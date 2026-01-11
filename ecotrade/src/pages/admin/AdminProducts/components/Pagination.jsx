import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  // Return null if there's nothing to paginate
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper function to get visible pages for desktop
  const getDesktopVisiblePages = () => {
    // FIX: Guard against totalPages being undefined or 0
    if (!totalPages) return [];

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    range.push(1); // Always show the first page

    if (currentPage > delta + 2) {
      rangeWithDots.push(1, '...');
    } else {
      for (let i = 2; i < currentPage - delta; i++) {
          if (i > 1) range.push(i);
      }
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }
    
    if (currentPage < totalPages - delta - 1) {
        rangeWithDots.push('...', totalPages);
    } else {
        for (let i = currentPage + delta + 1; i < totalPages; i++) {
             range.push(i);
        }
    }
    
    if (totalPages > 1) {
        range.push(totalPages);
    }

    // This logic ensures that we don't have duplicate page numbers
    const uniquePages = [...new Set(range)]; 
    let lastPage = 0;
    for (const page of uniquePages) {
        if (lastPage) {
            if (page - lastPage === 2) {
                rangeWithDots.push(lastPage + 1);
            } else if (page - lastPage !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(page);
        lastPage = page;
    }

    return rangeWithDots;
  };
  
  const desktopPages = getDesktopVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-y-4">
      <div className="text-sm text-gray-700">
        {/* Showing <span className="font-medium">{indexOfFirstItem}</span> to{' '} */}
        {/* <span className="font-medium">{indexOfLastItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results */}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {/* FIX: Check if desktopPages exists before mapping */}
        {desktopPages && desktopPages.map((page, index) => (
          page === '...' ? (
            <span key={index} className="px-3 py-2 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;