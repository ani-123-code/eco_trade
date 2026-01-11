import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, CircleCheck as CheckCircle, User, Building2, ArrowLeft, Leaf, Globe, Award, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import serviceRequestAPI from '../api/serviceRequestAPI';
import { useToast } from '../contexts/ToastContext';

const RecyclePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    ewasteItems: '',
    pickupDate: '',
    companyName: '',
    gstNumber: '',
    estimatedQuantity: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await serviceRequestAPI.recycle.create({ ...formData, userType });

      if (result.success) {
        showToast('Recycle request submitted successfully! We will schedule a pickup soon.', 'success');
        setSubmitted(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to submit recycle request');
      }
    } catch (error) {
      console.error('Error submitting recycle request:', error);
      showToast(error.response?.data?.message || 'Failed to submit request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-purple-100">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recycle Request Submitted!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for choosing to recycle responsibly. Our eco-friendly team will contact you to schedule a convenient pickup time.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-purple-800 text-sm font-medium">
              🌱 Environmental impact confirmation sent to {formData.email}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Recycle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Responsible E-Waste Recycling</h1>
              <p className="text-xl text-purple-100 mb-8">
                Join us in creating a sustainable future. Dispose your electronic waste responsibly.
              </p>
              
              {/* Environmental Impact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Eco-Friendly</h3>
                  <p className="text-purple-100 text-sm">Reduce environmental impact</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Secure Disposal</h3>
                  <p className="text-purple-100 text-sm">Data destruction guaranteed</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Certified Process</h3>
                  <p className="text-purple-100 text-sm">Government approved recycling</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Type Selection */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Recycling Category</h2>
              <p className="text-gray-600 text-lg">Select the option that best describes your recycling needs</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Individual Option */}
              <button
                onClick={() => setUserType('individual')}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 text-left shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-gray-200 hover:border-green-500"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -mr-16 -mt-16 transition-all duration-300 group-hover:scale-110"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 inline-block rounded-full bg-green-100 p-4 group-hover:bg-green-200 transition-colors">
                    <User className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">Individual Recycling</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Perfect for personal e-waste disposal. Schedule a convenient pickup for your old electronics from home.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Free doorstep pickup service</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Certified data destruction</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Environmental contribution certificate</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>No minimum quantity required</span>
                    </div>
                  </div>

                  <div className="mt-6 inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                    <span>Get Started</span>
                    <ArrowLeft className="ml-2 h-5 w-5 rotate-180 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>

              {/* Corporate Option */}
              <button
                onClick={() => setUserType('corporate')}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 text-left shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-gray-200 hover:border-blue-500"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -mr-16 -mt-16 transition-all duration-300 group-hover:scale-110"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 inline-block rounded-full bg-blue-100 p-4 group-hover:bg-blue-200 transition-colors">
                    <Building2 className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">Corporate Recycling</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Comprehensive e-waste management for businesses and organizations. Bulk disposal with compliance documentation.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Bulk pickup and processing</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Government compliance certificates</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Secure data destruction services</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>CSR reporting and documentation</span>
                    </div>
                  </div>

                  <div className="mt-6 inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                    <span>Get Started</span>
                    <ArrowLeft className="ml-2 h-5 w-5 rotate-180 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            </div>

            {/* Environmental Impact Section */}
            <div className="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
              <Globe className="h-16 w-16 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-4">Make a Difference Today</h3>
              <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                Every device you recycle helps reduce electronic waste and contributes to a cleaner, more sustainable planet for future generations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-1">50+</div>
                  <div className="text-green-100 text-sm">Tons E-waste Recycled</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">10K+</div>
                  <div className="text-green-100 text-sm">Devices Processed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-green-100 text-sm">Secure Data Destruction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <Recycle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {userType === 'individual' ? 'Individual' : 'Corporate'} E-Waste Recycling
            </h1>
            <p className="text-lg text-purple-100 mb-4">Schedule a pickup for responsible e-waste disposal</p>
            <button
              onClick={() => setUserType('')}
              className="inline-flex items-center text-sm text-purple-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Change category
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userType === 'corporate' ? 'Corporate' : 'Individual'} Recycling Request
                  </h2>
                  <p className="text-gray-600 mt-1">Help us schedule the perfect pickup for your e-waste</p>
                </div>
                <button
                  onClick={() => setUserType('')}
                  className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* Organization/Contact Information */}
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {userType === 'corporate' ? 'Organization' : 'Contact'} Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                  {userType === 'corporate' && (
                    <>
                      <Input
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        placeholder="Enter company name"
                        className="transition-all duration-200 focus:scale-105"
                      />
                      <Input
                        label="GST Number"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="Optional - for compliance documentation"
                        className="transition-all duration-200 focus:scale-105"
                      />
                    </>
                  )}
                  <Input
                    label={userType === 'corporate' ? 'Contact Person Name' : 'Full Name'}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  {userType === 'corporate' && (
                    <Input
                      label="Estimated Quantity"
                      name="estimatedQuantity"
                      value={formData.estimatedQuantity}
                      onChange={handleChange}
                      placeholder="e.g., 50 devices, 100 kg, 20 computers"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  )}
                </div>
              </div>

              {/* Pickup Details Section */}
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pickup Address</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                      placeholder="House/Flat No., Building Name, Street"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Area, Landmark (Optional)"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Enter city"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="Enter state"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <Input
                    label="Pincode"
                    name="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder="6-digit pincode"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              </div>

              {/* E-Waste Items Section */}
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">E-Waste Items & Pickup Details</h3>
                </div>
                <div className="space-y-6 pl-11">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Waste Items Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="ewasteItems"
                      value={formData.ewasteItems}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                      placeholder={userType === 'corporate' 
                        ? "List all electronic items for disposal (e.g., 50 desktop computers, 20 monitors, 30 keyboards, 10 printers, networking equipment...)"
                        : "List the items you want to dispose (e.g., 2 old laptops, 3 mobile phones, 1 printer, old chargers, cables...)"
                      }
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Preferred Pickup Date"
                      name="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="transition-all duration-200 focus:scale-105"
                    />
                    <div className="flex items-center">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 w-full">
                        <p className="text-purple-800 text-sm font-medium">
                          📅 Pickup available Monday to Saturday, 9 AM to 6 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                <h4 className="font-bold text-green-900 mb-4 flex items-center">
                  <Leaf className="h-5 w-5 mr-2" />
                  Environmental Impact of Your Action
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Reduce Carbon Footprint</p>
                      <p className="text-green-700">Proper recycling reduces greenhouse gas emissions</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Prevent Soil Contamination</p>
                      <p className="text-green-700">Safe disposal prevents toxic materials from entering soil</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Recycle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Resource Recovery</p>
                      <p className="text-green-700">Valuable materials are recovered and reused</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Compliance Assured</p>
                      <p className="text-green-700">Meet environmental regulations and standards</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserType('')}
                  className="flex-1 border-2 border-gray-300 hover:border-purple-500 transition-all duration-200"
                  leftIcon={<ArrowLeft className="h-5 w-5" />}
                >
                  Back to Categories
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  leftIcon={loading ? null : <Recycle className="h-5 w-5" />}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Scheduling Pickup...
                    </div>
                  ) : (
                    'Schedule Pickup'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclePage;