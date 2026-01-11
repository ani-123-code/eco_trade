import React from "react";
import Button from "../../../components/ui/Button";

const OrderActions = ({
  order,
//   onTrackOrder,
  onCompletePayment,
  onDownloadInvoice,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 space-y-3">
        {/* <Button variant="outline" className="w-full" onClick={onTrackOrder}>
          Track Order
        </Button> */}

        {order.paymentStatus === "pending" && (
          <Button variant="primary" className="w-full" onClick={onCompletePayment}>
            Complete Payment
          </Button>
        )}

        <Button variant="outline" className="w-full" onClick={onDownloadInvoice}>
          Download Invoice
        </Button>
      </div>
    </div>
  );
};

export default OrderActions;