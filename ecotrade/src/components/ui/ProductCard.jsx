import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Zap, Crown, Flame, Heart, CheckCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDispatch } from 'react-redux';
import { setUserWishlist } from '../../store/slices/authSlice';
import { wishlistAPI } from '../../api/wishlistAPI';

const ProductCard = ({ product, viewMode = 'grid', showGamification = false }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    if (user && user.wishlist) {
      setIsInWishlist(user.wishlist.some(id => id === product._id || id._id === product._id));
    }
  }, [user, product._id]);
  
  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Gamification features
  const isHotDeal = discountPercentage > 30;
  const isHighRated = product.rating >= 4.5;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart(product, 1);
      showToast('Added to cart successfully!', 'success');
    } catch (error) {
      showToast('Please login to add items to cart', 'error');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please login to manage wishlist', 'error');
      return;
    }

    setIsWishlistLoading(true);
    try {
      const response = await wishlistAPI.toggleWishlist(product._id);
      setIsInWishlist(response.isInWishlist);
      // Update global auth state so header wishlist count updates immediately
      if (response.wishlist) {
        dispatch(setUserWishlist(response.wishlist));
      }
      showToast(
        response.isInWishlist ? 'Added to wishlist!' : 'Removed from wishlist',
        'success'
      );
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update wishlist', 'error');
    } finally {
      setIsWishlistLoading(false);
    }
  };
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 transition-colors ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="flex">
          <div className="w-48 h-48 flex-shrink-0 relative">
            {/* Wishlist Heart Icon */}
            <button
              onClick={handleToggleWishlist}
              disabled={isWishlistLoading}
              className="absolute top-2 right-2 z-20 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-200 ${
                  isInWishlist
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              />
            </button>

            {/* Gamification Badges */}
            {showGamification && (
              <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                {isHotDeal && (
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                    <Flame className="h-3 w-3 mr-1" />
                    HOT
                  </div>
                )}
                {isHighRated && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    TOP
                  </div>
                )}
              </div>
            )}
            
            <Link to={`/product/${product._id}`}>
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110 ${product.stock === 0 ? 'opacity-50' : ''}`}
              />
            </Link>
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-md transform -rotate-12 shadow-lg">
                  SOLD OUT
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 p-6">
            <Link to={`/product/${product._id}`}>
              <h3 className="text-lg font-semibold mb-2 hover:text-green-700">
                {product.name}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Quality Check Badge */}
            {product.qualityCheckPoints && (
              <div className="flex items-center mb-2">
                <div className="bg-green-50 border border-green-200 rounded-full px-3 py-1 flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-green-700">
                    {product.qualityCheckPoints}-Point Quality Check
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {renderStars(product.rating || 0)}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviewCount || 0})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {product.discountPrice ? (
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-green-700">
                      ₹{product.discountPrice.toFixed(2)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-green-700">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <button
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className={`px-4 py-2 rounded-md transition-all duration-300 flex items-center transform hover:scale-105 ${
                  product.stock === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group relative transform hover:scale-105">
      {/* Wishlist Heart Icon */}
      <button
        onClick={handleToggleWishlist}
        disabled={isWishlistLoading}
        className="absolute top-2 right-2 z-30 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`h-5 w-5 transition-all duration-200 ${
            isInWishlist
              ? 'text-red-500 fill-red-500'
              : 'text-gray-400 hover:text-red-500'
          }`}
        />
      </button>

      {/* Gamification Badges */}
      {showGamification && (
        <>
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {isHotDeal && (
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse shadow-lg">
                <Flame className="h-3 w-3 mr-1" />
                HOT
              </div>
            )}
            {isHighRated && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                <Crown className="h-3 w-3 mr-1" />
                TOP
              </div>
            )}
            {isLowStock && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                ONLY {product.stock} LEFT!
              </div>
            )}
          </div>
          
          {/* Sparkle Effects */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </>
      )}

      <div className="relative">
        <Link to={`/product/${product._id}`}>
          <div className="aspect-square bg-gray-50 p-4">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                product.stock === 0 ? 'opacity-50' : ''
              }`}
            />
          </div>
        </Link>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white px-6 py-3 text-base font-bold rounded-md transform -rotate-12 shadow-lg">
              SOLD OUT
            </div>
          </div>
        )}
        {product.stock > 0 && discountPercentage > 0 && product.discountPrice && product.discountPrice < product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
            {discountPercentage}% OFF
          </div>
        )}
        {product.stock > 0 && product.newArrival && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs font-semibold rounded">
            CERTIFIED
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">
          {(() => {
            if (product && product.type) {
              if (typeof product.type === 'string' && product.type.trim()) {
                return product.type.trim();
              } else if (typeof product.type === 'object' && product.type.name) {
                return String(product.type.name).trim();
              }
            }
            return 'Certified Refurbished';
          })()}
        </div>
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold mb-2 line-clamp-2 hover:text-green-700 transition-colors">
            {product && product.name ? String(product.name) : 'Product'}
          </h3>
        </Link>
        
        {/* Quality Check Badge */}
        {product.qualityCheckPoints && (
          <div className="flex items-center mb-2">
            <div className="bg-green-50 border border-green-200 rounded-full px-2 py-1 flex items-center">
              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-700">
                {product.qualityCheckPoints}-Point Check
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {renderStars(product.rating || 0)}
            <span className="ml-2 text-sm text-gray-600">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          {product.discountPrice ? (
            <div>
              <span className="text-lg font-bold text-green-700">
                ₹{product.discountPrice.toFixed(2)}
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                ₹{product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-green-700">
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>
        
        <button
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-md transition-all duration-300 flex items-center justify-center transform hover:scale-105 relative overflow-hidden ${
            product.stock === 0
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {/* Button Shine Effect */}
          {product.stock > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
          )}
          
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Sold Out' : (
            <>
              Add to Cart
              {showGamification && isHotDeal && <span className="ml-2">🔥</span>}
              {showGamification && <span className="ml-2 text-xs opacity-75">+10 XP</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;