const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getDashboardStats, 
  getPendingVerifications, 
  verifyUser, 
  rejectUser,
  getAllMaterials,
  deleteMaterial,
  getAllAuctions,
  getPendingAuctionRequests,
  acceptBid,
  closeAuction,
  getAllRFQs,
  approveRFQ,
  rejectRFQ,
  updateRFQStatus,
  updateUser,
  warnUser,
  deleteUser,
  createBid,
  updateBid,
  deleteBid,
  deleteAuction,
  createAuction,
  approveScheduledAuction,
  rejectAuctionRequest,
  processTokenPayment
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');

// Dashboard
router.get('/dashboard', protect, admin, getDashboardStats);

// Users
router.get('/users', protect, admin, getUsers);
router.get('/', protect, admin, getUsers); // Keep for backward compatibility
router.put('/users/:id', protect, admin, updateUser);
router.post('/users/:id/warn', protect, admin, warnUser);
router.delete('/users/:id', protect, admin, deleteUser);

// Verifications
router.get('/verifications', protect, admin, getPendingVerifications);
router.put('/verifications/:id/approve', protect, admin, verifyUser);
router.put('/verifications/:id/reject', protect, admin, rejectUser);

// Materials
router.get('/materials', protect, admin, getAllMaterials);
router.delete('/materials/:id', protect, admin, deleteMaterial);

// Auctions
router.get('/auctions', protect, admin, getAllAuctions);
router.get('/auctions/pending', protect, admin, getPendingAuctionRequests);
router.post('/auctions/create', protect, admin, createAuction);
router.put('/auctions/:id/accept-bid', protect, admin, acceptBid);
router.put('/auctions/:id/close', protect, admin, closeAuction);
router.put('/auctions/:id/approve-scheduled', protect, admin, approveScheduledAuction);
router.put('/auctions/:id/reject-request', protect, admin, rejectAuctionRequest);
router.put('/auctions/:id/token-payment', protect, admin, processTokenPayment);
router.delete('/auctions/:id', protect, admin, deleteAuction);

// RFQs
router.get('/rfqs', protect, admin, getAllRFQs);
router.put('/rfqs/:id/approve', protect, admin, approveRFQ);
router.put('/rfqs/:id/reject', protect, admin, rejectRFQ);
router.put('/rfqs/:id/status', protect, admin, updateRFQStatus);

// Bids Management
router.post('/auctions/:id/bids', protect, admin, createBid);
router.put('/bids/:id', protect, admin, updateBid);
router.delete('/bids/:id', protect, admin, deleteBid);

module.exports = router;