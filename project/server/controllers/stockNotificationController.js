const StockNotification = require('../models/StockNotification');
const Product = require('../models/Product');
const EmailService = require('../emailService/EmailService');

exports.requestNotification = async (req, res) => {
  try {
    const { productId, email, phone, notificationChannels } = req.body;

    if (!productId || !email) {
      return res.status(400).json({ message: 'Product ID and email are required' });
    }

    // Validate phone if SMS or WhatsApp is enabled
    if (notificationChannels && (notificationChannels.sms || notificationChannels.whatsapp)) {
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required for SMS/WhatsApp notifications' });
      }
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock > 0) {
      return res.status(400).json({ message: 'Product is currently in stock' });
    }

    const existingNotification = await StockNotification.findOne({
      product: productId,
      email: email
    });

    if (existingNotification && !existingNotification.notified) {
      // Update existing notification with new preferences
      if (phone) existingNotification.phone = phone;
      if (notificationChannels) existingNotification.notificationChannels = notificationChannels;
      await existingNotification.save();

      return res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        notification: existingNotification
      });
    }

    const notification = await StockNotification.create({
      email,
      phone: phone || undefined,
      product: productId,
      notificationChannels: notificationChannels || {
        email: true,
        sms: phone ? true : false,
        whatsapp: phone ? true : false
      }
    });

    res.status(201).json({
      success: true,
      message: 'You will be notified when this product is back in stock',
      notification
    });
  } catch (error) {
    console.error('Request notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.notifyStockAvailable = async (productId) => {
  try {
    const notifications = await StockNotification.find({
      product: productId,
      notified: false
    });

    const product = await Product.findById(productId);
    let successCount = 0;
    let failedCount = 0;

    for (const notification of notifications) {
      try {
        const channels = notification.notificationChannels || { email: true };
        let notificationSent = false;

        // Send Email Notification
        if (channels.email) {
          try {
            await EmailService.sendStockNotification(
              notification.email,
              product.name,
              product._id
            );
            notificationSent = true;
            console.log(`Email notification sent to ${notification.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${notification.email}:`, emailError);
          }
        }

        // Send SMS Notification
        if (channels.sms && notification.phone) {
          try {
            await EmailService.sendSMSNotification(
              notification.phone,
              product.name,
              product._id
            );
            notificationSent = true;
            console.log(`SMS notification sent to ${notification.phone}`);
          } catch (smsError) {
            console.error(`Failed to send SMS to ${notification.phone}:`, smsError);
          }
        }

        // Send WhatsApp Notification
        if (channels.whatsapp && notification.phone) {
          try {
            await EmailService.sendWhatsAppNotification(
              notification.phone,
              product.name,
              product._id
            );
            notificationSent = true;
            console.log(`WhatsApp notification sent to ${notification.phone}`);
          } catch (whatsappError) {
            console.error(`Failed to send WhatsApp to ${notification.phone}:`, whatsappError);
          }
        }

        if (notificationSent) {
          notification.notified = true;
          notification.notifiedAt = new Date();
          await notification.save();
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to process notification for ${notification.email}:`, error);
        failedCount++;
      }
    }

    return {
      success: true,
      notifiedCount: successCount,
      failedCount: failedCount,
      totalRequests: notifications.length
    };
  } catch (error) {
    console.error('Notify stock available error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Admin: list notification requests
exports.listNotifications = async (req, res) => {
  try {
    const { productId, notified } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (typeof notified !== 'undefined') filter.notified = notified === 'true';

    const notifications = await StockNotification.find(filter)
      .populate('product', 'name sku price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Admin: delete a notification request
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await StockNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    await notification.remove();
    res.status(200).json({ success: true, message: 'Notification removed' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Admin: mark as notified
exports.markNotified = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await StockNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.notified = true;
    notification.notifiedAt = new Date();
    await notification.save();
    res.status(200).json({ success: true, message: 'Notification marked as notified', notification });
  } catch (error) {
    console.error('Mark notified error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
