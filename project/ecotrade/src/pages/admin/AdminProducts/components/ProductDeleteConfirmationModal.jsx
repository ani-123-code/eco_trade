import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const ProductDeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  productName = 'this product'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-2xl">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-red-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Confirm Deletion
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
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 mb-4 bg-red-600 rounded-full">
                <Trash2 className="h-8 w-8 text-white" />
              </div>
              
              {/* Message */}
              <h4 className="text-lg font-semibold text-[#DC2626] mb-2">
                Delete Product?
              </h4>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{productName}"</span>? 
                This action cannot be undone and the product will be permanently removed from your inventory.
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-2.5 bg-red-600 text-white rounded-md hover:from-[#B91C1C] hover:to-[#DC2626] transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDeleteConfirmationModal;