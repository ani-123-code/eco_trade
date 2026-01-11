import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Mail, Phone, CreditCard as Edit, ChevronLeft, ChevronRight, Loader as Loader2, User, Eye, CheckCircle, Trash2, AlertTriangle, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminAPI } from '../../api/AdminAPI';
import { useToast } from '../../contexts/ToastContext';

// Import the actions
import { fetchAllUsers } from '../../store/slices/adminSlice';

const AdminCustomers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const customersPerPage = 5;

  // Fetch customers on component mount
  useEffect(() => {
    dispatch(fetchAllUsers());
    // Orders removed - EcoTrade uses auctions/RFQ instead
  }, [dispatch]);

  // Helper functions for EcoTrade (no orders, using auctions/RFQ instead)
  const getUserOrders = (userId) => {
    // EcoTrade doesn't use orders - return empty array
    return [];
  };

  const calculateTotalSpent = (userOrders) => {
    // EcoTrade doesn't track spending via orders
    return 0;
  };

  const getLastOrderDate = (userOrders) => {
    // EcoTrade doesn't track order dates
    return null;
  };

  // Filter customers based on search (excluding current admin user) and sort by newest first
  const filteredCustomers = users
    .filter(customer => {
      // Don't show current admin user in customer list
      if (currentUser && customer._id === currentUser._id) {
        return false;
      }
      
      const searchLower = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        (customer.phone && customer.phone.includes(searchQuery))
      );
    })
    .sort((a, b) => {
      // Sort by creation date in descending order (newest first)
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleViewCustomer = (id) => {
    setSelectedCustomer(id);
  };
  
  const handleCloseCustomerDetails = () => {
    setSelectedCustomer(null);
  };
  
  const getStatusClass = (status) => {
    return status === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleWarnUser = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setWarningMessage('');
    setWarnModalOpen(true);
  };

  const handleDeleteUser = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setDeleteModalOpen(true);
  };

  const confirmWarnUser = async () => {
    if (!warningMessage.trim()) {
      showError('Please enter a warning message');
      return;
    }

    setActionLoading(true);
    try {
      const result = await adminAPI.warnUser(selectedUserId, warningMessage.trim());
      if (result.success) {
        showSuccess(`Warning sent to ${selectedUserName} successfully`);
        setWarnModalOpen(false);
        setWarningMessage('');
        setSelectedUserId(null);
        setSelectedUserName('');
      } else {
        showError(result.message || 'Failed to send warning');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send warning');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    setActionLoading(true);
    try {
      const result = await adminAPI.deleteUser(selectedUserId);
      if (result.success) {
        showSuccess(`User ${selectedUserName} deleted successfully`);
        setDeleteModalOpen(false);
        setSelectedUserId(null);
        setSelectedUserName('');
        dispatch(fetchAllUsers()); // Refresh users list
      } else {
        showError(result.message || 'Failed to delete user');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const closeWarnModal = () => {
    setWarnModalOpen(false);
    setWarningMessage('');
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  // Find the customer to display details
  const customerDetails = selectedCustomer
    ? users.find(customer => customer._id === selectedCustomer)
    : null;


  // Show loading state
  if (loading && users.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-green-700" />
          <span className="text-gray-600 text-sm sm:text-base">Loading customers...</span>
        </div>
      </div>
    );
  }

  

  // Show error state
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading customers
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  onClick={() => dispatch(fetchAllUsers())}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {!customerDetails ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and view customer information</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500">Total Customers</div>
              <div className="text-lg font-semibold text-green-700">{filteredCustomers.length}</div>
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={handleSearch}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              fullWidth
              className="bg-white border-gray-200 focus:border-green-600 focus:ring-green-600"
            />
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentCustomers.map((customer) => {
                    const isActive = customer.isVerified; 
                    
                    return (
                      <tr key={customer._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Joined {formatDate(customer.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-900 mb-1">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                            {customer.phoneNumber && (
                              <div className="flex items-center text-gray-500">
                                <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                <span>{customer.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            customer.userType === 'seller'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {customer.userType ? customer.userType.charAt(0).toUpperCase() + customer.userType.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.isVerified ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              customer.verificationStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.verificationStatus ? customer.verificationStatus.charAt(0).toUpperCase() + customer.verificationStatus.slice(1) : 'Pending'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getStatusClass(
                              customer.isVerified ? 'active' : 'inactive'
                            )}`}
                          >
                            {customer.isVerified ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewCustomer(customer._id)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-150"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleWarnUser(customer._id, customer.name)}
                              className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-md hover:bg-yellow-700 transition-colors duration-150"
                              title="Warn User"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Warn
                            </button>
                            <button
                              onClick={() => handleDeleteUser(customer._id, customer.name)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-150"
                              title="Delete User"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {currentCustomers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <User className="h-12 w-12 text-gray-300 mb-3" />
                          <div className="text-gray-500">
                            {searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
                          </div>
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="mt-2 text-sm text-green-700 hover:text-emerald-600 font-medium"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 mb-6">
            {currentCustomers.map((customer) => {
              const isActive = customer.isVerified;
              
              return (
                <div key={customer._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="h-12 w-12 flex-shrink-0 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{customer.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClass(
                        isActive ? 'active' : 'inactive'
                      )}`}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.phoneNumber && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{customer.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          customer.userType === 'seller'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {customer.userType ? customer.userType.charAt(0).toUpperCase() + customer.userType.slice(1) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Verification:</span>
                        {customer.isVerified ? (
                          <span className="ml-1 inline-flex items-center text-xs text-green-800 bg-green-100 rounded-full px-2 py-0.5">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                            customer.verificationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.verificationStatus ? customer.verificationStatus.charAt(0).toUpperCase() + customer.verificationStatus.slice(1) : 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCustomer(customer._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-150"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleWarnUser(customer._id, customer.name)}
                        className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-md hover:bg-yellow-700 transition-colors duration-150"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Warn
                      </button>
                      <button
                        onClick={() => handleDeleteUser(customer._id, customer.name)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-150"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {currentCustomers.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-gray-500 mb-2">
                  {searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-green-700 hover:text-emerald-600 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredCustomers.length > customersPerPage && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  Showing <span className="font-medium">{indexOfFirstCustomer + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastCustomer, filteredCustomers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredCustomers.length}</span> customers
                </div>
                
                <div className="flex justify-center sm:justify-end">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </button>
                    
                    <div className="hidden sm:flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-150 ${
                            currentPage === page
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <div className="sm:hidden flex items-center px-3 py-2 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-700">
                        {currentPage} of {totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // Customer Details View
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={handleCloseCustomerDetails}
              className="mr-4 p-2 text-gray-600 hover:text-green-700 hover:bg-gray-100 rounded-full transition-colors duration-150"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Details</h1>
              <p className="text-sm text-gray-600 mt-1">Complete customer information and order history</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-2xl text-white font-semibold">
                      {customerDetails.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{customerDetails.name}</h3>
                    <p className="text-sm text-gray-500">
                      Customer since {formatDate(customerDetails.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <p className="font-medium text-gray-900">{customerDetails.email}</p>
                  </div>
                  {customerDetails.phoneNumber && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                      <p className="font-medium text-gray-900">{customerDetails.phoneNumber}</p>
                    </div>
                  )}
                  {customerDetails.address && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address</label>
                      <p className="font-medium text-gray-900">{customerDetails.address}</p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="bg-gray-50 p-4 rounded-lg flex-1">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</label>
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusClass(
                          customerDetails.isVerified ? 'active' : 'inactive'
                        )}`}
                      >
                        {customerDetails.isVerified ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg flex-1">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
                      <p className="font-medium text-gray-900 capitalize">{customerDetails.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80">User Type</div>
                    <div className="text-lg font-bold mt-1 capitalize">
                      {customerDetails.userType || 'N/A'}
                    </div>
                  </div>
                  <div className={`text-white p-4 rounded-lg text-center ${
                    customerDetails.isVerified ? 'bg-emerald-500' : 'bg-yellow-500'
                  }`}>
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80">Verification</div>
                    <div className="text-lg font-bold mt-1 capitalize">
                      {customerDetails.verificationStatus || 'Pending'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Verification Details</div>
                    <div className="text-sm text-gray-600">
                      {customerDetails.isVerified ? (
                        <span className="text-green-600 font-medium">✓ Verified Account</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">⏳ Pending Verification</span>
                      )}
                    </div>
                    {customerDetails.verifiedBy && (
                      <div className="text-xs text-gray-500 mt-2">
                        Verified by: {customerDetails.verifiedBy.name} on {formatDate(customerDetails.verifiedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-start">
            <Button
              variant="outline"
              onClick={handleCloseCustomerDetails}
              className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors duration-150"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </div>
        </div>
      )}

      {/* Warn User Modal */}
      {warnModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Warn User</h2>
              </div>
              <button
                onClick={closeWarnModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={actionLoading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                You are about to send a warning to <strong>{selectedUserName}</strong>. This will send them a notification and an email with your message.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Enter the warning message for this user..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                  rows={6}
                  disabled={actionLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {warningMessage.length} characters
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={closeWarnModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmWarnUser}
                isLoading={actionLoading}
                disabled={actionLoading || !warningMessage.trim()}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {actionLoading ? 'Sending...' : 'Send Warning'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
              </div>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={actionLoading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{selectedUserName}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All associated data including:
                </p>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>User account and profile</li>
                  <li>All auctions and materials created</li>
                  <li>All bids placed</li>
                  <li>All RFQs submitted</li>
                </ul>
                <p className="mt-2 text-sm text-red-800 font-semibold">
                  Will be permanently deleted.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDeleteUser}
                isLoading={actionLoading}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;