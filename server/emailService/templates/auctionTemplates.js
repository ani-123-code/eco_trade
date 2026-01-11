const APP_NAME = process.env.APP_NAME || 'EcoTrade';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function bidPlacedTemplate(buyerName, auctionName, bidAmount, auctionId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bid Placed Successfully</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Bid Placed Successfully!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${buyerName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Your bid has been successfully placed on <strong>${auctionName}</strong>.
                  </p>
                  
                  <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #065f46; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">Your Bid Amount</p>
                    <p style="color: #047857; font-size: 32px; font-weight: bold; margin: 0;">₹${bidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    You will be notified in real-time if you are outbid. Keep an eye on the auction to maintain your winning position!
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/auctions/${auctionId}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Auction</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function bidOutbidTemplate(buyerName, auctionName, currentBid, auctionId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've Been Outbid</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">You've Been Outbid</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${buyerName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    You've been outbid on <strong>${auctionName}</strong>. The current highest bid is now:
                  </p>
                  
                  <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">Current Highest Bid</p>
                    <p style="color: #b45309; font-size: 32px; font-weight: bold; margin: 0;">₹${currentBid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    Place a higher bid to regain your winning position! Remember, bids must be at least 2% higher than the current bid.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/auctions/${auctionId}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Place New Bid</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function bidWonTemplate(buyerName, auctionName, winningBid, tokenAmount, tokenDeadline, auctionId) {
  const deadlineDate = new Date(tokenDeadline).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations! You Won the Auction</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">🎉 Congratulations! You Won!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${buyerName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Congratulations! You have won the auction for <strong>${auctionName}</strong>.
                  </p>
                  
                  <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #065f46; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">Winning Bid Amount</p>
                    <p style="color: #047857; font-size: 32px; font-weight: bold; margin: 0;">₹${winningBid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  
                  ${tokenAmount > 0 ? `
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">⚠️ Token Amount Payment Required</p>
                    <p style="color: #b45309; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">₹${tokenAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p style="color: #78350f; font-size: 14px; margin: 10px 0 0 0;">
                      <strong>Payment Deadline:</strong> ${deadlineDate}
                    </p>
                    <p style="color: #78350f; font-size: 13px; margin: 5px 0 0 0;">
                      Please pay the token amount within 2 days to secure your purchase. Failure to pay may result in cancellation of your winning bid.
                    </p>
                  </div>
                  ` : ''}
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    The seller and admin will be notified. You will be contacted shortly for the next steps regarding delivery and payment.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/auctions/${auctionId}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Auction Details</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function tokenPaymentReminderTemplate(buyerName, auctionName, tokenAmount, hoursRemaining, auctionId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Token Payment Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">⚠️ Payment Reminder</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${buyerName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    This is a reminder that you need to pay the token amount for your winning bid on <strong>${auctionName}</strong>.
                  </p>
                  
                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #991b1b; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">Token Amount Due</p>
                    <p style="color: #dc2626; font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">₹${tokenAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p style="color: #991b1b; font-size: 14px; margin: 10px 0 0 0;">
                      <strong>Time Remaining:</strong> ${hoursRemaining} hours
                    </p>
                  </div>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    Please complete the payment as soon as possible to secure your purchase. Failure to pay within the deadline may result in cancellation of your winning bid.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/auctions/${auctionId}" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Pay Token Amount</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function auctionApprovedTemplate(sellerName, auctionName, auctionId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Auction Approved</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Auction Approved</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${sellerName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Great news! Your auction for <strong>${auctionName}</strong> has been approved by the admin and is now live.
                  </p>
                  
                  <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #065f46; font-size: 16px; font-weight: bold; margin: 0;">✅ Your auction is now active and visible to all buyers!</p>
                  </div>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    Buyers can now place bids on your listing. You'll be notified when bids are placed and when the auction ends.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/auctions/${auctionId}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Auction</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function auctionScheduledTemplate(sellerName, auctionName, publishDate, auctionId) {
  const publishDateFormatted = new Date(publishDate).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Auction Scheduled</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Auction Scheduled</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${sellerName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Your auction for <strong>${auctionName}</strong> has been scheduled and will be published on:
                  </p>
                  
                  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #1e40af; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">Scheduled Publish Date</p>
                    <p style="color: #2563eb; font-size: 24px; font-weight: bold; margin: 0;">${publishDateFormatted}</p>
                  </div>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    The auction will be reviewed by admin before going live. Once approved, it will be published at the scheduled time and become visible to all buyers.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/seller/my-listings" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View My Listings</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function userWarningTemplate(userName, warningMessage, adminName) {
  const APP_NAME = process.env.APP_NAME || 'EcoTrade';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Warning - ${APP_NAME}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">⚠️ Account Warning</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${userName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    We are writing to inform you that an administrator has issued a warning regarding your account on ${APP_NAME}.
                  </p>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">Warning Message:</p>
                    <p style="color: #78350f; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${warningMessage}</p>
                  </div>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    Please review your account activity and ensure compliance with our terms of service. Continued violations may result in account suspension or termination.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Your Account</a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    If you have any questions or concerns about this warning, please contact our support team immediately.
                  </p>
                  
                  <p style="color: #374151; font-size: 14px; margin: 20px 0 0 0;">
                    Warning issued by: <strong>${adminName || 'Administrator'}</strong><br>
                    Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                    © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                  </p>
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function auctionRejectedTemplate(userName, auctionName) {
  const APP_NAME = process.env.APP_NAME || 'EcoTrade';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Auction Request Rejected</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Auction Request Rejected</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #111827; font-size: 16px; margin: 0 0 20px 0;">Hello ${userName},</p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    We regret to inform you that your auction request for <strong>"${auctionName}"</strong> has been rejected by our admin team.
                  </p>
                  
                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #991b1b; font-size: 15px; margin: 0;">
                      <strong>Auction Name:</strong> ${auctionName}
                    </p>
                    <p style="color: #991b1b; font-size: 15px; margin: 10px 0 0 0;">
                      <strong>Status:</strong> Rejected
                    </p>
                  </div>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    Please review your auction details and ensure they meet our guidelines. You can create a new auction request if needed.
                  </p>
                  
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                    If you have any questions, please contact our support team.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                    © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                  </p>
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = {
  bidPlacedTemplate,
  bidOutbidTemplate,
  bidWonTemplate,
  tokenPaymentReminderTemplate,
  auctionApprovedTemplate,
  auctionScheduledTemplate,
  auctionRejectedTemplate,
  userWarningTemplate
};

