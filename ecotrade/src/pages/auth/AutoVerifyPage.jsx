import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, clearError, clearSuccessMessage } from '../../features/auth/authSlice';
import { useToast } from '../../contexts/ToastContext';

const AutoVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, successMessage } = useSelector((state) => state.auth);
  const { showSuccess, showError } = useToast();

  const [status, setStatus] = useState('verifying');
  const hasVerified = useRef(false); 
  const hasShownToast = useRef(false);
  const navigationTimer = useRef(null);

  // Clear any existing timers on unmount
  useEffect(() => {
    return () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasVerified.current) return;

    // Clear Redux state first
    dispatch(clearError());
    dispatch(clearSuccessMessage());
    
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token) {
      hasVerified.current = true;
      handleAutoVerification(token);
    } else {
      setStatus('error');
      hasVerified.current = true;
      if (!hasShownToast.current) {
        showError('Invalid verification link. Please try again.');
        hasShownToast.current = true;
      }
    }
  }, [location.search, dispatch, showError]);

  const handleAutoVerification = async (token) => {
    try {
      const result = await dispatch(verifyEmail(token));

      if (verifyEmail.fulfilled.match(result)) {
        setStatus('success');

        if (!hasShownToast.current) {
          showSuccess('Email verified successfully! You can now log in.');
          hasShownToast.current = true;
        }
        

        navigationTimer.current = setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: null 
          });
        }, 3000);
      } else {
        setStatus('error');
        if (!hasShownToast.current) {
          const errorMsg = result.payload?.message || 'Email verification failed. Please try again.';
          showError(errorMsg);
          hasShownToast.current = true;
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      if (!hasShownToast.current) {
        showError('An unexpected error occurred during verification.');
        hasShownToast.current = true;
      }
    }
  };

  const handleTryAgain = () => {
    navigate('/verify-email', { replace: true });
  };

  const handleGoToLogin = () => {
    navigate('/login', { 
      replace: true,
      state: null 
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex flex-col justify-center bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 text-center">
            {status === 'verifying' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Verifying Your Email</h1>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-green-600">Email Verified!</h1>
                <p className="text-gray-600 mb-4">
                  Your email has been successfully verified. You can now log in to your account.
                </p>
                <p className="text-sm text-green-600 mb-4">
                  Redirecting you to login page in a few seconds...
                </p>
                <button
                  onClick={handleGoToLogin}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Go to Login Now
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h1>
                <p className="text-gray-600 mb-4">
                  The verification link is invalid or has expired.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleTryAgain}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Go to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoVerifyPage;