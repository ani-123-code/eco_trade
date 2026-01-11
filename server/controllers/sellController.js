const SellRequest = require('../models/SellRequest');

const createSellRequest = async (req, res) => {
  try {
    const sellRequest = new SellRequest(req.body);
    await sellRequest.save();

    // Send confirmation email (if email service is configured)
    try {
      const emailService = require('../emailService/EmailService');
      await emailService.sendEmail({
        to: sellRequest.email,
        subject: 'Sell Request Received - Reeown',
        html: `
          <h2>Thank You for Your Sell Request!</h2>
          <p>Dear ${sellRequest.name},</p>
          <p>We have received your request to sell your ${sellRequest.brand} ${sellRequest.model}.</p>
          <p><strong>Request Details:</strong></p>
          <ul>
            <li>Device: ${sellRequest.deviceType}</li>
            <li>Brand: ${sellRequest.brand}</li>
            <li>Model: ${sellRequest.model}</li>
            <li>Condition: ${sellRequest.condition}</li>
          </ul>
          <p>Our team will review your device details and contact you within 24-48 hours with a quotation.</p>
          <p>Best regards,<br>Reeowns Team</p>
        `
      });
    } catch (emailError) {
      console.log('Email service not configured or failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Sell request submitted successfully',
      data: sellRequest
    });
  } catch (error) {
    console.error('Error creating sell request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit sell request',
      error: error.message
    });
  }
};

const getAllSellRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const sellRequests = await SellRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await SellRequest.countDocuments(query);

    res.json({
      success: true,
      data: sellRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sell requests',
      error: error.message
    });
  }
};

const getSellRequestById = async (req, res) => {
  try {
    const sellRequest = await SellRequest.findById(req.params.id);
    if (!sellRequest) {
      return res.status(404).json({
        success: false,
        message: 'Sell request not found'
      });
    }
    res.json({
      success: true,
      data: sellRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sell request',
      error: error.message
    });
  }
};

const updateSellRequest = async (req, res) => {
  try {
    const sellRequest = await SellRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sellRequest) {
      return res.status(404).json({
        success: false,
        message: 'Sell request not found'
      });
    }

    res.json({
      success: true,
      message: 'Sell request updated successfully',
      data: sellRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update sell request',
      error: error.message
    });
  }
};

const deleteSellRequest = async (req, res) => {
  try {
    const sellRequest = await SellRequest.findByIdAndDelete(req.params.id);
    if (!sellRequest) {
      return res.status(404).json({
        success: false,
        message: 'Sell request not found'
      });
    }
    res.json({
      success: true,
      message: 'Sell request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete sell request',
      error: error.message
    });
  }
};

module.exports = {
  createSellRequest,
  getAllSellRequests,
  getSellRequestById,
  updateSellRequest,
  deleteSellRequest
};