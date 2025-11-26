function orderConfirmationTemplate(order, user) {
  // Calculate pricing details
  const totalProductPrice = order.items.reduce((sum, item) => {
    const priceWithoutGst = item.price / 1.18; // Extract base price
    return sum + (priceWithoutGst * item.quantity);
  }, 0);
  const totalGstAmount = order.items.reduce((sum, item) => {
    const priceWithoutGst = item.price / 1.18;
    const gstAmount = priceWithoutGst * 0.18;
    return sum + (gstAmount * item.quantity);
  }, 0);
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCharges = 0; // Free delivery
  const totalAmount = totalProductPrice + totalGstAmount; // Same as order total

  const orderItemsHTML = order.items.map(item => {
    const priceWithoutGst = item.price / 1.18;
    const gstAmount = priceWithoutGst * 0.18;
    const totalWithoutGst = priceWithoutGst * item.quantity;
    const totalGst = gstAmount * item.quantity;
    const totalPrice = totalWithoutGst + totalGst;
    
    
    return `
      <tr>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; vertical-align: top;">
          <div class="product-info" style="display: flex; align-items: flex-start; gap: 20px;">
            <a href="${process.env.FRONTEND_URL}/product/${item.product._id}" style="display: block;">
              <img src="${item.product.image}" alt="${item.product.name}" 
                   style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #ddd;">
            </a>
            <div style="margin-left: 15px;">
              <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${item.product.name}</h4>
            </div>
          </div>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: center; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">${item.quantity}</span>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: right; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">₹${totalWithoutGst.toFixed(2)}</span>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: right; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">₹${totalGst.toFixed(2)}</span>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: right; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">₹${totalPrice.toFixed(2)}</span>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Base styles for all screens */
        .container {
          font-family: Inter, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          color: #333;
        }
        
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .two-column {
          display: flex;
          gap: 50px;
          margin-bottom: 40px;
        }
        
        .column {
          flex: 1;
          min-width: 0;
        }
        
        .address-block, .payment-block {
          padding: 25px;
          height: 100%;
          box-sizing: border-box;
        }
        
        /* Mobile styles */
        @media only screen and (max-width: 768px) {
          .container { 
            max-width: 100% !important; 
            margin: 0 !important;
          }
          
          .header { 
            padding: 20px 15px !important; 
          }
          
          .header h1 { 
            font-size: 24px !important; 
          }
          
          .header p { 
            font-size: 14px !important; 
          }
          
          .content { 
            padding: 20px 15px !important; 
          }
          
          .greeting h2 { 
            font-size: 18px !important; 
          }
          
          .greeting p { 
            font-size: 14px !important; 
          }
          
          .section-title { 
            font-size: 16px !important; 
          }
          
          .order-items td { 
            padding: 15px 8px !important; 
          }
          
          .order-items .product-info { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
            gap: 10px !important; 
          }
          
          .order-items img { 
            width: 60px !important; 
            height: 60px !important; 
          }
          
          .order-items h4 { 
            font-size: 14px !important; 
          }
          
          .price-text { 
            font-size: 14px !important; 
          }
          
          .total-amount { 
            font-size: 18px !important; 
          }
          
          .two-column { 
            flex-direction: column !important; 
            gap: 30px !important;
          }
          
          .column { 
            width: 100% !important; 
            margin-bottom: 0 !important;
          }
          
          .address-block, .payment-block { 
            padding: 20px !important; 
            margin-bottom: 20px !important;
          }
          
          .address-name { 
            font-size: 16px !important; 
          }
          
          .address-text { 
            font-size: 14px !important; 
          }
          
          .next-steps { 
            padding: 20px 15px !important; 
          }
          
          .next-steps h3 { 
            font-size: 16px !important; 
          }
          
          .next-steps li { 
            font-size: 14px !important; 
          }
          
          .buttons a { 
            padding: 12px 20px !important; 
            font-size: 12px !important; 
            margin: 5px !important; 
            display: block !important; 
            text-align: center !important;
          }
          
          .footer { 
            padding: 20px 15px !important; 
          }
          
          .footer p { 
            font-size: 14px !important; 
          }
          
          .order-details-table {
            font-size: 14px !important;
          }
          
          .order-details-table td {
            padding: 10px 0 !important;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .header h1 { 
            font-size: 20px !important; 
          }
          
          .greeting h2 { 
            font-size: 16px !important; 
          }
          
          .section-title { 
            font-size: 14px !important; 
          }
          
          .buttons a {
            font-size: 11px !important;
            padding: 10px 15px !important;
          }
        }
      </style>
    </head>
    <body>
    <div class="container">
      
      <!-- Header -->
      <div class="header" style="background-color: #056D6A; color: white; padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 1px;">ORDER CONFIRMATION #${order.orderId}</h1>
        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Thank you for your order</p>
      </div>

      <!-- Main Content -->
      <div class="content" style="padding: 40px 30px;">
        
        <!-- Greeting -->
        <div class="greeting" style="margin-bottom: 40px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 400;">Hello ${user.name},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
            Your order has been confirmed and is being processed. Here are the details:
          </p>
        </div>

        <!-- Order Details -->
        <div style="margin-bottom: 40px;">
          <h3 class="section-title" style="color: #064E3B; margin: 0 0 25px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</h3>
          <div class="table-responsive">
            <table class="order-details-table" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee; width: 30%;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #333; font-weight: 600; font-size: 16px;">#${order.orderId}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #333; font-weight: 600; font-size: 16px;">${new Date(order.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Status</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #28a745; font-weight: 600; font-size: 16px; text-transform: capitalize;">${order.paymentStatus}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 0;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order Status</span>
                </td>
                <td style="padding: 15px 0;">
                  <span style="color: #064E3B; font-weight: 700; font-size: 16px; text-transform: capitalize;">${order.orderStatus}</span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Order Items -->
        <div style="margin-bottom: 40px;">
          <h3 class="section-title" style="color: #064E3B; margin: 0 0 25px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Items</h3>
          <div class="table-responsive">
            <table class="order-items" style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; min-width: 600px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 20px; text-align: left; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Product</th>
                  <th style="padding: 20px; text-align: center; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Qty</th>
                  <th style="padding: 20px; text-align: right; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Product Price</th>
                  <th style="padding: 20px; text-align: right; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">GST (18%)</th>
                  <th style="padding: 20px; text-align: right; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHTML}
                <!-- Total row inside the table -->
                <tr style="background-color: #f8f9fa; font-weight: 700;">
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: left;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700; text-transform: uppercase;">TOTAL</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: center;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">${totalQuantity}</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: right;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">₹${totalProductPrice.toFixed(2)}</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: right;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">₹${totalGstAmount.toFixed(2)}</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: right;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">₹${totalAmount.toFixed(2)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Price Summary -->
        <div style="margin-bottom: 40px;">
          <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee; width: 70%;">
                  <span style="color: #666; font-size: 16px;">Delivery Charges</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right;">
                  <span class="price-text" style="color: #28a745; font-weight: 600; font-size: 16px;">FREE</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 0 15px 0;">
                  <span class="total-amount" style="color: #0EA5A4; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</span>
                </td>
                <td style="padding: 20px 0 15px 0; text-align: right;">
                  <span class="total-amount" style="color: #0EA5A4; font-size: 20px; font-weight: 700;">₹${totalAmount.toFixed(2)}</span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Delivery Address and Payment Information Side by Side -->
        <div class="two-column" style="margin-bottom: 50px;">
          <!-- Delivery Address -->
          <div class="column">
            <h3 class="section-title" style="color: #064E3B; margin: 0 0 10px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</h3>
            <div class="address-block">
              <p class="address-name" style="margin: 0 0 12px 0; color: #333; font-weight: 600; font-size: 18px;">${order.shippingAddress.fullName}</p>
              <p class="address-text" style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                ${order.shippingAddress.country}<br>
                <strong>Phone:</strong> ${order.shippingAddress.phone}
              </p>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="column">
            <h3 class="section-title" style="color: #064E3B; margin: 0 0 10px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Payment Information</h3>
            <div class="payment-block">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;">
                    <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</span>
                  </td>
                  <td style="padding: 8px 0;">
                    <span style="color: #333; font-weight: 600; font-size: 16px; text-transform: capitalize;">${order.paymentMethod}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Payment ID</span>
                  </td>
                  <td style="padding: 8px 0;">
                    <span style="color: #333; font-weight: 600; font-size: 16px; word-break: break-all; overflow-wrap: break-word;">${order.paymentId}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps" style="background-color: #f8f9fa; padding: 30px; border-left: 4px solid #17a2b8; margin-bottom: 40px;">
          <h3 style="color: #17a2b8; margin: 0 0 20px 0; font-size: 20px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">What's Next?</h3>
          <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 16px;">
            <li style="margin-bottom: 8px;">We'll send you a tracking number once your order is shipped</li>
            <li style="margin-bottom: 8px;">You can track your order status in your account</li>
            <li style="margin-bottom: 8px;">Expected delivery: 5-7 business days</li>
            <li>Contact us if you have any questions</li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #666; font-size: 16px; margin: 0 0 25px 0;">
            Need help? Contact our support team
          </p>
          <div class="buttons" style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
              style="background-color: #056D6A; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: 700; margin-right: 15px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 8px; box-shadow: 0 8px 24px rgba(5,109,106,0.08);">
              View Order
            </a>
            <a href="${process.env.FRONTEND_URL}/contact" 
              style="background-color: #6c757d; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 8px;">
              Contact Support
            </a>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer" style="background-color: #056D6A; color: white; padding: 30px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
          Thank you for shopping with ${process.env.APP_NAME || 'Reeown'}!
        </p>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">
          © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Reeown'}. All rights reserved.
        </p>
      </div>
    </div>
    </body>
    </html>
  `;
}

function orderAdminNotificationTemplate(order, user) {
  const totalProductPrice = order.items.reduce((sum, item) => {
    const priceWithoutGst = item.price / 1.18;
    return sum + (priceWithoutGst * item.quantity);
  }, 0);
  const totalGstAmount = order.items.reduce((sum, item) => {
    const priceWithoutGst = item.price / 1.18;
    const gstAmount = priceWithoutGst * 0.18;
    return sum + (gstAmount * item.quantity);
  }, 0);
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCharges = 0;
  const totalAmount = totalProductPrice + totalGstAmount;

  const orderItemsHTML = order.items.map(item => {
    const priceWithoutGst = item.price / 1.18;
    const gstAmount = priceWithoutGst * 0.18;
    const totalWithoutGst = priceWithoutGst * item.quantity;
    const totalGst = gstAmount * item.quantity;
    const totalPrice = totalWithoutGst + totalGst;
    
    return `
      <tr>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; vertical-align: top;">
          <div class="product-info" style="display: flex; align-items: flex-start; gap: 20px;">
            <a href="${process.env.FRONTEND_URL}/product/${item.product._id}" style="display: block;">
              <img src="${item.product.image}" alt="${item.product.name}" 
                   style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #ddd;">
            </a>
            <div style="margin-left: 15px;">
              <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${item.product.name}</h4>
              <p style="margin: 0; color: #666; font-size: 14px;">SKU: ${item.product._id}</p>
            </div>
          </div>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: center; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">${item.quantity}</span>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: right; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">₹${totalWithoutGst.toFixed(2)}</span>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: right; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">₹${totalGst.toFixed(2)}</span>
        </td>
        <td style="padding: 20px; border-bottom: 1px solid #ddd; text-align: right; vertical-align: top;">
          <span class="price-text" style="font-weight: 600; color: #333; font-size: 16px;">₹${totalPrice.toFixed(2)}</span>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Base styles for all screens */
        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 700px;
          margin: 0 auto;
          background-color: #ffffff;
          color: #333;
        }
        
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .two-column {
          display: flex;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .column {
          flex: 1;
          min-width: 0;
        }
        
        .address-block, .payment-block {
          padding: 25px;
          height: 100%;
          box-sizing: border-box;
        }

        /* Mobile styles */
        @media only screen and (max-width: 768px) {
          .container { 
            max-width: 100% !important; 
            margin: 0 !important;
          }
          
          .header { 
            padding: 20px 15px !important; 
          }
          
          .header h1 { 
            font-size: 24px !important; 
          }
          
          .header p { 
            font-size: 14px !important; 
          }
          
          .content { 
            padding: 20px 15px !important; 
          }
          
          .greeting h2 { 
            font-size: 18px !important; 
          }
          
          .greeting p { 
            font-size: 14px !important; 
          }
          
          .section-title { 
            font-size: 16px !important; 
          }
          
          .order-items td { 
            padding: 15px 8px !important; 
          }
          
          .order-items .product-info { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
            gap: 10px !important; 
          }
          
          .order-items img { 
            width: 60px !important; 
            height: 60px !important; 
          }
          
          .order-items h4 { 
            font-size: 14px !important; 
          }
          
          .price-text { 
            font-size: 14px !important; 
          }
          
          .total-amount { 
            font-size: 18px !important; 
          }
          
          .two-column { 
            flex-direction: column !important; 
            gap: 20px !important;
          }
          
          .column { 
            width: 100% !important; 
            margin-bottom: 0 !important;
          }
          
          .address-block, .payment-block { 
            padding: 20px 15px !important; 
          }
          
          .address-name { 
            font-size: 16px !important; 
          }
          
          .address-text { 
            font-size: 14px !important; 
          }
          
          .next-steps { 
            padding: 20px 15px !important; 
          }
          
          .next-steps h3 { 
            font-size: 16px !important; 
          }
          
          .next-steps li { 
            font-size: 14px !important; 
          }
          
          .buttons a { 
            padding: 12px 20px !important; 
            font-size: 12px !important; 
            margin: 5px !important; 
            display: block !important; 
            text-align: center !important;
          }
          
          .footer { 
            padding: 20px 15px !important; 
          }
          
          .footer p { 
            font-size: 14px !important; 
          }
          
          .order-details-table {
            font-size: 14px !important;
          }
          
          .order-details-table td {
            padding: 10px 0 !important;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .header h1 { 
            font-size: 20px !important; 
          }
          
          .greeting h2 { 
            font-size: 16px !important; 
          }
          
          .section-title { 
            font-size: 14px !important; 
          }
          
          .buttons a {
            font-size: 11px !important;
            padding: 10px 15px !important;
          }
        }
      </style>
    </head>
    <body>
    <div class="container">
      
      <!-- Header -->
      <div class="header" style="background-color: #056D6A; color: white; padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 1px;">NEW ORDER RECEIVED #${order.orderId}</h1>
      </div>

      <!-- Main Content -->
      <div class="content" style="padding: 40px 30px;">
        
        <!-- Customer Information -->
        <div style="margin-bottom: 40px;">
          <h3 class="section-title" style="color: #064E3B; margin: 0 0 25px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Customer Information</h3>
          <div class="address-block">
            <p class="address-name" style="margin: 0 0 15px 0; color: #333; font-weight: 600; font-size: 18px;">${user.name}</p>
            <p class="address-text" style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
              <strong>Email:</strong> ${user.email}<br>
              <strong>Phone:</strong> ${user.phoneNumber || order.shippingAddress.phone || 'Not provided'}<br>
              <strong>Customer ID:</strong> ${user._id}
            </p>
          </div>
        </div>

        <!-- Order Details -->
        <div style="margin-bottom: 40px;">
          <h3 class="section-title" style="color: #064E3B; margin: 0 0 25px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</h3>
          <div class="table-responsive">
            <table class="order-details-table" style="width: 100%; border-collapse: collapse; min-width: 300px;">
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee; width: 30%;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #333; font-weight: 600; font-size: 16px;">#${order.orderId}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #333; font-weight: 600; font-size: 16px;">${new Date(order.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Status</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                  <span style="color: #28a745; font-weight: 600; font-size: 16px; text-transform: capitalize;">${order.paymentStatus}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 0;">
                  <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Order Status</span>
                </td>
                <td style="padding: 15px 0;">
                  <span style="color: #064E3B; font-weight: 700; font-size: 16px; text-transform: capitalize;">${order.orderStatus}</span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Order Items -->
        <div style="margin-bottom: 40px;">
          <h3 class="section-title" style="color: #064E3B; margin: 0 0 25px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Items</h3>
          <div class="table-responsive">
            <table class="order-items" style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; min-width: 600px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 20px; text-align: left; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Product</th>
                  <th style="padding: 20px; text-align: center; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Qty</th>
                  <th style="padding: 20px; text-align: right; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Product Price</th>
                  <th style="padding: 20px; text-align: right; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">GST (18%)</th>
                  <th style="padding: 20px; text-align: right; font-weight: 700; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0EA5A4;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHTML}
                <!-- Total row inside the table -->
                <tr style="background-color: #f8f9fa; font-weight: 700;">
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: left;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700; text-transform: uppercase;">TOTAL</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: center;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">${totalQuantity}</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: right;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">₹${totalProductPrice.toFixed(2)}</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: right;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">₹${totalGstAmount.toFixed(2)}</span>
                  </td>
                  <td style="padding: 20px; border-top: 2px solid #0EA5A4; text-align: right;">
                    <span style="color: #0EA5A4; font-size: 16px; font-weight: 700;">₹${totalAmount.toFixed(2)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Price Summary -->
        <div style="margin-bottom: 40px;">
          <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee; width: 70%;">
                  <span style="color: #666; font-size: 16px;">Delivery Charges</span>
                </td>
                <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right;">
                  <span class="price-text" style="color: #28a745; font-weight: 600; font-size: 16px;">FREE</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 0 15px 0;">
                  <span class="total-amount" style="color: #0EA5A4; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</span>
                </td>
                <td style="padding: 20px 0 15px 0; text-align: right;">
                  <span class="total-amount" style="color: #0EA5A4; font-size: 20px; font-weight: 700;">₹${totalAmount.toFixed(2)}</span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Delivery Address and Payment Information Side by Side -->
        <div class="two-column" style="margin-bottom: 50px;">
          <!-- Delivery Address -->
          <div class="column">
            <h3 class="section-title" style="color: #064E3B; margin: 0 0 10px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</h3>
            <div class="address-block">
              <p class="address-name" style="margin: 0 0 12px 0; color: #333; font-weight: 600; font-size: 18px;">${order.shippingAddress.fullName}</p>
              <p class="address-text" style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                ${order.shippingAddress.country}<br>
                <strong>Phone:</strong> ${order.shippingAddress.phone}
              </p>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="column">
            <h3 class="section-title" style="color: #064E3B; margin: 0 0 10px 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Payment Information</h3>
            <div class="payment-block">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;">
                    <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</span>
                  </td>
                  <td style="padding: 8px 0;">
                    <span style="color: #333; font-weight: 600; font-size: 16px; text-transform: capitalize;">${order.paymentMethod}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Payment ID</span>
                  </td>
                  <td style="padding: 8px 0;">
                    <span style="color: #333; font-weight: 600; font-size: 16px; word-break: break-all; overflow-wrap: break-word;">${order.paymentId}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin-top: 40px;">
         
          <div class="buttons" style="margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
              style="background-color: #056D6A; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: 700; margin-right: 15px; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 8px; box-shadow: 0 8px 24px rgba(5,109,106,0.08);">
              Process Order
            </a>
            <a href="${process.env.FRONTEND_URL}/admin" 
              style="background-color: #10B981; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 8px;">
              View All Orders
            </a>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer" style="background-color: #056D6A; color: white; padding: 30px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
          ${process.env.APP_NAME || 'Reeown'} - Admin Panel
        </p>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">
          © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Reeown'}. All rights reserved.
        </p>
      </div>
    </div>
    </body>
    </html>
  `;
}

function orderStatusUpdateTemplate(order, user, newStatus, oldStatus) {
  const getStatusMessage = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return {
          title: 'Order is Being Processed',
          message: 'Your order is currently being prepared for shipment.',
          color: '#f59e0b',
          icon: '⏳'
        };
      case 'shipped':
        return {
          title: 'Order Has Been Shipped',
          message: 'Your order is on its way! You should receive it within 3-5 business days.',
          color: '#3b82f6',
          icon: '🚚'
        };
      case 'delivered':
        return {
          title: 'Order Delivered Successfully',
          message: 'Your order has been delivered! We hope you enjoy your new products.',
          color: '#10b981',
          icon: '✅'
        };
      case 'cancelled':
        return {
          title: 'Order Has Been Cancelled',
          message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
          color: '#ef4444',
          icon: '❌'
        };
      default:
        return {
          title: 'Order Status Updated',
          message: 'Your order status has been updated.',
          color: '#6b7280',
          icon: '📦'
        };
    }
  };

  const statusInfo = getStatusMessage(newStatus);
  const orderItemsHTML = order.items.map(item => {
    return `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${item.product.image}" alt="${item.product.name}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div>
              <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 14px; font-weight: 600;">${item.product.name}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Quantity: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <span style="font-weight: 600; color: #111827;">₹${(item.price * item.quantity).toFixed(2)}</span>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          color: #333;
        }
        
        @media only screen and (max-width: 768px) {
          .container { 
            max-width: 100% !important; 
            margin: 0 !important;
          }
          .header { 
            padding: 20px 15px !important; 
          }
          .content { 
            padding: 20px 15px !important; 
          }
          .status-banner {
            padding: 20px 15px !important;
          }
        }
      </style>
    </head>
    <body>
    <div class="container">
      
      <!-- Header -->
      <div class="header" style="background-color: #056D6A; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">ORDER STATUS UPDATE</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Order #${order.orderId}</p>
      </div>

      <!-- Status Banner -->
      <div class="status-banner" style="background-color: ${statusInfo.color}; color: white; padding: 25px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 10px;">${statusInfo.icon}</div>
        <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">${statusInfo.title}</h2>
        <p style="margin: 0; font-size: 16px; opacity: 0.95;">${statusInfo.message}</p>
      </div>

      <!-- Main Content -->
      <div class="content" style="padding: 30px;">
        
        <!-- Greeting -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Hello ${user.name},</h3>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
            We wanted to update you on the status of your recent order. Here are the current details:
          </p>
        </div>

        <!-- Order Summary -->
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h4 style="color: #064E3B; margin: 0 0 15px 0; font-size: 16px; font-weight: 700;">Order Summary</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order ID:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">#${order.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Date:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">${new Date(order.createdAt).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Previous Status:</td>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; text-transform: capitalize;">${oldStatus}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Current Status:</td>
              <td style="padding: 8px 0; color: ${statusInfo.color}; font-weight: 600; font-size: 14px; text-transform: capitalize;">${newStatus}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Amount:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">₹${order.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Order Items -->
        <div style="margin-bottom: 25px;">
          <h4 style="color: #064E3B; margin: 0 0 15px 0; font-size: 16px; font-weight: 700;">Items in Your Order</h4>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 15px; text-align: left; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase;">Product</th>
                <th style="padding: 15px; text-align: right; font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHTML}
            </tbody>
          </table>
        </div>

        <!-- Next Steps -->
        ${newStatus === 'shipped' ? `
        <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Tracking Information</h4>
          <p style="color: #1e40af; font-size: 14px; margin: 0;">
            Your order is now on its way! You can track your order status in your account dashboard.
          </p>
        </div>
        ` : ''}

        ${newStatus === 'delivered' ? `
        <div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Thank You!</h4>
          <p style="color: #047857; font-size: 14px; margin: 0;">
            We hope you're satisfied with your purchase. Please consider leaving a review for the products you received.
          </p>
        </div>
        ` : ''}

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0;">
           <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
             style="background-color: #056D6A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 700; margin-right: 10px; box-shadow: 0 8px 24px rgba(5,109,106,0.08);">
            View Order Details
          </a>
          <a href="${process.env.FRONTEND_URL}/contact" 
             style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Contact Support
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #056D6A; color: white; padding: 25px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
          Thank you for shopping with ${process.env.APP_NAME || 'Reeown'}!
        </p>
        <p style="margin: 0; font-size: 12px; opacity: 0.9;">
          © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Reeown'}. All rights reserved.
        </p>
      </div>
    </div>
    </body>
    </html>
  `;
}

module.exports = {
  orderConfirmationTemplate,
  orderAdminNotificationTemplate,
  orderStatusUpdateTemplate
};