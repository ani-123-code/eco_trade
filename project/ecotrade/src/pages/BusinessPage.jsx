import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CircleCheck as CheckCircle, ArrowLeft, ShoppingCart, Package, TrendingUp, Award, Shield, Clock, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import serviceRequestAPI from '../api/serviceRequestAPI';
import { useToast } from '../contexts/ToastContext';

const BusinessPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPersonName: '',
    designation: '',
    email: '',
    phone: '',
    companyWebsite: '',
    gstNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',

    // Purchase Requirements
    productCategories: [],
    quantityRange: '',
    budgetRange: '',
    purchaseFrequency: '',
    preferredBrands: '',
    specificRequirements: '',

    // Timeline & Delivery
    urgency: 'normal',
    preferredDeliveryDate: '',
    deliveryLocation: '',

    // Business Details
    businessType: '',
    yearsInBusiness: '',
    annualVolume: '',
    paymentTerms: ''
  });

  const [selectedCategories, setSelectedCategories] = useState([]);

  const productCategoryOptions = [
    { value: 'smartphones', label: '📱 Smartphones', icon: '📱' },
    { value: 'laptops', label: '💻 Laptops & Notebooks', icon: '💻' },
    { value: 'tablets', label: '📱 Tablets', icon: '📱' },
    { value: 'desktops', label: '🖥️ Desktop Computers', icon: '🖥️' },
    { value: 'monitors', label: '🖥️ Monitors & Displays', icon: '🖥️' },
    { value: 'smartwatches', label: '⌚ Smartwatches', icon: '⌚' },
    { value: 'cameras', label: '📷 Cameras & Equipment', icon: '📷' },
    { value: 'gaming', label: '🎮 Gaming Consoles', icon: '🎮' },
    { value: 'networking', label: '🌐 Networking Equipment', icon: '🌐' },
    { value: 'audio', label: '🎧 Audio Equipment', icon: '🎧' },
    { value: 'accessories', label: '⚡ Accessories & Peripherals', icon: '⚡' },
    { value: 'appliances', label: '🏠 Home Appliances', icon: '🏠' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        productCategories: selectedCategories
      };

      const result = await serviceRequestAPI.business.create(submitData);

      if (result.success) {
        showToast('Business inquiry submitted successfully! Our team will contact you within 24 hours.', 'success');
        setSubmitted(true);
        setTimeout(() => {
          navigate('/');
        }, 4000);
      } else {
        throw new Error(result.message || 'Failed to submit business inquiry');
      }
    } catch (error) {
      console.error('Error submitting business inquiry:', error);
      showToast(error.response?.data?.message || 'Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center border border-blue-100">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce">
            <CheckCircle className="h-14 w-14 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Thank You for Your Interest!</h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Your bulk purchase inquiry has been received. Our dedicated B2B team will review your requirements and contact you within 24 hours with a customized quote and solution.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-blue-900 font-semibold mb-3">What happens next?</p>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Dedicated account manager assigned to your inquiry</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Customized quote based on your specific requirements</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Flexible payment terms and volume discounts available</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 text-sm font-medium">
              📧 Confirmation sent to {formData.email}
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-8 shadow-2xl">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Business & Bulk Purchase</h1>
            <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Wholesale refurbished electronics for businesses, retailers, and tech companies.
              Get competitive pricing on bulk orders with flexible payment terms.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Volume Discounts</h3>
                <p className="text-blue-100 text-sm">Up to 40% off on bulk orders</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Quality Assured</h3>
                <p className="text-blue-100 text-sm">6-month warranty on all products</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
                <p className="text-blue-100 text-sm">Quick turnaround on orders</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Dedicated Support</h3>
                <p className="text-blue-100 text-sm">Personal account manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-10 py-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Bulk Purchase Inquiry Form</h2>
                  <p className="text-gray-600 text-lg">Tell us about your requirements and we'll create a custom solution</p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 mr-2" />
                  <span className="font-medium">Back</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
              {/* Company Information */}
              <div className="mb-12">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Company Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-14">
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
                    label="Contact Person Name"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <Input
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Procurement Manager"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="business@company.com"
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
                  <Input
                    label="Company Website"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="www.yourcompany.com"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <Input
                    label="GST Number"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="GST Number (if applicable)"
                    className="transition-all duration-200 focus:scale-105"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select business type</option>
                      <option value="retailer">🏪 Retailer</option>
                      <option value="distributor">📦 Distributor/Wholesaler</option>
                      <option value="tech-company">💼 Tech Company</option>
                      <option value="startup">🚀 Startup</option>
                      <option value="educational">🎓 Educational Institution</option>
                      <option value="corporate">🏢 Corporate</option>
                      <option value="government">🏛️ Government/Public Sector</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>
                  <Input
                    label="Years in Business"
                    name="yearsInBusiness"
                    type="number"
                    value={formData.yearsInBusiness}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    min="0"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-12">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Delivery Address</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14">
                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                      placeholder="Building Name, Street, Area"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Address Line 2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Landmark (Optional)"
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

              {/* Purchase Requirements */}
              <div className="mb-12">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Purchase Requirements</h3>
                </div>
                <div className="pl-14">
                  {/* Product Categories */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Product Categories Interested In <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs ml-2">(Select multiple)</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {productCategoryOptions.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => toggleCategory(category.value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-105 ${
                            selectedCategories.includes(category.value)
                              ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{category.icon}</div>
                          <div className="text-sm font-medium">{category.label.replace(category.icon + ' ', '')}</div>
                        </button>
                      ))}
                    </div>
                    {selectedCategories.length === 0 && (
                      <p className="text-red-500 text-sm mt-2">Please select at least one category</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Range <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="quantityRange"
                        value={formData.quantityRange}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="">Select quantity range</option>
                        <option value="10-50">10-50 units</option>
                        <option value="51-100">51-100 units</option>
                        <option value="101-500">101-500 units</option>
                        <option value="500+">500+ units</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="">Select budget range</option>
                        <option value="under-1L">Under ₹1 Lakh</option>
                        <option value="1L-5L">₹1 - 5 Lakhs</option>
                        <option value="5L-10L">₹5 - 10 Lakhs</option>
                        <option value="10L-25L">₹10 - 25 Lakhs</option>
                        <option value="25L+">₹25 Lakhs+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Frequency <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="purchaseFrequency"
                        value={formData.purchaseFrequency}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="">Select frequency</option>
                        <option value="one-time">One-time Purchase</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="ongoing">Ongoing/As Needed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms Preference
                      </label>
                      <select
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      >
                        <option value="">Select payment terms</option>
                        <option value="immediate">Immediate Payment</option>
                        <option value="net-30">Net 30 Days</option>
                        <option value="net-60">Net 60 Days</option>
                        <option value="custom">Custom Terms</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Brands
                    </label>
                    <Input
                      name="preferredBrands"
                      value={formData.preferredBrands}
                      onChange={handleChange}
                      placeholder="e.g., Apple, Samsung, Dell, HP (separate with commas)"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specific Requirements & Additional Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="specificRequirements"
                      value={formData.specificRequirements}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Please provide detailed information about:&#10;• Specific models or configurations you need&#10;• Condition preferences (Excellent, Good, etc.)&#10;• Any technical specifications required&#10;• Warranty or support needs&#10;• Timeline for delivery&#10;• Any other special requirements or questions"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-12">
                <div className="flex items-center mb-8">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    4
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Timeline & Urgency</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      <option value="normal">🕐 Normal (2-4 weeks)</option>
                      <option value="urgent">⚡ Urgent (1 week)</option>
                      <option value="immediate">🚨 Immediate (ASAP)</option>
                    </select>
                  </div>
                  <Input
                    label="Preferred Delivery Date"
                    name="preferredDeliveryDate"
                    type="date"
                    value={formData.preferredDeliveryDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-10">
                <h4 className="font-bold text-blue-900 mb-6 flex items-center text-xl">
                  <Award className="h-6 w-6 mr-3" />
                  Why Choose Us for Bulk Orders?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">✓</div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Volume Discounts</p>
                      <p className="text-blue-700 text-sm">Up to 40% discount on bulk purchases. The more you buy, the more you save.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">✓</div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Quality Assurance</p>
                      <p className="text-blue-700 text-sm">All products tested and certified. 6-month warranty on every purchase.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">✓</div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Flexible Payment</p>
                      <p className="text-blue-700 text-sm">Multiple payment options. Credit terms available for established businesses.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">✓</div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Dedicated Support</p>
                      <p className="text-blue-700 text-sm">Personal account manager for seamless ordering and after-sales support.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">✓</div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Fast Logistics</p>
                      <p className="text-blue-700 text-sm">Pan-India delivery with tracking. Bulk orders delivered within 2-4 weeks.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">✓</div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Custom Solutions</p>
                      <p className="text-blue-700 text-sm">Tailored packages to meet your specific business needs and requirements.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-2 border-gray-300 hover:border-blue-500 transition-all duration-200 text-lg py-4"
                  leftIcon={<ArrowLeft className="h-6 w-6" />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || selectedCategories.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  leftIcon={loading ? null : <ShoppingCart className="h-6 w-6" />}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Submitting Inquiry...
                    </div>
                  ) : (
                    'Submit Bulk Purchase Inquiry'
                  )}
                </Button>
              </div>

              {selectedCategories.length === 0 && (
                <p className="text-red-500 text-center mt-4 font-medium">Please select at least one product category to continue</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;
