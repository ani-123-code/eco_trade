const BusinessRequest = require('../models/BusinessRequest');
const EmailService = require('../emailService/EmailService');

exports.createBusinessRequest = async (req, res) => {
  try {
    const businessRequest = new BusinessRequest(req.body);
    await businessRequest.save();

    // Send confirmation email to business
    try {
      await EmailService.sendBusinessInquiryConfirmation(
        businessRequest.email,
        businessRequest.contactPersonName,
        businessRequest.companyName
      );

      // Send notification to admin
      await EmailService.sendBusinessInquiryNotificationToAdmin(businessRequest);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Business inquiry submitted successfully',
      data: businessRequest
    });
  } catch (error) {
    console.error('Error creating business request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit business inquiry',
      error: error.message
    });
  }
};

exports.getAllBusinessRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      businessType,
      urgency,
      search
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (businessType) query.businessType = businessType;
    if (urgency) query.urgency = urgency;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPersonName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      BusinessRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      BusinessRequest.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching business requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business requests',
      error: error.message
    });
  }
};

exports.getBusinessRequestById = async (req, res) => {
  try {
    const businessRequest = await BusinessRequest.findById(req.params.id);

    if (!businessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Business request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: businessRequest
    });
  } catch (error) {
    console.error('Error fetching business request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business request',
      error: error.message
    });
  }
};

exports.updateBusinessRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes, quotedAmount, assignedTo, followUpDate } = req.body;

    const businessRequest = await BusinessRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        quotedAmount,
        assignedTo,
        followUpDate
      },
      { new: true, runValidators: true }
    );

    if (!businessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Business request not found'
      });
    }

    // Send status update email to business
    try {
      if (status === 'quote-sent' && quotedAmount) {
        await EmailService.sendBusinessQuote(
          businessRequest.email,
          businessRequest.contactPersonName,
          businessRequest.companyName,
          quotedAmount
        );
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Business request updated successfully',
      data: businessRequest
    });
  } catch (error) {
    console.error('Error updating business request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business request',
      error: error.message
    });
  }
};

exports.deleteBusinessRequest = async (req, res) => {
  try {
    const businessRequest = await BusinessRequest.findByIdAndDelete(req.params.id);

    if (!businessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Business request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Business request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete business request',
      error: error.message
    });
  }
};

exports.getBusinessRequestStats = async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      contactedRequests,
      approvedRequests,
      completedRequests,
      urgentRequests,
      recentRequests
    ] = await Promise.all([
      BusinessRequest.countDocuments(),
      BusinessRequest.countDocuments({ status: 'pending' }),
      BusinessRequest.countDocuments({ status: 'contacted' }),
      BusinessRequest.countDocuments({ status: 'approved' }),
      BusinessRequest.countDocuments({ status: 'completed' }),
      BusinessRequest.countDocuments({ urgency: { $in: ['urgent', 'immediate'] } }),
      BusinessRequest.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalRequests,
        pending: pendingRequests,
        contacted: contactedRequests,
        approved: approvedRequests,
        completed: completedRequests,
        urgent: urgentRequests,
        recent: recentRequests
      }
    });
  } catch (error) {
    console.error('Error fetching business request stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
