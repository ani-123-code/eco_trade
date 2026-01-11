const express = require('express');
const router = express.Router();
const {
  createRFQ,
  getRFQsByMaterial,
  getMyRFQs,
  getSellerRFQs,
  respondToRFQ,
  acceptRFQ,
  rejectRFQ
} = require('../controllers/rfqController');
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.post('/', protect, createRFQ);
router.get('/material/:materialId', protect, getRFQsByMaterial);
router.get('/my-rfqs', protect, getMyRFQs);
router.get('/my-listings', protect, getSellerRFQs);
router.put('/:id/respond', protect, respondToRFQ);
router.put('/:id/accept', protect, acceptRFQ);
router.put('/:id/reject', protect, rejectRFQ);

module.exports = router;

