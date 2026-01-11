import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialAPI } from '../../api/materialAPI';
import { uploadAPI } from '../../api/uploadAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import VerificationStatusBanner from '../../components/VerificationStatusBanner';
import { Upload, X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ListMaterialPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    itemType: 'material', // material, machine, software
    quantity: '',
    unit: 'kg',
    listingType: 'auction',
    startingPrice: '',
    auctionEndTime: '',
    condition: 'good',
    location: { city: '', state: '', pincode: '', address: '' },
    images: [],
    // New fields for draft/scheduled and token
    publishOption: 'publish', // publish, draft, scheduled
    scheduledPublishDate: '',
    tokenAmount: ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'ewaste', label: 'E-Waste' },
    { value: 'fmgc', label: 'FMGC' },
    { value: 'metal', label: 'Metal' },
    { value: 'plastics', label: 'Plastics' },
    { value: 'paper', label: 'Paper' },
    { value: 'textile', label: 'Textile' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'ton', label: 'Tons' },
    { value: 'piece', label: 'Pieces' },
    { value: 'unit', label: 'Units' },
    { value: 'license', label: 'Licenses' },
    { value: 'set', label: 'Sets' },
    { value: 'package', label: 'Packages' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Auto-set listing type for machines and software
      if (name === 'itemType') {
        if (value === 'machine' || value === 'software') {
          setForm(prev => ({
            ...prev,
            itemType: value,
            listingType: 'rfq',
            category: value === 'machine' ? 'machines' : 'software'
          }));
        } else {
          setForm(prev => ({
            ...prev,
            itemType: value,
            listingType: 'auction',
            category: ''
          }));
        }
      }
    }
    
    // Clear error for this field
    if (errors[name] || errors[name?.split('.')[1]]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (name.startsWith('location.')) {
          delete newErrors[`location.${name.split('.')[1]}`];
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (form.images.length + files.length > 10) {
      showError('Maximum 10 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
        }
        return uploadAPI.uploadImage(file);
      });

      const results = await Promise.all(uploadPromises);
      const newImages = results.map(r => r.data?.url || r.url).filter(Boolean);
      
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } catch (error) {
      showError(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = 'Name is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!form.unit) newErrors.unit = 'Unit is required';
    if (!form.condition) newErrors.condition = 'Condition is required';
    if (!form.location.city) newErrors['location.city'] = 'City is required';
    if (!form.location.state) newErrors['location.state'] = 'State is required';
    if (!form.location.pincode) newErrors['location.pincode'] = 'Pincode is required';

    // Category required for materials
    if (form.itemType === 'material' && !form.category) {
      newErrors.category = 'Category is required';
    }

    // Auction-specific validation
    if (form.listingType === 'auction') {
      if (!form.startingPrice || parseFloat(form.startingPrice) <= 0) {
        newErrors.startingPrice = 'Valid starting price is required';
      }
      if (!form.auctionEndTime) {
        newErrors.auctionEndTime = 'Auction end time is required';
      } else if (new Date(form.auctionEndTime) <= new Date()) {
        newErrors.auctionEndTime = 'Auction end time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.isVerified || user?.userType !== 'seller') {
      showError('Only verified sellers can create listings');
      return;
    }

    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        category: form.itemType === 'machine' ? 'machines' : form.itemType === 'software' ? 'software' : form.category,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        condition: form.condition,
        location: form.location,
        images: form.images,
        listingType: form.listingType,
        startingPrice: form.listingType === 'auction' ? parseFloat(form.startingPrice) : null,
        auctionEndTime: form.listingType === 'auction' ? new Date(form.auctionEndTime).toISOString() : null
      };

      const result = await materialAPI.create(data);
      if (result.success) {
        const itemType = form.itemType === 'machine' ? 'Machine' : form.itemType === 'software' ? 'Software' : 'Material';
        showSuccess(`${itemType} listed successfully! Pending admin verification.`);
        
        // Reset form
        setForm({
          name: '',
          description: '',
          category: '',
          itemType: 'material',
          quantity: '',
          unit: 'kg',
          listingType: 'auction',
          startingPrice: '',
          auctionEndTime: '',
          condition: 'good',
          location: { city: '', state: '', pincode: '', address: '' },
          images: [],
          publishOption: 'publish',
          scheduledPublishDate: '',
          tokenAmount: ''
        });
        setErrors({});
        navigate('/seller/my-listings');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isVerified || user?.userType !== 'seller') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-4">Your seller account is pending verification.</p>
        <p className="text-sm text-gray-500">Please wait for admin approval to create listings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-2 pb-2">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <VerificationStatusBanner user={user} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Listing</h1>
          <p className="text-gray-600">Create a new listing for auction or RFQ. All listings require admin verification.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Item Type */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Item Type</h2>
            <Select
              label="What are you listing? *"
              name="itemType"
              value={form.itemType}
              onChange={handleChange}
              error={errors.itemType}
              required
            >
              <option value="material">Material (E-Waste, FMGC, Metal, etc.)</option>
              <option value="machine">Machine</option>
              <option value="software">Software</option>
            </Select>
            {(form.itemType === 'machine' || form.itemType === 'software') && (
              <div className={`mt-3 p-3 rounded ${form.itemType === 'machine' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}>
                <p className={`text-sm ${form.itemType === 'machine' ? 'text-blue-800' : 'text-purple-800'}`}>
                  <strong>{form.itemType === 'machine' ? 'Machine' : 'Software'} Listing:</strong> This will be listed in the {form.itemType === 'machine' ? 'Machines' : 'Softwares'} section. Buyers will request quotes from you.
                </p>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label={`${form.itemType === 'machine' ? 'Machine' : form.itemType === 'software' ? 'Software' : 'Material'} Name *`}
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder={
                  form.itemType === 'machine' 
                    ? 'e.g., Industrial Mixing Machine'
                    : form.itemType === 'software'
                    ? 'e.g., ERP Software Solution'
                    : 'e.g., Used Laptop Batteries'
                }
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description * <span className="text-gray-500 text-xs">(For listing)</span>
                </label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  error={errors.description}
                  placeholder="Provide detailed information about your listing..."
                  rows="8"
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A detailed description helps buyers make informed decisions. Include all relevant information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category - only for materials */}
                {form.itemType === 'material' && (
                  <Select
                    label="Category *"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    error={errors.category}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </Select>
                )}

                <Select
                  label="Condition"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Quantity *"
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  error={errors.quantity}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
                
                <Select
                  label="Unit *"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Images</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploadingImages || form.images.length >= 10
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImages ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each (Max 10 images)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages || form.images.length >= 10}
                  />
                </label>
              </div>

              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {form.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City *"
                name="location.city"
                value={form.location.city}
                onChange={handleChange}
                error={errors['location.city']}
                required
              />
              <Input
                label="State *"
                name="location.state"
                value={form.location.state}
                onChange={handleChange}
                error={errors['location.state']}
                required
              />
              <Input
                label="Pincode *"
                name="location.pincode"
                value={form.location.pincode}
                onChange={handleChange}
                error={errors['location.pincode']}
                required
              />
            </div>
            <Input
              label="Full Address (Optional)"
              name="location.address"
              value={form.location.address}
              onChange={handleChange}
              placeholder="Complete address for pickup"
              className="mt-4"
            />
          </div>

          {/* Listing Type - Only for Materials */}
          {form.itemType === 'material' && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Listing Type</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Listing Type *</label>
                  <select
                    name="listingType"
                    value={form.listingType}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="auction">Auction - Real-time bidding</option>
                    <option value="rfq">Request for Quote (RFQ) - Custom quotes only</option>
                  </select>
                </div>

                {form.listingType === 'auction' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-green-800">Auction Settings</h3>
                    <Input
                      label="Starting Price (₹) *"
                      type="number"
                      name="startingPrice"
                      value={form.startingPrice}
                      onChange={handleChange}
                      error={errors.startingPrice}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <Input
                      label="Auction End Date & Time *"
                      type="datetime-local"
                      name="auctionEndTime"
                      value={form.auctionEndTime}
                      onChange={handleChange}
                      error={errors.auctionEndTime}
                      required
                    />
                    
                    {/* Token Amount */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <Input
                        label="Token Amount (₹) - Optional"
                        type="number"
                        name="tokenAmount"
                        value={form.tokenAmount}
                        onChange={handleChange}
                        error={errors.tokenAmount}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-yellow-800 mt-1">
                        If set, the winning bidder must pay this token amount within 2 days of winning the auction.
                      </p>
                    </div>
                    
                    {/* Publish Options */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Publish Option *</label>
                      <select
                        name="publishOption"
                        value={form.publishOption}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="publish">Publish Immediately (after admin approval)</option>
                        <option value="draft">Save as Draft</option>
                        <option value="scheduled">Schedule for Later</option>
                      </select>
                      {form.publishOption === 'scheduled' && (
                        <div className="mt-3">
                          <Input
                            label="Schedule Publish Date & Time *"
                            type="datetime-local"
                            name="scheduledPublishDate"
                            value={form.scheduledPublishDate}
                            onChange={handleChange}
                            error={errors.scheduledPublishDate}
                            min={new Date().toISOString().slice(0, 16)}
                            required
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            The auction will be published automatically at this time (after admin approval).
                          </p>
                        </div>
                      )}
                      {form.publishOption === 'draft' && (
                        <p className="text-xs text-gray-600 mt-2">
                          Your listing will be saved as a draft. You can publish it later from "My Bids".
                        </p>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      The auction will end at the specified time. Buyers can bid until then.
                    </p>
                  </div>
                )}

                {form.listingType === 'rfq' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>RFQ Listing Mode:</strong> Buyers will see this listing and can request quotes from you.
                    </p>
                    <p className="text-xs text-blue-700">
                      When buyers request quotes, you'll receive notifications and can respond with custom pricing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/seller/my-listings')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={loading || uploadingImages}
              className="w-full sm:w-auto"
            >
              {loading 
                ? `Creating ${form.itemType === 'machine' ? 'Machine' : form.itemType === 'software' ? 'Software' : 'Material'}...` 
                : `Create ${form.itemType === 'machine' ? 'Machine' : form.itemType === 'software' ? 'Software' : 'Material'} Listing`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListMaterialPage;
