const express = require('express');
const router = express.Router();
const {
  getAuctions,
  getAuctionById,
  getUpcomingAuctions,
  placeBid,
  getBidHistory,
  endAuction,
  getMyBids,
  getSellerAuctions,
  getClosedBids,
  acceptBidSeller,
  deleteBidSeller,
  getBidAnalytics
} = require('../controllers/auctionController');
const { protect, admin } = require('../middlewares/auth');

// Public routes
router.get('/', getAuctions);
router.get('/upcoming', getUpcomingAuctions);

// Protected specific routes (MUST come before /:id route)
router.get('/my-bids', protect, getMyBids);
router.get('/closed-bids', protect, getClosedBids);
router.get('/seller-auctions', protect, getSellerAuctions);
router.get('/analytics', protect, getBidAnalytics);

// Dynamic routes (must come after specific routes)
router.get('/:id', getAuctionById);
router.get('/:id/bids', protect, getBidHistory); // Now protected to check user role
router.post('/:id/bid', protect, placeBid);
router.put('/:id/end', protect, endAuction);
router.put('/:id/accept-bid-seller', protect, acceptBidSeller); // Seller can accept bid
router.delete('/:auctionId/bids/:bidId', protect, deleteBidSeller); // Seller can delete bid

module.exports = router;

