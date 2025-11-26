import React from "react";
import { Star, CheckCircle } from "lucide-react";

const ReviewStatusIndicator = ({ hasReviewed, userReview }) => {
  if (!hasReviewed) return null;

  // Function to render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "text-yellow-500 fill-yellow-500"
            : "text-gray-300 fill-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="font-medium">Reviewed</span>
        </div>
        
        {userReview && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(userReview.rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {userReview.rating}/5
            </span>
          </div>
        )}
      </div>
      
      {userReview && userReview.comment && (
        <div className="mt-2 text-xs text-gray-600">
          <p className="italic">"{userReview.comment}"</p>
        </div>
      )}
    </div>
  );
};

export default ReviewStatusIndicator;