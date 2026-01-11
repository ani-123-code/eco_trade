import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, CircleCheck as CheckCircle, ArrowLeft, Shield, Clock, Award, Settings } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import serviceRequestAPI from '../api/serviceRequestAPI';
import { useToast } from '../contexts/ToastContext';

const RepairPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    deviceType: '',
    brand: '',
    model: '',
    problemDescription: '',
    urgency: 'normal',
    preferredDate: '',
    warrantyStatus: ''
  });
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 3;
  const stepTitles = [
    'Contact Information',
    'Device Details',
    'Repair Details'
  ];

  const stepRequirements = {
    1: ['name', 'email', 'phone', 'addressLine1', 'city', 'state', 'pincode'],
    2: ['deviceType', 'brand', 'model'],
    3: ['problemDescription', 'urgency']
  };

  const progressPercent = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 100;

  const validateStep = (step) => {
    const required = stepRequirements[step] || [];
    const missing = required.filter(field => !String(formData[field] || '').trim());

    if (missing.length) {
      showToast('Please complete all required fields in this step before continuing.', 'error');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
              <Input
                label="Full Name"
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
        );
      case 2:
        return (
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900">Device Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                >
                  <option value="">Select device type</option>
                  <option value="smartphone">📱 Smartphone</option>
                  <option value="laptop">💻 Laptop</option>
                  <option value="tablet">📱 Tablet</option>
                  <option value="smartwatch">⌚ Smartwatch</option>
                  <option value="camera">📷 Camera</option>
                  <option value="gaming-console">🎮 Gaming Console</option>
                  <option value="other">📦 Other Electronics</option>
                </select>
              </div>
              <Input
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="e.g., Apple, Samsung, Dell"
                className="transition-all duration-200 focus:scale-105"
              />
              <Input
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="e.g., iPhone 13, Galaxy S22"
                className="transition-all duration-200 focus:scale-105"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Status
                </label>
                <select
                  name="warrantyStatus"
                  value={formData.warrantyStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                >
                  <option value="">Select warranty status</option>
                  <option value="under-warranty">✅ Under Warranty</option>
                  <option value="expired">⏰ Warranty Expired</option>
                  <option value="no-warranty">❌ No Warranty</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900">Repair Details</h3>
              </div>
              <div className="space-y-6 pl-11">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                    placeholder="Please describe the problem in detail. Include when it started, what triggers it, any error messages, etc..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Urgency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                    >
                      <option value="normal">🕐 Normal (3-5 business days)</option>
                      <option value="urgent">⚡ Urgent (1-2 business days)</option>
                      <option value="emergency">🚨 Emergency (Same day service)</option>
                    </select>
                  </div>
                  <Input
                    label="Preferred Service Date"
                    name="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-8">
              <h4 className="font-bold text-orange-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Our Repair Process
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-2">1</div>
                  <p className="font-semibold text-orange-900">Diagnosis</p>
                  <p className="text-orange-700">Free device diagnosis and quote</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-2">2</div>
                  <p className="font-semibold text-orange-900">Approval</p>
                  <p className="text-orange-700">Get approval before any work begins</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-2">3</div>
                  <p className="font-semibold text-orange-900">Repair</p>
                  <p className="text-orange-700">Expert repair with genuine parts</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-2">4</div>
                  <p className="font-semibold text-orange-900">Delivery</p>
                  <p className="text-orange-700">Safe delivery with warranty</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-orange-50 border border-gray-200 rounded-xl p-6 mb-8">
              <h4 className="font-bold text-gray-900 mb-4">Why Choose Our Repair Service?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">3-Month Warranty</p>
                    <p className="text-gray-600 text-sm">All repairs covered by comprehensive warranty</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Genuine Parts</p>
                    <p className="text-gray-600 text-sm">Only authentic components used</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Quick Service</p>
                    <p className="text-gray-600 text-sm">Fast turnaround times</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Settings className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Expert Technicians</p>
                    <p className="text-gray-600 text-sm">Certified repair professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

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
      const result = await serviceRequestAPI.repair.create(formData);

      if (result.success) {
        showToast('Repair request submitted successfully! We will contact you soon.', 'success');
        setSubmitted(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to submit repair request');
      }
    } catch (error) {
      console.error('Error submitting repair request:', error);
      showToast(error.response?.data?.message || 'Failed to submit request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-orange-100">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Repair Request Submitted!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Our expert repair team will contact you within 24 hours to schedule a pickup or service appointment at your convenience.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-800 text-sm font-medium">
              🔧 Service confirmation sent to {formData.email}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Wrench className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Expert Repair Services</h1>
            <p className="text-xl text-orange-100 mb-8">
              Professional repair services for all your electronic devices. Quick, reliable, and affordable.
            </p>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Expert Technicians</h3>
                <p className="text-orange-100 text-sm">Certified professionals with years of experience</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Quality Guarantee</h3>
                <p className="text-orange-100 text-sm">3-month warranty on all repair work</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Quick Turnaround</h3>
                <p className="text-orange-100 text-sm">Most repairs completed within 24-48 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Repair Service Request</h2>
                  <p className="text-gray-600 mt-1">Tell us about your device and we'll fix it right</p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center text-gray-500 hover:text-orange-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="mb-10">
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {stepTitles.map((title, index) => {
                      const stepNumber = index + 1;
                      const isCompleted = stepNumber < currentStep;
                      const isActive = stepNumber === currentStep;

                      return (
                        <div key={title} className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              isActive
                                ? 'bg-orange-600 text-white shadow-lg'
                                : isCompleted
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Step {stepNumber}</p>
                            <p className="font-semibold text-gray-900">{title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {renderStepContent()}

              <div className="flex flex-col md:flex-row md:flex-wrap gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-2 border-gray-200 hover:border-orange-500 transition-all duration-200"
                  leftIcon={<ArrowLeft className="h-5 w-5" />}
                >
                  Cancel Request
                </Button>

                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 border-2 border-gray-200 hover:border-orange-500 transition-all duration-200"
                    leftIcon={<ArrowLeft className="h-5 w-5" />}
                  >
                    Previous Step
                  </Button>
                )}

                {currentStep < totalSteps && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    leftIcon={<Wrench className="h-5 w-5" />}
                  >
                    Next: {stepTitles[currentStep]}
                  </Button>
                )}

                {currentStep === totalSteps && (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    leftIcon={loading ? null : <Wrench className="h-5 w-5" />}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting Request...
                      </div>
                    ) : (
                      'Submit Repair Request'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairPage;