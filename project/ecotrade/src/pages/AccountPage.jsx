import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Settings, Package, LogOut, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { updateUserProfile, clearError, forgotPassword, clearSuccessMessage } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AccountPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user, isLoading, error, successMessage } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  // Handle success messages with toast
  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, showSuccess, dispatch]);

  // Handle error messages with toast
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      // Error is handled by the useEffect above
      console.error('Update failed:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || ''
    });
    setIsEditing(false);
    if (error) {
      dispatch(clearError());
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordReset = async () => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());
    
    try {
      const result = await dispatch(forgotPassword(user.email));
      
      if (forgotPassword.fulfilled.match(result)) {
        // showSuccess('Password reset email sent! Check your inbox for further instructions.');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your account.</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-600 to-[#324e76] flex items-center justify-center mb-3 shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="w-full">
                    <p className="font-semibold text-gray-900 text-lg mb-1 truncate" title={user?.name}>
                      {user?.name}
                    </p>
                    <p className="text-sm text-gray-500 break-all text-center px-2" title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === 'profile' 
                        ? 'text-green-700 bg-green-50 border-l-4 border-green-600 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === 'security' 
                        ? 'text-green-700 bg-green-50 border-l-4 border-green-600 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Lock className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">Security</span>
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                  >
                    <Package className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">Orders</span>
                  </button>
                  {/* <button
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                  >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">Settings</span>
                  </button> */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                    >
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                        <p className="text-sm text-gray-600 mt-1">Manage your personal information</p>
                      </div>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              disabled={isLoading}
                              className="flex-1 sm:flex-none"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              form="profile-form"
                              size="sm"
                              disabled={isLoading}
                              className="flex-1 sm:flex-none"
                            >
                              {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="flex-1 sm:flex-none"
                          >
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <form id="profile-form" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <Input
                          label="Full Name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                          required
                          className="text-sm"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          required
                          className="text-sm"
                        />
                        <Input
                          label="Phone Number"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                          className="text-sm"
                        />
                        <Input
                          label="Pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your pincode"
                          className="text-sm"
                        />
                        <div className="sm:col-span-2">
                          <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter your full address"
                            className="text-sm"
                          />
                        </div>
                        <Input
                          label="City"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your city"
                          className="text-sm"
                        />
                        <Input
                          label="State"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your state"
                          className="text-sm"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Security Settings</h2>
                    <p className="text-gray-600 mt-1">Manage your account security and password</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Password Section */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">Password</h3>
                            <p className="text-sm text-gray-600">
                              Change your password to keep your account secure
                            </p>
                          </div>
                          <Lock className="h-6 w-6 text-gray-400" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            variant="outline"
                            onClick={handlePasswordReset}
                            disabled={isLoading}
                            leftIcon={<Lock className="h-4 w-4" />}
                          >
                            {isLoading ? 'Sending...' : 'Reset Password'}
                          </Button>
                          <div className="text-sm text-gray-600 flex items-center">
                            <span>A reset link will be sent to {user?.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Account Information */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">Account Information</h3>
                            <p className="text-sm text-gray-600">
                              Your account details and current status
                            </p>
                          </div>
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <p className="text-gray-600">{user?.email}</p>
                          </div>
                          {/* <div>
                            <span className="font-medium text-gray-700">Account Created:</span>
                            <p className="text-gray-600">
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div> */}
                          {/* <div>
                            <span className="font-medium text-gray-700">Last Login:</span>
                            <p className="text-gray-600">
                              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                            </p>
                          </div> */}
                          <div>
                            <span className="font-medium text-gray-700">Account Status:</span>
                            <p className="text-green-600 font-medium">Active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;