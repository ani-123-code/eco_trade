import React from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../../../components/ui/Button";
import ReviewStatusIndicator from "./ReviewStatusIndicator";

const OrderItems = ({ items, orderStatus, onWriteReview, orderId }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const hasUserReviewed = (product) => {
    if (!product.reviews || !user || !orderId) return false;
    
    // Convert both IDs to strings for comparison to handle ObjectId vs string mismatch
    const orderIdStr = orderId.toString();
    const userIdStr = user._id.toString();
    
    return product.reviews.some(review => {
      const reviewUserIdStr = review.user._id ? review.user._id.toString() : review.user.toString();
      const reviewOrderIdStr = review.orderId ? review.orderId.toString() : '';
      
      return reviewUserIdStr === userIdStr && reviewOrderIdStr === orderIdStr;
    });
  };

  // Helper function to get user's review for this product and order
  const getUserReview = (product) => {
    if (!product.reviews || !user || !orderId) return null;

    // Convert both IDs to strings for comparison
    const orderIdStr = orderId.toString();
    const userIdStr = user._id.toString();

    return product.reviews.find(review => {
      const reviewUserIdStr = review.user._id ? review.user._id.toString() : review.user.toString();
      const reviewOrderIdStr = review.orderId ? review.orderId.toString() : '';

      return reviewUserIdStr === userIdStr && reviewOrderIdStr === orderIdStr;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Order Items
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item, index) => {
          const isReviewed = hasUserReviewed(item.product);
          const userReview = getUserReview(item.product);

          return (
            <div
              key={`${item.product._id || item.product}-${index}`}
              className="p-6"
            >
              <div className="flex items-start">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={
                      item.product.image ||
                      item.product.images?.[0] ||
                      "/placeholder-image.jpg"
                    }
                    alt={item.product.name || "Product"}
                    className="h-full w-full object-contain cursor-pointer"
                    onClick={() => navigate(`/product/${item.product.id || item.product._id}`)}
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900">
                        {item.product.name || "Product Name"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Price: ₹{item.price.toFixed(2)} each
                      </p>
                      
                      {/* Review status indicator */}
                      <ReviewStatusIndicator 
                        hasReviewed={isReviewed}
                        userReview={userReview}
                      />
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-base font-medium text-gray-900 mb-2">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      
                      {/* Conditional rendering: Show review button only if order is delivered AND user hasn't reviewed */}
                      {orderStatus === "delivered" && !isReviewed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onWriteReview(item.product)}
                          className="text-xs"
                        >
                          Write Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItems;