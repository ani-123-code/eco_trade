const OTP = require('../models/OTP');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPViaSMS = async (phoneNumber, otp) => {
  console.log(`Sending OTP ${otp} to ${phoneNumber}`);

  if (process.env.NODE_ENV === 'development') {
    console.log(`\n========================================`);
    console.log(`📱 DEVELOPMENT MODE - OTP for ${phoneNumber}: ${otp}`);
    console.log(`========================================\n`);
    return { success: true };
  }

  return { success: true };
};

exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Please provide a valid 10-digit Indian mobile number'
      });
    }

    const recentOTP = await OTP.findOne({
      phoneNumber,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOTP) {
      return res.status(429).json({
        message: 'Please wait 60 seconds before requesting a new OTP'
      });
    }

    const otp = generateOTP();

    await OTP.create({
      phoneNumber,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPViaSMS(phoneNumber, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyOTPAndLogin = async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        message: 'Phone number and OTP are required'
      });
    }

    const otpRecord = await OTP.findOne({
      phoneNumber,
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: 'Invalid or expired OTP'
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        message: 'Too many failed attempts. Please request a new OTP'
      });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        message: 'Invalid OTP',
        attemptsRemaining: 5 - otpRecord.attempts
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      if (!name) {
        return res.status(400).json({
          message: 'Name is required for new user registration',
          requiresRegistration: true
        });
      }

      user = await User.create({
        name,
        phoneNumber,
        isPhoneVerified: true,
        email: `${phoneNumber}@ecotrade.temp`,
        password: crypto.randomBytes(32).toString('hex')
      });
    } else {
      user.isPhoneVerified = true;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Please provide a valid 10-digit Indian mobile number'
      });
    }

    const recentOTP = await OTP.findOne({
      phoneNumber,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOTP) {
      return res.status(429).json({
        message: 'Please wait 60 seconds before requesting a new OTP'
      });
    }

    const otp = generateOTP();

    await OTP.create({
      phoneNumber,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPViaSMS(phoneNumber, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
