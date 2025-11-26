import React from 'react';
import { Eye, Calendar, User, Package, DollarSign, CircleCheck as CheckCircle } from 'lucide-react';
import formatProductNames from  './formatProductNames'

export const OrdersTable = ({ orders, onViewOrder}) => {

  const getOrderStatus = (order) => order.orderStatus || 'processing';
  const getOrderTotal = (order) => order.total || 0;
  // Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR'
    }).format(amount || 0);
  };

  // Get status class helper
const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to slice product names
 

  // Mobile Card Component for small screens
  const MobileOrderCard = ({ order }) => {
    const orderStatus = getOrderStatus(order);
    const orderTotal = getOrderTotal(order);
    
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onViewOrder(order._id)}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-green-700 truncate">
              #{order.orderId || order._id.slice(-8)}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {order.user?.name || order.shippingAddress?.fullName || 'N/A'}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(orderStatus)}`}>
            {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Products</p>
              <p className="text-sm font-medium truncate">{formatProductNames(order)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-semibold text-green-600">{formatCurrency(orderTotal)}</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrder(order._id);
            }}
            className="text-green-700 hover:text-emerald-600 text-xs font-medium flex items-center space-x-1"
          >
            <Eye className="h-3 w-3" />
            <span>View</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="block md:hidden mb-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => <MobileOrderCard key={order._id} order={order} />)
        ) : (
          <div className="text-center py-10">No orders found.</div>
        )}
      </div>

      {/* Desktop/Tablet View - Table */}
      <div className="hidden md:block bg-white overflow-hidden shadow-sm rounded-lg mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Order Details</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Products</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="p-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders && orders.map((order) => {
                const orderStatus = getOrderStatus(order);
                const orderTotal = getOrderTotal(order);
                
                return (
                  <tr key={order._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewOrder(order._id)}>
                    <td className="p-4">
                      <div className="font-semibold text-green-700">#{order.orderId}</div>
                      <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="p-4">
                      <div>{order.user?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      {/* This will now work correctly as the backend provides the product name */}
                      {formatProductNames(order) || 'Unknown Product'}
                    </td>
                    <td className="p-4 font-semibold">{formatCurrency(orderTotal)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(orderStatus)}`}>
                        {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                      </span>
                    </td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrder(order._id);
                        }}
                        className="text-green-700 hover:text-emerald-600 inline-flex items-center text-sm font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;