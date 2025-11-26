import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Upload } from 'lucide-react';
import { uploadMultipleImages } from '../../../../../../store/slices/uploadSlice';

const ImageManager = ({ images, onChange }) => {
  const dispatch = useDispatch();
  const { uploadingMultiple, multipleUploadProgress } = useSelector((state) => state.upload);
  
  const [newImage, setNewImage] = useState('');

  const addImage = () => {
    if (newImage.trim()) {
      onChange([...images, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const updateImage = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    onChange(newImages);
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      const result = await dispatch(uploadMultipleImages({ 
        files, 
        folder: 'products' 
      })).unwrap();
      
      onChange([...images, ...result.urls]);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  // Calculate overall upload progress for multiple files
  const getOverallProgress = () => {
    const progressValues = Object.values(multipleUploadProgress);
    if (progressValues.length === 0) return 0;
    const totalProgress = progressValues.reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / progressValues.length);
  };

  const isUploading = uploadingMultiple;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-green-700 mb-1">
        Additional Images
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Add multiple images for your product. You can upload files or add image URLs.
      </p>
      
      <div className="mb-4">
        <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 text-sm cursor-pointer disabled:opacity-50">
          {isUploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>
      
      <div className="space-y-3">
        {images.filter(img => img.trim()).map((image, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-1 flex items-center space-x-3">
              <div className="w-12 h-12 rounded-md overflow-hidden border border-[#E2E8F0] flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-100 items-center justify-center text-xs text-gray-500">
                  Error
                </div>
              </div>
              <input
                type="url"
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700 placeholder-gray-400"
                disabled={isUploading}
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              disabled={isUploading}
              className="p-2 text-emerald-600 hover:text-[#A0522D] hover:bg-[#FEF5E7] rounded-md transition-all duration-200 mt-3 flex-shrink-0 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
        
        <div className="flex items-center space-x-3">
          <input
            type="url"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="Add image URL manually"
            className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 text-green-700 placeholder-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={addImage}
            disabled={isUploading || !newImage.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Upload Status Messages */}
      {isUploading && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              <span className="text-sm text-green-700">
                Uploading images... {getOverallProgress()}%
              </span>
            </div>
            <span className="text-xs text-green-600 font-medium">
              {getOverallProgress()}%
            </span>
          </div>
          {/* Progress bar in the status message */}
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Loading Bar */}
      {isUploading && (
        <div className="fixed left-0 bottom-0 w-full z-50 bg-white shadow-lg border-t">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-spin  mr-3"></div>
              <span className="text-sm text-gray-700 font-medium">
                Uploading {Object.keys(multipleUploadProgress).length} image(s)...
              </span>
            </div>
            <span className="text-sm text-green-600 font-semibold">
              {getOverallProgress()}%
            </span>
          </div>
          <div className="h-1 bg-gray-200">
            <div 
              className="h-1 bg-gradient-to-r from-green-900 to-green-950 transition-all duration-500 ease-out"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;