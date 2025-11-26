import React from 'react';
import { X, Check, Eye } from 'lucide-react';

const ProductConfirmationModal = ({ 
  isOpen, 
  onClose, 
  message, 
  productId, 
  isEditMode = false 
}) => {
  const handleViewProduct = () => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    if (frontendUrl && productId) {
      window.open(`${frontendUrl}/product/${productId}`, '_blank');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-2xl">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-green-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Success!
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-md transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 mb-4 bg-green-600 rounded-full">
                <Check className="h-8 w-8 text-white" />
              </div>
              
              {/* Message */}
              <h4 className="text-lg font-semibold text-green-700 mb-2">
                Product {isEditMode ? 'Updated' : 'Created'} Successfully!
              </h4>
              
              <p className="text-sm text-gray-600 mb-6">
                {message || `Your product has been ${isEditMode ? 'updated' : 'added'} successfully and is now available.`}
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E2E8F0] bg-gray-100">
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-green-600 text-green-700 rounded-md hover:bg-green-600 hover:text-white transition-all duration-200 font-medium"
              >
                OK
              </button>
              
              {productId && (
                <button
                  type="button"
                  onClick={handleViewProduct}
                  className="px-6 py-2.5 bg-[#A0522D] text-white rounded-md hover:from-[#A0522D] hover:to-[#C87941] transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Product</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfirmationModal;