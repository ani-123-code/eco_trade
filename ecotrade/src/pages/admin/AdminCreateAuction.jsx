import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/AdminAPI';
import { uploadAPI } from '../../api/uploadAPI';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Upload, Package, DollarSign, Calendar, MapPin, FileText, Image as ImageIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';

const AdminCreateAuction = () => {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [formData, setFormData] = useState({
    // Material fields
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
    // Auction fields
    sellerId: '',
    startingPrice: '',
    auctionEndTime: '',
    isVerified: true
  });
  const [errors, setErrors] = useState({});
  const [showBidForm, setShowBidForm] = useState(false);
  const [createdAuction, setCreatedAuction] = useState(null);
  const [bidData, setBidData] = useState({
    bidderId: '',
    amount: '',
    timestamp: ''
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await adminAPI.getUsers();
      // Include admin in sellers if they want to create auction for themselves
      const sellersList = users.filter(u => (u.userType === 'seller' && u.isVerified) || u.role === 'admin');
      // Include admin and all verified buyers in bidders list
      const buyersList = users.filter(u => (u.userType === 'buyer' && u.isVerified) || u.role === 'admin');
      setSellers(sellersList);
      setBuyers(buyersList);
    } catch (error) {
      showError('Failed to fetch users');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
        [name]: value
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

  const handleImageAdd = (e) => {
    const url = e.target.value;
    if (url && !formData.images.includes(url)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      showError('Maximum 10 images allowed');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      showError('Please upload only image files (JPEG, PNG, WebP, GIF)');
      return;
    }

    // Validate file sizes (max 5MB per file)
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
      // Reset file input
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
    if (!formData.location.city) newErrors['location.city'] = 'City is required';
    if (!formData.location.state) newErrors['location.state'] = 'State is required';
    if (!formData.location.pincode) newErrors['location.pincode'] = 'Pincode is required';
    if (!formData.sellerId) newErrors.sellerId = 'Seller is required';
    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) {
      newErrors.startingPrice = 'Valid starting price is required';
    }
    if (!formData.auctionEndTime) {
      newErrors.auctionEndTime = 'Auction end time is required';
    } else if (new Date(formData.auctionEndTime) <= new Date()) {
      newErrors.auctionEndTime = 'Auction end time must be in the future';
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
      const auctionData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: null,
        specifications: {}
      };

      const result = await adminAPI.createAuction(auctionData);
      if (result.success) {
        showSuccess('Auction created successfully!');
        setCreatedAuction(result.data);
        setShowBidForm(true);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBid = async () => {
    if (!bidData.bidderId || !bidData.amount || parseFloat(bidData.amount) <= 0) {
      showError('Please select a bidder and enter a valid bid amount');
      return;
    }

    try {
      const result = await adminAPI.createBid(
        createdAuction.auction._id,
        bidData.bidderId,
        parseFloat(bidData.amount),
        bidData.timestamp || undefined,
        'active'
      );
      if (result.success) {
        showSuccess('Bid added successfully!');
        setBidData({
          bidderId: '',
          amount: '',
          timestamp: ''
        });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add bid');
    }
  };

  const handleReset = () => {
    setFormData({
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
      sellerId: '',
      startingPrice: '',
      auctionEndTime: '',
      isVerified: true
    });
    setCreatedAuction(null);
    setShowBidForm(false);
    setBidData({
      bidderId: '',
      amount: '',
      timestamp: ''
    });
    setErrors({});
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create New Auction</h1>
        <p className="text-gray-600">Create auctions and add bids directly from admin panel</p>
      </div>

      {!createdAuction ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Material Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Material Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  >
                    <option value="ewaste">E-Waste</option>
                    <option value="fmgc">FMGC</option>
                    <option value="metal">Metal</option>
                    <option value="plastics">Plastics</option>
                    <option value="paper">Paper</option>
                    <option value="textile">Textile</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
                <div>
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ton">Ton</option>
                    <option value="piece">Piece</option>
                    <option value="unit">Unit</option>
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
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Provide a detailed description of what you're selling. Include:\n- Item specifications and details\n- Condition and quality\n- Quantity breakdown\n- Any special features or requirements\n- Delivery terms (if applicable)\n\nThis description will be visible to all buyers in the auction listing."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A detailed description helps buyers make informed decisions. Include all relevant information about your listing.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
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
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages || formData.images.length >= 10}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center ${uploadingImages || formData.images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading images...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload images or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, WebP up to 5MB each (Max 10 images)
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or Add Image URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Enter image URL and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (formData.images.length >= 10) {
                            showError('Maximum 10 images allowed');
                            return;
                          }
                          handleImageAdd(e);
                        }
                      }}
                      fullWidth
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling?.querySelector('input');
                        if (input && input.value && formData.images.length < 10) {
                          handleImageAdd({ target: input });
                        } else if (formData.images.length >= 10) {
                          showError('Maximum 10 images allowed');
                        }
                      }}
                      disabled={formData.images.length >= 10}
                    >
                      Add URL
                    </Button>
                  </div>
                </div>

                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Material ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
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

                {formData.images.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No images added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Auction Settings */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Auction Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller *</label>
                  <select
                    name="sellerId"
                    value={formData.sellerId}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm ${errors.sellerId ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  >
                    <option value="">Select a seller...</option>
                    {sellers.map(seller => (
                      <option key={seller._id} value={seller._id}>
                        {seller.name} ({seller.email}) {seller.role === 'admin' ? '(Admin)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.sellerId && <p className="text-red-500 text-xs mt-1">{errors.sellerId}</p>}
                </div>
                <div>
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
                </div>
                <div>
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
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Auto-verify material (recommended)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Auction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset Form
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h3 className="font-semibold text-green-800 mb-2">Auction Created Successfully!</h3>
            <p className="text-green-700 text-sm">
              Auction ID: {createdAuction.auction._id}
            </p>
            <p className="text-green-700 text-sm">
              Material: {createdAuction.material.name}
            </p>
          </div>

          {/* Add Bids Section */}
          {showBidForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Add Bids to Auction
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bidder *</label>
                    <select
                      value={bidData.bidderId}
                      onChange={(e) => setBidData({...bidData, bidderId: e.target.value})}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select a bidder...</option>
                      {buyers.map(buyer => (
                        <option key={buyer._id} value={buyer._id}>
                          {buyer.name} ({buyer.email}) {buyer.role === 'admin' ? '(Admin)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      label="Bid Amount (₹) *"
                      type="number"
                      value={bidData.amount}
                      onChange={(e) => setBidData({...bidData, amount: e.target.value})}
                      placeholder="Enter bid amount"
                      min={formData.startingPrice}
                      step="0.01"
                      fullWidth
                    />
                  </div>
                  <div>
                    <Input
                      label="Bid Date & Time (Optional)"
                      type="datetime-local"
                      value={bidData.timestamp}
                      onChange={(e) => setBidData({...bidData, timestamp: e.target.value})}
                      fullWidth
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddBid}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Bid
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBidForm(false);
                      handleReset();
                    }}
                  >
                    Finish
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin')}
                  >
                    Go to Auctions
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCreateAuction;

