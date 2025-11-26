import React from 'react';

const ProductImages = ({ product, activeImage, setActiveImage }) => {
  const getProductImages = () => {
      const images = [];

  // Always push the main image first
  if (product.image) {
    images.push(product.image);
  }

  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (img !== product.image) {
        images.push(img);
      }
    });

     }

  return images;
  };

  const productImages = getProductImages();

  return (
    <div className="p-6">
      <div className="relative mb-4 aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={productImages[activeImage] || product.image}
          alt={product.name}
          className={`w-full h-full object-contain p-4 ${product.stock === 0 ? 'opacity-50' : ''}`}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-red-600 text-white px-8 py-4 text-xl font-bold rounded-md transform -rotate-12 shadow-lg">
              SOLD OUT
            </div>
          </div>
        )}
        {product.stock > 0 && product.discountPrice && product.discountPrice < product.price &&
         Math.round(((product.price - product.discountPrice) / product.price) * 100) > 0 && (
          <div className="absolute left-4 top-4 z-10 bg-red-500 px-3 py-1 text-sm font-semibold text-white">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}
        {product.stock > 0 && product.newArrival && (
          <div className="absolute right-4 top-4 z-10 bg-green-600 px-3 py-1 text-sm font-semibold text-white">
            NEW
          </div>
        )}
      </div>
      
      {productImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden ${
                activeImage === index ? 'border-green-600' : 'border-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`${product.name} - view ${index + 1}`}
                className={`w-full h-full object-contain p-1 ${product.stock === 0 ? 'opacity-50' : ''}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;