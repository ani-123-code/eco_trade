import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { rateProduct } from "../../../store/slices/productSlice";
import { useToast } from "../../../contexts/ToastContext";
import { Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Send, User, Mail, Shield, CircleCheck as CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const ProductReviews = ({
  product,
  currentReviewPage,
  setCurrentReviewPage,
  reviewsPerPage,
}) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { showSuccess, showError } = useToast();
  
  // State for expanded comments
  const [expandedComments, setExpandedComments] = useState({});
  
  // State for review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    reviewerName: '',
    reviewerEmail: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Filter reviews to only include those with comments
  const validReviews =
    product?.reviews?.filter(
      (review) => review.comment && review.comment.trim() !== ""
    ) || [];

  // Pagination logic for reviews
  const paginatedReviews = validReviews.slice(
    (currentReviewPage - 1) * reviewsPerPage,
    currentReviewPage * reviewsPerPage
  );

  const totalPages = Math.ceil(validReviews.length / reviewsPerPage);

  const handlePreviousPage = () => {
    if (currentReviewPage > 1) {
      setCurrentReviewPage(currentReviewPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentReviewPage < totalPages) {
      setCurrentReviewPage(currentReviewPage + 1);
    }
  };

  // Function to toggle comment expansion
  const toggleCommentExpansion = (reviewId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  // Function to check if comment needs truncation
  const needsTruncation = (comment) => {
    return comment.split(" ").length > 100;
  };

  // Function to truncate comment
  const truncateComment = (comment, limit = 100) => {
    const words = comment.split(" ");
    if (words.length <= limit) return comment;
    return words.slice(0, limit).join(" ") + "...";
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation to reduce bad requests
    if (!reviewForm.comment.trim()) {
      showError('Please write a review comment');
      return;
    }

    if (!reviewForm.rating || reviewForm.rating <= 0) {
      showError('Please provide a rating (1-5 stars)');
      return;
    }

    if (!isAuthenticated) {
      if (!reviewForm.reviewerName || !reviewForm.reviewerEmail) {
        showError('Please provide your name and email to submit a public review');
        return;
      }
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(reviewForm.reviewerEmail)) {
        showError('Please provide a valid email address');
        return;
      }
    }

    setSubmittingReview(true);

    try {
      const ratingData = {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      };

      // If user is not authenticated, include name/email for public review
      if (!isAuthenticated) {
        if (reviewForm.reviewerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewForm.reviewerEmail)) {
          showError('Please provide a valid email or leave it blank');
          setSubmittingReview(false);
          return;
        }
        if (reviewForm.reviewerName && reviewForm.reviewerName.trim()) {
          ratingData.reviewerName = reviewForm.reviewerName.trim();
        }
        if (reviewForm.reviewerEmail && reviewForm.reviewerEmail.trim()) {
          ratingData.reviewerEmail = reviewForm.reviewerEmail.trim();
        }
      }

      await dispatch(
        rateProduct({ productId: product._id, ratingData })
      ).unwrap();

      showSuccess('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '', reviewerName: '', reviewerEmail: '' });
    } catch (error) {
      // Normalize error payloads (could be string or object from rejectWithValue)
      const errObj = typeof error === 'string' ? { message: error } : (error || {});
      console.error('Review submit error:', errObj);
      if (errObj.requiresPurchase) {
        showError('You can only review products you have purchased');
      } else {
        const msg = errObj.message || (errObj.error && errObj.error.message) || JSON.stringify(errObj);
        showError(msg || 'Failed to submit review');
      }
    } finally {
      setSubmittingReview(false);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
      <div className="p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h2 className="text-xl lg:text-2xl font-bold">Customer Reviews</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowReviewForm(!showReviewForm)}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Write Review
          </Button>
        </div>

        {showReviewForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {isAuthenticated ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Logged-in users can leave reviews. If you purchased this product your review will be marked as a verified purchase.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <Input
                    name="reviewerName"
                    value={reviewForm.reviewerName}
                    onChange={handleFormChange}
                    placeholder="Your name (required)"
                    required
                  />
                  <Input
                    name="reviewerEmail"
                    value={reviewForm.reviewerEmail}
                    onChange={handleFormChange}
                    placeholder="Your email (required)"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      className="text-2xl hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-1"
                    >
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-colors duration-200 ${
                          star <= (hoverRating || reviewForm.rating)
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">{reviewForm.rating} out of 5 stars</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Click on a star to rate this product</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={submittingReview} leftIcon={<Send className="h-4 w-4" />}>Submit Review</Button>
              </div>
            </form>
          </div>
        )}

        {/* Two Column Layout */}
        {product.reviews && product.reviews.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - 30% width */}
          <div className="w-full lg:w-[30%] space-y-6">
            {/* Overall Rating */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="bg-gradient-to-br from-green-600 to-[#3A5A7A] rounded-lg p-4 lg:p-6 text-white text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  {product.rating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = product.rating;
                    const isFullStar = star <= Math.floor(rating);
                    const isPartialStar =
                      star === Math.ceil(rating) && rating % 1 !== 0;
                    const partialPercent = isPartialStar
                      ? (rating % 1) * 100
                      : 0;

                    return (
                      <div key={star} className="relative">
                        {isPartialStar ? (
                          <div className="relative">
                            <Star className="h-4 w-4 lg:h-5 lg:w-5 text-white/40" />
                            <div
                              className="absolute top-0 left-0 overflow-hidden"
                              style={{ width: `${partialPercent}%` }}
                            >
                              <Star className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 fill-[#C87941]" />
                            </div>
                          </div>
                        ) : (
                          <Star
                            className={`h-4 w-4 lg:h-5 lg:w-5 ${
                              isFullStar
                                ? "text-emerald-600 fill-[#C87941]"
                                : "text-white/40"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs lg:text-sm text-white/80">
                  Based on {product.reviewCount} reviews
                </div>
              </div>
            )}

            {/* Rating Breakdown */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-900">
                  Rating Breakdown
                </h3>
                <div className="space-y-2 lg:space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = product.reviews
                      ? product.reviews.filter(
                          (r) => Math.round(r.rating) === rating
                        ).length
                      : 0;
                    const percentage =
                      product.reviewCount > 0
                        ? (count / product.reviewCount) * 100
                        : 0;

                    return (
                      <div key={rating} className="flex items-center space-x-0">
                        <div className="flex items-center space-x-1 w-14 lg:w-16">
                          <span className="text-xs lg:text-sm font-medium w-3">
                            {rating}
                          </span>
                          <Star className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600 fill-[#C87941]" />
                        </div>
                        <div className="flex-1 h-2 lg:h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#D4935C] rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs lg:text-sm text-gray-600 w-6 lg:w-8 text-right font-medium">
                          {count}
                        </span>
                        <span className="text-xs text-gray-500 w-10 lg:w-12 text-right">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 70% width */}
          <div className="w-full lg:w-[70%]">
            {/* Reviews List */}
            <div className=" lg:pt-6">
              {validReviews.length > 0 ? (
                <>
                  {/* Reviews List */}
                  <div className="space-y-4 lg:space-y-6">
                    {paginatedReviews.map((review) => {
                      const isExpanded = expandedComments[review._id];
                      const needsExpansion = needsTruncation(review.comment);
                      
                      // Get reviewer name - support both old and new format
                      const reviewerName = review.reviewerName || review.user?.name || "Anonymous";
                      const isVerifiedPurchase = review.isVerifiedPurchase || !!review.orderId;

                      return (
                        <div
                          key={review._id}
                          className="bg-white border border-gray-200 rounded-lg p-4 lg:p-4 "
                        >
                          <div className="flex items-start justify-between mb-3 lg:mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-[#3A5A7A] rounded-full flex items-center justify-center text-white font-semibold text-base lg:text-lg">
                                {reviewerName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                {/* Stars on top */}
                                <div className="flex mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 lg:h-4 lg:w-4 ${
                                        star <= review.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>

                                {/* Name + Verified Badge */}
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900 text-sm lg:text-base">
                                    {reviewerName}
                                  </span>
                                  {isVerifiedPurchase ? (
                                    <span className="text-[10px] bg-green-600 text-white px-1 py-0.5 rounded-full font-medium">
                                      ✓ Verified Purchase
                                    </span>
                                  ) : review.user ? (
                                    <span className="text-[10px] bg-blue-600 text-white px-1 py-0.5 rounded-full font-medium">
                                      ✓ Verified User
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-gray-500 text-white px-1 py-0.5 rounded-full font-medium">
                                      Public Review
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs lg:text-sm text-gray-500 font-medium">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>

                          <div className="ml-13 lg:ml-15">
                            <p className="text-gray-700 text-xs lg:text-sm leading-relaxed">
                              {isExpanded || !needsExpansion
                                ? review.comment
                                : truncateComment(review.comment)}
                            </p>

                            {needsExpansion && (
                              <button
                                onClick={() =>
                                  toggleCommentExpansion(review._id)
                                }
                                className="mt-2 flex items-center space-x-1 text-green-700 hover:text-[#3A5A7A] text-sm font-medium transition-colors duration-200"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Show less</span>
                                    <ChevronUp className="h-4 w-4" />
                                  </>
                                ) : (
                                  <>
                                    <span>Read more</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 lg:py-16">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-400 mb-2">
                    No reviews yet
                  </h3>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
                  <div className="text-xs lg:text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentReviewPage - 1) * reviewsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentReviewPage * reviewsPerPage,
                        validReviews.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{validReviews.length}</span>{" "}
                    reviews
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentReviewPage === 1}
                      className="px-3 py-2 text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden lg:inline ml-1">Previous</span>
                    </Button>

                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isActive = pageNumber === currentReviewPage;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentReviewPage(pageNumber)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-green-600 text-white shadow-lg transform scale-105"
                                : "text-gray-500 hover:text-green-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentReviewPage === totalPages}
                      className="px-3 py-2 text-sm"
                    >
                      <span className="hidden lg:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        ) : (
          <div className="text-center py-12 lg:py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Star className="h-16 w-16 mx-auto text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to share your experience with this product!
              </p>
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Write First Review
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;