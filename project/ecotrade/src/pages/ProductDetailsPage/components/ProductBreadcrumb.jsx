import React from 'react';
import { Link } from 'react-router-dom';

const ProductBreadcrumb = ({ product, collectionName }) => {
  // Safely extract collection name as string with comprehensive validation
  let safeCollectionName = 'Unknown';
  
  if (typeof collectionName === 'string' && collectionName.trim()) {
    safeCollectionName = collectionName.trim();
  } else if (collectionName && typeof collectionName === 'object') {
    if (collectionName.name && typeof collectionName.name === 'string') {
      safeCollectionName = String(collectionName.name).trim();
    }
  } else if (product && product.collection) {
    if (typeof product.collection === 'string' && product.collection.trim()) {
      safeCollectionName = product.collection.trim();
    } else if (typeof product.collection === 'object' && product.collection.name) {
      safeCollectionName = String(product.collection.name).trim();
    }
  }

  // Safely extract product name
  const productName = product && product.name ? String(product.name) : 'Product';

  return (
    <nav className="py-4">
      <ol className="flex text-sm overflow-x-auto whitespace-nowrap">
        <li className="flex items-center">
          <Link to="/" className="text-gray-500 hover:text-green-700">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>
        <li className="flex items-center">
          <Link to="/products" className="text-gray-500 hover:text-green-700">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
        </li>
        {safeCollectionName && safeCollectionName !== 'Unknown' && (
          <li className="flex items-center">
            <Link
              to={`/products/${safeCollectionName.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-gray-500 hover:text-green-700"
            >
              {safeCollectionName}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
        )}
        <li className="text-gray-900 font-medium">{productName}</li>
      </ol>
    </nav>
  );
};

export default ProductBreadcrumb;