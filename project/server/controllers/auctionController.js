const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Material = require('../models/Material');
const User = require('../models/User');
const { emitBidUpdate, emitAuctionUpdate } = require('../socket/socketHandler');
const { createNotification } = require('./notificationController');

// @desc    Get all auctions with filters (ALL | LIVE | LATEST | UPCOMING)
// @route   GET /api/auctions
const getAuctions = async (req, res) => {
  try {
    const {
      category,
      filter = 'all', // all, live, latest, upcoming
      status,
      page = 1,
      limit = 12,
      sortBy = 'ending-soon',
      search // Search term for material name, category, description
    } = req.query;

    const now = new Date();
    const query = {};

    // Filter logic based on filter type
    switch (filter.toLowerCase()) {
      case 'live':
        // Show only active auctions currently running (status='active', admin-approved, endTime > now)
        query.status = 'active';
        query.adminApproved = true; // Only show admin-approved auctions
        query.$or = [
          { startTime: { $exists: false } }, // No startTime means started immediately
          { startTime: { $lte: now } } // Already started
        ];
        query.endTime = { $gt: now };
        break;
      case 'latest':
        // Show recently created active auctions (admin-approved, sorted by createdAt)
        query.status = 'active';
        query.adminApproved = true; // Only show admin-approved auctions
        query.createdAt = { $exists: true }; // Ensure it has createdAt
        break;
      case 'upcoming':
        // Show scheduled auctions that are admin-approved and haven't started yet
        query.status = 'scheduled';
        query.adminApproved = true; // Only show admin-approved scheduled auctions
        query.scheduledPublishDate = { $gt: now }; // Future scheduled date
        break;
      case 'all':
      default:
        // Show all active auctions (admin-approved)
        // Exclude draft, scheduled (pending approval), rejected, and cancelled
        query.$and = [
          { status: { $nin: ['draft', 'scheduled', 'rejected', 'cancelled'] } },
          {
            $or: [
              { adminApproved: true }, // Admin-approved seller auctions
              { adminApproved: { $exists: false } } // Admin-created auctions (may not have this field)
            ]
          }
        ];
        break;
    }

    // Legacy status filter support (for backward compatibility)
    if (status && filter === 'all') {
      query.status = status;
      if (status === 'active') {
        query.endTime = { $gt: now };
      }
    }

    // Build material query for category and search filters
    let materialQuery = { listingType: 'auction' };
    
    // Category filter (only if category is specified and not empty)
    if (category && category.trim() !== '') {
      materialQuery.category = category;
    }

    // Search filter - search in material name, category, description
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search, $options: 'i' };
      materialQuery.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    // IMPORTANT: Only show materials with active status (admin-approved auctions)
    // All filters should only show active materials - draft/scheduled auctions don't appear on auctions page
    materialQuery.status = 'active';

    // If category or search is specified, filter materials first
    if (category || search) {
      const materials = await Material.find(materialQuery).select('_id');
      const materialIds = materials.map(m => m._id);

      // If filters are applied and no materials found, return empty
      if (materialIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: parseInt(limit),
            pages: 0
          }
        });
      }

      query.material = { $in: materialIds };
    }
    // If no category/search filter, query all auctions based on filter type (no material filter)

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Sorting - override for 'latest' filter
    let sort = {};
    if (filter === 'latest') {
      sort = { createdAt: -1 };
    } else {
      switch (sortBy) {
        case 'ending-soon':
          sort = { endTime: 1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'highest-bid':
          sort = { currentBid: -1 };
          break;
        case 'most-bids':
          sort = { bidCount: -1 };
          break;
        default:
          sort = { endTime: 1 };
      }
    }

    const auctions = await Auction.find(query)
      .populate({
        path: 'material',
        populate: {
          path: 'seller',
          select: 'name email city state'
        }
      })
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const total = await Auction.countDocuments(query);

    res.json({
      success: true,
      data: auctions,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get auctions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auctions',
      error: error.message
    });
  }
};

// @desc    Get auction by ID or Material ID
// @route   GET /api/auctions/:id
const getAuctionById = async (req, res) => {
  try {
    // Try to find by auction ID first, then by material ID
    let auction = await Auction.findById(req.params.id)
      .populate({
        path: 'material',
        populate: {
          path: 'seller',
          select: 'name email phoneNumber city state'
        }
      })
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email');

    // If not found by auction ID, try finding by material ID
    if (!auction) {
      auction = await Auction.findOne({ material: req.params.id })
        .populate({
          path: 'material',
          populate: {
            path: 'seller',
            select: 'name email phoneNumber city state'
          }
        })
        .populate('currentBidder', 'name email')
        .populate('winner', 'name email');
    }

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Get bid history
    const bids = await Bid.find({ auction: auction._id })
      .populate('bidder', 'name email')
      .sort({ timestamp: -1 })
      .limit(50);
    
    // Ensure material images are populated
    if (auction.material) {
      const materialDoc = await Material.findById(auction.material._id || auction.material);
      if (materialDoc && materialDoc.images) {
        auction.material.images = materialDoc.images;
      }
    }

    res.json({
      success: true,
      data: {
        ...auction.toObject(),
        bidHistory: bids
      }
    });
  } catch (error) {
    console.error('Get auction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auction',
      error: error.message
    });
  }
};

// @desc    Place bid
// @route   POST /api/auctions/:id/bid
const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid bid amount is required'
      });
    }

    // Check if user is verified buyer
    if (req.user.userType !== 'buyer' || !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified buyers can place bids'
      });
    }

    const auction = await Auction.findById(req.params.id)
      .populate('material');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if auction is active and not approved/closed
    if (auction.status !== 'active') {
      // Provide specific error message based on status
      if (auction.status === 'seller-approved') {
        return res.status(400).json({
          success: false,
          message: 'Auction is closed. Seller has accepted a bid. Waiting for admin approval.'
        });
      }
      if (auction.status === 'admin-approved') {
        return res.status(400).json({
          success: false,
          message: 'Auction is closed. Admin has approved the bid. No further bids are allowed.'
        });
      }
      if (auction.status === 'ended' || auction.status === 'cancelled' || auction.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: `Auction is ${auction.status}. Bidding is closed.`
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Auction is not active. Bidding is closed.'
      });
    }

    // Additional check: if seller has approved bid, block bidding
    // Note: adminApproved flag means admin approved auction to go live (status: active) - NOT that bid is approved
    // Only block if seller has accepted a bid (status will be 'seller-approved' which is already checked above)
    if (auction.sellerApproved && auction.status === 'seller-approved') {
      return res.status(400).json({
        success: false,
        message: 'Auction is closed. Seller has accepted a bid. Waiting for admin approval. No further bids are allowed.'
      });
    }

    // Check if auction has ended
    if (new Date(auction.endTime) <= new Date()) {
      auction.status = 'ended';
      if (auction.currentBidder && !auction.winner) {
        auction.winner = auction.currentBidder;
      }
      await auction.save();
      
      // Mark all bids as closed
      const bids = await Bid.find({ auction: auction._id });
      for (const bid of bids) {
        // Determine if this bid won
        if (auction.winner && bid.bidder.toString() === auction.winner.toString()) {
          bid.status = 'won';
        } else {
          bid.status = 'lost';
        }
        bid.closedAt = new Date();
        await bid.save();
      }
      
      return res.status(400).json({
        success: false,
        message: 'Auction has ended'
      });
    }

    // Check if user is the seller
    if (auction.material.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Sellers cannot bid on their own materials'
      });
    }

    // Check if bid is higher than current bid
    const minBid = auction.currentBid > 0 ? auction.currentBid * 1.02 : auction.startingPrice;
    if (amount < minBid) {
      return res.status(400).json({
        success: false,
        message: `Bid must be at least ${minBid.toFixed(2)} (2% higher than current bid)`
      });
    }

    // Check reserve price if set
    if (auction.reservePrice && amount < auction.reservePrice) {
      return res.status(400).json({
        success: false,
        message: `Bid must meet or exceed reserve price of ${auction.reservePrice}`
      });
    }

    // Mark previous winning bid as outbid and notify previous bidder
    if (auction.currentBidder) {
      await Bid.updateMany(
        { auction: auction._id, bidder: auction.currentBidder, isWinning: true },
        { isWinning: false, isOutbid: true }
      );
      
      // Notify previous bidder they've been outbid
      const previousBidder = await User.findById(auction.currentBidder);
      if (previousBidder) {
        await createNotification(
          previousBidder._id,
          'bid-outbid',
          'You\'ve Been Outbid',
          `You've been outbid on "${auction.material.name}". Current bid is now ₹${amount.toLocaleString('en-IN')}.`,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id,
            sendEmail: true,
            userEmail: previousBidder.email,
            userName: previousBidder.name,
            auctionName: auction.material.name,
            currentBid: amount
          }
        );
      }
    }

    // Create new bid
    const bid = await Bid.create({
      auction: auction._id,
      bidder: req.user._id,
      amount,
      isWinning: true
    });

    // Update auction
    auction.currentBid = amount;
    auction.currentBidder = req.user._id;
    auction.bidCount += 1;
    await auction.save();

    // Populate bid for response
    await bid.populate('bidder', 'name email');

    // Create notification for bidder
    const bidder = await User.findById(req.user._id);
    if (bidder) {
      await createNotification(
        bidder._id,
        'bid-placed',
        'Bid Placed Successfully',
        `Your bid of ₹${amount.toLocaleString('en-IN')} has been placed on "${auction.material.name}".`,
        {
          relatedAuction: auction._id,
          relatedBid: bid._id,
          relatedMaterial: auction.material._id,
          sendEmail: true,
          userEmail: bidder.email,
          userName: bidder.name,
          auctionName: auction.material.name,
          bidAmount: amount
        }
      );
    }

    // Notify seller about new bid
    const seller = await User.findById(auction.material.seller);
    if (seller) {
      await createNotification(
        seller._id,
        'bid-placed',
        'New Bid Received',
        `A new bid of ₹${amount.toLocaleString('en-IN')} has been placed on your auction "${auction.material.name}".`,
        {
          relatedAuction: auction._id,
          relatedBid: bid._id,
          relatedMaterial: auction.material._id,
          sendEmail: false // Don't email seller for every bid
        }
      );
    }

    // Emit real-time update
    emitBidUpdate(auction._id.toString(), {
      bid: bid,
      auction: {
        currentBid: auction.currentBid,
        bidCount: auction.bidCount,
        currentBidder: auction.currentBidder
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: bid,
      auction: {
        currentBid: auction.currentBid,
        bidCount: auction.bidCount,
        tokenAmount: auction.tokenAmount || 0
      }
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bid',
      error: error.message
    });
  }
};

// @desc    Get bid history for auction
// @route   GET /api/auctions/:id/bids
const getBidHistory = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('material');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if user is admin, seller, or buyer
    const isAdmin = req.user?.role === 'admin';
    let isSeller = false;
    
    if (auction.material) {
      const material = await Material.findById(auction.material._id || auction.material);
      if (material) {
        isSeller = material.seller.toString() === req.user?._id?.toString() || 
                   material.seller.toString() === req.user?.id?.toString();
      }
    }

          // Populate bidder info based on user role
          let populateFields = 'name'; // Default: only name for sellers and buyers
          if (isAdmin) {
            populateFields = 'name email phoneNumber companyName address city state pincode userType isVerified role'; // Full details for admin including role
          }

    const bids = await Bid.find({ auction: auction._id })
      .populate('bidder', populateFields)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      data: bids,
      userRole: isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer'
    });
  } catch (error) {
    console.error('Get bid history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bid history',
      error: error.message
    });
  }
};

// @desc    End auction (admin or seller)
// @route   PUT /api/auctions/:id/end
const endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('material');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check authorization (admin or seller)
    const isSeller = auction.material.seller.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this auction'
      });
    }

    if (auction.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Auction is already ended'
      });
    }

    // Determine winner
    if (auction.currentBidder) {
      auction.winner = auction.currentBidder;
      
      // Check if reserve price was met
      if (auction.reservePrice && auction.currentBid < auction.reservePrice) {
        auction.winner = null; // Reserve not met
      }
    }

    auction.status = 'ended';
    await auction.save();

    // Mark all bids as closed
    const bids = await Bid.find({ auction: auction._id });
    for (const bid of bids) {
      // Determine if this bid won
      if (auction.winner && bid.bidder.toString() === auction.winner.toString()) {
        bid.status = 'won';
      } else {
        bid.status = 'lost';
      }
      bid.closedAt = new Date();
      await bid.save();
    }

    // Update material status
    const material = await Material.findById(auction.material._id);
    if (material) {
      material.status = auction.winner ? 'sold' : 'expired';
      await material.save();
    }

    res.json({
      success: true,
      message: 'Auction ended successfully',
      data: auction
    });
  } catch (error) {
    console.error('End auction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end auction',
      error: error.message
    });
  }
};

// @desc    Get closed bids for buyer
// @route   GET /api/auctions/closed-bids
const getClosedBids = async (req, res) => {
  try {
    const bids = await Bid.find({
      bidder: req.user._id,
      status: { $in: ['won', 'lost', 'closed'] }
    })
      .populate({
        path: 'auction',
        populate: {
          path: 'material',
          select: 'name category images quantity unit'
        }
      })
      .populate('auction.winner', 'name email')
      .populate('auction.currentBidder', 'name email')
      .sort({ closedAt: -1, createdAt: -1 });

    // Get full auction details
    const bidsWithAuctions = await Promise.all(
      bids.map(async (bid) => {
        const auction = await Auction.findById(bid.auction._id)
          .populate('material', 'name category images')
          .populate('winner', 'name email')
          .populate('currentBidder', 'name email')
          .populate('adminApprovedBy', 'name email');
        
        return {
          ...bid.toObject(),
          auction: auction ? auction.toObject() : bid.auction
        };
      })
    );

    res.json({
      success: true,
      data: bidsWithAuctions
    });
  } catch (error) {
    console.error('Get closed bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch closed bids',
      error: error.message
    });
  }
};

// @desc    Get buyer's bids
// @route   GET /api/auctions/my-bids
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate({
        path: 'auction',
        populate: {
          path: 'material',
          select: 'name category images description'
        }
      })
      .populate('auction.winner', 'name email')
      .sort({ createdAt: -1 });

    // Get auction details for each bid
    const bidsWithAuctions = await Promise.all(
      bids.map(async (bid) => {
        const auction = await Auction.findById(bid.auction._id)
          .populate('material', 'name category images')
          .populate('winner', 'name email')
          .populate('currentBidder', 'name email');
        
        return {
          ...bid.toObject(),
          auction: auction ? auction.toObject() : bid.auction
        };
      })
    );

    res.json({
      success: true,
      data: bidsWithAuctions
    });
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bids',
      error: error.message
    });
  }
};

// @desc    Get seller's auctions
// @route   GET /api/auctions/seller-auctions
const getSellerAuctions = async (req, res) => {
  try {
    // Get seller's materials
    const materials = await Material.find({ seller: req.user._id }).select('_id');
    const materialIds = materials.map(m => m._id);

    // Get auctions for seller's materials
    const auctions = await Auction.find({ material: { $in: materialIds } })
      .populate('material', 'name category images description')
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email')
      .populate('adminApprovedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: auctions
    });
  } catch (error) {
    console.error('Get seller auctions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller auctions',
      error: error.message
    });
  }
};

// @desc    Accept bid (seller) - Seller can accept bid anytime
// @route   PUT /api/auctions/:id/accept-bid-seller
const acceptBidSeller = async (req, res) => {
  try {
    const auctionId = req.params.id;
    
    // Validate auction ID
    if (!auctionId || auctionId === 'undefined' || auctionId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid auction ID provided'
      });
    }

    // Try to find by auction ID first, then by material ID (same logic as getAuctionById)
    let auction = await Auction.findById(auctionId)
      .populate('material')
      .populate('currentBidder', 'name email');

    // If not found by auction ID, try finding by material ID
    if (!auction) {
      auction = await Auction.findOne({ material: auctionId })
        .populate('material')
        .populate('currentBidder', 'name email');
    }

    if (!auction) {
      console.error('Auction not found for ID:', auctionId);
      return res.status(404).json({
        success: false,
        message: `Auction not found with ID: ${auctionId}`
      });
    }

    // Check if user is the seller
    const material = await Material.findById(auction.material._id || auction.material);
    if (!material || material.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can accept bids for this auction'
      });
    }

    if (auction.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept bid for cancelled auction'
      });
    }

    if (auction.sellerApproved) {
      return res.status(400).json({
        success: false,
        message: 'Bid has already been accepted by seller'
      });
    }

    // Check if there are any bids
    const bidCount = await Bid.countDocuments({ auction: auction._id });
    if (bidCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No bids found for this auction'
      });
    }

    // Get the highest bid to determine winner
    const highestBid = await Bid.findOne({ auction: auction._id })
      .sort({ amount: -1 })
      .populate('bidder', 'name email');
    
    if (!highestBid) {
      return res.status(400).json({
        success: false,
        message: 'No valid bids found for this auction'
      });
    }

    // Set winner and current bidder from highest bid
    auction.winner = highestBid.bidder._id;
    auction.currentBid = highestBid.amount;
    auction.currentBidder = highestBid.bidder._id;

    // Seller accepts bid - auction stays visible but no new bids allowed
    // Don't change status to 'ended' - keep it as 'seller-approved' so buyers can still see it
    // Status will be changed to 'admin-approved' when admin approves and generates PO
    
    // Accept the bid (seller approval)
    auction.sellerApproved = true;
    auction.sellerApprovedBy = req.user._id;
    auction.sellerApprovedAt = new Date();
    auction.status = 'seller-approved'; // This status means seller accepted, waiting for admin approval

    await auction.save();

    // Don't mark bids as closed yet - wait for admin approval
    // Don't update material status to 'sold' yet - wait for admin approval and PO generation

    // Notify winner
    if (auction.winner) {
      const winner = await User.findById(auction.winner);
      if (winner) {
        await createNotification(
          winner._id,
          'bid-accepted-seller',
          'Bid Accepted by Seller',
          `Your bid on "${auction.material.name}" has been accepted by the seller. Waiting for admin final approval.`,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id,
            sendEmail: true,
            userEmail: winner.email,
            userName: winner.name,
            auctionName: auction.material.name
          }
        );
      }
    }

    // Emit socket event
    emitAuctionUpdate(auction._id.toString(), {
      auctionId: auction._id,
      status: auction.status,
      sellerApproved: auction.sellerApproved,
      winner: auction.winner,
      currentBid: auction.currentBid
    });

    res.json({
      success: true,
      message: 'Bid accepted successfully. Waiting for admin final approval.',
      data: auction
    });
  } catch (error) {
    console.error('Accept bid seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept bid',
      error: error.message
    });
  }
};

// @desc    Delete bid (seller) - Seller can delete/cancel bids for their auctions
// @route   DELETE /api/auctions/:auctionId/bids/:bidId
const deleteBidSeller = async (req, res) => {
  try {
    const { auctionId, bidId } = req.params;
    
    const auction = await Auction.findById(auctionId)
      .populate('material');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if user is the seller
    const material = await Material.findById(auction.material._id || auction.material);
    if (!material || material.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can delete bids for this auction'
      });
    }

    // Check if auction is cancelled or approved
    if (auction.status === 'cancelled' || auction.status === 'admin-approved' || auction.status === 'seller-approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bid from cancelled or approved auction'
      });
    }

    const bid = await Bid.findById(bidId);

    if (!bid || bid.auction.toString() !== auctionId) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // If this is the winning bid, we need to find the next highest bid
    if (bid.isWinning || auction.currentBidder?.toString() === bid.bidder.toString()) {
      // Find the next highest bid
      const nextBid = await Bid.findOne({
        auction: auction._id,
        _id: { $ne: bid._id }
      }).sort({ amount: -1 });

      if (nextBid) {
        // Set next bid as winning
        nextBid.isWinning = true;
        nextBid.isOutbid = false;
        await nextBid.save();

        // Update auction
        auction.currentBid = nextBid.amount;
        auction.currentBidder = nextBid.bidder;
      } else {
        // No other bids, reset auction
        auction.currentBid = auction.startingPrice;
        auction.currentBidder = null;
      }

      auction.bidCount -= 1;
      await auction.save();
    } else {
      // Just decrease bid count
      auction.bidCount -= 1;
      await auction.save();
    }

    // Delete the bid
    await Bid.findByIdAndDelete(bid._id);

    // Emit real-time update
    emitBidUpdate(auction._id.toString(), {
      auction: {
        currentBid: auction.currentBid,
        bidCount: auction.bidCount,
        currentBidder: auction.currentBidder
      }
    });

    res.json({
      success: true,
      message: 'Bid deleted successfully'
    });
  } catch (error) {
    console.error('Delete bid seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bid',
      error: error.message
    });
  }
};

// @desc    Get upcoming auctions (scheduled)
// @route   GET /api/auctions/upcoming
const getUpcomingAuctions = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      status: { $in: ['scheduled', 'draft'] },
      $or: [
        { scheduledPublishDate: { $gt: new Date() } },
        { isDraft: true }
      ]
    };

    const auctions = await Auction.find(query)
      .populate('material', 'name category images description quantity unit location seller')
      .populate('material.seller', 'name email')
      .sort({ scheduledPublishDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Auction.countDocuments(query);

    res.json({
      success: true,
      data: auctions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get upcoming auctions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming auctions',
      error: error.message
    });
  }
};

// @desc    Get bid analytics with ranking
// @route   GET /api/auctions/analytics?auctionId=:id
const getBidAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    const { auctionId } = req.query; // Optional: get analytics for specific auction

    if (userType === 'buyer') {
      // If auctionId is provided, return specific auction analytics
      if (auctionId) {
        const auction = await Auction.findById(auctionId)
          .populate('material', 'name category images location')
          .populate('currentBidder', 'name email')
          .populate('winner', 'name email');

        if (!auction) {
          return res.status(404).json({
            success: false,
            message: 'Auction not found'
          });
        }

        // Get all bids for this auction with bidder details
        const allBids = await Bid.find({ auction: auctionId })
          .populate('bidder', 'name email phoneNumber companyName city state')
          .sort({ amount: -1 });

        // Find user's bid and rank
        const userBids = allBids.filter(b => b.bidder._id.toString() === userId.toString());
        const userHighestBid = userBids.length > 0 ? Math.max(...userBids.map(b => b.amount)) : 0;
        const userRank = userHighestBid > 0 
          ? allBids.findIndex(b => b.bidder._id.toString() === userId.toString() && b.amount === userHighestBid) + 1
          : null;

        // Get unique bidders count
        const uniqueBidders = new Set(allBids.map(b => b.bidder._id.toString())).size;

        // Get top bidders (top 10)
        const topBidders = allBids
          .filter((bid, index, self) => 
            index === self.findIndex(b => b.bidder._id.toString() === bid.bidder._id.toString())
          )
          .slice(0, 10)
          .map((bid, index) => ({
            rank: index + 1,
            bidder: {
              name: bid.bidder.name,
              email: bid.bidder.email,
              isYou: bid.bidder._id.toString() === userId.toString()
            },
            amount: bid.amount,
            timestamp: bid.timestamp,
            isWinning: bid.isWinning || false
          }));

        return res.json({
          success: true,
          data: {
            auction: {
              _id: auction._id,
              material: auction.material,
              currentBid: auction.currentBid,
              startingPrice: auction.startingPrice,
              bidCount: auction.bidCount,
              status: auction.status,
              endTime: auction.endTime,
              tokenAmount: auction.tokenAmount || 0
            },
            userRank: userRank || null,
            userBidAmount: userHighestBid,
            totalBidders: uniqueBidders,
            totalBids: allBids.length,
            topBidders,
            allBids: allBids.map(bid => ({
              _id: bid._id,
              bidder: {
                name: bid.bidder.name,
                email: bid.bidder.email,
                isYou: bid.bidder._id.toString() === userId.toString()
              },
              amount: bid.amount,
              timestamp: bid.timestamp,
              isWinning: bid.isWinning || false,
              isOutbid: bid.isOutbid || false,
              status: bid.status
            }))
          }
        });
      }

      // Buyer analytics - bid-wise ranking across all auctions
      const allBids = await Bid.find({ bidder: userId })
        .populate('auction', 'material currentBid status endTime')
        .populate('auction.material', 'name category')
        .sort({ timestamp: -1 });

      // Calculate rankings per auction
      const auctionRankings = {};
      const bidStats = {
        totalBids: allBids.length,
        activeBids: 0,
        wonBids: 0,
        lostBids: 0,
        totalSpent: 0,
        averageBid: 0,
        highestBid: 0
      };

      for (const bid of allBids) {
        const auctionIdStr = bid.auction._id.toString();
        if (!auctionRankings[auctionIdStr]) {
          // Get all bids for this auction to calculate ranking
          const auctionBids = await Bid.find({ auction: auctionIdStr })
            .sort({ amount: -1 });
          
          const userRank = auctionBids.findIndex(b => b.bidder.toString() === userId.toString()) + 1;
          const totalBidders = new Set(auctionBids.map(b => b.bidder.toString())).size;
          
          auctionRankings[auctionIdStr] = {
            auction: bid.auction,
            userBid: bid,
            rank: userRank,
            totalBidders,
            highestBid: auctionBids[0]?.amount || 0,
            userBidAmount: bid.amount
          };
        }

        if (bid.status === 'active' || bid.status === 'won') {
          bidStats.activeBids++;
        }
        if (bid.status === 'won') {
          bidStats.wonBids++;
        }
        if (bid.status === 'lost') {
          bidStats.lostBids++;
        }
        bidStats.totalSpent += bid.amount;
        if (bid.amount > bidStats.highestBid) {
          bidStats.highestBid = bid.amount;
        }
      }

      bidStats.averageBid = bidStats.totalBids > 0 
        ? bidStats.totalSpent / bidStats.totalBids 
        : 0;

      // Overall ranking across all bidders
      const allBidders = await Bid.aggregate([
        {
          $group: {
            _id: '$bidder',
            totalBids: { $sum: 1 },
            totalSpent: { $sum: '$amount' },
            avgBid: { $avg: '$amount' },
            wonBids: {
              $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
            }
          }
        },
        { $sort: { totalSpent: -1 } }
      ]);

      const userOverallRank = allBidders.findIndex(b => b._id.toString() === userId.toString()) + 1;

      res.json({
        success: true,
        data: {
          bidStats,
          auctionRankings: Object.values(auctionRankings),
          overallRank: userOverallRank,
          totalBidders: allBidders.length
        }
      });
    } else if (userType === 'seller') {
      // If auctionId is provided, return specific auction analytics for seller
      if (auctionId) {
        const auction = await Auction.findById(auctionId)
          .populate('material', 'name category images location condition quantity unit')
          .populate('currentBidder', 'name email phoneNumber companyName city state')
          .populate('winner', 'name email');

        if (!auction) {
          return res.status(404).json({
            success: false,
            message: 'Auction not found'
          });
        }

        // Verify that the seller owns this auction
        const materialId = auction.material._id || auction.material;
        const material = await Material.findById(materialId);
        if (!material || material.seller.toString() !== userId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to view analytics for this auction'
          });
        }

        // Get all bids for this auction with bidder details
        const allBids = await Bid.find({ auction: auctionId })
          .populate('bidder', 'name email phoneNumber companyName address city state pincode isVerified userType')
          .sort({ amount: -1 });

        // Get unique bidders count
        const uniqueBidders = new Set(allBids.map(b => b.bidder._id.toString())).size;

        // Get top bidders (all unique bidders ranked)
        const bidderMap = new Map();
        allBids.forEach(bid => {
          const bidderId = bid.bidder._id.toString();
          if (!bidderMap.has(bidderId) || bidderMap.get(bidderId).amount < bid.amount) {
            bidderMap.set(bidderId, {
              bidder: bid.bidder,
              amount: bid.amount,
              timestamp: bid.timestamp,
              isWinning: bid.isWinning || false,
              bidId: bid._id
            });
          }
        });

        const topBidders = Array.from(bidderMap.values())
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 20)
          .map((item, index) => ({
            rank: index + 1,
            bidder: {
              name: item.bidder.name,
              email: item.bidder.email,
              phoneNumber: item.bidder.phoneNumber,
              companyName: item.bidder.companyName,
              address: item.bidder.address,
              city: item.bidder.city,
              state: item.bidder.state,
              pincode: item.bidder.pincode,
              isVerified: item.bidder.isVerified,
              userType: item.bidder.userType
            },
            amount: item.amount,
            timestamp: item.timestamp,
            isWinning: item.isWinning,
            bidId: item.bidId
          }));

        // Calculate bid statistics
        const bidStats = {
          totalBids: allBids.length,
          uniqueBidders,
          highestBid: allBids.length > 0 ? allBids[0].amount : 0,
          lowestBid: allBids.length > 0 ? allBids[allBids.length - 1].amount : 0,
          averageBid: allBids.length > 0 
            ? allBids.reduce((sum, b) => sum + b.amount, 0) / allBids.length 
            : 0,
          bidsInLast24Hours: allBids.filter(b => {
            const bidTime = new Date(b.timestamp);
            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return bidTime >= last24Hours;
          }).length
        };

        return res.json({
          success: true,
          data: {
            auction: {
              _id: auction._id,
              material: auction.material,
              currentBid: auction.currentBid,
              startingPrice: auction.startingPrice,
              bidCount: auction.bidCount,
              status: auction.status,
              endTime: auction.endTime,
              tokenAmount: auction.tokenAmount || 0,
              currentBidder: auction.currentBidder,
              winner: auction.winner,
              createdAt: auction.createdAt,
              publishedAt: auction.publishedAt
            },
            bidStats,
            topBidders,
            allBids: allBids.map(bid => ({
              _id: bid._id,
              bidder: {
                name: bid.bidder.name,
                email: bid.bidder.email,
                phoneNumber: bid.bidder.phoneNumber,
                companyName: bid.bidder.companyName
              },
              amount: bid.amount,
              timestamp: bid.timestamp,
              isWinning: bid.isWinning || false,
              isOutbid: bid.isOutbid || false,
              status: bid.status
            }))
          }
        });
      }

      // Seller analytics - highest bid tracking for their listings
      const sellerAuctions = await Auction.find({
        'material.seller': userId
      })
        .populate('material', 'name category')
        .populate('currentBidder', 'name email')
        .sort({ createdAt: -1 });

      const auctionStats = sellerAuctions.map(auction => {
        return {
          auction: {
            _id: auction._id,
            material: auction.material,
            currentBid: auction.currentBid,
            bidCount: auction.bidCount,
            status: auction.status,
            endTime: auction.endTime
          },
          highestBid: auction.currentBid,
          totalBids: auction.bidCount,
          currentBidder: auction.currentBidder
        };
      });

      const totalStats = {
        totalAuctions: sellerAuctions.length,
        activeAuctions: sellerAuctions.filter(a => a.status === 'active').length,
        totalBidsReceived: sellerAuctions.reduce((sum, a) => sum + (a.bidCount || 0), 0),
        highestBidReceived: Math.max(...sellerAuctions.map(a => a.currentBid || 0), 0),
        totalRevenue: sellerAuctions
          .filter(a => a.status === 'admin-approved' || a.status === 'seller-approved')
          .reduce((sum, a) => sum + (a.currentBid || 0), 0)
      };

      res.json({
        success: true,
        data: {
          auctionStats,
          totalStats
        }
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Analytics only available for buyers and sellers'
      });
    }
  } catch (error) {
    console.error('Get bid analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

module.exports = {
  getAuctions,
  getAuctionById,
  getUpcomingAuctions,
  placeBid,
  getBidHistory,
  endAuction,
  getMyBids,
  getClosedBids,
  getSellerAuctions,
  acceptBidSeller,
  deleteBidSeller,
  getBidAnalytics
};

