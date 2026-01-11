const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { protect, admin } = require('../middlewares/auth');

// Public route - Submit business inquiry
router.post('/', businessController.createBusinessRequest);

// Admin routes - Manage business requests
router.get('/stats', protect, admin, businessController.getBusinessRequestStats);
router.get('/', protect, admin, businessController.getAllBusinessRequests);
router.get('/:id', protect, admin, businessController.getBusinessRequestById);
router.put('/:id', protect, admin, businessController.updateBusinessRequestStatus);
router.delete('/:id', protect, admin, businessController.deleteBusinessRequest);

module.exports = router;
