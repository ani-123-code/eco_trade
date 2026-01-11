import React from 'react';
import { CreditCard as Edit, Trash2, ExternalLink } from 'lucide-react';
import DriveImage from '../../../../utils/DriveImage';

const ProductsTable = ({ products, onEdit, onDelete, onProductClick }) => {
  return (
    <div className="min-w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
               <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Collection 
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <ProductTableRow
                key={product._id || product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                onProductClick={onProductClick}
                isDesktop={true}
              />
            ))}
            
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No products found. Try a different search or add a new product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onProductClick={onProductClick}
          />
        ))}
        
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found. Try a different search or add a new product.
          </div>
        )}
      </div>
    </div>
  );
};

const ProductTableRow = ({ product, onEdit, onDelete, onProductClick, isDesktop }) => {
  const handleRowClick = (e) => {
    // Don't trigger navigation if clicking on action buttons
    if (e.target.closest('button')) return;
    onProductClick(product._id || product.id);
  };

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleRowClick}
    >
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 lg:h-12 lg:w-12 flex-shrink-0">
            <img
  src={product.image}
  alt={product.name}
  className="h-10 w-10 lg:h-12 lg:w-12 object-cover rounded"
  onError={(e) => {
    // e.target.src = fallbackImage; // Use local fallback
    e.target.onerror = null; // Prevent infinite loop
  }}
/>
          </div>
          <div className="ml-3 lg:ml-4">
            <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs lg:max-w-sm">
              {product.name}
            </div>
            <div className="text-xs lg:text-sm text-gray-500 truncate max-w-xs">
              {typeof product.type === 'object' ? product.type?.name : product.type}
            </div>
          </div>
        </div>
      </td>
     <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="max-w-24 lg:max-w-32 truncate">
          {typeof product.collection === 'object' ? product.collection?.name : product.collection || 'N/A'}
        </div>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        {product.discountPrice ? (
          <div className="text-sm">
            <span className="font-medium text-gray-600">₹{product.discountPrice.toFixed(2)}</span>
            <span className="text-gray-500 line-through ml-1 text-xs">₹{product.price.toFixed(2)}</span>
          </div>
        ) : (
          <span className="text-sm font-medium">₹{product.price.toFixed(2)}</span>
        )}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {product.stock}
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            product.stock > 5
              ? 'bg-green-100 text-green-800'
              : product.stock > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
        </span>
      </td>
      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product._id || product.id);
            }}
            className="text-green-600 hover:text-blue-800 p-1"
            title="View Product"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="text-green-700 hover:text-emerald-600 p-1"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // FIXED: Pass the entire product object instead of just the ID
              onDelete(product);
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ProductCard = ({ product, onEdit, onDelete, onProductClick }) => {
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    onProductClick(product._id || product.id);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="h-16 w-16 flex-shrink-0">
          <DriveImage
            src={product.image}
            alt={product.name}
            className="h-16 w-16 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {typeof product.type === 'object' ? product.type?.name : product.type}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {typeof product.collection === 'object' ? product.collection?.name : product.collection || 'N/A'}
          </p>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Price:</span>
          <div className="font-medium">
            {product.discountPrice ? (
              <>
                <span className="text-green-600">₹{product.discountPrice.toFixed(2)}</span>
                <span className="text-gray-500 line-through ml-1 text-xs">₹{product.price.toFixed(2)}</span>
              </>
            ) : (
              <span>₹{product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Stock:</span>
          <div className="font-medium">{product.stock}</div>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            product.stock > 5
              ? 'bg-green-100 text-green-800'
              : product.stock > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
        </span>
        
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product._id || product.id);
            }}
            className="text-green-600 hover:text-blue-800 p-1"
            title="View Product"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="text-green-700 hover:text-emerald-600 p-1"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product);
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;