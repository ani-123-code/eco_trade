import React from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const VerificationStatusBanner = ({ user, className = '' }) => {
  if (!user) return null;

  // If user is admin, don't show banner
  if (user.role === 'admin') return null;

  // If user is verified, show success message
  if (user.isVerified && user.verificationStatus === 'approved') {
    return (
      <div className={`bg-green-50 border-l-4 border-green-500 p-4 mb-6 ${className}`}>
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Account Verified
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Your {user.userType} account has been verified. You can now {user.userType === 'seller' ? 'list materials' : 'participate in auctions and request quotes'}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If verification is pending
  if (user.verificationStatus === 'pending' || !user.isVerified) {
    return (
      <div className={`bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 ${className}`}>
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Account Verification Pending
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your {user.userType} account is pending admin verification. 
              <strong> Admin will verify your account within 24 hours.</strong> 
              Once verified, you'll be able to {user.userType === 'seller' ? 'list materials for auction' : 'participate in auctions and request quotes'}.
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              You'll receive an email notification once your account is verified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If verification is rejected
  if (user.verificationStatus === 'rejected') {
    return (
      <div className={`bg-red-50 border-l-4 border-red-500 p-4 mb-6 ${className}`}>
        <div className="flex items-start">
          <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Account Verification Rejected
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Your account verification has been rejected. Please contact support for more information.
            </p>
            <Link to="/contact" className="text-xs text-red-600 underline mt-2 inline-block">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerificationStatusBanner;

