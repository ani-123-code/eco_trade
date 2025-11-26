const RecycleRequest = require('../models/RecycleRequest');

const createRecycleRequest = async (req, res) => {
  try {
    const recycleRequest = new RecycleRequest(req.body);
    await recycleRequest.save();

    const userTypeLabel = recycleRequest.userType === 'corporate' ? 'Corporate' : 'Individual';

    // Send confirmation email (if email service is configured)
    try {
      const emailService = require('../emailService/EmailService');
      await emailService.sendEmail({
        to: recycleRequest.email,
        subject: 'Recycle Request Received - Reeown',
        html: `
          <h2>Thank You for Choosing to Recycle!</h2>
          <p>Dear ${recycleRequest.name},</p>
          <p>We have received your ${userTypeLabel.toLowerCase()} recycling request.</p>
          <p><strong>Request Details:</strong></p>
          <ul>
            <li>Type: ${userTypeLabel}</li>
            ${recycleRequest.companyName ? `<li>Company: ${recycleRequest.companyName}</li>` : ''}
            <li>Pickup Address: ${recycleRequest.pickupAddress}</li>
            <li>Preferred Pickup Date: ${new Date(recycleRequest.pickupDate).toLocaleDateString()}</li>
            <li>Items: ${recycleRequest.ewasteItems}</li>
          </ul>
          <p>Our team will contact you to schedule a convenient pickup time.</p>
          <p>Thank you for contributing to a cleaner environment!</p>
          <p>Best regards,<br>Reeown Team</p>
        `
      });
    } catch (emailError) {
      console.log('Email service not configured or failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Recycle request submitted successfully',
      data: recycleRequest
    });
  } catch (error) {
    console.error('Error creating recycle request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit recycle request',
      error: error.message
    });
  }
};

const getAllRecycleRequests = async (req, res) => {
  try {
    const { status, userType, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (userType) query.userType = userType;

    const recycleRequests = await RecycleRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await RecycleRequest.countDocuments(query);

    res.json({
      success: true,
      data: recycleRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recycle requests',
      error: error.message
    });
  }
};

const getRecycleRequestById = async (req, res) => {
  try {
    const recycleRequest = await RecycleRequest.findById(req.params.id);
    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Recycle request not found'
      });
    }
    res.json({
      success: true,
      data: recycleRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recycle request',
      error: error.message
    });
  }
};

const updateRecycleRequest = async (req, res) => {
  try {
    const recycleRequest = await RecycleRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Recycle request not found'
      });
    }

    res.json({
      success: true,
      message: 'Recycle request updated successfully',
      data: recycleRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update recycle request',
      error: error.message
    });
  }
};

const deleteRecycleRequest = async (req, res) => {
  try {
    const recycleRequest = await RecycleRequest.findByIdAndDelete(req.params.id);
    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Recycle request not found'
      });
    }
    res.json({
      success: true,
      message: 'Recycle request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete recycle request',
      error: error.message
    });
  }
};

module.exports = {
  createRecycleRequest,
  getAllRecycleRequests,
  getRecycleRequestById,
  updateRecycleRequest,
  deleteRecycleRequest
};