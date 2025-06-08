# 🏪 City Mart API Documentation

## 📋 **API Overview**

**Base URL**: `http://localhost:5000`  
**API Version**: v1  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`  
**Total Endpoints**: 18

---

## 🔐 **Authentication**

### Headers Required for Protected Endpoints:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Roles:
- **customer**: Regular users who can place orders
- **admin**: Shop owners who can manage products and view analytics

---

## 📚 **API Endpoints**

## 🔑 **1. AUTHENTICATION ENDPOINTS**

### 1.1 User Registration
```http
POST /api/auth/register
```

**Access**: Public  
**Description**: Register a new user (customer or admin)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "customer",
  "city": "Mumbai"
}
```

**Request Fields**:
- `name` (string, required): User's full name
- `email` (string, required): Valid email address
- `password` (string, required): User password
- `role` (string, required): Either "customer" or "admin"
- `city` (string, required): User's city

**Response Success (201)**:
```json
{
  "message": "User registered successfully"
}
```

**Response Error (400)**:
```json
{
  "message": "Missing required fields"
}
```

**Response Error (409)**:
```json
{
  "message": "Email already registered"
}
```

---

### 1.2 User Login
```http
POST /api/auth/login
```

**Access**: Public  
**Description**: Authenticate user and get JWT token

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Request Fields**:
- `email` (string, required): User's email
- `password` (string, required): User's password

**Response Success (200)**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "role": "customer",
  "city": "Mumbai",
  "name": "John Doe",
  "user_id": 1
}
```

**Response Error (401)**:
```json
{
  "message": "Invalid email or password"
}
```

---

### 1.3 Get Current User
```http
GET /api/auth/me
```

**Access**: JWT Required  
**Description**: Get current authenticated user's profile

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "city": "Mumbai"
}
```

**Response Error (404)**:
```json
{
  "message": "User not found"
}
```

---

### 1.4 Update User Profile
```http
PUT /api/auth/profile
```

**Access**: JWT Required  
**Description**: Update current user's profile information

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "name": "John Smith",
  "city": "Delhi",
  "password": "newpassword123"
}
```

**Request Fields**:
- `name` (string, optional): Updated name
- `city` (string, optional): Updated city
- `password` (string, optional): New password

**Response Success (200)**:
```json
{
  "message": "Profile updated successfully"
}
```

---

## 🏠 **2. ADDRESS MANAGEMENT ENDPOINTS**

### 2.1 Get User Addresses
```http
GET /api/addresses
```

**Access**: JWT Required  
**Description**: Get all addresses for the current user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "full_name": "John Doe",
    "street_address": "123 Main Street, Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "phone_number": "+91-9876543210",
    "is_default": true
  }
]
```

---

### 2.2 Add New Address
```http
POST /api/addresses
```

**Access**: JWT Required  
**Description**: Add a new delivery address

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "full_name": "John Doe",
  "street_address": "123 Main Street, Apt 4B",
  "landmark": "Near Central Mall",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "phone_number": "+91-9876543210",
  "is_default": false
}
```

**Request Fields**:
- `full_name` (string, required): Recipient's full name
- `street_address` (string, required): Street address
- `landmark` (string, optional): Nearby landmark
- `city` (string, required): City name
- `state` (string, required): State name
- `postal_code` (string, required): Postal/ZIP code
- `phone_number` (string, required): Contact phone number
- `is_default` (boolean, optional): Set as default address

**Response Success (201)**:
```json
{
  "message": "Address added successfully",
  "address_id": 1,
  "is_default": true
}
```

**Response Error (400)**:
```json
{
  "message": "Missing required field: full_name"
}
```

---

### 2.3 Update Address
```http
PUT /api/addresses/<int:address_id>
```

**Access**: JWT Required  
**Description**: Update a specific address

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `address_id` (integer): ID of the address to update

**Request Body**:
```json
{
  "full_name": "John Smith",
  "street_address": "456 New Street",
  "city": "Delhi",
  "state": "Delhi",
  "postal_code": "110001",
  "phone_number": "+91-9876543211",
  "is_default": true
}
```

**Response Success (200)**:
```json
{
  "message": "Address updated successfully",
  "address_id": 1
}
```

**Response Error (404)**:
```json
{
  "message": "Address not found or does not belong to this user"
}
```

---

### 2.4 Delete Address
```http
DELETE /api/addresses/<int:address_id>
```

**Access**: JWT Required  
**Description**: Delete a specific address

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `address_id` (integer): ID of the address to delete

**Response Success (200)**:
```json
{
  "message": "Address deleted successfully"
}
```

**Response Error (400)**:
```json
{
  "message": "Cannot delete address as it is used in orders"
}
```

---

### 2.5 Get Default Address
```http
GET /api/addresses/default
```

**Access**: JWT Required  
**Description**: Get user's default delivery address

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
{
  "id": 1,
  "full_name": "John Doe",
  "street_address": "123 Main Street, Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "phone_number": "+91-9876543210",
  "is_default": true
}
```

**Response Error (404)**:
```json
{
  "message": "No default address found"
}
```

---

## 🏪 **3. SHOP MANAGEMENT ENDPOINTS**

### 3.1 Create Shop
```http
POST /api/shops
```

**Access**: Admin Only  
**Description**: Create a new shop (one shop per admin)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "name": "Fresh Mart",
  "city": "Mumbai"
}
```

**Request Fields**:
- `name` (string, required): Shop name
- `city` (string, required): Shop location city

**Response Success (201)**:
```json
{
  "message": "Shop created successfully",
  "shop_id": 1,
  "name": "Fresh Mart",
  "city": "Mumbai"
}
```

**Response Error (409)**:
```json
{
  "message": "Admin already owns shop: Fresh Mart"
}
```

---

### 3.2 Get My Shop
```http
GET /api/shops/my
```

**Access**: Admin Only  
**Description**: Get current admin's shop details

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
{
  "id": 1,
  "name": "Fresh Mart",
  "city": "Mumbai",
  "owner_id": 2
}
```

**Response Error (404)**:
```json
{
  "message": "No shop found for this admin."
}
```

---

### 3.3 Get Shops by City
```http
GET /api/shops/city/<city_name>
```

**Access**: JWT Required  
**Description**: Get all shops in a specific city

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `city_name` (string): Name of the city

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "name": "Fresh Mart",
    "city": "Mumbai"
  },
  {
    "id": 2,
    "name": "Green Grocers",
    "city": "Mumbai"
  }
]
```

**Response Error (404)**:
```json
{
  "message": "No shops found in Mumbai"
}
```

---

## 📦 **4. PRODUCT MANAGEMENT ENDPOINTS**

### 4.1 Add Product
```http
POST /api/products
```

**Access**: Admin Only  
**Description**: Add a new product to admin's shop

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "name": "Fresh Tomatoes",
  "price": 45.50,
  "image_url": "https://example.com/tomato.jpg",
  "category": "Vegetables",
  "discount_percentage": 10,
  "featured": true,
  "unit": "kg",
  "description": "Fresh organic tomatoes from local farms",
  "quantity": 100
}
```

**Request Fields**:
- `name` (string, required): Product name
- `price` (float, required): Product price
- `image_url` (string, optional): Product image URL
- `category` (string, optional): Product category (default: "Vegetables")
- `discount_percentage` (float, optional): Discount percentage (default: 0)
- `featured` (boolean, optional): Featured product flag (default: false)
- `unit` (string, optional): Unit of measurement (default: "kg")
- `description` (string, optional): Product description
- `quantity` (integer, optional): Available quantity (default: 0)

**Response Success (201)**:
```json
{
  "message": "Product added successfully",
  "product_id": 1,
  "product": {
    "id": 1,
    "name": "Fresh Tomatoes",
    "price": 45.50,
    "image_url": "https://example.com/tomato.jpg",
    "shop_id": 1,
    "shop_name": "Fresh Mart",
    "category": "Vegetables",
    "discount_percentage": 10,
    "featured": true,
    "unit": "kg",
    "description": "Fresh organic tomatoes from local farms",
    "sold_count": 0,
    "quantity": 100
  }
}
```

**Response Error (400)**:
```json
{
  "message": "Admin does not have a shop. Create a shop first."
}
```

---

### 4.2 Update Product
```http
PUT /api/products/<int:product_id>
```

**Access**: Admin Only  
**Description**: Update an existing product

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `product_id` (integer): ID of the product to update

**Request Body**:
```json
{
  "name": "Premium Tomatoes",
  "price": 55.00,
  "quantity": 150,
  "discount_percentage": 15,
  "featured": false
}
```

**Response Success (200)**:
```json
{
  "id": 1,
  "name": "Premium Tomatoes",
  "price": 55.00,
  "image_url": "https://example.com/tomato.jpg",
  "shop_id": 1,
  "shop_name": "Fresh Mart",
  "quantity": 150,
  "category": "Vegetables",
  "discount_percentage": 15,
  "featured": false,
  "unit": "kg",
  "description": "Fresh organic tomatoes from local farms",
  "sold_count": 0
}
```

**Response Error (404)**:
```json
{
  "message": "Product not found or does not belong to this shop"
}
```

---

### 4.3 Delete Product
```http
DELETE /api/products/<int:product_id>
```

**Access**: Admin Only  
**Description**: Delete a product from admin's shop

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `product_id` (integer): ID of the product to delete

**Response Success (200)**:
```json
{
  "message": "Product deleted successfully"
}
```

**Response Error (404)**:
```json
{
  "message": "Product not found or does not belong to this shop"
}
```

---

### 4.4 Get All Products
```http
GET /api/products
```

**Access**: Public  
**Description**: Get all products from all shops

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "name": "Fresh Tomatoes",
    "price": 45.50,
    "image_url": "https://example.com/tomato.jpg",
    "shop_id": 1,
    "shop_name": "Fresh Mart",
    "city": "Mumbai",
    "category": "Vegetables",
    "discount_percentage": 10,
    "featured": true,
    "unit": "kg",
    "description": "Fresh organic tomatoes from local farms",
    "sold_count": 0,
    "quantity": 100
  }
]
```

**Response Error (404)**:
```json
{
  "message": "No products found"
}
```

---

### 4.5 Get Products by Shop
```http
GET /api/shops/<int:shop_id>/products
```

**Access**: Public  
**Description**: Get all products from a specific shop

**URL Parameters**:
- `shop_id` (integer): ID of the shop

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "name": "Fresh Tomatoes",
    "price": 45.50,
    "image_url": "https://example.com/tomato.jpg",
    "shop_id": 1,
    "shop_name": "Fresh Mart",
    "city": "Mumbai",
    "quantity": 100,
    "category": "Vegetables",
    "discount_percentage": 10,
    "featured": true,
    "unit": "kg",
    "description": "Fresh organic tomatoes from local farms",
    "sold_count": 0
  }
]
```

**Response Error (404)**:
```json
{
  "message": "Shop not found"
}
```

---

### 4.6 Get Products by City
```http
GET /api/products/city/<city_name>
```

**Access**: Public  
**Description**: Get all products from shops in a specific city

**URL Parameters**:
- `city_name` (string): Name of the city

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "name": "Fresh Tomatoes",
    "price": 45.50,
    "image_url": "https://example.com/tomato.jpg",
    "shop_id": 1,
    "shop_name": "Fresh Mart",
    "city": "Mumbai",
    "category": "Vegetables",
    "discount_percentage": 10,
    "featured": true,
    "unit": "kg",
    "description": "Fresh organic tomatoes from local farms",
    "sold_count": 0,
    "quantity": 100
  }
]
```

**Response Error (404)**:
```json
{
  "message": "No shops found in Mumbai, hence no products."
}
```

---

## 🛒 **5. ORDER MANAGEMENT ENDPOINTS**

### 5.1 Place Order
```http
POST /api/orders
```

**Access**: Customer Only  
**Description**: Place a new order with multiple products

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ],
  "address_id": 1,
  "payment": {
    "method": "cod",
    "transaction_id": null
  }
}
```

**Request Fields**:
- `items` (array, required): Array of order items
  - `product_id` (integer, required): Product ID
  - `quantity` (integer, required): Quantity to order
- `address_id` (integer, required): Delivery address ID
- `payment` (object, required): Payment information
  - `method` (string, required): Payment method ("cod", "online")
  - `transaction_id` (string, optional): Transaction ID for online payments

**Response Success (201)**:
```json
{
  "message": "Order placed successfully",
  "order_id": 1,
  "total_amount": 131.00,
  "delivery_address": {
    "full_name": "John Doe",
    "street_address": "123 Main Street, Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001"
  }
}
```

**Response Error (400)**:
```json
{
  "message": "Not enough quantity available for Fresh Tomatoes. Available: 50, Requested: 100"
}
```

---

### 5.2 Get Customer Orders
```http
GET /api/orders/customer
```

**Access**: Customer Only  
**Description**: Get all orders for the current customer

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "created_at": "2024-01-15T10:30:00",
    "total_amount": 131.00,
    "status": "Pending",
    "payment_method": "cod",
    "payment_transaction_id": null,
    "delivery_address": {
      "id": 1,
      "full_name": "John Doe",
      "street_address": "123 Main Street, Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001",
      "phone_number": "+91-9876543210"
    },
    "items": [
      {
        "product_id": 1,
        "name": "Fresh Tomatoes",
        "price": 45.50,
        "quantity": 2,
        "shop_id": 1
      }
    ]
  }
]
```

---

### 5.3 Get Shop Orders
```http
GET /api/orders/shop
```

**Access**: Admin Only  
**Description**: Get all orders containing products from admin's shop

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "customer_name": "John Doe",
    "customer_city": "Mumbai",
    "created_at": "2024-01-15T10:30:00",
    "total_amount": 131.00,
    "status": "Pending",
    "shop_specific_total_amount": 91.00,
    "items_for_this_shop": [
      {
        "product_id": 1,
        "name": "Fresh Tomatoes",
        "price": 45.50,
        "quantity": 2,
        "image_url": "https://example.com/tomato.jpg"
      }
    ]
  }
]
```

**Response Error (404)**:
```json
{
  "message": "Admin does not have a shop."
}
```

---

### 5.4 Update Order Status
```http
PUT /api/orders/<int:order_id>/status
```

**Access**: Admin Only  
**Description**: Update order status (for orders containing admin's products)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `order_id` (integer): ID of the order to update

**Request Body**:
```json
{
  "status": "Shipped"
}
```

**Request Fields**:
- `status` (string, required): New order status
  - Valid values: "Pending", "Processing", "Shipped", "Delivered", "Cancelled"

**Response Success (200)**:
```json
{
  "message": "Order status updated to Shipped",
  "order_id": 1,
  "status": "Shipped"
}
```

**Response Error (404)**:
```json
{
  "message": "Order not found or does not contain items from your shop"
}
```

---

### 5.5 Cancel Order
```http
PUT /api/orders/<int:order_id>/cancel
```

**Access**: JWT Required  
**Description**: Cancel an order (customers can cancel their orders, admins can cancel orders with their products)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `order_id` (integer): ID of the order to cancel

**Response Success (200)**:
```json
{
  "message": "Order cancelled successfully",
  "order_id": 1,
  "status": "Cancelled"
}
```

**Response Error (400)**:
```json
{
  "message": "Cannot cancel a delivered order"
}
```

**Response Error (403)**:
```json
{
  "message": "Unauthorized to cancel this order"
}
```

---

## 📊 **6. ANALYTICS ENDPOINTS**

### 6.1 Get Shop Analytics
```http
GET /api/admin/analytics?days=30
```

**Access**: Admin Only  
**Description**: Get comprehensive analytics for admin's shop

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `days` (integer, optional): Number of days for analytics (default: 30)

**Response Success (200)**:
```json
{
  "totalSales": 2500.75,
  "totalOrders": 45,
  "activeCustomers": 23,
  "averageOrderValue": 55.57,
  "revenueData": [
    {
      "date": "2024-01-15",
      "revenue": 150.00
    },
    {
      "date": "2024-01-16",
      "revenue": 200.50
    }
  ],
  "orderStatusData": {
    "Pending": 5,
    "Processing": 8,
    "Shipped": 12,
    "Delivered": 18,
    "Cancelled": 2
  },
  "topProducts": [
    {
      "id": 1,
      "name": "Fresh Tomatoes",
      "sales": 120,
      "revenue": 5460.00
    },
    {
      "id": 3,
      "name": "Organic Onions",
      "sales": 85,
      "revenue": 2550.00
    }
  ]
}
```

**Response Error (404)**:
```json
{
  "message": "Admin does not have a shop."
}
```

---

## ❌ **Error Responses**

### Common HTTP Status Codes:

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `500` | Internal Server Error |

### Standard Error Response Format:
```json
{
  "message": "Error description",
  "error": "error_code"
}
```

---

## 🔧 **Additional Features**

### Business Rules:
1. **Inventory Management**: Product quantities are reduced when orders are placed
2. **COD Fee**: ₹40 fee is added for Cash on Delivery orders
3. **Default Address**: First address added becomes default automatically
4. **One Shop Per Admin**: Each admin can only create one shop
5. **Order Cancellation**: Orders cannot be cancelled once delivered
6. **Address Deletion**: Addresses used in orders cannot be deleted

### Security Features:
1. **JWT Authentication**: 24-hour token expiration
2. **Role-Based Access**: Separate permissions for customers and admins
3. **Password Hashing**: Secure password storage using Werkzeug
4. **CORS Configuration**: Proper cross-origin request handling

---

## 📝 **Notes**

1. All timestamps are in ISO 8601 format
2. Prices are in Indian Rupees (₹)
3. Phone numbers should include country code
4. Image URLs should be publicly accessible
5. Product quantities are managed automatically during order placement
6. Analytics data is calculated in real-time based on the specified date range

---

**Last Updated**: January 2024  
**API Version**: 1.0  
**Documentation Version**: 1.0