import React from "react";
import { CircleCheck as CheckCircle, Truck, Clock, CircleAlert as AlertCircle, Circle as XCircle, Package } from "lucide-react";

const OrderHeader = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "processing":
        return <Clock className="h-5 w-5" />;
      case "pending":
        return <AlertCircle className="h-5 w-5" />;
      case "cancelled":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Order #{order.orderId}
        </h1>
        <p className="text-gray-600 mt-1">
          Placed on {formatDate(order.createdAt)}
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            order.orderStatus
          )}`}
        >
          {getStatusIcon(order.orderStatus)}
          <span className="ml-2 capitalize">{order.orderStatus}</span>
        </span>
      </div>
    </div>
  );
};

export default OrderHeader;
