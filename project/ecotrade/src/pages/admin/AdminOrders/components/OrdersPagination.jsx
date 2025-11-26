import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OrdersPagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper function to get visible pages for mobile
  const getMobileVisiblePages = () => {
    const pages = [];
    const showPages = Math.min(3, totalPages);
    
    if (currentPage <= 2) {
      for (let i = 1; i <= showPages; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 1) {
      for (let i = Math.max(1, totalPages - showPages + 1); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(currentPage - 1, currentPage, currentPage + 1);
    }
    
    return pages;
  };

  // Helper function to get visible pages for desktop
  const getDesktopVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  };

  const mobilePages = totalPages > 1 ? getMobileVisiblePages() : [];
  const desktopPages = totalPages > 1 ? getDesktopVisiblePages() : [];

  return (
    <div className="flex flex-col space-y-3 sm:space-y-4">
      {/* Info Text */}
      <div className="text-xs sm:text-sm text-gray-700 text-center">
        Showing <span className="font-medium">{indexOfFirstItem}</span> to{' '}
         <span className="font-medium">{indexOfLastItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> orders
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-1">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-1">Prev</span>
          </button>
          
          {/* Mobile Page Numbers */}
          <div className="flex sm:hidden space-x-1">
            {mobilePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`inline-flex items-center px-2 py-1 border rounded-md text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          {/* Desktop Page Numbers */}
          <div className="hidden sm:flex space-x-1">
            {desktopPages.map((page, index) => (
              page === '...' ? (
                <span key={index} className="inline-flex items-center px-2 py-2 text-sm text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPagination;
