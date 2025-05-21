import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../services/api';
import AddressForm from './AddressForm';
import Toast from './Toast';

const AddressSelector = ({ 
  onAddressSelect, 
  selectedAddressId = null, 
  isManagementMode = false,
  onAddressUpdate = null,
  title = "Delivery Address"
}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);
  
  // If there's a selected address ID, make sure it's selected
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const address = addresses.find(addr => addr.id === selectedAddressId);
      if (address) {
        onAddressSelect(address);
      }
    }
  }, [selectedAddressId, addresses, onAddressSelect]);
  
  const fetchAddresses = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getAddresses();
      setAddresses(response.data);
      
      // If we have addresses but no selected address, select the default one
      if (response.data.length > 0 && !selectedAddressId) {
        const defaultAddress = response.data.find(addr => addr.is_default) || response.data[0];
        onAddressSelect(defaultAddress);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAddress = async (addressData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await addAddress(addressData);
      
      // Refresh the address list
      await fetchAddresses();
      
      // Close the form
      setShowAddForm(false);
      
      // Show success notification
      if (onAddressUpdate) {
        onAddressUpdate('Address added successfully', 'success');
      } else {
        setNotification({
          show: true,
          message: 'Address added successfully',
          type: 'success'
        });
      }
      
      // If this is the first address or it's set as default, select it
      if (addresses.length === 0 || addressData.is_default) {
        const newAddress = {
          id: response.data.address_id,
          ...addressData
        };
        onAddressSelect(newAddress);
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address. Please try again.');
      
      // Show error notification
      if (onAddressUpdate) {
        onAddressUpdate('Failed to add address', 'error');
      } else {
        setNotification({
          show: true,
          message: 'Failed to add address',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateAddress = async (addressData) => {
    if (!editingAddress) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await updateAddress(editingAddress.id, addressData);
      
      // Refresh the address list
      await fetchAddresses();
      
      // Close the form
      setEditingAddress(null);
      
      // Show success notification
      if (onAddressUpdate) {
        onAddressUpdate('Address updated successfully', 'success');
      } else {
        setNotification({
          show: true,
          message: 'Address updated successfully',
          type: 'success'
        });
      }
      
      // If this address is set as default, select it
      if (addressData.is_default) {
        const updatedAddress = {
          id: editingAddress.id,
          ...addressData
        };
        onAddressSelect(updatedAddress);
      }
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update address. Please try again.');
      
      // Show error notification
      if (onAddressUpdate) {
        onAddressUpdate('Failed to update address', 'error');
      } else {
        setNotification({
          show: true,
          message: 'Failed to update address',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteAddress(addressId);
      
      // Refresh the address list
      await fetchAddresses();
      
      // Show success notification
      if (onAddressUpdate) {
        onAddressUpdate('Address deleted successfully', 'success');
      } else {
        setNotification({
          show: true,
          message: 'Address deleted successfully',
          type: 'success'
        });
      }
      
      // If the deleted address was selected, select another one
      if (selectedAddressId === addressId) {
        const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
        if (remainingAddresses.length > 0) {
          const defaultAddress = remainingAddresses.find(addr => addr.is_default) || remainingAddresses[0];
          onAddressSelect(defaultAddress);
        } else {
          onAddressSelect(null);
        }
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      
      // Show error notification
      if (onAddressUpdate) {
        onAddressUpdate('Failed to delete address', 'error');
      } else {
        setNotification({
          show: true,
          message: 'Failed to delete address',
          type: 'error'
        });
      }
    }
  };
  
  const handleSubmit = (formData) => {
    if (editingAddress) {
      handleUpdateAddress(formData);
    } else {
      handleAddAddress(formData);
    }
  };
  
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };
  
  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      <Toast 
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {!showAddForm && !editingAddress && (
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="text-primary hover:text-primary-dark text-sm font-medium flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Address
          </motion.button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Address Form (Add/Edit) */}
          <AnimatePresence>
            {(showAddForm || editingAddress) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-gray-50 p-4 rounded-lg mb-4"
              >
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h4>
                <AddressForm
                  address={editingAddress}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                  }}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Address List */}
          {addresses.length === 0 && !showAddForm ? (
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-yellow-700 mb-2">You don't have any saved addresses</p>
              <motion.button
                onClick={() => setShowAddForm(true)}
                className="text-primary hover:text-primary-dark font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add your first address
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(address => (
                <motion.div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !isManagementMode && onAddressSelect(address)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      {!isManagementMode && (
                        <input
                          type="radio"
                          checked={selectedAddressId === address.id}
                          onChange={() => onAddressSelect(address)}
                          className="mt-1 form-radio text-primary"
                        />
                      )}
                      <div className="ml-3">
                        <div className="flex items-center">
                          <p className="font-medium text-gray-800">{address.full_name}</p>
                          {address.is_default && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{address.street_address}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-gray-600 mt-1">Phone: {address.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAddress(address);
                        }}
                        className="text-gray-500 hover:text-primary p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        className="text-gray-500 hover:text-red-500 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={address.is_default}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddressSelector;