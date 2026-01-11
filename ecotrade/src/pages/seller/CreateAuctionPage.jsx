import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialAPI } from '../../api/materialAPI';
import { uploadAPI } from '../../api/uploadAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import VerificationStatusBanner from '../../components/VerificationStatusBanner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, X, Upload, Package, DollarSign, Calendar, MapPin, FileText, Image as ImageIcon, AlertCircle, Gavel } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'ewaste',
    quantity: '',
    unit: 'kg',
    images: [],
    location: {
      city: '',
      state: '',
      pincode: '',
      address: ''
    },
    condition: 'good',
    startingPrice: '',
    auctionEndTime: '',
    tokenAmount: '',
    isVerified: false, // Auto-verify option
    publishOption: 'publish', // publish, draft, scheduled
    scheduledPublishDate: '',
    // Compliance checkboxes
    sellerConfirmsOwnership: false,
    materialCompliesWithLaws: false,
    buyerResponsibleForTransport: false,
    platformNotLiableForDisputes: false,
    // Category-specific fields - will be populated based on category
    // E-Waste
    ewasteType: '',
    workingCondition: '',
    approxYear: '',
    hazardousComponentsPresent: '',
    dataCleared: '',
    weighmentMethod: '',
    brandList: '',
    batteryIncluded: '',
    pcbGrade: '',
    // Metal
    metalType: '',
    gradePurity: '',
    form: '',
    contaminationPresent: '',
    oilGreasePresent: '',
    magnetTestPassed: '',
    // Plastics
    plasticType: '',
    plasticForm: '',
    cleanliness: '',
    color: '',
    moistureLevel: '',
    foodGrade: '',
    // Paper
    paperType: '',
    paperCondition: '',
    baledOrLoose: '',
    paperContaminationPresent: '',
    approxGSM: '',
    storageCondition: '',
    // Textile
    textileType: '',
    textileForm: '',
    textileCleanliness: '',
    reusableOrRecyclingGrade: '',
    colorSortingAvailable: '',
    // FMCG
    productType: '',
    expiryDate: '',
    packagingCondition: '',
    returnDamageReason: '',
    batchQuantity: '',
    brand: '',
    mrp: '',
    // Other
    materialDescription: '',
    intendedUseNature: '',
    specialHandlingRequired: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrl, setImageUrl] = useState('');

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
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'ton', label: 'Ton' },
    { value: 'piece', label: 'Piece' },
    { value: 'unit', label: 'Unit' },
    { value: 'set', label: 'Set' },
    { value: 'package', label: 'Package' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'scrap', label: 'Scrap' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageAdd = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      setImageUrl('');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      showError('Maximum 10 images allowed');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      showError('Please upload only image files (JPEG, PNG, WebP, GIF)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const largeFiles = files.filter(file => file.size > maxSize);
    if (largeFiles.length > 0) {
      showError('Image size should be less than 5MB');
      return;
    }

    setUploadingImages(true);
    try {
      const result = await uploadAPI.uploadMultipleImages(files, 'materials');
      if (result.urls && result.urls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.urls]
        }));
        setImagePreviews(prev => [...prev, ...files]);
        showSuccess(`${result.urls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Material name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.location.city) newErrors['location.city'] = 'City is required';
    if (!formData.location.state) newErrors['location.state'] = 'State is required';
    if (!formData.location.pincode) newErrors['location.pincode'] = 'Pincode is required';
    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) {
      newErrors.startingPrice = 'Valid starting price is required';
    }
    if (!formData.auctionEndTime) {
      newErrors.auctionEndTime = 'Auction end time is required';
    } else if (new Date(formData.auctionEndTime) <= new Date()) {
      newErrors.auctionEndTime = 'Auction end time must be in the future';
    }
    if (formData.publishOption === 'scheduled' && !formData.scheduledPublishDate) {
      newErrors.scheduledPublishDate = 'Scheduled publish date is required';
    }
    
    // Compliance checkboxes validation
    if (!formData.sellerConfirmsOwnership) newErrors.sellerConfirmsOwnership = 'You must confirm ownership';
    if (!formData.materialCompliesWithLaws) newErrors.materialCompliesWithLaws = 'You must confirm compliance with laws';
    if (!formData.buyerResponsibleForTransport) newErrors.buyerResponsibleForTransport = 'This checkbox is required';
    if (!formData.platformNotLiableForDisputes) newErrors.platformNotLiableForDisputes = 'This checkbox is required';
    
    // Category-specific validation
    if (formData.category === 'ewaste') {
      if (!formData.ewasteType) newErrors.ewasteType = 'E-waste type is required';
      if (!formData.workingCondition) newErrors.workingCondition = 'Working condition is required';
      if (!formData.approxYear) newErrors.approxYear = 'Approx year/age is required';
      if (!formData.hazardousComponentsPresent) newErrors.hazardousComponentsPresent = 'This field is required';
      if (!formData.dataCleared) newErrors.dataCleared = 'This field is required';
      if (!formData.weighmentMethod) newErrors.weighmentMethod = 'Weighment method is required';
    } else if (formData.category === 'metal') {
      if (!formData.metalType) newErrors.metalType = 'Metal type is required';
      if (!formData.gradePurity) newErrors.gradePurity = 'Grade/purity is required';
      if (!formData.form) newErrors.form = 'Form is required';
      if (!formData.contaminationPresent) newErrors.contaminationPresent = 'This field is required';
      if (!formData.weighmentMethod) newErrors.weighmentMethod = 'Weighment method is required';
    } else if (formData.category === 'plastics') {
      if (!formData.plasticType) newErrors.plasticType = 'Plastic type is required';
      if (!formData.plasticForm) newErrors.plasticForm = 'Form is required';
      if (!formData.cleanliness) newErrors.cleanliness = 'Cleanliness is required';
    } else if (formData.category === 'paper') {
      if (!formData.paperType) newErrors.paperType = 'Paper type is required';
      if (!formData.paperCondition) newErrors.paperCondition = 'Condition is required';
      if (!formData.baledOrLoose) newErrors.baledOrLoose = 'Baled or Loose is required';
      if (!formData.paperContaminationPresent) newErrors.paperContaminationPresent = 'This field is required';
    } else if (formData.category === 'textile') {
      if (!formData.textileType) newErrors.textileType = 'Textile type is required';
      if (!formData.textileForm) newErrors.textileForm = 'Form is required';
      if (!formData.textileCleanliness) newErrors.textileCleanliness = 'Cleanliness is required';
      if (!formData.reusableOrRecyclingGrade) newErrors.reusableOrRecyclingGrade = 'This field is required';
    } else if (formData.category === 'fmgc') {
      if (!formData.productType) newErrors.productType = 'Product type is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.packagingCondition) newErrors.packagingCondition = 'Packaging condition is required';
      if (!formData.returnDamageReason) newErrors.returnDamageReason = 'Return/damage reason is required';
      if (!formData.batchQuantity) newErrors.batchQuantity = 'Batch quantity is required';
    } else if (formData.category === 'other') {
      if (!formData.materialDescription) newErrors.materialDescription = 'Material description is required';
      if (!formData.intendedUseNature) newErrors.intendedUseNature = 'Intended use/nature is required';
      if (!formData.specialHandlingRequired) newErrors.specialHandlingRequired = 'This field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      showError('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        condition: formData.condition,
        location: formData.location,
        images: formData.images,
        listingType: 'auction', // Only auctions now
        startingPrice: parseFloat(formData.startingPrice),
        auctionEndTime: new Date(formData.auctionEndTime).toISOString(),
        tokenAmount: formData.tokenAmount ? parseFloat(formData.tokenAmount) : null,
        isDraft: formData.publishOption === 'draft',
        scheduledPublishDate: formData.publishOption === 'scheduled' && formData.scheduledPublishDate 
          ? new Date(formData.scheduledPublishDate).toISOString() 
          : null,
        isVerified: formData.isVerified,
        // Compliance checkboxes
        sellerConfirmsOwnership: formData.sellerConfirmsOwnership,
        materialCompliesWithLaws: formData.materialCompliesWithLaws,
        buyerResponsibleForTransport: formData.buyerResponsibleForTransport,
        platformNotLiableForDisputes: formData.platformNotLiableForDisputes,
        // Category-specific fields - include all, backend will use based on category
        ewasteType: formData.ewasteType,
        workingCondition: formData.workingCondition,
        approxYear: formData.approxYear,
        hazardousComponentsPresent: formData.hazardousComponentsPresent,
        dataCleared: formData.dataCleared,
        weighmentMethod: formData.weighmentMethod,
        brandList: formData.brandList,
        batteryIncluded: formData.batteryIncluded,
        pcbGrade: formData.pcbGrade,
        metalType: formData.metalType,
        gradePurity: formData.gradePurity,
        form: formData.form,
        contaminationPresent: formData.contaminationPresent,
        oilGreasePresent: formData.oilGreasePresent,
        magnetTestPassed: formData.magnetTestPassed,
        plasticType: formData.plasticType,
        plasticForm: formData.plasticForm,
        cleanliness: formData.cleanliness,
        color: formData.color,
        moistureLevel: formData.moistureLevel,
        foodGrade: formData.foodGrade,
        paperType: formData.paperType,
        paperCondition: formData.paperCondition,
        baledOrLoose: formData.baledOrLoose,
        paperContaminationPresent: formData.paperContaminationPresent,
        approxGSM: formData.approxGSM,
        storageCondition: formData.storageCondition,
        textileType: formData.textileType,
        textileForm: formData.textileForm,
        textileCleanliness: formData.textileCleanliness,
        reusableOrRecyclingGrade: formData.reusableOrRecyclingGrade,
        colorSortingAvailable: formData.colorSortingAvailable,
        productType: formData.productType,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        packagingCondition: formData.packagingCondition,
        returnDamageReason: formData.returnDamageReason,
        batchQuantity: formData.batchQuantity,
        brand: formData.brand,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        materialDescription: formData.materialDescription,
        intendedUseNature: formData.intendedUseNature,
        specialHandlingRequired: formData.specialHandlingRequired
      };

      const result = await materialAPI.create(data);
      if (result.success) {
        showSuccess('Auction created successfully! Pending admin approval.');
        navigate('/seller/my-auctions');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create auction');
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
        <p className="text-sm text-gray-500">Please wait for admin approval to create auctions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-2 pb-2">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <VerificationStatusBanner user={user} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Auction</h1>
          <p className="text-gray-600">Create a new auction listing. All auctions require admin approval.</p>
        </div>

        {/* Information Message */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Auction Creation Process:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Fill out all required fields and submit your auction</li>
                <li>Your auction will be sent to admin for approval</li>
                <li>Once admin approves, your auction will go LIVE</li>
                <li>Buyers can then start bidding on your auction</li>
                <li>You can accept a bid when ready</li>
                <li>Admin will verify and approve the bid, then generate Purchase Order</li>
              </ol>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Material Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Material Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Material Name *"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g., Copper Scrap"
                required
                fullWidth
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <Input
                label="Quantity *"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                error={errors.quantity}
                placeholder="0"
                min="0"
                step="0.01"
                required
                fullWidth
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description * <span className="text-gray-500 text-xs">(For Auction listing)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full border rounded-md px-3 py-2 text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Provide a detailed description of what you're selling. Include:\n- Item specifications and details\n- Condition and quality\n- Quantity breakdown\n- Any special features or requirements\n- Delivery terms (if applicable)\n\nThis description will be visible to all buyers in the auction listing."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A detailed description helps buyers make informed decisions. Include all relevant information about your listing.
                </p>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City *"
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                error={errors['location.city']}
                placeholder="City name"
                required
                fullWidth
              />
              <Input
                label="State *"
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                error={errors['location.state']}
                placeholder="State name"
                required
                fullWidth
              />
              <Input
                label="Pincode *"
                type="text"
                name="location.pincode"
                value={formData.location.pincode}
                onChange={handleChange}
                error={errors['location.pincode']}
                placeholder="123456"
                required
                fullWidth
              />
              <Input
                label="Address (Optional)"
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Full address"
                fullWidth
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-green-600" />
              Images ({formData.images.length}/10)
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploadingImages || formData.images.length >= 10
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
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB each (Max 10 images)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages || formData.images.length >= 10}
                  />
                </label>
              </div>

              {/* Add Image URL */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Or Add Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleImageAdd())}
                  fullWidth
                />
                <Button
                  type="button"
                  onClick={handleImageAdd}
                  variant="outline"
                  disabled={!imageUrl || formData.images.length >= 10}
                >
                  Add URL
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No images added yet</p>
              )}
            </div>
          </div>

          {/* Category-Specific Fields */}
          {formData.category && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Category-Specific Information
              </h2>
              {formData.category === 'ewaste' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-waste Type *</label>
                    <select name="ewasteType" value={formData.ewasteType} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select type</option>
                      <option value="IT equipment">IT equipment</option>
                      <option value="Consumer electronics">Consumer electronics</option>
                      <option value="Industrial electronics">Industrial electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Working Condition *</label>
                    <select name="workingCondition" value={formData.workingCondition} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select condition</option>
                      <option value="Working">Working</option>
                      <option value="Non-working">Non-working</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <Input label="Approx Year / Age *" type="text" name="approxYear" value={formData.approxYear} onChange={handleChange} placeholder="e.g., 2020 or 3 years" required fullWidth />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Components Present? *</label>
                    <select name="hazardousComponentsPresent" value={formData.hazardousComponentsPresent} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Cleared? *</label>
                    <select name="dataCleared" value={formData.dataCleared} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Not applicable">Not applicable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weighment Method *</label>
                    <select name="weighmentMethod" value={formData.weighmentMethod} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select method</option>
                      <option value="Seller">Seller</option>
                      <option value="Buyer">Buyer</option>
                      <option value="Third-party">Third-party</option>
                    </select>
                  </div>
                  <Input label="Brand list (if applicable)" type="text" name="brandList" value={formData.brandList} onChange={handleChange} placeholder="e.g., Dell, HP, Lenovo" fullWidth />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Battery included?</label>
                    <select name="batteryIncluded" value={formData.batteryIncluded} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PCB grade</label>
                    <select name="pcbGrade" value={formData.pcbGrade} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="">Select grade</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              )}
              
              {formData.category === 'metal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metal Type *</label>
                    <select name="metalType" value={formData.metalType} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select type</option>
                      <option value="Copper">Copper</option>
                      <option value="Aluminum">Aluminum</option>
                      <option value="Steel">Steel</option>
                      <option value="Brass">Brass</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <Input label="Grade / Purity *" type="text" name="gradePurity" value={formData.gradePurity} onChange={handleChange} placeholder="e.g., Copper 99%, Mixed scrap" required fullWidth />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Form *</label>
                    <select name="form" value={formData.form} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select form</option>
                      <option value="Wire">Wire</option>
                      <option value="Sheet">Sheet</option>
                      <option value="Pipe">Pipe</option>
                      <option value="Turning">Turning</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contamination Present? *</label>
                    <select name="contaminationPresent" value={formData.contaminationPresent} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weighment Method *</label>
                    <select name="weighmentMethod" value={formData.weighmentMethod} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select method</option>
                      <option value="Seller">Seller</option>
                      <option value="Buyer">Buyer</option>
                      <option value="Third-party">Third-party</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oil / grease present</label>
                    <select name="oilGreasePresent" value={formData.oilGreasePresent} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <Input label="Magnet test passed (for ferrous)" type="text" name="magnetTestPassed" value={formData.magnetTestPassed} onChange={handleChange} placeholder="Yes/No/Not applicable" fullWidth />
                </div>
              )}
              
              {formData.category === 'plastics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plastic Type *</label>
                    <select name="plasticType" value={formData.plasticType} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select type</option>
                      <option value="PET">PET</option>
                      <option value="HDPE">HDPE</option>
                      <option value="LDPE">LDPE</option>
                      <option value="PP">PP</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Form *</label>
                    <select name="plasticForm" value={formData.plasticForm} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select form</option>
                      <option value="Granules">Granules</option>
                      <option value="Scrap">Scrap</option>
                      <option value="Bales">Bales</option>
                      <option value="Regrind">Regrind</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness *</label>
                    <select name="cleanliness" value={formData.cleanliness} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Clean">Clean</option>
                      <option value="Semi-clean">Semi-clean</option>
                      <option value="Dirty">Dirty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <select name="color" value={formData.color} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="Natural">Natural</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Specific color">Specific color</option>
                    </select>
                  </div>
                  <Input label="Moisture level (optional)" type="text" name="moistureLevel" value={formData.moistureLevel} onChange={handleChange} placeholder="e.g., Low, Medium, High" fullWidth />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food-grade?</label>
                    <select name="foodGrade" value={formData.foodGrade} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              )}
              
              {formData.category === 'paper' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paper Type *</label>
                    <select name="paperType" value={formData.paperType} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select type</option>
                      <option value="OCC">OCC</option>
                      <option value="Newspaper">Newspaper</option>
                      <option value="Office paper">Office paper</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                    <select name="paperCondition" value={formData.paperCondition} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select condition</option>
                      <option value="Dry">Dry</option>
                      <option value="Semi-wet">Semi-wet</option>
                      <option value="Wet">Wet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Baled or Loose *</label>
                    <select name="baledOrLoose" value={formData.baledOrLoose} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Baled">Baled</option>
                      <option value="Loose">Loose</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contamination Present? *</label>
                    <select name="paperContaminationPresent" value={formData.paperContaminationPresent} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <Input label="Approx GSM (optional)" type="text" name="approxGSM" value={formData.approxGSM} onChange={handleChange} placeholder="e.g., 80 GSM" fullWidth />
                  <Input label="Storage condition (optional)" type="text" name="storageCondition" value={formData.storageCondition} onChange={handleChange} placeholder="e.g., Covered, Dry place" fullWidth />
                </div>
              )}
              
              {formData.category === 'textile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Textile Type *</label>
                    <select name="textileType" value={formData.textileType} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select type</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Polyester">Polyester</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Fabric scrap">Fabric scrap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Form *</label>
                    <select name="textileForm" value={formData.textileForm} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select form</option>
                      <option value="Clips">Clips</option>
                      <option value="Rags">Rags</option>
                      <option value="Rolls">Rolls</option>
                      <option value="Cut pieces">Cut pieces</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness *</label>
                    <select name="textileCleanliness" value={formData.textileCleanliness} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Clean">Clean</option>
                      <option value="Semi-clean">Semi-clean</option>
                      <option value="Dirty">Dirty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reusable or Recycling Grade *</label>
                    <select name="reusableOrRecyclingGrade" value={formData.reusableOrRecyclingGrade} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Reusable">Reusable</option>
                      <option value="Recycling Grade">Recycling Grade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color sorting available</label>
                    <select name="colorSortingAvailable" value={formData.colorSortingAvailable} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              )}
              
              {formData.category === 'fmgc' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
                    <select name="productType" value={formData.productType} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select type</option>
                      <option value="Food">Food</option>
                      <option value="Personal care">Personal care</option>
                      <option value="Household">Household</option>
                    </select>
                  </div>
                  <Input label="Expiry Date *" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required fullWidth />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Condition *</label>
                    <select name="packagingCondition" value={formData.packagingCondition} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select condition</option>
                      <option value="Sealed">Sealed</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Open box">Open box</option>
                    </select>
                  </div>
                  <Input label="Return / Damage Reason *" type="text" name="returnDamageReason" value={formData.returnDamageReason} onChange={handleChange} placeholder="Reason for return/damage" required fullWidth />
                  <Input label="Batch Quantity *" type="text" name="batchQuantity" value={formData.batchQuantity} onChange={handleChange} placeholder="e.g., 100 units" required fullWidth />
                  <Input label="Brand (optional)" type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand name" fullWidth />
                  <Input label="MRP (for reference, optional)" type="number" name="mrp" value={formData.mrp} onChange={handleChange} placeholder="0.00" min="0" step="0.01" fullWidth />
                  <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Disclaimer:</strong> Platform not responsible for resale legality. Seller must ensure compliance with local laws.
                    </p>
                  </div>
                </div>
              )}
              
              {formData.category === 'other' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material Description *</label>
                    <textarea name="materialDescription" value={formData.materialDescription} onChange={handleChange} rows={4} className="w-full border rounded-md px-3 py-2 text-sm" required placeholder="Detailed description of the material" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Intended Use / Nature *</label>
                    <textarea name="intendedUseNature" value={formData.intendedUseNature} onChange={handleChange} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" required placeholder="Describe the intended use or nature of the material" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Handling Required? *</label>
                    <select name="specialHandlingRequired" value={formData.specialHandlingRequired} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance & Legal */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Compliance & Legal
            </h2>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="sellerConfirmsOwnership"
                  checked={formData.sellerConfirmsOwnership}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  required
                />
                <label className="text-sm text-gray-700">
                  <strong>Seller confirms ownership of material</strong> *
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="materialCompliesWithLaws"
                  checked={formData.materialCompliesWithLaws}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  required
                />
                <label className="text-sm text-gray-700">
                  <strong>Material complies with local laws</strong> *
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="buyerResponsibleForTransport"
                  checked={formData.buyerResponsibleForTransport}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  required
                />
                <label className="text-sm text-gray-700">
                  <strong>Buyer responsible for transportation & compliance</strong> *
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="platformNotLiableForDisputes"
                  checked={formData.platformNotLiableForDisputes}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  required
                />
                <label className="text-sm text-gray-700">
                  <strong>Platform not liable for post-sale disputes</strong> *
                </label>
              </div>
            </div>
          </div>

          {/* Auction Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5 text-green-600" />
              Auction Settings
            </h2>
            <div className="space-y-4">
              <Input
                label="Starting Price (₹) *"
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                error={errors.startingPrice}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                fullWidth
              />
              <Input
                label="Auction End Date & Time *"
                type="datetime-local"
                name="auctionEndTime"
                value={formData.auctionEndTime}
                onChange={handleChange}
                error={errors.auctionEndTime}
                required
                fullWidth
              />
              <Input
                label="Token Amount (₹) - Optional"
                type="number"
                name="tokenAmount"
                value={formData.tokenAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                fullWidth
              />
              <p className="text-xs text-gray-500">
                If set, the winning bidder must pay this token amount within 2 days of winning the auction. Payment will be done externally.
              </p>
              
              {/* Publish Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Publish Option *</label>
                <select
                  name="publishOption"
                  value={formData.publishOption}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="publish">Publish Immediately (after admin approval)</option>
                  <option value="draft">Save as Draft</option>
                  <option value="scheduled">Schedule for Later</option>
                </select>
                {formData.publishOption === 'scheduled' && (
                  <div className="mt-3">
                    <Input
                      label="Schedule Publish Date & Time *"
                      type="datetime-local"
                      name="scheduledPublishDate"
                      value={formData.scheduledPublishDate}
                      onChange={handleChange}
                      error={errors.scheduledPublishDate}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                      fullWidth
                    />
                  </div>
                )}
              </div>

              {/* Auto-verify option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="text-sm text-gray-700">
                  Auto-verify material (recommended)
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/seller/my-auctions')}
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
              {loading ? 'Creating Auction...' : 'Create Auction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionPage;


