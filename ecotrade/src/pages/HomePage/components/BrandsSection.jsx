import React from 'react';
import { Link } from 'react-router-dom';

const BrandsSection = ({ types }) => {
  // Add comprehensive safety checks to prevent React child errors
  if (!types || !Array.isArray(types) || types.length === 0) {
    return null;
  }

  // Filter and validate types to ensure they have required properties
  const validTypes = types.filter(type => {
    if (!type || typeof type !== 'object') {
      console.warn('Invalid type object:', type);
      return false;
    }
    
    // Ensure we have essential data as stringsa
    const typeId = type._id ? String(type._id) : (type.id ? String(type.id) : '');
    const typeName = type.name ? String(type.name) : '';
    
    if (!typeId || !typeName) {
      console.warn('Missing essential type data:', { typeId, typeName });
      return false;
    }
    
    return true;
  });

  // Don't render if no valid types
  if (validTypes.length === 0) {
    return null;
  }

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Brands background"
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Shop by Brand</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Browse certified refurbished products from your favorite trusted brands
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {validTypes.map((type, index) => {
            // Safely extract type properties as strings
            const typeId = type._id ? String(type._id) : (type.id ? String(type.id) : '');
            const typeName = type.name ? String(type.name) : '';
            const typeLogo = type.logo && typeof type.logo === 'string' ? String(type.logo) : null;

            return (
              <Link
                key={`brand-${typeId}-${index}`}
                to={`/products?types=${encodeURIComponent(typeName)}`}
                className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center transition-all hover:shadow-lg hover:-translate-y-1 group"
              >
                <div className="text-center w-full">
                  {typeLogo ? (
                    <div className="w-full h-20 mx-auto mb-3 flex items-center justify-center">
                      <img
                        src={typeLogo}
                        alt={`${typeName} logo`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden w-16 h-16 bg-gray-100 rounded-full items-center justify-center group-hover:bg-green-50 transition-colors">
                        <span className="text-2xl font-bold text-green-700">
                          {typeName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors">
                      <span className="text-2xl font-bold text-green-700">
                        {typeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors block">
                    {typeName}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;