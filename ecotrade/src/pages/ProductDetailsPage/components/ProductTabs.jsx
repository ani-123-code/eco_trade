import React from 'react';

const ProductTabs = ({ product, activeTab, setActiveTab }) => {

  return (
    <div className="border-t border-gray-200">
      <div className="px-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('specifications')}
            className={`py-4 mr-8 font-medium text-sm transition-colors relative whitespace-nowrap ${
              activeTab === 'specifications' ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Specifications
            {activeTab === 'specifications' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('additionalInfo')}
            className={`py-4 mr-8 font-medium text-sm transition-colors relative whitespace-nowrap ${
              activeTab === 'additionalInfo' ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Additional Information
            {activeTab === 'additionalInfo' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
            )}
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="w-1/3 font-medium text-gray-900">{key}</span>
                  <span className="w-2/3 text-gray-600">{value}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No specifications available for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'additionalInfo' && (
          <div className="prose prose-sm max-w-none">
            <p>
              This certified refurbished {product.name} comes with a {(product.warranty && product.warranty) || '6 months'} warranty that covers hardware defects and functionality issues.
            </p>
            <p>
              For technical support or device assistance, please contact our customer service team at team@eco-dispose.com or call us at 88610 09443.
            </p>
            <h4>Certified Refurbished Device Care</h4>
            <ul>
              <li>Handle with care as certified refurbished devices may show minor cosmetic wear</li>
              <li>Clean the device with a soft, dry cloth and avoid harsh chemicals</li>
              <li>Keep the device away from extreme temperatures and moisture</li>
              <li>Follow manufacturer's guidelines for optimal battery performance</li>
              <li>Contact us immediately if you notice any functionality issues</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;