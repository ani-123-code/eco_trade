const express = require('express');
const router = express.Router();
const {
  createRepairRequest,
  getAllRepairRequests,
  getRepairRequestById,
  updateRepairRequest,
  deleteRepairRequest
} = require('../controllers/repairController');
const { protect, admin } = require('../middlewares/auth');

// Public route for creating repair requests
router.post('/', createRepairRequest);

// Admin routes (require authentication)
router.get('/', protect, admin, getAllRepairRequests);
router.get('/:id', protect, admin, getRepairRequestById);
router.put('/:id', protect, admin, updateRepairRequest);
router.delete('/:id', protect, admin, deleteRepairRequest);

module.exports = router;