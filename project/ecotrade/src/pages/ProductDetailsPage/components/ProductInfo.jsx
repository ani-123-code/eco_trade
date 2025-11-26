import React, { useState, useEffect } from 'react';
import { Minus, Plus, Check, ShoppingCart, Star, Truck as TruckIcon, ShieldCheck, Heart, Zap, TrendingDown, Percent, Calculator, CheckCircle, Bell } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useDispatch } from 'react-redux';
import { setUserWishlist } from '../../../store/slices/authSlice';
import { useToast } from '../../../contexts/ToastContext';
import { wishlistAPI } from '../../../api/wishlistAPI';
import stockNotificationAPI from '../../../api/stockNotificationAPI';

const ProductInfo = ({
  product,
  quantity,
  incrementQuantity,
  decrementQuantity,
  setQuantity,
  handleAddToCart,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  collectionName,
  scrollToReviews
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationPhone, setNotificationPhone] = useState('');
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: false,
    whatsapp: false
  });
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  useEffect(() => {
    if (user && user.wishlist) {
      setIsInWishlist(user.wishlist.some(id => id === product._id || id._id === product._id));
    }
    if (user && user.email) {
      setNotificationEmail(user.email);
    }
  }, [user, product._id]);
  // Safely extract type name as string with comprehensive validation
  let typeName = 'Refurbished Electronics';
  if (product && product.type) {
    if (typeof product.type === 'string' && product.type.trim()) {
      typeName = product.type.trim();
    } else if (typeof product.type === 'object' && product.type.name) {
      typeName = String(product.type.name).trim();
    }
  }

  // Safely extract collection name for display
  let safeCollectionName = 'Electronics';
  if (typeof collectionName === 'string' && collectionName.trim() && collectionName !== 'Unknown') {
    safeCollectionName = collectionName.trim();
  }

  // Calculate savings and discount percentage
  const originalPrice = product.originalPrice || product.price;
  const currentPrice = product.discountPrice || product.price;
  const savings = originalPrice - currentPrice;
  const discountPercentage = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const totalSavings = savings * quantity;

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast('Please login to manage wishlist', 'error');
      return;
    }

    setIsWishlistLoading(true);
    try {
      const response = await wishlistAPI.toggleWishlist(product._id);
      setIsInWishlist(response.isInWishlist);
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

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!notificationEmail) {
      showToast('Please enter your email', 'error');
      return;
    }

    if ((notificationChannels.sms || notificationChannels.whatsapp) && !notificationPhone) {
      showToast('Please enter your phone number for SMS/WhatsApp notifications', 'error');
      return;
    }

    setIsNotificationLoading(true);
    try {
      await stockNotificationAPI.requestNotification(
        product._id,
        notificationEmail,
        notificationPhone || undefined,
        notificationChannels
      );
      showToast('You will be notified when this product is back in stock!', 'success');
      setShowNotificationForm(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to subscribe to notifications', 'error');
    } finally {
      setIsNotificationLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col">
      <div className="mb-1 text-sm text-gray-500">{typeName}</div>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
      
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => {
            const fillPercent = Math.min(Math.max(product.rating - (star - 1), 0), 1) * 100;

            return (
              <div key={star} className="relative w-5 h-5 mr-0.5">
                <Star className="w-5 h-5 text-gray-200" fill="#E0E0E0" />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${fillPercent}%` }}
                >
                  <Star className="w-5 h-5 text-yellow-400" fill="#FCD34D" />
                </div>
              </div>
            );
          })}
          <span className="ml-2 text-sm font-medium">{product.rating}</span>
        </div>
        <span className="text-gray-300">|</span>
        <button
          onClick={scrollToReviews}
          className="text-sm text-gray-500 hover:text-green-700 hover:underline transition-colors duration-200 cursor-pointer"
        >
          {product.reviewCount} reviews
        </button>

        {/* Quality Check Badge */}
        {product.qualityCheckPoints && (
          <>
            <span className="text-gray-300">|</span>
            <div className="bg-green-50 border border-green-200 rounded-full px-3 py-1 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1.5" />
              <span className="text-sm font-semibold text-green-700">
                {product.qualityCheckPoints}-Point Quality Check
              </span>
            </div>
          </>
        )}
      </div>
      
      {/* Innovative Price Display */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 relative overflow-hidden">
          {/* Background Pattern */}
         
          
          <div className="relative z-10">
            {/* Price Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800">Certified Refurbished Price</h3>
              </div>
              {discountPercentage > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Main Price Display */}
            <div className="flex items-end mb-4">
              <div className="flex items-baseline">
                <span className="text-4xl md:text-5xl font-black text-green-700">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-lg text-green-600 ml-2">.00</span>
              </div>
              {originalPrice > currentPrice && (
                <div className="ml-4 flex flex-col">
                  <span className="text-lg text-gray-500 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-red-600 font-semibold">
                    Original Price
                  </span>
                </div>
              )}
            </div>

            {/* Savings Breakdown */}
            {savings > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 text-center border border-green-300">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-800">YOU SAVE</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    ₹{savings.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 text-center border border-green-300">
                  <div className="flex items-center justify-center mb-1">
                    <Percent className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-800">DISCOUNT</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    {discountPercentage}%
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 text-center border border-green-300">
                  <div className="flex items-center justify-center mb-1">
                    <Calculator className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-800">TOTAL SAVINGS</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    ₹{totalSavings.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}

            {/* Price Comparison */}
            <div className="bg-white/50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Market Price (New):</span>
                <span className="font-semibold text-gray-800">₹{originalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-green-700 font-medium">Reeown Price:</span>
                <span className="font-bold text-green-700">₹{currentPrice.toLocaleString('en-IN')}</span>
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-green-200">
                  <span className="text-green-800 font-bold">Your Savings:</span>
                  <span className="font-bold text-green-800 text-lg">₹{savings.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Quantity-based savings */}
            {quantity > 1 && savings > 0 && (
              <div className="mt-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 border border-green-300">
                <div className="flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-green-700 mr-2" />
                  <span className="text-sm font-bold text-green-800">
                    Total Savings with {quantity} items: ₹{totalSavings.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <p className={`text-gray-600 ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
          {product.description}
        </p>
        {product.description.length > 150 && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-green-700 text-sm font-medium hover:text-emerald-600 mt-1"
          >
            {isDescriptionExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      
      {/* Key Features */}
      {product.features && product.features.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Key Features</h3>
          <ul className="space-y-1">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-700 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Stock */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            product.stock > 5 ? 'bg-green-500' :
            product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : ''}`}>
            {product.stock > 5
              ? 'In Stock'
              : product.stock > 0
              ? `Low Stock (${product.stock} left)`
              : 'Sold Out'}
          </span>
        </div>
        {product.stock === 0 && (
          <div className="mt-3 space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700 font-medium mb-2">
                This item is currently out of stock.
              </p>
              {!showNotificationForm && (
                <button
                  onClick={() => setShowNotificationForm(true)}
                  className="text-sm text-green-700 font-semibold hover:text-green-800 flex items-center"
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Notify me when available
                </button>
              )}
            </div>

            {/* Notification Form */}
            {showNotificationForm && (
              <form onSubmit={handleNotifyMe} className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-base font-semibold text-green-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Get Notified When Back in Stock
                </h4>

                {/* Email Input */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                {/* Phone Input */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number {(notificationChannels.sms || notificationChannels.whatsapp) && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    value={notificationPhone}
                    onChange={(e) => setNotificationPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    maxLength="10"
                    pattern="[0-9]{10}"
                  />
                </div>

                {/* Notification Preferences */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Notify me via:</label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationChannels.email}
                        onChange={(e) => setNotificationChannels({...notificationChannels, email: e.target.checked})}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">📧 Email</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationChannels.sms}
                        onChange={(e) => setNotificationChannels({...notificationChannels, sms: e.target.checked})}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">📱 SMS (requires phone number)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationChannels.whatsapp}
                        onChange={(e) => setNotificationChannels({...notificationChannels, whatsapp: e.target.checked})}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">💬 WhatsApp (requires phone number)</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isNotificationLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isNotificationLoading ? 'Subscribing...' : 'Notify Me'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowNotificationForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      
      {/* Quantity Selector and Add to Cart */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className={`flex items-center border border-gray-300 rounded-md w-36 ${
          product.stock === 0 ? 'opacity-50' : ''
        }`}>
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1 || product.stock === 0}
            className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-green-700 disabled:opacity-50"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val > 0 && val <= product.stock) {
                setQuantity(val);
              }
            }}
            className="h-10 w-16 border-0 text-center focus:ring-0"
            min="1"
            max={product.stock}
            disabled={product.stock === 0}
          />
          <button
            onClick={incrementQuantity}
            disabled={quantity >= product.stock || product.stock === 0}
            className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-green-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<ShoppingCart className="h-5 w-5" />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          fullWidth
          className={`flex-1 ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''}`}
        >
          {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
        </Button>
        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className="w-14 h-10 flex items-center justify-center border-2 border-gray-300 rounded-md hover:border-red-500 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-5 w-5 transition-all duration-200 ${
              isInWishlist
                ? 'text-red-500 fill-red-500'
                : 'text-gray-400'
            }`}
          />
        </button>
      </div>
      
      {/* Benefits */}
      <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
        <div className="flex items-center">
          <TruckIcon className="h-5 w-5 text-green-700 mr-3" />
          <span className="text-sm">Free shipping on all certified refurbished devices across India. EMI available on products over ₹1,500 at checkout.</span>
        </div>
        
        <div className="flex items-center">
          <ShieldCheck className="h-5 w-5 text-green-700 mr-3" />
          <span className="text-sm">
            {(product.warranty && product.warranty) || '6 months'} warranty on certified refurbished device
          </span>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4 mt-auto">
        <div className="flex items-center text-sm">
          <span className="text-gray-500">SKU: {product._id ? String(product._id) : 'N/A'}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-500">Collection: {safeCollectionName}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;