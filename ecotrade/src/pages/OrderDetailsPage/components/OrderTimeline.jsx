import React from "react";
import { Calendar, CircleCheck as CheckCircle, Clock, Truck, Package, Circle as XCircle, Mail } from "lucide-react";

const OrderTimeline = ({ order }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    const historyItem = order.statusHistory?.find(item => item.status === status);
    return historyItem || null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100';
      case 'shipped':
        return 'bg-blue-100';
      case 'delivered':
        return 'bg-green-100';
      case 'cancelled':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Order Timeline
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Order Placed - Always shown */}
          <div className="flex items-start relative">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Order Placed</p>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Completed</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Dynamic status timeline based on status history */}
          {order.statusHistory?.slice(1).map((statusItem, index) => {
            const isCompleted = true; // All items in history are completed
            const isLast = index === order.statusHistory.length - 2;
            
            return (
              <div key={statusItem._id || index} className="flex items-start relative">
                {/* Connecting line */}
                {!isLast && (
                  <div className="absolute left-5 top-10 w-0.5 h-6 bg-gray-200"></div>
                )}
                
                <div className={`flex-shrink-0 w-10 h-10 ${getStatusColor(statusItem.status)} rounded-full flex items-center justify-center border-2 ${
                  isCompleted ? 'border-gray-300' : 'border-gray-200'
                }`}>
                  {getStatusIcon(statusItem.status)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {statusItem.status === 'processing' ? 'Order Processing' :
                       statusItem.status === 'shipped' ? 'Order Shipped' :
                       statusItem.status === 'delivered' ? 'Order Delivered' :
                       statusItem.status === 'cancelled' ? 'Order Cancelled' :
                       statusItem.status}
                    </p>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(statusItem.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;