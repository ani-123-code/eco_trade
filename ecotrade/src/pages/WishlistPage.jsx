import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch } from 'react-redux';
import { setUserWishlist } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { wishlistAPI } from '../api/wishlistAPI';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const WishlistPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      setWishlistProducts(response.wishlist || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      // Update page list and global auth wishlist so header badge updates
      setWishlistProducts(response.wishlist || []);
      if (response.wishlist) dispatch(setUserWishlist(response.wishlist));
      showToast('Removed from wishlist', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to remove from wishlist', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const cartProduct = {
        id: product._id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.image,
        stock: product.stock,
        collection: product.collection?.name || product.collection,
        type: product.type?.name || product.type
      };
      await addToCart(cartProduct, 1);
      showToast('Added to cart successfully!', 'success');
    } catch (error) {
      showToast('Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="h-8 w-8 text-red-500 fill-red-500 mr-3" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">
              Start adding products you love to your wishlist
            </p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
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

                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-red-50"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
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
                      {product.name}
                    </h3>
                  </Link>

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
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-2 rounded-md transition-all duration-300 flex items-center justify-center ${
                      product.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
