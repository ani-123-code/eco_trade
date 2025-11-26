import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Search, Circle as HelpCircle, MessageCircle, Phone } from 'lucide-react';
import {faqData} from '../../data/faqData'; 
import Button from '../ui/Button';

const FAQModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState(null); // Only one item can be expanded

  // Filter FAQs based on search only
  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle expanded state - only one at a time
  const toggleExpanded = (id) => {
    setExpandedItem(prev => prev === id ? null : id);
  };

  // Close modal on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Reset expanded item when search changes
  useEffect(() => {
    setExpandedItem(null);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                <p className="text-gray-200">Find answers to common questions about our products and services</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search Only */}
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredFAQs.length} of {faqData.length} FAQs
            </p>
          )}
        </div>

        {/* FAQ Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'No FAQs available at the moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFAQs.map(faq => (
                  <div 
                    key={faq.id} 
                    className={`border border-gray-200 rounded-md overflow-hidden transition-all duration-200  cursor-pointer ${
                      expandedItem === faq.id ? 'ring-2 ring-green-600 ring-opacity-20' : ''
                    }`}
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    {/* Question */}
                    <div className={`p-4 transition-colors duration-200 ${
                      expandedItem === faq.id 
                        ? 'bg-green-600 text-white' 
                        : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold pr-4">{faq.question}</h3>
                        <div className="flex-shrink-0">
                          {expandedItem === faq.id ? (
                            <ChevronUp className="h-5 w-5 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Answer with animation */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedItem === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
                </div>
            {/* Footer - Animated from bottom */}
            <div 
              className={`bg-gray-50 p-6 border-t border-gray-200 mt-6 transition-all duration-1000 ease-out ${
                filteredFAQs.length > 0 
                  ? 'transform translate-y-0 opacity-100' 
                  : 'transform translate-y-full opacity-0'
              }`}
            >
              <div className="text-center">
                <p className="text-gray-600 mb-4">Still have questions? We're here to help!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<MessageCircle className="h-4 w-4" />}
                    onClick={() => {
                      const whatsappNumber = '+918008030203';
                      const message = 'Hello! I have a question about Reeown refurbished electronics that\'s not covered in your FAQ section.';
                      const encodedMessage = encodeURIComponent(message);
                      window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`, '_blank');
                    }}
                  >
                    Chat on WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Phone className="h-4 w-4" />}
                    onClick={() => window.open('tel:+918008030203')}
                  >
                    Call 8008030203
                  </Button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;