import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CircleCheck as CheckCircle, Package, ArrowRight, Hop as Home } from 'lucide-react';
import Button from '../components/ui/Button';

const OrderSuccessPage= () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentId } = location.state || {};

  useEffect(() => {
    // If no order data, redirect to home
    if (!orderId || !paymentId) {
      navigate('/', { replace: true });
    }
  }, [orderId, paymentId, navigate]);

  if (!orderId || !paymentId) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
            
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold text-green-700">#{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="font-semibold">{paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                </div>
              </div>
            </div>
            
            {/* What's Next */}
            <div className="text-left mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="h-6 w-6 text-green-700 mr-2" />
                What happens next?
              </h2>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                    1
                  </div>
                  <p>We'll send you an order confirmation email with tracking details</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                    2
                  </div>
                  <p>Your order will be processed and prepared for shipping</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                    3
                  </div>
                  <p>You'll receive tracking information once your order ships</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/orders">
                <Button variant="primary" leftIcon={<Package className="h-5 w-5" />}>
                  Track Your Order
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" leftIcon={<Home className="h-5 w-5" />}>
                  Continue Shopping
                </Button>
              </Link>
            </div>
            
            {/* Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team at{' '}
                <a href="mailto:team@eco-dispose.com" className="text-green-700 hover:text-emerald-600">
                  team@eco-dispose.com
                </a>{' '}
                or call{' '}
                <a href="tel:8861009443" className="text-green-700 hover:text-emerald-600">
                  8861009443
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;