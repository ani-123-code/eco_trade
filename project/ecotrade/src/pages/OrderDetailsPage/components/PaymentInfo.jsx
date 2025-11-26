import React from "react";
import { CreditCard } from "lucide-react";

const PaymentInfo = ({ order }) => {
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Information
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Payment Method</p>
          <p className="font-medium capitalize">{order.paymentMethod}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Payment Status</p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
              order.paymentStatus
            )}`}
          >
            {order.paymentStatus.charAt(0).toUpperCase() +
              order.paymentStatus.slice(1)}
          </span>
        </div>
        {order.paymentId && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Payment ID</p>
            <p className="text-sm font-mono bg-gray-50 p-2 rounded">
              {order.paymentId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInfo;