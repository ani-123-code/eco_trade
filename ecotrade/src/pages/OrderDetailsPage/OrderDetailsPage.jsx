import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader as Loader2, CircleAlert as AlertCircle, Package } from "lucide-react";
import Button from "../../components/ui/Button";
import { fetchOrderDetails, resetOrder } from "../../store/slices/orderSlice";
import { rateProduct } from "../../store/slices/productSlice";
import { useToast } from "../../contexts/ToastContext";
import OrderHeader from "./components/OrderHeader";
import OrderItems from "./components/OrderItems";
import ShippingAddress from "./components/ShippingAddress";
import OrderTimeline from "./components/OrderTimeline";
import OrderSummary from "./components/OrderSummary";
import PaymentInfo from "./components/PaymentInfo";
import OrderActions from "./components/OrderActions";
import RatingModal from "./components/RatingModal";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { order, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (user && orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
    return () => {
      dispatch(resetOrder());
    };
  }, [dispatch, orderId, user]);

  // Poll for order updates every 30 seconds if order is not delivered/cancelled
  useEffect(() => {
    if (!order || !user) return;
    
    const shouldPoll = order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled';
    if (!shouldPoll) return;
    
    const pollInterval = setInterval(() => {
      dispatch(fetchOrderDetails(orderId));
    }, 30000); // Poll every 30 seconds for active orders
    
    return () => clearInterval(pollInterval);
  }, [dispatch, orderId, order?.orderStatus, user]);
  const handleRateProduct = async (productId, ratingData) => {
    try {
      await dispatch(
        rateProduct({
          productId,
          ratingData: {
            ...ratingData,
            orderId: order._id,
          },
        })
      ).unwrap();
      
      setShowRatingModal(false);
      setSelectedProduct(null);
      showSuccess("Review submitted successfully!");
      
      // Refresh the order details to get updated review status
      dispatch(fetchOrderDetails(orderId));
    } catch (error) {
      console.error("Rating failed:", error);
      showError(error.message || "Failed to submit review. Please try again.");
    }
  };

  const handleTrackOrder = () => {
    console.log("Track order:", order._id);
    // showInfo("Tracking functionality coming soon!");
  };

  const handleCompletePayment = () => {
    // Add payment functionality
    console.log("Complete payment:", order._id);
    showInfo("Redirecting to payment...");
  };

  // Updated to handle individual product reviews
  const handleWriteReview = (product) => {
    setSelectedProduct(product);
    setShowRatingModal(true);
  };

  const handleDownloadInvoice = () => {
    try {
      // Create invoice HTML content
      const invoiceContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${order.orderId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .invoice-header h1 { color: #16a34a; font-size: 32px; margin-bottom: 10px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info div { flex: 1; }
            .invoice-info h3 { color: #16a34a; margin-bottom: 10px; font-size: 14px; }
            .invoice-info p { font-size: 12px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #16a34a; color: white; padding: 12px; text-align: left; font-size: 12px; }
            td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 12px; }
            .text-right { text-align: right; }
            .summary { margin-left: auto; width: 300px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; }
            .summary-row.total { border-top: 2px solid #333; font-weight: bold; font-size: 14px; margin-top: 10px; padding-top: 10px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #666; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
            .status-completed { background-color: #dcfce7; color: #16a34a; }
            .status-processing { background-color: #fef3c7; color: #d97706; }
            .status-shipped { background-color: #dbeafe; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>INVOICE</h1>
            <p style="font-size: 14px; color: #666;">Order #${order.orderId}</p>
          </div>

          <div class="invoice-info">
            <div>
              <h3>BILL TO:</h3>
              <p><strong>${order.shippingAddress.fullName}</strong></p>
              <p>${order.shippingAddress.address}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
              <p>${order.shippingAddress.country}</p>
              ${order.shippingAddress.phone ? `<p>Phone: ${order.shippingAddress.phone}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <h3>ORDER DETAILS:</h3>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Status:</strong> <span class="status-badge status-${order.orderStatus}">${order.orderStatus.toUpperCase()}</span></p>
              <p><strong>Payment:</strong> ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Product</th>
                <th style="width: 15%;">Price</th>
                <th style="width: 15%;">Quantity</th>
                <th style="width: 20%;" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product.name || 'Product'}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>₹${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span style="color: #16a34a; font-weight: 600;">FREE</span>
            </div>
            <div class="summary-row total">
              <span>TOTAL:</span>
              <span>₹${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>For any questions about this invoice, please contact our support team.</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };

        showSuccess("Invoice opened in new window. Use your browser's print dialog to save as PDF.");
      } else {
        showError("Please allow pop-ups to download the invoice.");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      showError("Failed to generate invoice. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
              <span className="ml-3 text-lg">Loading order details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Error Loading Order
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => navigate("/orders")}>
                  Back to Orders
                </Button>
                <Button
                  variant="primary"
                  onClick={() => dispatch(fetchOrderDetails(orderId))}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order && !loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Order Found
              </h2>
              <p className="text-gray-600 mb-4">Order ID: {orderId}</p>
              <Link to="/orders">
                <Button variant="primary">Back to Orders</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If still loading or no data, show loading
  if (!order) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
              <span className="ml-3 text-lg">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/orders"
              className="inline-flex items-center text-green-700 hover:text-emerald-600 mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
            <OrderHeader order={order} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <OrderItems 
                items={order.items} 
                orderStatus={order.orderStatus}
                onWriteReview={handleWriteReview}
                orderId={order._id}
              />
              <ShippingAddress address={order.shippingAddress} />
              <OrderTimeline order={order} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <OrderSummary order={order} />
              <PaymentInfo order={order} />
              <OrderActions
                order={order}
                onTrackOrder={handleTrackOrder}
                onCompletePayment={handleCompletePayment}
                onDownloadInvoice={handleDownloadInvoice}
              />
            </div>
          </div>
        </div>
      </div>

      {showRatingModal && selectedProduct && (
        <RatingModal
          product={selectedProduct}
          onSubmit={handleRateProduct}
          onCancel={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};

export default OrderDetailsPage;