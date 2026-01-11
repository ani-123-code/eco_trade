import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { materialAPI } from '../../api/materialAPI';
import { uploadAPI } from '../../api/uploadAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Upload, X, AlertCircle, Package, FileText, Gavel, MapPin, Image as ImageIcon } from 'lucide-react';

const EditAuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'kg',
    listingType: 'auction',
    startingPrice: '',
    reservePrice: '',
    auctionEndTime: '',
    condition: 'good',
    location: {
      city: '',
      state: '',
      pincode: '',
      address: ''
    },
    // Compliance checkboxes
    sellerConfirmsOwnership: false,
    materialCompliesWithLaws: false,
    buyerResponsibleForTransport: false,
    platformNotLiableForDisputes: false,
    // Category-specific fields
    ewasteType: '',
    workingCondition: '',
    approxYear: '',
    hazardousComponentsPresent: '',
    dataCleared: '',
    weighmentMethod: '',
    brandList: '',
    batteryIncluded: '',
    pcbGrade: '',
    metalType: '',
    gradePurity: '',
    form: '',
    contaminationPresent: '',
    oilGreasePresent: '',
    magnetTestPassed: '',
    plasticType: '',
    plasticForm: '',
    cleanliness: '',
    color: '',
    moistureLevel: '',
    foodGrade: '',
    paperType: '',
    paperCondition: '',
    baledOrLoose: '',
    paperContaminationPresent: '',
    approxGSM: '',
    storageCondition: '',
    textileType: '',
    textileForm: '',
    textileCleanliness: '',
    reusableOrRecyclingGrade: '',
    colorSortingAvailable: '',
    productType: '',
    expiryDate: '',
    packagingCondition: '',
    returnDamageReason: '',
    batchQuantity: '',
    brand: '',
    mrp: '',
    materialDescription: '',
    intendedUseNature: '',
    specialHandlingRequired: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    setLoading(true);
    try {
      const result = await materialAPI.getById(id);
      if (result.success) {
        const material = result.data;
        if (material.seller._id !== user?._id && user?.role !== 'admin') {
          showError('You are not authorized to edit this material');
          navigate('/seller/my-auctions');
          return;
        }
        setFormData({
          name: material.name,
          description: material.description || '',
          category: material.category,
          quantity: material.quantity,
          unit: material.unit,
          listingType: material.listingType,
          startingPrice: material.startingPrice || '',
          reservePrice: material.reservePrice || '',
          auctionEndTime: material.auctionEndTime ? new Date(material.auctionEndTime).toISOString().slice(0, 16) : '',
          condition: material.condition || 'good',
          location: material.location || { city: '', state: '', pincode: '', address: '' },
          // Compliance checkboxes
          sellerConfirmsOwnership: material.sellerConfirmsOwnership || false,
          materialCompliesWithLaws: material.materialCompliesWithLaws || false,
          buyerResponsibleForTransport: material.buyerResponsibleForTransport || false,
          platformNotLiableForDisputes: material.platformNotLiableForDisputes || false,
          // Category-specific fields
          ewasteType: material.ewasteType || '',
          workingCondition: material.workingCondition || '',
          approxYear: material.approxYear || '',
          hazardousComponentsPresent: material.hazardousComponentsPresent || '',
          dataCleared: material.dataCleared || '',
          weighmentMethod: material.weighmentMethod || '',
          brandList: material.brandList || '',
          batteryIncluded: material.batteryIncluded || '',
          pcbGrade: material.pcbGrade || '',
          metalType: material.metalType || '',
          gradePurity: material.gradePurity || '',
          form: material.form || '',
          contaminationPresent: material.contaminationPresent || '',
          oilGreasePresent: material.oilGreasePresent || '',
          magnetTestPassed: material.magnetTestPassed || '',
          plasticType: material.plasticType || '',
          plasticForm: material.plasticForm || '',
          cleanliness: material.cleanliness || '',
          color: material.color || '',
          moistureLevel: material.moistureLevel || '',
          foodGrade: material.foodGrade || '',
          paperType: material.paperType || '',
          paperCondition: material.paperCondition || '',
          baledOrLoose: material.baledOrLoose || '',
          paperContaminationPresent: material.paperContaminationPresent || '',
          approxGSM: material.approxGSM || '',
          storageCondition: material.storageCondition || '',
          textileType: material.textileType || '',
          textileForm: material.textileForm || '',
          textileCleanliness: material.textileCleanliness || '',
          reusableOrRecyclingGrade: material.reusableOrRecyclingGrade || '',
          colorSortingAvailable: material.colorSortingAvailable || '',
          productType: material.productType || '',
          expiryDate: material.expiryDate ? new Date(material.expiryDate).toISOString().slice(0, 10) : '',
          packagingCondition: material.packagingCondition || '',
          returnDamageReason: material.returnDamageReason || '',
          batchQuantity: material.batchQuantity || '',
          brand: material.brand || '',
          mrp: material.mrp || '',
          materialDescription: material.materialDescription || '',
          intendedUseNature: material.intendedUseNature || '',
          specialHandlingRequired: material.specialHandlingRequired || ''
        });
        setImages(material.images || []);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch material');
      navigate('/seller/my-auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      showError('Maximum 10 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      const result = await uploadAPI.uploadMultipleImages(files, 'materials');
      if (result.urls && result.urls.length > 0) {
        setImages([...images, ...result.urls]);
        showSuccess(`${result.urls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Material name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.location.city) newErrors['location.city'] = 'City is required';
    if (!formData.location.state) newErrors['location.state'] = 'State is required';
    if (!formData.location.pincode) newErrors['location.pincode'] = 'Pincode is required';

    if (formData.listingType === 'auction') {
      if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) {
        newErrors.startingPrice = 'Valid starting price is required';
      }
      if (!formData.auctionEndTime) {
        newErrors.auctionEndTime = 'Auction end time is required';
      } else if (new Date(formData.auctionEndTime) <= new Date()) {
        newErrors.auctionEndTime = 'Auction end time must be in the future';
      }
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
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        images: images,
        startingPrice: formData.listingType === 'auction' ? parseFloat(formData.startingPrice) : null,
        reservePrice: formData.listingType === 'auction' && formData.reservePrice ? parseFloat(formData.reservePrice) : null,
        auctionEndTime: formData.listingType === 'auction' ? new Date(formData.auctionEndTime).toISOString() : null,
        // Include all category-specific fields
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null
      };

      const result = await materialAPI.update(id, data);
      if (result.success) {
        showSuccess('Material updated successfully!');
        navigate('/seller/my-auctions');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update material');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user?.isVerified || user?.userType !== 'seller') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">Your seller account is pending verification.</p>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Material</h1>
        <p className="text-gray-600">Update your material listing details</p>
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              fullWidth
            />
            <Select
              label="Category *"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </Select>
            <Input
              label="Quantity *"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              min="0"
              step="0.01"
              required
              fullWidth
            />
            <Select
              label="Unit *"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </Select>
            <div className="md:col-span-2">
              <Textarea
                label="Detailed Description *"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                rows="6"
                required
                fullWidth
              />
            </div>
            <Select
              label="Condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              {conditions.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </Select>
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
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              error={errors['location.city']}
              required
              fullWidth
            />
            <Input
              label="State *"
              name="location.state"
              value={formData.location.state}
              onChange={handleChange}
              error={errors['location.state']}
              required
              fullWidth
            />
            <Input
              label="Pincode *"
              name="location.pincode"
              value={formData.location.pincode}
              onChange={handleChange}
              error={errors['location.pincode']}
              required
              fullWidth
            />
            <Input
              label="Address (Optional)"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              fullWidth
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-green-600" />
            Images ({images.length}/10)
          </h2>
          <label className="block text-sm font-medium mb-2">Images</label>
          <div className="flex items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg p-4">
            <label className="cursor-pointer">
              <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to upload images</p>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImages || images.length >= 10}
              />
            </label>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
                  {errors.ewasteType && <p className="text-red-500 text-xs mt-1">{errors.ewasteType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Condition *</label>
                  <select name="workingCondition" value={formData.workingCondition} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select condition</option>
                    <option value="Working">Working</option>
                    <option value="Non-working">Non-working</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                  {errors.workingCondition && <p className="text-red-500 text-xs mt-1">{errors.workingCondition}</p>}
                </div>
                <Input label="Approx Year / Age *" type="text" name="approxYear" value={formData.approxYear} onChange={handleChange} error={errors.approxYear} placeholder="e.g., 2020 or 3 years" required fullWidth />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous Components Present? *</label>
                  <select name="hazardousComponentsPresent" value={formData.hazardousComponentsPresent} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.hazardousComponentsPresent && <p className="text-red-500 text-xs mt-1">{errors.hazardousComponentsPresent}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Cleared? *</label>
                  <select name="dataCleared" value={formData.dataCleared} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Not applicable">Not applicable</option>
                  </select>
                  {errors.dataCleared && <p className="text-red-500 text-xs mt-1">{errors.dataCleared}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weighment Method *</label>
                  <select name="weighmentMethod" value={formData.weighmentMethod} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select method</option>
                    <option value="Seller">Seller</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Third-party">Third-party</option>
                  </select>
                  {errors.weighmentMethod && <p className="text-red-500 text-xs mt-1">{errors.weighmentMethod}</p>}
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
                  {errors.metalType && <p className="text-red-500 text-xs mt-1">{errors.metalType}</p>}
                </div>
                <Input label="Grade / Purity *" type="text" name="gradePurity" value={formData.gradePurity} onChange={handleChange} error={errors.gradePurity} placeholder="e.g., Copper 99%, Mixed scrap" required fullWidth />
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
                  {errors.form && <p className="text-red-500 text-xs mt-1">{errors.form}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contamination Present? *</label>
                  <select name="contaminationPresent" value={formData.contaminationPresent} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.contaminationPresent && <p className="text-red-500 text-xs mt-1">{errors.contaminationPresent}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weighment Method *</label>
                  <select name="weighmentMethod" value={formData.weighmentMethod} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select method</option>
                    <option value="Seller">Seller</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Third-party">Third-party</option>
                  </select>
                  {errors.weighmentMethod && <p className="text-red-500 text-xs mt-1">{errors.weighmentMethod}</p>}
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
                  {errors.plasticType && <p className="text-red-500 text-xs mt-1">{errors.plasticType}</p>}
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
                  {errors.plasticForm && <p className="text-red-500 text-xs mt-1">{errors.plasticForm}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness *</label>
                  <select name="cleanliness" value={formData.cleanliness} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Clean">Clean</option>
                    <option value="Semi-clean">Semi-clean</option>
                    <option value="Dirty">Dirty</option>
                  </select>
                  {errors.cleanliness && <p className="text-red-500 text-xs mt-1">{errors.cleanliness}</p>}
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
                  {errors.paperType && <p className="text-red-500 text-xs mt-1">{errors.paperType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                  <select name="paperCondition" value={formData.paperCondition} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select condition</option>
                    <option value="Dry">Dry</option>
                    <option value="Semi-wet">Semi-wet</option>
                    <option value="Wet">Wet</option>
                  </select>
                  {errors.paperCondition && <p className="text-red-500 text-xs mt-1">{errors.paperCondition}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Baled or Loose *</label>
                  <select name="baledOrLoose" value={formData.baledOrLoose} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Baled">Baled</option>
                    <option value="Loose">Loose</option>
                  </select>
                  {errors.baledOrLoose && <p className="text-red-500 text-xs mt-1">{errors.baledOrLoose}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contamination Present? *</label>
                  <select name="paperContaminationPresent" value={formData.paperContaminationPresent} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.paperContaminationPresent && <p className="text-red-500 text-xs mt-1">{errors.paperContaminationPresent}</p>}
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
                  {errors.textileType && <p className="text-red-500 text-xs mt-1">{errors.textileType}</p>}
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
                  {errors.textileForm && <p className="text-red-500 text-xs mt-1">{errors.textileForm}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness *</label>
                  <select name="textileCleanliness" value={formData.textileCleanliness} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Clean">Clean</option>
                    <option value="Semi-clean">Semi-clean</option>
                    <option value="Dirty">Dirty</option>
                  </select>
                  {errors.textileCleanliness && <p className="text-red-500 text-xs mt-1">{errors.textileCleanliness}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reusable or Recycling Grade *</label>
                  <select name="reusableOrRecyclingGrade" value={formData.reusableOrRecyclingGrade} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Reusable">Reusable</option>
                    <option value="Recycling Grade">Recycling Grade</option>
                  </select>
                  {errors.reusableOrRecyclingGrade && <p className="text-red-500 text-xs mt-1">{errors.reusableOrRecyclingGrade}</p>}
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
                  {errors.productType && <p className="text-red-500 text-xs mt-1">{errors.productType}</p>}
                </div>
                <Input label="Expiry Date *" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} error={errors.expiryDate} required fullWidth />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Condition *</label>
                  <select name="packagingCondition" value={formData.packagingCondition} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select condition</option>
                    <option value="Sealed">Sealed</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Open box">Open box</option>
                  </select>
                  {errors.packagingCondition && <p className="text-red-500 text-xs mt-1">{errors.packagingCondition}</p>}
                </div>
                <Input label="Return / Damage Reason *" type="text" name="returnDamageReason" value={formData.returnDamageReason} onChange={handleChange} error={errors.returnDamageReason} placeholder="Reason for return/damage" required fullWidth />
                <Input label="Batch Quantity *" type="text" name="batchQuantity" value={formData.batchQuantity} onChange={handleChange} error={errors.batchQuantity} placeholder="e.g., 100 units" required fullWidth />
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
                  {errors.materialDescription && <p className="text-red-500 text-xs mt-1">{errors.materialDescription}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intended Use / Nature *</label>
                  <textarea name="intendedUseNature" value={formData.intendedUseNature} onChange={handleChange} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" required placeholder="Describe the intended use or nature of the material" />
                  {errors.intendedUseNature && <p className="text-red-500 text-xs mt-1">{errors.intendedUseNature}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Handling Required? *</label>
                  <select name="specialHandlingRequired" value={formData.specialHandlingRequired} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.specialHandlingRequired && <p className="text-red-500 text-xs mt-1">{errors.specialHandlingRequired}</p>}
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
            {errors.sellerConfirmsOwnership && <p className="text-red-500 text-xs ml-7">{errors.sellerConfirmsOwnership}</p>}
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
            {errors.materialCompliesWithLaws && <p className="text-red-500 text-xs ml-7">{errors.materialCompliesWithLaws}</p>}
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
            {errors.buyerResponsibleForTransport && <p className="text-red-500 text-xs ml-7">{errors.buyerResponsibleForTransport}</p>}
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
            {errors.platformNotLiableForDisputes && <p className="text-red-500 text-xs ml-7">{errors.platformNotLiableForDisputes}</p>}
          </div>
        </div>

        {/* Auction Settings */}
        {formData.listingType === 'auction' && (
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
            </div>
          </div>
        )}

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
            isLoading={saving}
            disabled={saving || uploadingImages}
            className="w-full sm:w-auto"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditAuctionPage;

