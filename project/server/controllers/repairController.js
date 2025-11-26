const RepairRequest = require('../models/RepairRequest');

const createRepairRequest = async (req, res) => {
  try {
    const repairRequest = new RepairRequest(req.body);
    await repairRequest.save();

    // Send confirmation email (if email service is configured)
    try {
      const emailService = require('../emailService/EmailService');
      await emailService.sendEmail({
        to: repairRequest.email,
        subject: 'Repair Request Received - Reeown',
        html: `
          <h2>Thank You for Your Repair Request!</h2>
          <p>Dear ${repairRequest.name},</p>
          <p>We have received your repair request for your ${repairRequest.brand} ${repairRequest.model}.</p>
          <p><strong>Request Details:</strong></p>
          <ul>
            <li>Device: ${repairRequest.deviceType}</li>
            <li>Brand: ${repairRequest.brand}</li>
            <li>Model: ${repairRequest.model}</li>
            <li>Urgency: ${repairRequest.urgency}</li>
          </ul>
          <p><strong>Problem Description:</strong></p>
          <p>${repairRequest.problemDescription}</p>
          <p>Our repair team will contact you within 24 hours to schedule a pickup or service appointment.</p>
          <p>Best regards,<br>Reeown Team</p>
        `
      });
    } catch (emailError) {
      console.log('Email service not configured or failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Repair request submitted successfully',
      data: repairRequest
    });
  } catch (error) {
    console.error('Error creating repair request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit repair request',
      error: error.message
    });
  }
};

const getAllRepairRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const repairRequests = await RepairRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await RepairRequest.countDocuments(query);

    res.json({
      success: true,
      data: repairRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repair requests',
      error: error.message
    });
  }
};

const getRepairRequestById = async (req, res) => {
  try {
    const repairRequest = await RepairRequest.findById(req.params.id);
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }
    res.json({
      success: true,
      data: repairRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repair request',
      error: error.message
    });
  }
};

const updateRepairRequest = async (req, res) => {
  try {
    const repairRequest = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }

    res.json({
      success: true,
      message: 'Repair request updated successfully',
      data: repairRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update repair request',
      error: error.message
    });
  }
};

const deleteRepairRequest = async (req, res) => {
  try {
    const repairRequest = await RepairRequest.findByIdAndDelete(req.params.id);
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }
    res.json({
      success: true,
      message: 'Repair request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete repair request',
      error: error.message
    });
  }
};

module.exports = {
  createRepairRequest,
  getAllRepairRequests,
  getRepairRequestById,
  updateRepairRequest,
  deleteRepairRequest
};