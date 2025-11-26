import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Mail, Phone, CreditCard as Edit, ChevronLeft, ChevronRight, Loader as Loader2, User, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// Import the actions
import { fetchAllUsers } from '../../store/slices/adminSlice';
import { fetchAllOrders } from '../../store/slices/orderSlice';

const AdminCustomers = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const { orders } = useSelector((state) => state.orders);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const customersPerPage = 5;

  // Fetch customers and orders on component mount
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Helper function to get user orders
  const getUserOrders = (userId) => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter(order => {
      if (!order.user) return false;
      return order.user === userId || order.user._id === userId;
    });
  };

  // Helper function to calculate total spent
  const calculateTotalSpent = (userOrders) => {
    if (!userOrders || !Array.isArray(userOrders)) return 0;
    return userOrders.reduce((total, order) => total + (order.total || 0), 0);
  };

  // Helper function to get last order date
  const getLastOrderDate = (userOrders) => {
    if (!userOrders || !Array.isArray(userOrders) || userOrders.length === 0) return null;
    return userOrders.reduce((latest, order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate > latest ? orderDate : latest;
    }, new Date(userOrders[0].createdAt));
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

  // Find the customer to display details
  const customerDetails = selectedCustomer
    ? users.find(customer => customer._id === selectedCustomer)
    : null;

  // Get customer orders for details view
  const customerOrders = customerDetails ? getUserOrders(customerDetails._id) : [];

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
                      Orders
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total Spent
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
                    const userOrders = getUserOrders(customer._id);
                    const totalSpent = calculateTotalSpent(userOrders);
                    const lastOrderDate = getLastOrderDate(userOrders);
                    const isActive = userOrders.length > 0; 
                    
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
                                {lastOrderDate 
                                  ? `Last order: ${formatDate(lastOrderDate)}`
                                  : 'No orders yet'
                                }
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
                          <div className="text-sm font-medium text-gray-900">{userOrders.length}</div>
                          <div className="text-xs text-gray-500">orders</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-700">₹{totalSpent.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getStatusClass(
                              isActive ? 'active' : 'inactive'
                            )}`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewCustomer(customer._id)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-[#1a2f4a] transition-colors duration-150"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </button>
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
              const userOrders = getUserOrders(customer._id);
              const totalSpent = calculateTotalSpent(userOrders);
              const lastOrderDate = getLastOrderDate(userOrders);
              const isActive = userOrders.length > 0;
              
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
                          {lastOrderDate ? `Last order: ${formatDate(lastOrderDate)}` : 'No orders yet'}
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
                    <div className="flex space-x-4 text-sm">
                      <div>
                        <span className="text-gray-500">Orders:</span>
                        <span className="font-medium text-gray-900 ml-1">{userOrders.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Spent:</span>
                        <span className="font-semibold text-green-700 ml-1">₹{totalSpent.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewCustomer(customer._id)}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-[#1a2f4a] transition-colors duration-150"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
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
                          customerOrders.length > 0 ? 'active' : 'inactive'
                        )}`}
                      >
                        {customerOrders.length > 0 ? 'Active' : 'Inactive'}
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
            
            {/* Order History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80">Total Orders</div>
                    <div className="text-2xl font-bold mt-1">
                      {customerOrders.length}
                    </div>
                  </div>
                  <div className="bg-emerald-500 text-white p-4 rounded-lg text-center">
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80">Total Spent</div>
                    <div className="text-2xl font-bold mt-1">
                      ₹{calculateTotalSpent(customerOrders).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {customerOrders.length > 0 ? (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-4">Recent Orders</div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {customerOrders.reverse().slice(-5).map((order, index) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:border-green-600 transition-colors duration-150">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                Order #{order.orderId || `ORD-${index + 1}`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(order.createdAt)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {order.items?.length || 0} items
                              </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end">
                              <div className="font-semibold text-green-700 text-sm">
                                ₹{order.total?.toFixed(2) || '0.00'}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' : 
                                order.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                                'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              }`}>
                                {order.orderStatus === 'delivered' ? 'Delivered' : 
                                 order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-gray-500 text-sm">No orders found</div>
                    <div className="text-xs text-gray-400 mt-1">This customer hasn't placed any orders yet</div>
                  </div>
                )}
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
    </div>
  );
};

export default AdminCustomers;