const { google } = require('googleapis');
const {
  adminContactFormTemplate,
  customerContactFormTemplate
} = require('./templates/contactFormTemplates');
const {
  newsletterSubscriptionTemplate,
  welcomeNewsletterTemplate
} = require('./templates/newsletterTemplates');
const {
  verificationEmailTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate
} = require('./templates/authTemplates');
const {
  orderConfirmationTemplate,
  orderAdminNotificationTemplate,
  orderStatusUpdateTemplate
} = require('./templates/orderTemplates');

class EmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });
    this.adminEmail = process.env.ADMIN_EMAIL;
  }

  // Helper to send via Gmail REST API using googleapis
  async sendViaGmailApi(mailOptions) {
    try {
      // Ensure oauth2 client has credentials
      await this.getAccessToken();

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const from = mailOptions.from || `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`;
      const to = Array.isArray(mailOptions.to) ? mailOptions.to.join(', ') : mailOptions.to;
      const subject = mailOptions.subject || '';
      const html = mailOptions.html || (mailOptions.text || '');

      const rawLines = [];
      rawLines.push(`From: ${from}`);
      rawLines.push(`To: ${to}`);
      rawLines.push(`Subject: ${subject}`);
      rawLines.push('MIME-Version: 1.0');
      rawLines.push('Content-Type: text/html; charset="UTF-8"');
      rawLines.push('Content-Transfer-Encoding: 7bit');
      rawLines.push('');
      rawLines.push(html);

      const raw = Buffer.from(rawLines.join('\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw
        }
      });

      console.log('Email sent via Gmail REST API:', res && res.data && res.data.id);
      return res.data;
    } catch (error) {
      console.error('Error sending via Gmail API:', error);
      throw error;
    }
  }

  // Unified send that always goes through the Gmail REST API
  async sendMail(mailOptions) {
    try {
      return await this.sendViaGmailApi(mailOptions);
    } catch (error) {
      console.error('Gmail API send error:', error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      const { token } = await this.oauth2Client.getAccessToken();
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async sendNewsletterSubscriptionNotification(subscriberData) {
    try {
      const mailOptions = {
  from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
  to: this.adminEmail,
  subject: 'New Newsletter Subscription - Sarvin Electronics',
  html: newsletterSubscriptionTemplate(subscriberData)
};


      await this.sendMail(mailOptions);
      console.log('Newsletter subscription notification sent to admin');
      return { success: true, message: 'Newsletter subscription notification sent' };
    } catch (error) {
      console.error('Error sending newsletter subscription notification:', error);
      throw error;
    }
  }

  async sendContactFormNotification(contactData) {
    try {
      // Email to admin
      const adminMailOptions = {
  from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
  to: this.adminEmail,
  subject: `New Contact Form Submission - ${contactData.subject}`,
  html: adminContactFormTemplate(contactData)
};

const customerMailOptions = {
  from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
  to: contactData.email,
  subject: 'Thank you for contacting Sarvin Electronics',
  html: customerContactFormTemplate(contactData)
};


      // Send both emails
      await Promise.all([
        this.sendMail(adminMailOptions),
        this.sendMail(customerMailOptions)
      ]);

      console.log('Contact form notifications sent to both admin and customer');
      return { success: true, message: 'Contact form notifications sent' };
    } catch (error) {
      console.error('Error sending contact form notifications:', error);
      throw error;
    }
  }

  async sendWelcomeEmailToSubscriber(subscriberData) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: subscriberData.email,
        subject: 'Welcome to Sarvin Electronics Newsletter!',
        html: welcomeNewsletterTemplate(subscriberData)
      };

      await this.sendMail(mailOptions);
      console.log('Welcome email sent to subscriber');
      return { success: true, message: 'Welcome email sent' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email, verificationToken, name) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: verificationEmailTemplate(email, verificationUrl, name)
      };

      const result = await this.sendMail(mailOptions);
      console.log('Verification email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, resetToken, name) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        html: passwordResetTemplate(email, resetUrl, name)
      };

      const result = await this.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, name) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Welcome to ${process.env.APP_NAME}!`,
        html: welcomeEmailTemplate(email, name)
      };

      const result = await this.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendOrderConfirmationEmail(order, user) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: `Order Confirmation - #${order.orderId}`,
        html: orderConfirmationTemplate(order, user)
      };

      const result = await this.sendMail(mailOptions);
      console.log('Order confirmation email sent to customer:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }

  async sendOrderNotificationToAdmin(order, user) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Order Received - #${order.orderId}`,
        html: orderAdminNotificationTemplate(order, user)
      };

      const result = await this.sendMail(mailOptions);
      console.log('Order notification email sent to admin:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending order notification email to admin:', error);
      throw error;
    }
  }

  async sendOrderStatusUpdateEmail(order, user, newStatus, oldStatus) {
    try {
      const statusTitles = {
        processing: 'Order is Being Processed',
        shipped: 'Order Has Been Shipped',
        delivered: 'Order Delivered Successfully',
        cancelled: 'Order Has Been Cancelled'
      };

      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: `${statusTitles[newStatus] || 'Order Status Update'} - #${order.orderId}`,
        html: orderStatusUpdateTemplate(order, user, newStatus, oldStatus)
      };

      const result = await this.sendMail(mailOptions);
      console.log('Order status update email sent to customer:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending order status update email:', error);
      throw error;
    }
  }

  async sendStockNotification(email, productName, productId) {
    try {
      const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;

      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `${productName} is Back in Stock!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Product Back in Stock</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Good News!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Your Wishlist Item is Back in Stock!</h2>
                        <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
                          Great news! <strong>${productName}</strong> is now back in stock and ready to order.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
                          Don't miss out - this popular item sells out quickly!
                        </p>
                        <table role="presentation" style="margin: 0 auto;">
                          <tr>
                            <td style="border-radius: 6px; background: linear-gradient(135deg, #16a34a 0%, #059669 100%);">
                              <a href="${productUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                View Product
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                          You received this email because you requested to be notified when this product becomes available.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px; text-align: center;">
                          © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Reeown'}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      };

      const result = await this.sendMail(mailOptions);
      console.log('Stock notification email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending stock notification email:', error);
      throw error;
    }
  }

  async sendBusinessInquiryConfirmation(email, contactPersonName, companyName) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Business Inquiry Received - ${companyName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Thank You for Your Interest!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Dear ${contactPersonName},</p>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666;">
                          Thank you for submitting a bulk purchase inquiry with <strong>${process.env.APP_NAME}</strong> on behalf of <strong>${companyName}</strong>.
                        </p>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666;">
                          We have received your request and our dedicated B2B team is reviewing your requirements. You can expect to hear from us within <strong>24 hours</strong> with:
                        </p>
                        <ul style="margin: 0 0 20px; padding-left: 25px; color: #666;">
                          <li style="margin-bottom: 10px;">Customized quote based on your specifications</li>
                          <li style="margin-bottom: 10px;">Volume discount pricing</li>
                          <li style="margin-bottom: 10px;">Flexible payment term options</li>
                          <li style="margin-bottom: 10px;">Delivery timeline and logistics details</li>
                        </ul>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666;">
                          In the meantime, if you have any urgent questions, please don't hesitate to reach out to us.
                        </p>
                        <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                          <p style="margin: 0; font-size: 14px; color: #1e40af;">
                            <strong>Reference ID:</strong> Will be provided in our response<br>
                            <strong>Company:</strong> ${companyName}<br>
                            <strong>Status:</strong> Under Review
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px; background-color: #f9fafb; text-align: center;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #666;">
                          Best regards,<br>
                          <strong>${process.env.APP_NAME} B2B Team</strong>
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #999;">
                          © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      };

      const result = await this.sendMail(mailOptions);
      console.log('Business inquiry confirmation email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending business inquiry confirmation:', error);
      throw error;
    }
  }

  async sendBusinessInquiryNotificationToAdmin(businessRequest) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Business Inquiry - ${businessRequest.companyName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff;">
                    <tr>
                      <td style="padding: 30px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">🏢 New Business Inquiry</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px;">
                        <h2 style="margin: 0 0 20px; color: #333;">Company Details</h2>
                        <table style="width: 100%; margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold; width: 40%;">Company Name:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.companyName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Contact Person:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.contactPersonName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Designation:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.designation}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Email:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.email}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.phone}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Business Type:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.businessType}</td>
                          </tr>
                        </table>

                        <h2 style="margin: 30px 0 20px; color: #333;">Purchase Requirements</h2>
                        <table style="width: 100%; margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold; width: 40%;">Product Categories:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.productCategories.join(', ')}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Quantity Range:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.quantityRange}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Budget Range:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.budgetRange}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Purchase Frequency:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.purchaseFrequency}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px; background-color: #f9fafb; font-weight: bold;">Urgency:</td>
                            <td style="padding: 8px; background-color: #ffffff;">${businessRequest.urgency}</td>
                          </tr>
                        </table>

                        <h2 style="margin: 30px 0 20px; color: #333;">Specific Requirements</h2>
                        <p style="padding: 15px; background-color: #f9fafb; border-left: 4px solid #3b82f6; margin: 0;">
                          ${businessRequest.specificRequirements}
                        </p>

                        <div style="margin-top: 30px; text-align: center;">
                          <a href="${process.env.FRONTEND_URL}/admin" style="display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            View in Admin Panel
                          </a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      };

      const result = await this.sendMail(mailOptions);
      console.log('Business inquiry admin notification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending business inquiry admin notification:', error);
      throw error;
    }
  }

  async sendBusinessQuote(email, contactPersonName, companyName, quotedAmount) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Quote for ${companyName} - ${process.env.APP_NAME}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff;">
                    <tr>
                      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Your Quote is Ready!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Dear ${contactPersonName},</p>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666;">
                          Thank you for your interest in partnering with ${process.env.APP_NAME}. We're pleased to provide you with a customized quote for ${companyName}.
                        </p>

                        <div style="margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; text-align: center;">
                          <p style="margin: 0 0 10px; font-size: 14px; color: #166534; font-weight: bold; text-transform: uppercase;">Estimated Quote</p>
                          <p style="margin: 0; font-size: 36px; color: #15803d; font-weight: bold;">₹${quotedAmount ? quotedAmount.toLocaleString('en-IN') : 'TBD'}</p>
                        </div>

                        <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #666;">
                          Our team will contact you shortly to discuss the details, delivery timelines, and finalize the agreement. We look forward to building a successful partnership with you!
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px; background-color: #f9fafb; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                          Best regards,<br>
                          <strong>${process.env.APP_NAME} B2B Team</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      };

      const result = await this.sendMail(mailOptions);
      console.log('Business quote email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending business quote email:', error);
      throw error;
    }
  }

  async sendSMSNotification(phone, productName, productId) {
    try {
      // Note: This is a placeholder for SMS integration
      // You would integrate with services like Twilio, MSG91, AWS SNS, or similar

      const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;
      const message = `Great news! ${productName} is back in stock at ${process.env.APP_NAME}. Buy now: ${productUrl}`;

      console.log(`SMS would be sent to ${phone}: ${message}`);

      // Example Twilio integration (uncomment and configure when ready):
      /*
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${phone}`
      });
      */

      // Example MSG91 integration:
      /*
      const axios = require('axios');
      await axios.get('https://api.msg91.com/api/v5/flow/', {
        params: {
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: `91${phone}`,
          authkey: process.env.MSG91_AUTH_KEY,
          product_name: productName,
          product_url: productUrl
        }
      });
      */

      return { success: true, message: 'SMS notification queued' };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  async sendWhatsAppNotification(phone, productName, productId) {
    try {
      // Note: This is a placeholder for WhatsApp integration
      // You would integrate with services like Twilio WhatsApp API, WhatsApp Business API, or similar

      const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;
      const message = `🎉 *${productName}* is back in stock!\n\nShop now at ${process.env.APP_NAME}: ${productUrl}`;

      console.log(`WhatsApp would be sent to ${phone}: ${message}`);

      // Example Twilio WhatsApp integration (uncomment and configure when ready):
      /*
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:+91${phone}`
      });
      */

      // Example WATI.io integration:
      /*
      const axios = require('axios');
      await axios.post('https://live-server.wati.io/api/v1/sendTemplateMessage', {
        whatsappNumber: `91${phone}`,
        template_name: 'stock_notification',
        broadcast_name: 'Stock Alert',
        parameters: [
          { name: 'product_name', value: productName },
          { name: 'product_url', value: productUrl }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.WATI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      */

      return { success: true, message: 'WhatsApp notification queued' };
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();