import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, ArrowLeft, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { otpAPI } from '../../api/otpAPI';

const MobileLoginPage = () => {
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await otpAPI.sendOTP(phoneNumber);
      showToast(response.message || 'OTP sent successfully', 'success');

      if (process.env.NODE_ENV === 'development' && response.otp) {
        showToast(`Development OTP: ${response.otp}`, 'info');
      }

      setOtpSent(true);
      setStep('otp');
      setCountdown(60);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    if (requiresRegistration && !name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await otpAPI.verifyOTP(
        phoneNumber,
        otp,
        requiresRegistration ? name : null
      );

      if (response.requiresRegistration) {
        setRequiresRegistration(true);
        showToast('Please enter your name to complete registration', 'info');
        setLoading(false);
        return;
      }

      login(response.token, response.user);
      showToast('Login successful!', 'success');
      navigate('/');
    } catch (error) {
      if (error.response?.data?.requiresRegistration) {
        setRequiresRegistration(true);
        showToast('Please enter your name to complete registration', 'info');
      } else {
        showToast(error.response?.data?.message || 'Invalid OTP', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      const response = await otpAPI.resendOTP(phoneNumber);
      showToast(response.message || 'OTP resent successfully', 'success');

      if (process.env.NODE_ENV === 'development' && response.otp) {
        showToast(`Development OTP: ${response.otp}`, 'info');
      }

      setCountdown(60);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'phone' ? 'Mobile Login' : 'Verify OTP'}
            </h2>
            <p className="text-gray-600">
              {step === 'phone'
                ? 'Enter your mobile number to receive OTP'
                : `Enter the OTP sent to ${phoneNumber}`}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="mt-8 space-y-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    +91
                  </span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength="10"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Enter your 10-digit mobile number without country code
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || phoneNumber.length !== 10}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Login with email instead? </span>
                <Link to="/login" className="text-green-700 font-semibold hover:text-green-800">
                  Email Login
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
              {requiresRegistration && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength="6"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setRequiresRegistration(false);
                    setName('');
                  }}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Change Number
                </button>

                {countdown > 0 ? (
                  <span className="text-gray-500">Resend OTP in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-green-700 font-semibold hover:text-green-800"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading || otp.length !== 6 || (requiresRegistration && !name.trim())}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {loading ? 'Verifying...' : requiresRegistration ? 'Complete Registration' : 'Verify & Login'}
              </Button>

              <div className="flex items-center justify-center text-xs text-gray-500 bg-green-50 rounded-lg p-3">
                <Shield className="h-4 w-4 mr-2 text-green-600" />
                <span>Your data is secure and encrypted</span>
              </div>
            </form>
          )}
        </div>

        <div className="text-center text-sm text-gray-600">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-green-700 font-semibold hover:text-green-800">
            Register with Email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
