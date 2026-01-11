const RFQ = require('../models/RFQ');
const Material = require('../models/Material');
const { emitRFQUpdate } = require('../socket/socketHandler');

// @desc    Create RFQ
// @route   POST /api/rfqs
const createRFQ = async (req, res) => {
  try {
    const { materialId, quoteAmount, message } = req.body;

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }

    // Check if user is verified buyer
    if (req.user.userType !== 'buyer' || !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified buyers can create RFQs'
      });
    }

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if material is RFQ type
    if (material.listingType !== 'rfq') {
      return res.status(400).json({
        success: false,
        message: 'This material is not available for RFQ'
      });
    }

    // Check if material is verified and active
    if (!material.isVerified || material.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Material is not available for RFQ'
      });
    }

    // Check if user is the seller
    if (material.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Sellers cannot create RFQs for their own materials'
      });
    }

    // Check if RFQ already exists from this buyer
    const existingRFQ = await RFQ.findOne({
      material: materialId,
      buyer: req.user._id,
      status: { $in: ['pending', 'responded'] }
    });

    if (existingRFQ) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending RFQ for this material'
      });
    }

    // Create RFQ
    const rfq = await RFQ.create({
      material: materialId,
      buyer: req.user._id,
      quoteAmount: quoteAmount || null,
      message: message || null,
      status: 'pending'
    });

    await rfq.populate('material', 'name category quantity unit');
    await rfq.populate('buyer', 'name email');

    // Emit real-time update to seller
    emitRFQUpdate(material.seller.toString(), req.user._id.toString(), rfq);

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: rfq
    });
  } catch (error) {
    console.error('Create RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create RFQ',
      error: error.message
    });
  }
};

// @desc    Get RFQs for a material
// @route   GET /api/rfqs/material/:materialId
const getRFQsByMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user is the seller or admin
    const isSeller = material.seller.toString() === req.user?._id?.toString();
    if (!isSeller && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view RFQs for this material'
      });
    }

    const rfqs = await RFQ.find({ material: req.params.materialId })
      .populate('buyer', 'name email phoneNumber city state')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rfqs
    });
  } catch (error) {
    console.error('Get RFQs by material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs',
      error: error.message
    });
  }
};

// @desc    Get buyer's RFQs
// @route   GET /api/rfqs/my-rfqs
const getMyRFQs = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { buyer: req.user._id };
    if (status) {
      query.status = status;
    }

    const rfqs = await RFQ.find(query)
      .populate({
        path: 'material',
        populate: {
          path: 'seller',
          select: 'name email city state'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rfqs
    });
  } catch (error) {
    console.error('Get my RFQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs',
      error: error.message
    });
  }
};

// @desc    Get seller's RFQs (for their materials)
// @route   GET /api/rfqs/my-listings
const getSellerRFQs = async (req, res) => {
  try {
    // Check if user is verified seller
    if (req.user.userType !== 'seller' || !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified sellers can view RFQs for their listings'
      });
    }

    const { status } = req.query;

    // Get seller's materials
    const materials = await Material.find({ seller: req.user._id }).select('_id');
    const materialIds = materials.map(m => m._id);

    const query = { material: { $in: materialIds } };
    if (status) {
      query.status = status;
    }

    const rfqs = await RFQ.find(query)
      .populate('material', 'name category quantity unit')
      .populate('buyer', 'name email phoneNumber city state')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rfqs
    });
  } catch (error) {
    console.error('Get seller RFQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs',
      error: error.message
    });
  }
};

// @desc    Seller respond to RFQ
// @route   PUT /api/rfqs/:id/respond
const respondToRFQ = async (req, res) => {
  try {
    const { quotedPrice, message } = req.body;

    if (!quotedPrice || quotedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quoted price is required'
      });
    }

    const rfq = await RFQ.findById(req.params.id)
      .populate('material');

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check if user is the seller
    if (rfq.material.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this RFQ'
      });
    }

    if (rfq.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `RFQ is already ${rfq.status}`
      });
    }

    rfq.sellerResponse = {
      quotedPrice,
      message: message || null,
      respondedAt: new Date()
    };
    rfq.status = 'responded';
    await rfq.save();

    await rfq.populate('buyer', 'name email');
    await rfq.populate('material', 'name category');

    // Emit real-time update to buyer
    emitRFQUpdate(req.user._id.toString(), rfq.buyer._id.toString(), rfq);

    res.json({
      success: true,
      message: 'RFQ response submitted successfully',
      data: rfq
    });
  } catch (error) {
    console.error('Respond to RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to RFQ',
      error: error.message
    });
  }
};

// @desc    Buyer accept RFQ
// @route   PUT /api/rfqs/:id/accept
const acceptRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('material');

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check if user is the buyer
    if (rfq.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this RFQ'
      });
    }

    if (rfq.status !== 'responded') {
      return res.status(400).json({
        success: false,
        message: 'RFQ must be responded to before acceptance'
      });
    }

    rfq.status = 'accepted';
    rfq.acceptedAt = new Date();
    await rfq.save();

    // Update material status
    const material = await Material.findById(rfq.material._id);
    if (material) {
      material.status = 'sold';
      await material.save();
    }

    await rfq.populate('material', 'name category');
    await rfq.populate('buyer', 'name email');

    res.json({
      success: true,
      message: 'RFQ accepted successfully',
      data: rfq
    });
  } catch (error) {
    console.error('Accept RFQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept RFQ',
      error: error.message
    });
  }
};

// @desc    Buyer reject RFQ
// @route   PUT /api/rfqs/:id/reject
const rejectRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check if user is the buyer
    if (rfq.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this RFQ'
      });
    }

    if (rfq.status !== 'responded') {
      return res.status(400).json({
        success: false,
        message: 'RFQ must be responded to before rejection'
      });
    }

    rfq.status = 'rejected';
    rfq.rejectedAt = new Date();
    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ rejected',
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

module.exports = {
  createRFQ,
  getRFQsByMaterial,
  getMyRFQs,
  getSellerRFQs,
  respondToRFQ,
  acceptRFQ,
  rejectRFQ
};

