const express = require('express');
const router = express.Router();
const {
  createSellRequest,
  getAllSellRequests,
  getSellRequestById,
  updateSellRequest,
  deleteSellRequest
} = require('../controllers/sellController');
const { protect, admin } = require('../middlewares/auth');

// Public route for creating sell requests
router.post('/', createSellRequest);

// Admin routes (require authentication)
router.get('/', protect, admin, getAllSellRequests);
router.get('/:id', protect, admin, getSellRequestById);
router.put('/:id', protect, admin, updateSellRequest);
router.delete('/:id', protect, admin, deleteSellRequest);

module.exports = router;