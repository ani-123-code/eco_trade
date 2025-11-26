import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, clearSuccessMessage } from '../../store/slices/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);
  
  const from = location.state?.from?.pathname || '/';
  const locationMessage = location.state?.message;

  const hasShownLocationMessage = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());
    hasShownLocationMessage.current = false;
  }, [dispatch]);

  useEffect(() => {
    if (locationMessage && !hasShownLocationMessage.current) {
      hasShownLocationMessage.current = true;
      showError(locationMessage);
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [locationMessage, navigate, location.pathname, showError]);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeFlag = localStorage.getItem('rememberMe');
    
    if (rememberedEmail && rememberMeFlag === 'true') {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
   e.preventDefault();
    if (isSubmitting || isLoading) return;
    setIsSubmitting(true);
    
    dispatch(clearError());
    dispatch(clearSuccessMessage());

    if (!formData.email || !formData.password) {
      showError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedEmail');
        }

        showSuccess('Login successful! Welcome back.'); 
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        showError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      showError('An unexpected error occurred. Please try again.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex flex-col justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your Reeown account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  leftIcon={<Mail className="h-5 w-5" />}
                  placeholder="you@example.com"
                  fullWidth
                  required
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                  placeholder="Enter your password"
                  fullWidth
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-green-700 focus:ring-green-600 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-green-700 hover:text-emerald-600"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<LogIn className="h-5 w-5" />}
                isLoading={isLoading}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to Reeown?</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{' '}
              <Link
                to="/register"
                className="font-medium text-green-700 hover:text-emerald-600"
              >
                Create an account
              </Link>
            </div>

           

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Having trouble signing in?{' '}
                <Link
                  to="/verify-email"
                  className="text-green-700 hover:text-emerald-600"
                >
                  Verify your email
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;