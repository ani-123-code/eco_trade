const User = require('../models/User');
const Material = require('../models/Material');
const Auction = require('../models/Auction');
const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');
const { createNotification } = require('./notificationController');
const emailService = require('../emailService/EmailService');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalMaterials,
      activeAuctions,
      endedAuctions,
      pendingVerifications,
      totalRFQs,
      pendingRFQs,
      approvedRFQs,
      totalBids,
      approvedBids,
      pendingAuctionRequests,
      pendingSellerRequests,
      pendingServiceRequests,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', userType: 'buyer' }),
      User.countDocuments({ role: 'user', userType: 'seller' }),
      Material.countDocuments(),
      Auction.countDocuments({ status: 'active', endTime: { $gt: new Date() } }),
      Auction.countDocuments({ status: 'ended' }),
      User.countDocuments({ role: 'user', verificationStatus: 'pending' }),
      RFQ.countDocuments(),
      RFQ.countDocuments({ status: 'pending' }),
      RFQ.countDocuments({ status: 'admin-approved' }),
      Bid.countDocuments(),
      Auction.countDocuments({ adminApproved: true }),
      Auction.countDocuments({ status: { $in: ['draft', 'scheduled'] } }), // Pending auction requests
      require('../models/SellerRequest').countDocuments({ status: 'pending' }).catch(() => 0),
      Promise.all([
        require('../models/SellRequest').countDocuments({ status: 'pending' }).catch(() => 0),
        require('../models/RepairRequest').countDocuments({ status: 'pending' }).catch(() => 0),
        require('../models/RecycleRequest').countDocuments({ status: 'pending' }).catch(() => 0),
      ]).then(results => results.reduce((a, b) => a + b, 0)).catch(() => 0),
    ]);

    res.json({
      totalUsers,
      totalBuyers,
      totalSellers,
      totalMaterials,
      activeAuctions,
      endedAuctions,
      pendingVerifications,
      totalRFQs,
      pendingRFQs,
      approvedRFQs,
      totalBids,
      approvedBids,
      pendingAuctionRequests,
      pendingSellerRequests,
      pendingServiceRequests,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
const getPendingVerifications = async (req, res) => {
  try {
    const { userType, status = 'pending' } = req.query;

    const query = {
      role: 'user',
      verificationStatus: status
    };

    if (userType) {
      query.userType = userType;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verifications',
      error: error.message
    });
  }
};

// @desc    Verify user (approve)
// @route   PUT /api/admin/verifications/:id/approve
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot verify admin users'
      });
    }

    if (user.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    user.isVerified = true;
    user.verificationStatus = 'approved';
    user.verifiedBy = req.user._id;
    user.verifiedAt = new Date();
    await user.save();

    await user.populate('verifiedBy', 'name email');

    res.json({
      success: true,
      message: 'User verified successfully',
      data: user
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user',
      error: error.message
    });
  }
};

// @desc    Reject user verification
// @route   PUT /api/admin/verifications/:id/reject
const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject admin users'
      });
    }

    if (user.verificationStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'User is already rejected'
      });
    }

    user.isVerified = false;
    user.verificationStatus = 'rejected';
    user.verifiedBy = req.user._id;
    user.verifiedAt = new Date();
    await user.save();

    await user.populate('verifiedBy', 'name email');

    res.json({
      success: true,
      message: 'User verification rejected',
      data: user
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: error.message
    });
  }
};

// @desc    Get all materials (admin)
// @route   GET /api/admin/materials
const getAllMaterials = async (req, res) => {
  try {
    const { status, listingType, category, isVerified, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (listingType) query.listingType = listingType;
    if (category) query.category = category;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const materials = await Material.find(query)
      .populate('seller', 'name email userType')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Material.countDocuments(query);

    res.json({
      success: true,
      data: materials,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get all materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
};

// @desc    Delete material (admin)
// @route   DELETE /api/admin/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Delete associated auction if exists
    const auction = await Auction.findOne({ material: material._id });
    if (auction) {
      await Bid.deleteMany({ auction: auction._id });
      await Auction.findByIdAndDelete(auction._id);
    }

    // Delete associated RFQs
    await RFQ.deleteMany({ material: material._id });

    await Material.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error.message
    });
  }
};

// @desc    Get pending auction requests (draft/scheduled) waiting for admin approval
// @route   GET /api/admin/auctions/pending
const getPendingAuctionRequests = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20, search = '' } = req.query; // type: 'all', 'instant', 'scheduled'
    
    // Base query: Only get auctions that are NOT admin approved yet and are in draft/scheduled status
    const baseConditions = {
      status: { $in: ['draft', 'scheduled'] },
      adminApproved: { $ne: true }
    };

    let query = { ...baseConditions };

    // Filter by type: instant (draft, no scheduled date or scheduled date in past) vs scheduled (has future scheduledPublishDate)
    if (type === 'instant') {
      // Instant: draft auctions with no scheduled date or scheduled date in the past
      query.$and = [
        baseConditions,
        {
          $or: [
            { isDraft: true, scheduledPublishDate: { $exists: false } },
            { isDraft: true, scheduledPublishDate: null },
            { scheduledPublishDate: { $lte: new Date() } }
          ]
        }
      ];
      // Remove duplicate keys
      delete query.status;
      delete query.adminApproved;
    } else if (type === 'scheduled') {
      // Scheduled: has future scheduledPublishDate
      query = {
        ...baseConditions,
        scheduledPublishDate: { $exists: true, $ne: null, $gt: new Date() }
      };
    }

    // Note: Search is handled on frontend for now, but can be added to backend if needed
    // For backend search, we'd need to use aggregation pipeline with $lookup

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 20;
    const skip = (pageNumber - 1) * pageSize;

    // Get all pending for stats (before type filter)
    const allPending = await Auction.find({
      status: { $in: ['draft', 'scheduled'] },
      adminApproved: { $ne: true }
    });

    const instantCount = allPending.filter(a => 
      (a.isDraft && (!a.scheduledPublishDate || new Date(a.scheduledPublishDate) <= new Date()))
    ).length;
    
    const scheduledCount = allPending.filter(a => 
      a.scheduledPublishDate && new Date(a.scheduledPublishDate) > new Date()
    ).length;

    const auctions = await Auction.find(query)
      .populate({
        path: 'material',
        populate: {
          path: 'seller',
          select: 'name email phoneNumber companyName address city state pincode isVerified'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Auction.countDocuments(query);

    res.json({
      success: true,
      data: auctions,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      },
      stats: {
        total: allPending.length,
        instant: instantCount,
        scheduled: scheduledCount
      }
    });
  } catch (error) {
    console.error('Get pending auction requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending auction requests',
      error: error.message
    });
  }
};

// @desc    Get all auctions (admin)
// @route   GET /api/admin/auctions
const getAllAuctions = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Status filter - handle multiple statuses
    if (status && status !== '') {
      if (status === 'ended') {
        // Ended auctions: status is 'ended', 'closed', or endTime has passed
        query.$or = [
          { status: 'ended' },
          { status: 'closed' },
          { endTime: { $lt: new Date() } }
        ];
      } else if (status === 'active') {
        // Active auctions: status is 'active' and endTime hasn't passed
        query.status = 'active';
        query.endTime = { $gt: new Date() };
      } else if (status === 'seller-approved') {
        query.status = 'seller-approved';
      } else if (status === 'admin-approved') {
        query.status = 'admin-approved';
      } else if (status === 'scheduled') {
        query.status = 'scheduled';
      } else if (status === 'draft') {
        query.status = 'draft';
      } else {
        query.status = status;
      }
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let auctionsQuery = Auction.find(query)
      .populate({
        path: 'material',
        select: 'name category images listingType condition quantity unit location',
        populate: {
          path: 'seller',
          select: 'name email phoneNumber address city state pincode companyName isVerified verificationStatus verifiedAt verifiedBy'
        }
      })
      .populate('currentBidder', 'name email phoneNumber')
      .populate('winner', 'name email phoneNumber')
      .populate('adminApprovedBy', 'name email')
      .sort({ createdAt: -1 });

    // Apply search filter if provided
    if (search) {
      auctionsQuery = auctionsQuery.or([
        { 'material.name': { $regex: search, $options: 'i' } },
        { 'material.category': { $regex: search, $options: 'i' } },
        { 'material.seller.name': { $regex: search, $options: 'i' } },
        { 'material.seller.email': { $regex: search, $options: 'i' } }
      ]);
    }

    const auctions = await auctionsQuery
      .skip(skip)
      .limit(pageSize);

    // Count with search filter
    let countQuery = Auction.find(query);
    if (search) {
      countQuery = countQuery.or([
        { 'material.name': { $regex: search, $options: 'i' } },
        { 'material.category': { $regex: search, $options: 'i' } },
        { 'material.seller.name': { $regex: search, $options: 'i' } },
        { 'material.seller.email': { $regex: search, $options: 'i' } }
      ]);
    }
    const total = await countQuery.countDocuments();

    res.json({
      success: true,
      data: auctions,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get all auctions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auctions',
      error: error.message
    });
  }
};

// @desc    Accept bid (admin) - Final approval (can be done at any time)
// @route   PUT /api/admin/auctions/:id/accept-bid
const acceptBid = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('material')
      .populate('winner', 'name email')
      .populate('currentBidder', 'name email');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (auction.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept bid for cancelled auction'
      });
    }

    // Check if bid has already been accepted (status is admin-approved, not just adminApproved flag)
    // adminApproved flag is set when auction request is approved (auction goes live)
    // status='admin-approved' means admin approved the bid and generated PO
    if (auction.status === 'admin-approved') {
      return res.status(400).json({
        success: false,
        message: 'Bid has already been accepted and PO generated. Auction is closed.'
      });
    }

    // Check if auction is live (admin approved the auction request)
    // adminApproved flag means admin approved the auction to go live
    if (!auction.adminApproved) {
      return res.status(400).json({
        success: false,
        message: 'Auction must be approved by admin first (must be live) before admin can approve a bid.'
      });
    }

    // Check if seller has accepted a bid
    // Status should be 'seller-approved' which means seller accepted a bid
    if (!auction.sellerApproved || auction.status !== 'seller-approved') {
      return res.status(400).json({
        success: false,
        message: 'Seller must accept a bid first before admin can approve and generate PO.'
      });
    }

    // If seller has already approved, use the seller's selected winner
    if (auction.sellerApproved && auction.status === 'seller-approved') {
      // Seller has already accepted a bid, use that as the winner
      if (!auction.winner && auction.currentBidder) {
        auction.winner = auction.currentBidder;
      }
    } else {
      // Admin can accept bid from active auction
      if (auction.status === 'active') {
        // Set winner if not already set
        if (!auction.winner && auction.currentBidder) {
          auction.winner = auction.currentBidder;
        }
      }

      // If no current bidder, check if there are any bids
      if (!auction.winner && !auction.currentBidder) {
        // Check if there are any bids at all
        const bidCount = await Bid.countDocuments({ auction: auction._id });
        if (bidCount === 0) {
          return res.status(400).json({
            success: false,
            message: 'No bids found for this auction'
          });
        }
        // Get the highest bid
        const highestBid = await Bid.findOne({ auction: auction._id })
          .sort({ amount: -1 })
          .populate('bidder', 'name email');
        if (highestBid) {
          auction.winner = highestBid.bidder._id;
          auction.currentBid = highestBid.amount;
          auction.currentBidder = highestBid.bidder._id;
        }
      }

      if (!auction.winner && auction.currentBidder) {
        auction.winner = auction.currentBidder;
      }
    }

    // Accept the bid - Close the auction permanently
    auction.adminApproved = true;
    auction.adminApprovedBy = req.user._id;
    auction.adminApprovedAt = new Date();
    auction.status = 'admin-approved'; // Final status - auction is closed
    
    // Ensure winner is set
    if (!auction.winner && auction.currentBidder) {
      auction.winner = auction.currentBidder;
    }

    // Generate Purchase Order number
    const poNumber = `PO-${Date.now()}-${auction._id.toString().slice(-6).toUpperCase()}`;
    auction.purchaseOrder = poNumber;

    await auction.save();

    // Mark all bids as closed with proper status
    const bids = await Bid.find({ auction: auction._id });
    for (const bid of bids) {
      // Determine if this bid won
      if (auction.winner && bid.bidder.toString() === auction.winner.toString()) {
        bid.status = 'won';
        bid.isWinning = true;
      } else {
        bid.status = 'lost';
        bid.isWinning = false;
        bid.isOutbid = false;
      }
      bid.closedAt = new Date();
      await bid.save();
    }

    // Update material status
    const material = await Material.findById(auction.material._id);
    if (material) {
      material.status = 'sold';
      await material.save();
    }

    // Notify winner
    if (auction.winner) {
      const winner = await User.findById(auction.winner);
      if (winner) {
        await createNotification(
          winner._id,
          'bid-won',
          'Bid Accepted - You Won!',
          `Congratulations! Your bid on "${auction.material.name}" has been accepted by admin. Purchase Order: ${poNumber}`,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id,
            sendEmail: true,
            userEmail: winner.email,
            userName: winner.name,
            auctionName: auction.material.name,
            winningBid: auction.currentBid,
            tokenAmount: auction.tokenAmount || 0,
            tokenDeadline: auction.tokenPaymentDeadline || null
          }
        );
      }
    }

    // Notify seller
    if (auction.material.seller) {
      const seller = await User.findById(auction.material.seller);
      if (seller) {
        await createNotification(
          seller._id,
          'bid-accepted',
          'Bid Accepted by Admin',
          `The bid on your auction "${auction.material.name}" has been accepted by admin. Purchase Order: ${poNumber}`,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id,
            sendEmail: true,
            userEmail: seller.email,
            userName: seller.name,
            auctionName: auction.material.name
          }
        );
      }
    }

    // Emit socket update to notify all clients that auction is closed
    const { emitAuctionUpdate } = require('../socket/socketHandler');
    emitAuctionUpdate(auction._id.toString(), {
      auctionId: auction._id,
      status: 'admin-approved',
      adminApproved: true,
      sellerApproved: auction.sellerApproved,
      winner: auction.winner,
      currentBid: auction.currentBid,
      purchaseOrder: poNumber
    });

    res.json({
      success: true,
      message: 'Bid accepted successfully. Transaction will proceed manually outside the platform.',
      data: auction
    });
  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept bid',
      error: error.message
    });
  }
};

// @desc    Get all RFQs (admin)
// @route   GET /api/admin/rfqs
const getAllRFQs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const rfqs = await RFQ.find(query)
      .populate({
        path: 'material',
        select: 'name category images listingType quantity unit description',
        populate: {
          path: 'seller',
          select: 'name email phoneNumber companyName address city state pincode'
        }
      })
      .populate('buyer', 'name email phoneNumber companyName address city state pincode userType isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await RFQ.countDocuments(query);

    res.json({
      success: true,
      data: rfqs,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get all RFQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs',
      error: error.message
    });
  }
};

// @desc    Approve RFQ (admin) - Final approval
// @route   PUT /api/admin/rfqs/:id/approve
const approveRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('material')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve cancelled RFQ'
      });
    }

    if (rfq.status === 'accepted' || rfq.status === 'admin-approved') {
      return res.status(400).json({
        success: false,
        message: 'RFQ has already been approved'
      });
    }

    // Admin can approve from any status (pending, responded, accepted)
    // Since admin handles everything externally

    // Admin approval - final decision
    rfq.status = 'admin-approved';
    rfq.adminApproved = true;
    rfq.adminApprovedBy = req.user._id;
    rfq.adminApprovedAt = new Date();
    
    if (!rfq.acceptedAt) {
      rfq.acceptedAt = new Date();
    }

    await rfq.save();

    // Update material status
    const material = await Material.findById(rfq.material._id);
    if (material) {
      material.status = 'sold';
      await material.save();
    }

    res.json({
      success: true,
      message: 'RFQ approved successfully. Transaction will proceed manually outside the platform.',
      data: rfq
    });
  } catch (error) {
    console.error('Approve RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve RFQ',
      error: error.message
    });
  }
};

// @desc    Reject RFQ (admin)
// @route   PUT /api/admin/rfqs/:id/reject
const rejectRFQ = async (req, res) => {
  try {
    const { reason } = req.body;
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.status === 'admin-approved' || rfq.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject RFQ with status: ${rfq.status}`
      });
    }

    rfq.status = 'rejected';
    rfq.rejectedAt = new Date();
    rfq.adminRejected = true;
    rfq.adminRejectedBy = req.user._id;
    rfq.adminRejectedAt = new Date();
    if (reason) {
      rfq.rejectionReason = reason;
    }

    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ rejected successfully',
      data: rfq
    });
  } catch (error) {
    console.error('Reject RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject RFQ',
      error: error.message
    });
  }
};

// @desc    Update RFQ Status (admin) - For managing RFQ workflow
// @route   PUT /api/admin/rfqs/:id/status
const updateRFQStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    const validStatuses = ['pending', 'in-progress', 'responded', 'accepted', 'rejected', 'cancelled', 'admin-approved', 'finalized'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    rfq.status = status;
    
    // Update timestamps based on status
    if (status === 'admin-approved' && !rfq.adminApproved) {
      rfq.adminApproved = true;
      rfq.adminApprovedBy = req.user._id;
      rfq.adminApprovedAt = new Date();
    }
    
    if (status === 'finalized') {
      // Update material status
      const material = await Material.findById(rfq.material);
      if (material) {
        material.status = 'sold';
        await material.save();
      }
    }

    if (notes !== undefined) {
      rfq.adminNotes = notes;
    }

    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ status updated successfully',
      data: rfq
    });
  } catch (error) {
    console.error('Update RFQ status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update RFQ status',
      error: error.message
    });
  }
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, userType, isVerified, verificationStatus } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify admin users'
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (userType) user.userType = userType;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (verificationStatus) {
      user.verificationStatus = verificationStatus;
      if (verificationStatus === 'approved') {
        user.isVerified = true;
      } else if (verificationStatus === 'rejected') {
        user.isVerified = false;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// @desc    Warn user (admin) - Send warning notification and email
// @route   POST /api/admin/users/:id/warn
const warnUser = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Warning message is required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot warn admin users'
      });
    }

    const adminName = req.user.name || 'Administrator';

    // Create notification for the user (this will also send email)
    const notification = await createNotification(
      user._id,
      'user-warning',
      'Account Warning',
      message,
      {
        sendEmail: true,
        userEmail: user.email,
        userName: user.name,
        warningMessage: message,
        adminName: adminName,
        relatedUser: req.user._id
      }
    );

    if (!notification) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create notification, but email may have been sent'
      });
    }

    res.json({
      success: true,
      message: 'Warning sent to user successfully',
      notificationId: notification._id
    });
  } catch (error) {
    console.error('Warn user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to warn user',
      error: error.message
    });
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete user's materials
    const materials = await Material.find({ seller: user._id });
    for (const material of materials) {
      const auction = await Auction.findOne({ material: material._id });
      if (auction) {
        await Bid.deleteMany({ auction: auction._id });
        await Auction.findByIdAndDelete(auction._id);
      }
      await RFQ.deleteMany({ material: material._id });
    }
    await Material.deleteMany({ seller: user._id });

    // Delete user's bids
    await Bid.deleteMany({ bidder: user._id });

    // Delete user's RFQs
    await RFQ.deleteMany({ buyer: user._id });

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// @desc    Close auction (admin) - End auction manually
// @route   PUT /api/admin/auctions/:id/close
const closeAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('material')
      .populate('currentBidder', 'name email');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (auction.status === 'ended' || auction.status === 'admin-approved' || auction.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Auction is already ${auction.status}`
      });
    }

    // End the auction
    auction.status = 'ended';
    
    // Set winner if there's a current bidder
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

    // Emit socket event
    const { emitAuctionUpdate } = require('../socket/socketHandler');
    emitAuctionUpdate(auction._id.toString(), {
      auctionId: auction._id,
      status: auction.status,
      winner: auction.winner,
      currentBid: auction.currentBid
    });

    res.json({
      success: true,
      message: 'Auction closed successfully',
      data: auction
    });
  } catch (error) {
    console.error('Close auction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close auction',
      error: error.message
    });
  }
};

// @desc    Create bid (admin) - Add bid on behalf of user
// @route   POST /api/admin/auctions/:id/bids
const createBid = async (req, res) => {
  try {
    const { bidderId, amount, timestamp, status } = req.body;

    if (!bidderId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid bidder ID and amount are required'
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

    // Check if auction is active or ended (admin can add bids even after auction ends)
    if (auction.status === 'cancelled' || auction.status === 'admin-approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add bid to cancelled or approved auction'
      });
    }

    // Check if bidder exists
    const bidder = await User.findById(bidderId);
    if (!bidder) {
      return res.status(404).json({
        success: false,
        message: 'Bidder not found'
      });
    }

    // Check if bidder is the seller
    if (auction.material.seller.toString() === bidderId) {
      return res.status(400).json({
        success: false,
        message: 'Sellers cannot bid on their own materials'
      });
    }

    // Check if bid is higher than current bid (if auction is active)
    if (auction.status === 'active' && auction.currentBid > 0) {
      const minBid = auction.currentBid * 1.02;
      if (amount < minBid) {
        return res.status(400).json({
          success: false,
          message: `Bid must be at least ${minBid.toFixed(2)} (2% higher than current bid)`
        });
      }
    }

    // Check reserve price if set
    if (auction.reservePrice && amount < auction.reservePrice) {
      return res.status(400).json({
        success: false,
        message: `Bid must meet or exceed reserve price of ${auction.reservePrice}`
      });
    }

    // Mark previous winning bid as outbid
    if (auction.currentBidder) {
      await Bid.updateMany(
        { auction: auction._id, bidder: auction.currentBidder, isWinning: true },
        { isWinning: false, isOutbid: true }
      );
    }

    // Create new bid
    const bidData = {
      auction: auction._id,
      bidder: bidderId,
      amount,
      isWinning: true,
      status: status || (auction.status === 'ended' ? 'won' : 'active')
    };

    // Add timestamp if provided
    if (timestamp) {
      bidData.timestamp = new Date(timestamp);
    }

    // Add closedAt if status is won/lost
    if (bidData.status === 'won' || bidData.status === 'lost') {
      bidData.closedAt = new Date();
    }

    const bid = await Bid.create(bidData);

    // Update auction
    auction.currentBid = amount;
    auction.currentBidder = bidderId;
    auction.bidCount += 1;
    
    // If auction was ended, set winner
    if (auction.status === 'ended' && !auction.winner) {
      auction.winner = bidderId;
    }
    
    await auction.save();

    // Populate bid for response
    await bid.populate('bidder', 'name email');

    // Emit real-time update
    const { emitBidUpdate } = require('../socket/socketHandler');
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
      message: 'Bid created successfully',
      data: bid
    });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bid',
      error: error.message
    });
  }
};

// @desc    Update bid (admin) - Edit bid amount, date, bidder, status, etc.
// @route   PUT /api/admin/bids/:id
const updateBid = async (req, res) => {
  try {
    const { amount, timestamp, bidderId, status, isWinning, isOutbid, closedAt } = req.body;

    const bid = await Bid.findById(req.params.id)
      .populate('auction')
      .populate('bidder', 'name email');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const auction = await Auction.findById(bid.auction._id)
      .populate('material');

    // Check if auction is cancelled or approved (admin can still edit for approved auctions)
    if (auction.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit bid for cancelled auction'
      });
    }

    // Update amount if provided
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid bid amount is required'
        });
      }

      // Check if new amount is valid (only for active auctions)
      if (auction.status === 'active' && auction.currentBid > 0 && bid.amount !== auction.currentBid) {
        const minBid = auction.currentBid * 1.02;
        if (amount < minBid) {
          return res.status(400).json({
            success: false,
            message: `Bid must be at least ${minBid.toFixed(2)} (2% higher than current bid)`
          });
        }
      }

      // Check reserve price
      if (auction.reservePrice && amount < auction.reservePrice) {
        return res.status(400).json({
          success: false,
          message: `Bid must meet or exceed reserve price of ${auction.reservePrice}`
        });
      }

      bid.amount = amount;
    }

    // Update timestamp if provided
    if (timestamp) {
      bid.timestamp = new Date(timestamp);
    }

    // Update bidder if provided
    if (bidderId) {
      const bidder = await User.findById(bidderId);
      if (!bidder) {
        return res.status(404).json({
          success: false,
          message: 'Bidder not found'
        });
      }

      // Check if bidder is the seller
      if (auction.material.seller.toString() === bidderId) {
        return res.status(400).json({
          success: false,
          message: 'Sellers cannot bid on their own materials'
        });
      }

      bid.bidder = bidderId;
    }

    // Update status if provided
    if (status && ['active', 'closed', 'won', 'lost'].includes(status)) {
      bid.status = status;
    }

    // Update isWinning if provided
    if (isWinning !== undefined) {
      bid.isWinning = isWinning;
      
      // If setting as winning, mark others as outbid
      if (isWinning) {
        await Bid.updateMany(
          { 
            auction: auction._id, 
            _id: { $ne: bid._id },
            isWinning: true 
          },
          { isWinning: false, isOutbid: true }
        );
        bid.isOutbid = false;
      }
    }

    // Update isOutbid if provided
    if (isOutbid !== undefined) {
      bid.isOutbid = isOutbid;
    }

    // Update closedAt if provided
    if (closedAt) {
      bid.closedAt = new Date(closedAt);
    }

    await bid.save();

    // Update auction if this is the winning bid
    if (bid.isWinning) {
      auction.currentBid = bid.amount;
      auction.currentBidder = bid.bidder;
      
      // If auction is ended and this is winning, set as winner
      if (auction.status === 'ended' && !auction.winner) {
        auction.winner = bid.bidder;
      }
      
      await auction.save();
    } else if (bid.isWinning === false && auction.currentBidder?.toString() === bid.bidder?.toString()) {
      // If this was the winning bid and we're removing it, find next highest
      const nextBid = await Bid.findOne({
        auction: auction._id,
        _id: { $ne: bid._id },
        isWinning: false
      }).sort({ amount: -1 });

      if (nextBid) {
        nextBid.isWinning = true;
        nextBid.isOutbid = false;
        await nextBid.save();
        auction.currentBid = nextBid.amount;
        auction.currentBidder = nextBid.bidder;
      } else {
        auction.currentBid = auction.startingPrice;
        auction.currentBidder = null;
      }
      await auction.save();
    }

    // Repopulate bidder for response
    await bid.populate('bidder', 'name email');

    // Emit real-time update
    emitBidUpdate(auction._id.toString(), {
      bid: bid,
      auction: {
        currentBid: auction.currentBid,
        bidCount: auction.bidCount,
        currentBidder: auction.currentBidder
      }
    });

    res.json({
      success: true,
      message: 'Bid updated successfully',
      data: bid
    });
  } catch (error) {
    console.error('Update bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bid',
      error: error.message
    });
  }
};

// @desc    Delete bid (admin)
// @route   DELETE /api/admin/bids/:id
const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('auction');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const auction = await Auction.findById(bid.auction._id);

    // Check if auction is cancelled or approved
    if (auction.status === 'cancelled' || auction.status === 'admin-approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bid from cancelled or approved auction'
      });
    }

    // If this is the winning bid, we need to find the next highest bid
    if (bid.isWinning) {
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
    const { emitBidUpdate } = require('../socket/socketHandler');
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
    console.error('Delete bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bid',
      error: error.message
    });
  }
};

// @desc    Delete auction (admin)
// @route   DELETE /api/admin/auctions/:id
const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('material')
      .populate('currentBidder', 'name email')
      .populate('winner', 'name email');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Check if auction is in a state that can be deleted
    // Allow deletion of draft, scheduled, rejected, cancelled auctions
    // For active/ended auctions, warn but allow deletion
    if (auction.status === 'admin-approved' && auction.purchaseOrder) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete auction with processed purchase order. Please contact support.'
      });
    }

    // Delete all bids associated with this auction
    await Bid.deleteMany({ auction: auction._id });

    // Store material ID before deleting auction
    const materialId = auction.material?._id || auction.material;

    // Delete the auction
    await Auction.findByIdAndDelete(auction._id);

    // Optionally delete the material if it has no other associations
    // Only delete if material was created specifically for this auction
    if (materialId) {
      const material = await Material.findById(materialId);
      if (material) {
        // Check if material has any other auctions (shouldn't happen, but safety check)
        const otherAuctions = await Auction.find({ material: materialId, _id: { $ne: auction._id } });
        const otherRFQs = await RFQ.find({ material: materialId });
        
        // Only delete material if no other auctions or RFQs exist
        if (otherAuctions.length === 0 && otherRFQs.length === 0) {
          await Material.findByIdAndDelete(materialId);
        }
      }
    }

    // Emit socket update to notify clients
    try {
      const { emitAuctionUpdate } = require('../socket/socketHandler');
      emitAuctionUpdate(auction._id.toString(), {
        auctionId: auction._id,
        status: 'deleted',
        deleted: true
      });
    } catch (socketError) {
      console.error('Failed to emit auction deletion update:', socketError);
      // Don't fail deletion if socket fails
    }

    // Notify seller if auction was deleted
    if (auction.material?.seller) {
      const seller = await User.findById(auction.material.seller._id || auction.material.seller);
      if (seller) {
        try {
          await createNotification(
            seller._id,
            'auction-cancelled',
            'Auction Deleted',
            `Your auction "${auction.material?.name || 'Auction'}" has been deleted by an administrator.`,
            {
              relatedAuction: auction._id,
              relatedMaterial: materialId,
              sendEmail: false // Don't send email for deletion, just in-app notification
            }
          );
        } catch (notifError) {
          console.error('Failed to send deletion notification:', notifError);
          // Don't fail deletion if notification fails
        }
      }
    }

    res.json({
      success: true,
      message: 'Auction deleted successfully'
    });
  } catch (error) {
    console.error('Delete auction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete auction',
      error: error.message
    });
  }
};

// @desc    Create auction (admin) - Create auction on behalf of seller
// @route   POST /api/admin/auctions/create
const createAuction = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      quantity,
      unit,
      images,
      location,
      startingPrice,
      reservePrice,
      auctionEndTime,
      condition,
      specifications,
      sellerId,
      isVerified
    } = req.body;

    // Validate required fields
    if (!name || !category || !quantity || !unit || !location || !startingPrice || !auctionEndTime || !sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, quantity, unit, location, startingPrice, auctionEndTime, and sellerId are required'
      });
    }

    // Validate category
    if (!['ewaste', 'fmgc', 'metal', 'plastics', 'paper'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Validate seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Validate auction end time
    if (new Date(auctionEndTime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Auction end time must be in the future'
      });
    }

    // Create material
    const material = await Material.create({
      name,
      description: description || '',
      category,
      quantity,
      unit,
      images: images || [],
      location,
      seller: sellerId,
      listingType: 'auction',
      startingPrice,
      reservePrice: reservePrice || null,
      auctionEndTime,
      condition: condition || 'good',
      specifications: specifications || {},
      status: 'active',
      isVerified: isVerified !== undefined ? isVerified : true, // Admin created auctions are auto-verified
      verifiedBy: req.user._id,
      verifiedAt: new Date()
    });

    // Create auction record
    const auction = await Auction.create({
      material: material._id,
      startingPrice,
      reservePrice: reservePrice || null,
      endTime: auctionEndTime,
      status: 'active'
    });

    // Populate for response
    await material.populate('seller', 'name email');
    await auction.populate('material');

    res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      data: {
        auction,
        material
      }
    });
  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create auction',
      error: error.message
    });
  }
};

// @desc    Approve scheduled auction (admin)
// @route   PUT /api/admin/auctions/:id/approve-scheduled
const approveScheduledAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('material')
      .populate('material.seller', 'name email');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (auction.status !== 'scheduled' && auction.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Auction is not scheduled or draft. Only scheduled/draft auctions can be approved.'
      });
    }

    // Check if it's scheduled for future or instant
    const isScheduled = auction.scheduledPublishDate && new Date(auction.scheduledPublishDate) > new Date();
    
    if (isScheduled) {
      // Keep as scheduled, but mark as admin approved
      auction.adminApproved = true;
      auction.adminApprovedBy = req.user._id;
      auction.adminApprovedAt = new Date();
      // It will be published automatically when scheduledPublishDate arrives
    } else {
      // Instant approval - make it live immediately
      // When admin approves seller request, auction goes LIVE and buyers can bid
      auction.status = 'active';
      auction.publishedAt = new Date();
      auction.isDraft = false;
      auction.adminApproved = true; // This flag means admin approved the auction to go live
      auction.adminApprovedBy = req.user._id;
      auction.adminApprovedAt = new Date();
      
      // Update material status to active and verified
      if (auction.material) {
        const material = await Material.findById(auction.material._id || auction.material);
        if (material) {
          material.isVerified = true;
          material.status = 'active'; // Material is active, buyers can see and bid
          material.verifiedBy = req.user._id;
          material.verifiedAt = new Date();
          await material.save();
        }
      }

      // Emit socket update for instant approval
      const { emitAuctionUpdate } = require('../socket/socketHandler');
      emitAuctionUpdate(auction._id.toString(), {
        auctionId: auction._id,
        status: auction.status,
        adminApproved: true
      });
    }
    
    // For scheduled auctions, also update material when approved
    if (isScheduled && auction.material) {
      const material = await Material.findById(auction.material._id || auction.material);
      if (material) {
        material.isVerified = true;
        material.verifiedBy = req.user._id;
        material.verifiedAt = new Date();
        // Keep material status as pending until scheduled date arrives (will be updated by scheduler)
        await material.save();
      }
    }

    await auction.save();

    // Notify seller
    if (auction.material?.seller) {
      const seller = await User.findById(auction.material.seller._id || auction.material.seller);
      if (seller) {
        const message = isScheduled
          ? `Your auction "${auction.material.name}" has been approved by admin. It will go live on ${new Date(auction.scheduledPublishDate).toLocaleString()}.`
          : `Your auction "${auction.material.name}" has been approved by admin and is now live! Buyers can start bidding.`;
        
        await createNotification(
          seller._id,
          'auction-approved',
          isScheduled ? 'Auction Approved (Scheduled)' : 'Auction Approved & Live',
          message,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id,
            sendEmail: true,
            userEmail: seller.email,
            userName: seller.name,
            auctionName: auction.material.name,
            publishDate: auction.scheduledPublishDate
          }
        );
      }
    }

    res.json({
      success: true,
      message: isScheduled
        ? 'Auction approved. It will go live at the scheduled time.'
        : 'Auction approved and activated successfully. It is now live and buyers can bid.',
      data: auction
    });
  } catch (error) {
    console.error('Approve scheduled auction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve scheduled auction',
      error: error.message
    });
  }
};

// @desc    Reject auction request (admin)
// @route   PUT /api/admin/auctions/:id/reject-request
const rejectAuctionRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const auction = await Auction.findById(req.params.id)
      .populate('material')
      .populate('material.seller', 'name email');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (auction.status !== 'scheduled' && auction.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Auction is not scheduled or draft. Only pending auction requests can be rejected.'
      });
    }

    if (auction.adminApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved auction.'
      });
    }

    // Reject the auction
    auction.status = 'rejected';
    auction.adminApproved = false;
    auction.rejectedBy = req.user._id;
    auction.rejectedAt = new Date();

    await auction.save();

    // Notify seller
    if (auction.material?.seller) {
      const seller = await User.findById(auction.material.seller._id || auction.material.seller);
      if (seller) {
        const rejectionReason = reason || 'No specific reason provided. Please review our terms of service and community guidelines.';
        const message = `Your auction request for "${auction.material?.name || 'material'}" has been rejected by admin. Reason: ${rejectionReason}`;
        
        await createNotification(
          seller._id,
          'auction-rejected',
          'Auction Request Rejected',
          message,
          {
            relatedAuction: auction._id,
            relatedMaterial: auction.material._id || auction.material,
            sendEmail: true,
            userEmail: seller.email,
            userName: seller.name,
            auctionName: auction.material?.name || 'Material',
            rejectionReason: rejectionReason
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Auction request rejected successfully. Seller has been notified.',
      data: auction
    });
  } catch (error) {
    console.error('Reject auction request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject auction request',
      error: error.message
    });
  }
};

// @desc    Process token payment (admin)
// @route   PUT /api/admin/auctions/:id/token-payment
const processTokenPayment = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('winner', 'name email')
      .populate('material', 'name');

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (!auction.winner) {
      return res.status(400).json({
        success: false,
        message: 'No winner found for this auction'
      });
    }

    if (auction.tokenPaid) {
      return res.status(400).json({
        success: false,
        message: 'Token payment has already been processed'
      });
    }

    // Mark token as paid
    auction.tokenPaid = true;
    auction.tokenPaidAt = new Date();
    await auction.save();

    // Notify winner
    await createNotification(
      auction.winner._id,
      'token-payment-received',
      'Token Payment Confirmed',
      `Your token payment for auction "${auction.material.name}" has been confirmed.`,
      {
        relatedAuction: auction._id,
        relatedMaterial: auction.material._id,
        sendEmail: true,
        userEmail: auction.winner.email,
        userName: auction.winner.name,
        auctionName: auction.material.name,
        tokenAmount: auction.tokenAmount
      }
    );

    res.json({
      success: true,
      message: 'Token payment processed successfully',
      data: auction
    });
  } catch (error) {
    console.error('Process token payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process token payment',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
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
};