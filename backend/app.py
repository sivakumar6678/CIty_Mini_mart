# backend/app.py
import os
from datetime import datetime, timedelta
from functools import wraps
from urllib.parse import quote_plus

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env

app = Flask(__name__)

# --- Configurations ---
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-super-secret-key') # Should be in .env
password = quote_plus('CSKsiva@66')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'mysql+pymysql://root:{password}@localhost:3306/mini_mart_db') # Should be in .env
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key') # Should be in .env
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# --- Extensions ---
db = SQLAlchemy(app)
CORS(app) # Enable CORS for all routes and origins by default
jwt = JWTManager(app)

# --- Database Models ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'customer' or 'admin'
    city = db.Column(db.String(100), nullable=False)
    shops = db.relationship('Shop', backref='owner', lazy=True, cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='customer', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Shop(db.Model):
    __tablename__ = 'shops'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    products = db.relationship('Product', backref='shop', lazy=True, cascade="all, delete-orphan")
    orders = db.relationship('Order', secondary='order_items') # For shop orders

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255), nullable=True) # Placeholder for image path/URL
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)

# Association table for many-to-many relationship between orders and products
order_items = db.Table('order_items',
    db.Column('order_id', db.Integer, db.ForeignKey('orders.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('products.id'), primary_key=True),
    db.Column('quantity', db.Integer, nullable=False, default=1),
    db.Column('shop_id', db.Integer, db.ForeignKey('shops.id'), nullable=False) # To associate order item with shop
)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(50), nullable=False, default='Pending') # e.g., Pending, Confirmed, Shipped, Delivered
    
    # Relationship to products through the association table
    products = db.relationship('Product', secondary=order_items, lazy='subquery',
                               backref=db.backref('orders', lazy=True))


# --- Helper Decorators for Role-Based Access ---
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_identity = get_jwt_identity()
        user = User.query.filter_by(email=current_user_identity).first()
        if not user or user.role != 'admin':
            return jsonify(message="Admins only!"), 403
        return fn(*args, **kwargs)
    return wrapper

def customer_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_identity = get_jwt_identity() # This is the email
        user = User.query.filter_by(email=current_user_identity).first()
        if not user or user.role != 'customer':
            return jsonify(message="Customers only!"), 403
        return fn(*args, **kwargs)
    return wrapper

# --- Authentication Routes ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role') # 'customer' or 'admin'
    city = data.get('city')

    if not all([name, email, password, role, city]):
        return jsonify(message="Missing required fields"), 400
    
    if role not in ['customer', 'admin']:
        return jsonify(message="Invalid role specified"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(message="Email already registered"), 409

    new_user = User(name=name, email=email, role=role, city=city)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="User registered successfully"), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify(message="Email and password are required"), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=email) # Identity can be user.id or user.email
        return jsonify(
            access_token=access_token,
            role=user.role,
            city=user.city,
            name=user.name,
            user_id=user.id
        ), 200
    else:
        return jsonify(message="Invalid email or password"), 401

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify(message="User not found"), 404
    return jsonify(id=user.id, name=user.name, email=user.email, role=user.role, city=user.city), 200


# --- Shop Routes ---
@app.route('/api/shops', methods=['POST'])
@admin_required
def create_shop():
    data = request.get_json()
    name = data.get('name')
    city = data.get('city') # Shop city, can be different from owner's registration city if needed
    
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()

    if not name or not city:
        return jsonify(message="Shop name and city are required"), 400

    # Optional: Check if admin already owns a shop
    existing_shop = Shop.query.filter_by(owner_id=owner.id).first()
    if existing_shop:
        return jsonify(message=f"Admin already owns shop: {existing_shop.name}"), 409


    new_shop = Shop(name=name, city=city, owner_id=owner.id)
    db.session.add(new_shop)
    db.session.commit()
    return jsonify(message="Shop created successfully", shop_id=new_shop.id, name=new_shop.name, city=new_shop.city), 201

@app.route('/api/shops/my', methods=['GET'])
@admin_required
def get_my_shop():
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()
    if not shop:
        return jsonify(message="No shop found for this admin."), 404 # Or return an empty object/array
    return jsonify(id=shop.id, name=shop.name, city=shop.city, owner_id=shop.owner_id), 200


@app.route('/api/shops/city/<city_name>', methods=['GET'])
@jwt_required() # Any logged in user can see shops
def get_shops_by_city(city_name):
    shops = Shop.query.filter(Shop.city.ilike(f"%{city_name}%")).all()
    if not shops:
        return jsonify(message=f"No shops found in {city_name}"), 404
    
    return jsonify([{'id': shop.id, 'name': shop.name, 'city': shop.city} for shop in shops]), 200

# --- Product Routes ---
@app.route('/api/products', methods=['POST'])
@admin_required
def add_product():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    image_url = data.get('image_url', '') # Optional image_url

    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop. Create a shop first."), 400
    
    if not name or price is None:
        return jsonify(message="Product name and price are required"), 400
    
    try:
        price = float(price)
        if price <= 0:
            raise ValueError
    except ValueError:
        return jsonify(message="Invalid price format"), 400

    new_product = Product(name=name, price=price, image_url=image_url, shop_id=shop.id)
    db.session.add(new_product)
    db.session.commit()
    return jsonify(message="Product added successfully", product_id=new_product.id), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    data = request.get_json()
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop."), 403

    product = Product.query.filter_by(id=product_id, shop_id=shop.id).first()
    if not product:
        return jsonify(message="Product not found or does not belong to this shop"), 404

    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        try:
            price = float(data['price'])
            if price <= 0: raise ValueError
            product.price = price
        except ValueError:
            return jsonify(message="Invalid price format"), 400
    if 'image_url' in data:
        product.image_url = data['image_url']
    
    db.session.commit()
    return jsonify(message="Product updated successfully"), 200

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop."), 403

    product = Product.query.filter_by(id=product_id, shop_id=shop.id).first()
    if not product:
        return jsonify(message="Product not found or does not belong to this shop"), 404
        
    db.session.delete(product)
    db.session.commit()
    return jsonify(message="Product deleted successfully"), 200


@app.route('/api/shops/<int:shop_id>/products', methods=['GET'])
@jwt_required() # Any logged in user can see products of a shop
def get_products_by_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify(message="Shop not found"), 404
    
    products = Product.query.filter_by(shop_id=shop_id).all()
    return jsonify([{
        'id': p.id, 
        'name': p.name, 
        'price': p.price, 
        'image_url': p.image_url,
        'shop_id': p.shop_id
        } for p in products]), 200

@app.route('/api/products/city/<city_name>', methods=['GET'])
@jwt_required()
def get_products_by_city(city_name):
    # Find shops in the city
    shops_in_city = Shop.query.filter(Shop.city.ilike(f"%{city_name}%")).all()
    if not shops_in_city:
        return jsonify(message=f"No shops found in {city_name}, hence no products."), 404

    shop_ids = [shop.id for shop in shops_in_city]
    products = Product.query.filter(Product.shop_id.in_(shop_ids)).all()
    
    if not products:
        return jsonify(message=f"No products found in {city_name}"), 404

    return jsonify([{
        'id': p.id, 
        'name': p.name, 
        'price': p.price, 
        'image_url': p.image_url,
        'shop_id': p.shop_id,
        'shop_name': p.shop.name # Include shop name
        } for p in products]), 200


# --- Order Routes ---
@app.route('/api/orders', methods=['POST'])
@customer_required
def place_order():
    data = request.get_json()
    cart_items = data.get('items') # Expected format: [{"product_id": X, "quantity": Y}, ...]
    
    current_user_email = get_jwt_identity()
    customer = User.query.filter_by(email=current_user_email).first()

    if not cart_items:
        return jsonify(message="Cart is empty"), 400

    new_order = Order(customer_id=customer.id, total_amount=0) # Total amount calculated later
    db.session.add(new_order)
    db.session.flush() # To get new_order.id

    total_order_amount = 0

    for item_data in cart_items:
        product = Product.query.get(item_data.get('product_id'))
        quantity = item_data.get('quantity')

        if not product or not isinstance(quantity, int) or quantity <= 0:
            db.session.rollback() # Important: rollback if any item is invalid
            return jsonify(message=f"Invalid product or quantity for product ID {item_data.get('product_id')}."), 400
        
        # Add to order_items association
        stmt = order_items.insert().values(
            order_id=new_order.id, 
            product_id=product.id, 
            quantity=quantity,
            shop_id=product.shop_id # Store shop_id with the item
        )
        db.session.execute(stmt)
        total_order_amount += product.price * quantity
    
    new_order.total_amount = total_order_amount
    db.session.commit()

    return jsonify(message="Order placed successfully", order_id=new_order.id, total_amount=new_order.total_amount), 201

@app.route('/api/orders/customer', methods=['GET'])
@customer_required
def get_customer_orders():
    current_user_email = get_jwt_identity()
    customer = User.query.filter_by(email=current_user_email).first()
    
    orders = Order.query.filter_by(customer_id=customer.id).order_by(Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        order_data = {
            'id': order.id,
            'created_at': order.created_at.isoformat(),
            'total_amount': order.total_amount,
            'status': order.status,
            'items': []
        }
        # Fetch items for this order
        items_in_order = db.session.query(Product, order_items.c.quantity).\
            join(order_items, Product.id == order_items.c.product_id).\
            filter(order_items.c.order_id == order.id).all()
        
        for product, quantity in items_in_order:
            order_data['items'].append({
                'product_id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': quantity,
                'shop_id': product.shop_id
            })
        result.append(order_data)
        
    return jsonify(result), 200

@app.route('/api/orders/shop', methods=['GET'])
@admin_required
def get_shop_orders():
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop."), 404

    # Find orders that contain products from this admin's shop
    # This query is a bit more complex as orders can span multiple shops if cart allows.
    # For simplicity, this version assumes an order item is tied to a shop_id in order_items.
    
    order_ids_with_shop_items = db.session.query(order_items.c.order_id).\
        filter(order_items.c.shop_id == shop.id).distinct().all()
    
    if not order_ids_with_shop_items:
        return jsonify([]), 200 # No orders for this shop

    actual_order_ids = [oid[0] for oid in order_ids_with_shop_items]
    
    orders = Order.query.filter(Order.id.in_(actual_order_ids)).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        order_data = {
            'id': order.id,
            'customer_id': order.customer_id,
            'customer_name': order.customer.name, # Assuming backref works
            'customer_city': order.customer.city,
            'created_at': order.created_at.isoformat(),
            'total_amount': order.total_amount, # This is total for the whole order
            'status': order.status,
            'items_for_this_shop': []
        }
        
        # Fetch items specific to this shop for this order
        items_for_shop_in_order = db.session.query(Product, order_items.c.quantity).\
            join(order_items, Product.id == order_items.c.product_id).\
            filter(order_items.c.order_id == order.id, order_items.c.shop_id == shop.id).all()
            
        shop_specific_total = 0
        for product, quantity in items_for_shop_in_order:
            order_data['items_for_this_shop'].append({
                'product_id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': quantity
            })
            shop_specific_total += product.price * quantity
        
        order_data['shop_specific_total_amount'] = shop_specific_total
        result.append(order_data)
        
    return jsonify(result), 200

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify(message="New status is required"), 400
        
    # Validate status value
    valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify(message=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"), 400
    
    # Get current user's shop
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()
    
    if not shop:
        return jsonify(message="Admin does not have a shop."), 403
    
    # Check if order exists and contains items from this shop
    order_has_shop_items = db.session.query(order_items).\
        filter(order_items.c.order_id == order_id, order_items.c.shop_id == shop.id).first()
    
    if not order_has_shop_items:
        return jsonify(message="Order not found or does not contain items from your shop"), 404
    
    # Update order status
    order = Order.query.get(order_id)
    if not order:
        return jsonify(message="Order not found"), 404
        
    order.status = new_status
    db.session.commit()
    
    return jsonify(message=f"Order status updated to {new_status}", order_id=order_id, status=new_status), 200

@app.route('/api/admin/analytics', methods=['GET'])
@admin_required
def get_shop_analytics():
    """
    Get analytics data for the admin's shop
    Returns:
        - Total sales
        - Total orders
        - Active customers
        - Average order value
        - Revenue data (daily/weekly)
        - Order status breakdown
        - Top selling products
    """
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()
    
    if not shop:
        return jsonify(message="Admin does not have a shop."), 404
    
    # Get time range from query parameters (default to last 30 days)
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Find orders that contain products from this shop
    order_ids_with_shop_items = db.session.query(order_items.c.order_id).\
        filter(order_items.c.shop_id == shop.id).distinct().all()
    
    if not order_ids_with_shop_items:
        # Return empty analytics if no orders
        return jsonify({
            'totalSales': 0,
            'totalOrders': 0,
            'activeCustomers': 0,
            'averageOrderValue': 0,
            'revenueData': [],
            'orderStatusData': {},
            'topProducts': []
        }), 200
    
    actual_order_ids = [oid[0] for oid in order_ids_with_shop_items]
    
    # Get orders within the time range
    orders = Order.query.filter(
        Order.id.in_(actual_order_ids),
        Order.created_at >= start_date
    ).order_by(Order.created_at.desc()).all()
    
    # Calculate total sales for this shop
    total_sales = 0
    order_values = []
    customer_ids = set()
    order_status_counts = {
        'Pending': 0,
        'Processing': 0,
        'Shipped': 0,
        'Delivered': 0,
        'Cancelled': 0
    }
    
    # Group revenue by date
    revenue_by_date = {}
    
    for order in orders:
        # Get items for this shop in this order
        items_for_shop = db.session.query(Product, order_items.c.quantity).\
            join(order_items, Product.id == order_items.c.product_id).\
            filter(order_items.c.order_id == order.id, order_items.c.shop_id == shop.id).all()
        
        # Calculate shop-specific total for this order
        shop_specific_total = sum(product.price * quantity for product, quantity in items_for_shop)
        
        # Add to total sales
        total_sales += shop_specific_total
        
        # Add to order values for average calculation
        if shop_specific_total > 0:
            order_values.append(shop_specific_total)
        
        # Add customer to unique customers set
        customer_ids.add(order.customer_id)
        
        # Count order status
        if order.status in order_status_counts:
            order_status_counts[order.status] += 1
        
        # Add to revenue by date
        order_date = order.created_at.date().isoformat()
        if order_date in revenue_by_date:
            revenue_by_date[order_date] += shop_specific_total
        else:
            revenue_by_date[order_date] = shop_specific_total
    
    # Calculate average order value
    avg_order_value = sum(order_values) / len(order_values) if order_values else 0
    
    # Format revenue data for chart
    revenue_data = [{'date': date, 'revenue': revenue} for date, revenue in revenue_by_date.items()]
    revenue_data.sort(key=lambda x: x['date'])  # Sort by date
    
    # Get top selling products
    top_products_query = db.session.query(
        Product,
        db.func.sum(order_items.c.quantity).label('total_quantity'),
        db.func.sum(Product.price * order_items.c.quantity).label('total_revenue')
    ).\
    join(order_items, Product.id == order_items.c.product_id).\
    filter(
        order_items.c.shop_id == shop.id,
        order_items.c.order_id.in_(actual_order_ids)
    ).\
    group_by(Product.id).\
    order_by(db.text('total_quantity DESC')).\
    limit(5).all()
    
    top_products = [
        {
            'id': product.id,
            'name': product.name,
            'sales': int(total_quantity),
            'revenue': float(total_revenue)
        }
        for product, total_quantity, total_revenue in top_products_query
    ]
    
    # Prepare response
    analytics_data = {
        'totalSales': float(total_sales),
        'totalOrders': len(orders),
        'activeCustomers': len(customer_ids),
        'averageOrderValue': float(avg_order_value),
        'revenueData': revenue_data,
        'orderStatusData': order_status_counts,
        'topProducts': top_products
    }
    
    return jsonify(analytics_data), 200


# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Create database tables if they don't exist
    app.run(debug=True, host='0.0.0.0', port=5001) # Run on port 5001 to avoid conflict with React dev server
    