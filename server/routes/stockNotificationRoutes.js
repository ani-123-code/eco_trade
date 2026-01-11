const express = require('express');
const router = express.Router();
const stockNotificationController = require('../controllers/stockNotificationController');
const { protect, admin } = require('../middlewares/auth');

// Public: request a notification for a product when it's back in stock
router.post('/request', stockNotificationController.requestNotification);

// Admin: list all notification requests (filter by productId or notified)
router.get('/', protect, admin, stockNotificationController.listNotifications);

// Admin: delete a notification request
router.delete('/:id', protect, admin, stockNotificationController.deleteNotification);

// Admin: mark a request as notified
router.patch('/:id/mark-notified', protect, admin, stockNotificationController.markNotified);

module.exports = router;
