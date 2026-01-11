const Notification = require('../models/Notification');
const emailService = require('../emailService/EmailService');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedAuction', 'material currentBid')
      .populate('relatedMaterial', 'name category')
      .populate('relatedBid', 'amount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Helper function to create notification (used by other controllers)
const createNotification = async (userId, type, title, message, options = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      relatedAuction: options.relatedAuction || null,
      relatedMaterial: options.relatedMaterial || null,
      relatedBid: options.relatedBid || null,
      relatedRFQ: options.relatedRFQ || null
    });

    await notification.save();

    // Emit socket notification
    try {
      const { emitNotification } = require('../socket/socketHandler');
      emitNotification(userId.toString(), {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      });
    } catch (socketError) {
      console.error('Failed to emit socket notification:', socketError);
      // Don't fail notification creation if socket fails
    }

    // Send email if user has email and email service is configured
    if (options.sendEmail && options.userEmail && options.userName) {
      try {
        switch (type) {
          case 'bid-placed':
            await emailService.sendBidPlacedEmail(
              options.userEmail,
              options.userName,
              options.auctionName || 'Auction',
              options.bidAmount || 0,
              options.relatedAuction?.toString() || ''
            );
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await notification.save();
            break;
          case 'bid-outbid':
            await emailService.sendBidOutbidEmail(
              options.userEmail,
              options.userName,
              options.auctionName || 'Auction',
              options.currentBid || 0,
              options.relatedAuction?.toString() || ''
            );
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await notification.save();
            break;
          case 'bid-won':
            await emailService.sendBidWonEmail(
              options.userEmail,
              options.userName,
              options.auctionName || 'Auction',
              options.winningBid || 0,
              options.tokenAmount || 0,
              options.tokenDeadline || new Date(),
              options.relatedAuction?.toString() || ''
            );
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await notification.save();
            break;
          case 'auction-approved':
            await emailService.sendAuctionApprovedEmail(
              options.userEmail,
              options.userName,
              options.auctionName || 'Auction',
              options.relatedAuction?.toString() || ''
            );
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await notification.save();
            break;
          case 'auction-scheduled':
            await emailService.sendAuctionScheduledEmail(
              options.userEmail,
              options.userName,
              options.auctionName || 'Auction',
              options.publishDate || new Date(),
              options.relatedAuction?.toString() || ''
            );
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await notification.save();
            break;
          case 'auction-rejected':
            await emailService.sendAuctionRejectedEmail(
              options.userEmail,
              options.userName,
              options.auctionName || 'Auction'
            );
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await notification.save();
            break;
          case 'user-warning':
            await emailService.sendWarningEmail(
              options.userEmail,
              options.userName,
              options.warningMessage || message,
              options.adminName || 'Administrator'
            );
            notification.emailSent = true;
            notification.emailSentAt = new Date();
            await notification.save();
            break;
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the notification creation if email fails
      }
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};

