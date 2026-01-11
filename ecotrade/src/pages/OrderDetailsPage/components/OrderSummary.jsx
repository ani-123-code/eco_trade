import React from "react";

const OrderSummary = ({ order }) => {
  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal (incl. GST)</span>
          <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-base font-semibold">Total</span>
            <span className="text-base font-semibold">
              ₹{order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;