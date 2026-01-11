import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Upload } from 'lucide-react';
import { uploadSingleImage } from '../../../../../store/slices/uploadSlice';
import { fetchCollections } from '../../../../../store/slices/collectionSlice';
import FormField from './components/FormField';
import ImageManager from './components/ImageManager';
import FeatureManager from './components/FeatureManager';
import SpecificationManager from './components/SpecificationManager';
import {
  createNewType,
  updateExistingType,
  deleteType
} from '../../../../../store/slices/productSlice';

const ProductForm = ({ onClose, onSave, product, types }) => {
  const dispatch = useDispatch();
  const { uploading } = useSelector((state) => state.upload);
  const { collections } = useSelector((state) => state.collections);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price !== undefined ? product.price : '',
    discountPrice: product?.discountPrice || null,
    originalPrice: product?.originalPrice || '',
    collection: product?.collection?._id || product?.collection?.id || product?.collection || '',
    condition: product?.condition || 'Good',
    refurbishmentDetails: product?.refurbishmentDetails || 'Professionally refurbished and quality tested',
    warranty: product?.warranty || '',
    typeId: product?.type?._id || '',
    image: product?.image || '',
    images: product?.images || [],
    features: product?.features || [''],
    specifications: product?.specifications || {},
    stock: product?.stock !== undefined ? product.stock : '',
    featured: product?.featured || false,
    newArrival: product?.newArrival || false,
    bestSeller: product?.bestSeller || false,
  });

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const [errors, setErrors] = useState({});
  const [showNewType, setShowNewType] = useState(false);
  const [showManageTypes, setShowManageTypes] = useState(false);
  const [newTypeData, setNewTypeData] = useState({
    name: '',
    logo: ''
  });
  const [editingType, setEditingType] = useState(null);

  useEffect(() => {
    if (formData.discountPrice && formData.price) {
      if (parseFloat(formData.discountPrice) > parseFloat(formData.price)) {
        setErrors({
          ...errors,
          discountPrice: 'Discount price must be less than regular price'
        });
      } else {
        const newErrors = { ...errors };
        delete newErrors.discountPrice;
        setErrors(newErrors);
      }
    }
  }, [formData.discountPrice, formData.price]);

  const handleMainImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await dispatch(uploadSingleImage({ 
        file, 
        folder: 'products',
        key: 'mainImage'
      })).unwrap();
      setFormData({ ...formData, image: result.url });
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleNewTypeLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await dispatch(uploadSingleImage({ 
        file, 
        folder: 'types',
        key: 'typeLogo'
      })).unwrap();
      setNewTypeData({ ...newTypeData, logo: result.url });
    } catch (error) {
      alert('Failed to upload logo. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
      return;
    }
    if (name === 'typeId') {
      if (value === 'new') {
        setShowNewType(true);
        setFormData({ ...formData, typeId: 'new' });
      } else if (value === 'manage') {
        setShowManageTypes(true);
      } else {
        setShowNewType(false);
        setFormData({ ...formData, typeId: value });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleNewTypeChange = (e) => {
    const { name, value } = e.target;
    setNewTypeData({ ...newTypeData, [name]: value });
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setNewTypeData({ name: type.name, logo: type.logo || '' });
    setShowNewType(true);
  };

  const handleSaveType = () => {
    if (editingType) {
      dispatch(updateExistingType({ id: editingType.id, typeData: newTypeData }));
    } else {
      dispatch(createNewType(newTypeData));
    }
    resetTypeState();
  };

  const handleDeleteType = (id) => {
    if (window.confirm('Are you sure you want to delete this type?')) {
      dispatch(deleteType(id));
    }
  };


  const resetTypeState = () => {
    setShowNewType(false);
    setEditingType(null);
    setNewTypeData({ name: '', logo: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.discountPrice && formData.price && 
        parseFloat(formData.discountPrice) > parseFloat(formData.price)) {
      setErrors({ ...errors, discountPrice: 'Discount price must be less than or equal to regular price' });
      return;
    }
    if (!formData.image || !validateImageUrl(formData.image)) {
      setErrors({ ...errors, image: 'Valid main image URL is required' });
      return;
    }
    
    const cleanData = {
      ...formData,
      type: showNewType ? undefined : formData.typeId,
      features: formData.features.filter(f => f.trim()),
      images: formData.images.filter(img => img.trim()),
      discountPrice: formData.discountPrice || undefined,
    };

    if (!showNewType && formData.typeId && formData.typeId !== 'new') {
      cleanData.type = formData.typeId;
    }

    if (showNewType && newTypeData.name.trim()) {
      cleanData.newType = newTypeData;
    }
    
    onSave(cleanData);
  };
  
  const typeOptions = [
    { value: '', label: 'Select Brand' },
    ...types.map(type => ({ value: type.id, label: type.name })),
    { value: 'new', label: '+ Add New Brand' },
    { value: 'manage', label: '📝 Manage Brands' }
  ];

  const collectionOptions = [
    { value: '', label: 'Select Category' },
    ...collections
      .filter(col => col.isActive)
      .map(col => ({
        value: col.id || col._id,
        label: col.name
      }))
  ];

  const conditionOptions = [
    { value: 'Like New', label: 'Like New' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' }
  ];

  const mainImageUploading = uploading['mainImage'] || false;
  const typeLogoUploading = uploading['typeLogo'] || false;
  const isUploading = Object.values(uploading).some(Boolean);

  const validateImageUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <style>{`.product-form-scrollbar::-webkit-scrollbar{width:6px;}.product-form-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}.product-form-scrollbar{scrollbar-width:thin;scrollbar-color:#cbd5e1 #f7fafc;}`}</style>
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-10 sm:pb-20">
        <div className="inline-block w-full max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-5xl my-4 sm:my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-md sm:rounded-lg shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-[#E2E8F0] bg-gradient-to-r from-green-600 to-green-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-white">{product ? 'Edit Product' : 'Add New Product'}</h3>
                <button type="button" onClick={onClose} className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-all duration-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-2 sm:px-8 py-4 sm:py-6 max-h-[70vh] overflow-y-auto product-form-scrollbar text-xs sm:text-sm">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
                <FormField label="Product Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., iPhone 13 Pro Max 256GB" />
              </div>

              {/* Category and Brand Selection */}
              <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h4 className="text-base font-bold text-blue-900">Product Classification</h4>
                </div>
                <p className="text-sm text-blue-700 mb-4">Categorize your product to help customers find it easily</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="mb-2">
                      <FormField
                        label={
                          <span className="flex items-center text-sm font-semibold text-gray-800">
                            📱 Category
                          </span>
                        }
                        name="collection"
                        value={formData.collection}
                        onChange={handleChange}
                        type="select"
                        options={collectionOptions}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select product type: Smartphones, Laptops, Cameras, etc.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="mb-2">
                      <FormField
                        label={
                          <span className="flex items-center text-sm font-semibold text-gray-800">
                            🏷️ Brand/Manufacturer
                          </span>
                        }
                        name="typeId"
                        value={formData.typeId}
                        onChange={handleChange}
                        type="select"
                        options={typeOptions}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select brand: Apple, Samsung, Dell, HP, etc.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 p-4 bg-green-50 rounded-md border border-green-200">
                <FormField label="Condition" name="condition" value={formData.condition} onChange={handleChange} type="select" options={conditionOptions} required />
                <FormField label="Original Retail Price" name="originalPrice" value={formData.originalPrice} onChange={handleChange} type="number" min="0" step="0.01" placeholder="Original price before certification" className="text-xs sm:text-sm" />
              </div>

              <div className="mb-4 sm:mb-6">
                <FormField label="Refurbishment Details" name="refurbishmentDetails" value={formData.refurbishmentDetails} onChange={handleChange} type="textarea" rows={3} className="text-xs sm:text-sm" placeholder="Describe the certification process and quality checks" />
              </div>

              <FormField label="Description" name="description" value={formData.description} onChange={handleChange} type="textarea" rows={3} className="text-xs sm:text-sm mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <FormField label="Regular Price" name="price" value={formData.price} onChange={handleChange} type="number" min="0" step="0.01" required className="text-xs sm:text-sm" />
                <div>
                  <FormField label="Discount Price" name="discountPrice" value={formData.discountPrice || ''} onChange={handleChange} type="number" min="0" step="0.01" className="text-xs sm:text-sm" />
                  {errors.discountPrice && (<p className="text-red-500 text-xs mt-1">{errors.discountPrice}</p>)}
                </div>
                <FormField label="Stock" name="stock" value={formData.stock} onChange={handleChange} type="number" min="0" required className="text-xs sm:text-sm" />
                <FormField label="Warranty" name="warranty" value={formData.warranty} onChange={handleChange} placeholder="e.g., 2 Year" required />
              </div>

              {/* Brand Management Section */}
              {showManageTypes && (
                <div className="mb-6 p-4 sm:p-6 bg-white rounded-lg border-2 border-blue-300 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base sm:text-lg font-semibold text-blue-900 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 8a1 1 0 102 0 1 1 0 00-2 0zM2 12a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zM14 14a1 1 0 102 0 1 1 0 00-2 0z" />
                      </svg>
                      Manage Brands
                    </h4>
                    <button type="button" onClick={() => setShowManageTypes(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="max-h-60 overflow-y-auto product-form-scrollbar">
                    {types.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No brands added yet. Create your first brand below.</p>
                    ) : (
                      types.map(type => (
                        <div key={type.id} className="flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50">
                          <div className="flex items-center">
                            {type.logo && (
                              <img src={type.logo} alt={type.name} className="w-8 h-8 object-contain mr-3" />
                            )}
                            <span className="text-gray-800 text-sm font-medium">{type.name}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button type="button" onClick={() => { handleEditType(type); setShowManageTypes(false); }} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button type="button" onClick={() => handleDeleteType(type.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4">
                    <button type="button" onClick={() => { setEditingType(null); setShowNewType(true); setShowManageTypes(false); }} className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium">+ Add New Brand</button>
                  </div>
                </div>
              )}
              {showNewType && (
                <div className="mb-6 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-bold text-blue-900 flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      {editingType ? 'Edit Brand' : 'Create New Brand'}
                    </h4>
                    <button type="button" onClick={resetTypeState} className="text-sm text-red-600 hover:underline font-medium">Cancel</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField label="Brand Name" name="name" value={newTypeData.name} onChange={handleNewTypeChange} required placeholder="e.g., Apple, Samsung, Dell" className="text-sm" />
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Brand Logo URL <span className="text-blue-600 text-xs">(optional)</span></label>
                      <input type="url" name="logo" value={newTypeData.logo} onChange={handleNewTypeChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400 mb-3 text-sm" placeholder="https://example.com/logo.jpg" />
                      <div className="flex items-center justify-between mb-3">
                        <label className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md transition-all duration-200 text-sm cursor-pointer font-medium ${typeLogoUploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`} disabled={typeLogoUploading}><input type="file" accept="image/*" onChange={handleNewTypeLogoUpload} disabled={typeLogoUploading} className="hidden" />{typeLogoUploading ? (<><svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Uploading...</>) : (<><Upload className="h-4 w-4 mr-2" />Or Upload Brand Logo</>)}</label>
                        {newTypeData.logo && (<span className="text-xs text-blue-600 font-medium">✓ Logo added</span>)}
                      </div>
                      {newTypeData.logo && (
                        <div className="w-24 h-24 rounded-md overflow-hidden border-2 border-blue-200 shadow-sm bg-white p-2">
                          <img src={newTypeData.logo} alt="Brand logo preview" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                          <div className="hidden w-full h-full bg-gray-100 items-center justify-center text-xs text-gray-500">Invalid Image</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                    {editingType && (<button type="button" onClick={() => handleDeleteType(editingType.id)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 text-sm font-medium">Delete Brand</button>)}
                    <button type="button" onClick={handleSaveType} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium">{editingType ? 'Update Brand' : 'Create Brand'}</button>
                  </div>
                </div>
              )}

              {/* Main Image Upload */}
              <div className="mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-green-700 mb-1 sm:mb-2">Main Image <span className="text-emerald-600">*</span></label>
                  <input type="url" name="image" value={formData.image} onChange={handleChange} className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700 placeholder-gray-400 mb-2 sm:mb-3 text-xs sm:text-sm" placeholder="https://example.com/image.jpg" required />
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <label className={`flex items-center px-2 sm:px-4 py-2 bg-green-600 text-white rounded-md transition-all duration-200 text-xs sm:text-sm cursor-pointer ${mainImageUploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`} disabled={mainImageUploading}><input type="file" accept="image/*" onChange={handleMainImageUpload} disabled={mainImageUploading} className="hidden" />{mainImageUploading ? (<><svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Uploading...</>) : (<><Upload className="h-4 w-4 mr-2" />Or Upload Main Image</>)}</label>
                    {formData.image && (<span className="text-xs text-green-600 font-medium">✓ Image added</span>)}
                  </div>
                  {formData.image && (<div className="w-20 h-20 sm:w-32 sm:h-32 rounded-md overflow-hidden border-2 border-[#E2E8F0] shadow-sm"><img src={formData.image} alt="Main product preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} /><div className="hidden w-full h-full bg-gray-100 items-center justify-center text-xs text-gray-500">Invalid Image</div></div>)}
                </div>
              </div>
              <ImageManager images={formData.images} onChange={(images) => setFormData({ ...formData, images })} />
              <FeatureManager features={formData.features} onChange={(features) => setFormData({ ...formData, features })} />
              <SpecificationManager specifications={formData.specifications} onChange={(specifications) => setFormData({ ...formData, specifications })} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-[#F7FAFC] to-[#EDF2F7] rounded-md border border-[#E2E8F0]"><input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 focus:ring-green-600 border-emerald-500 rounded-md" /><label htmlFor="featured" className="ml-2 sm:ml-3 block text-xs sm:text-sm font-medium text-green-700">Featured Product</label></div>
                <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-[#F7FAFC] to-[#EDF2F7] rounded-md border border-[#E2E8F0]"><input type="checkbox" id="newArrival" name="newArrival" checked={formData.newArrival} onChange={handleChange} className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 focus:ring-green-600 border-emerald-500 rounded-md" /><label htmlFor="newArrival" className="ml-2 sm:ml-3 block text-xs sm:text-sm font-medium text-green-700">New Arrival</label></div>
                <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-[#F7FAFC] to-[#EDF2F7] rounded-md border border-[#E2E8F0]"><input type="checkbox" id="bestSeller" name="bestSeller" checked={formData.bestSeller} onChange={handleChange} className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 focus:ring-green-600 border-emerald-500 rounded-md" /><label htmlFor="bestSeller" className="ml-2 sm:ml-3 block text-xs sm:text-sm font-medium text-green-700">Best Seller</label></div>
              </div>
            </div>
            <div className="px-2 sm:px-8 py-4 sm:py-6 border-t border-[#E2E8F0] bg-gradient-to-r from-[#F7FAFC] to-[#EDF2F7] flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 border border-emerald-500 text-emerald-600 rounded-md hover:bg-emerald-500 hover:text-white transition-all duration-200 font-medium text-xs sm:text-sm">Cancel</button>
              <button type="submit" disabled={isUploading || Object.keys(errors).length > 0} className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-[#1A365D] hover:to-[#2A4365] transition-all duration-200 font-medium shadow-lg disabled:opacity-50 text-xs sm:text-sm">{isUploading ? 'Processing...' : (product ? 'Update Product' : 'Add Product')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;