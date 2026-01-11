import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const subtotal = cart.subtotal || 0;
  const total = subtotal;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 mt-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/products">
              <Button
                variant="primary"
                leftIcon={<ShoppingBag className="h-5 w-5" />}
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-2">Your Shopping Cart</h1>
          <p className="text-gray-600">
            {cart.items.length} items in your cart
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Cart
                  </button>
                </div>
              </div>

              <ul className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <li
                    key={item.product.id || item.product._id}
                    className="p-6 flex flex-col sm:flex-row"
                  >
                    <div className="sm:w-1/4 mb-4 sm:mb-0">
                      <Link
                        to={`/product/${item.product.id || item.product._id}`}
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 object-contain mx-auto sm:mx-0"
                        />
                      </Link>
                    </div>

                    <div className="sm:w-2/4 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/product/${item.product.id || item.product._id}`}
                          className="hover:text-green-700"
                        >
                          <h3 className="font-medium mb-1">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.product.type?.name || "General"}
                        </p>

                        <div className="flex items-center mb-4 sm:mb-0">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id || item.product._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-green-700 disabled:opacity-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (
                                  !isNaN(val) &&
                                  val > 0 &&
                                  val <= (item.product.stock || 999)
                                ) {
                                  updateQuantity(
                                    item.product.id || item.product._id,
                                    val
                                  );
                                }
                              }}
                              className="h-8 w-12 border-0 text-center text-sm focus:ring-0"
                              min="1"
                              max={item.product.stock || 999}
                            />
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id || item.product._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >= (item.product.stock || 999)
                              }
                              className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-green-700 disabled:opacity-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sm:w-1/4 flex flex-col items-end justify-between">
                      <div className="text-right">
                        {item.product.discountPrice ? (
                          <div>
                            <span className="font-semibold">
                              ₹{(item.product.discountPrice || 0).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 ml-2 line-through">
                              ₹{(item.product.price || 0).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold">
                            ₹{(item.product.price || 0).toFixed(2)}
                          </span>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Subtotal: ₹
                          {(
                            (item.product.discountPrice ||
                              item.product.price ||
                              0) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(item.product.id || item.product._id)
                        }
                        className="text-red-600 hover:text-red-800 text-sm flex items-center mt-4 sm:mt-0"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="p-6 border-t border-gray-100">
                <Link
                  to="/products"
                  className="flex items-center text-green-700 hover:text-emerald-600 text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {/* Order Summary + Secure Payments */}
          <div className="lg:w-1/3 sticky top-24 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Subtotal (GST included)
                    </span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>

                  <div className="border-t border-gray-100 my-4 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  Free shipping on all refurbished electronics across India
                </p>
              </div>
            </div>

            {/* Secure Payment Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800">
                  100% Secure Payments
                </h3>
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <img
                src="/assets/razorpay.jpg"
                alt="Accepted payment methods via Razorpay"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
