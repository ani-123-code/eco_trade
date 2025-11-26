import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, Package, Award, ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCollections } from "../../../store/slices/collectionSlice";
import { fetchCollections as fetchCollectionsWithTypes } from "../../../store/slices/productSlice";

const CollectionCards = () => {
  const dispatch = useDispatch();
  const { collections } = useSelector((state) => state.collections);
  const { collections: collectionsWithTypes } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCollections({ includeInactive: false }));
    dispatch(fetchCollectionsWithTypes());
  }, [dispatch]);

  // Comprehensive safety checks to prevent React child errors
  if (!collections || !Array.isArray(collections) || collections.length === 0) {
    return null;
  }

  // Safely process collections with extensive validation
  const displayCollections = collections
    .slice(0, 8) // Show more collections in horizontal scroll
    .map((collection, index) => {
      // Ensure collection is a valid object with required properties
      if (!collection || typeof collection !== 'object') {
        console.warn('Invalid collection object:', collection);
        return null;
      }

      // Safely extract collection properties as strings only
      const collectionId = collection._id ? String(collection._id) : (collection.id ? String(collection.id) : '');
      const collectionName = collection.name ? String(collection.name) : '';
      const collectionSlug = collection.slug ? String(collection.slug) : collectionName.toLowerCase().replace(/\s+/g, '-');
      const collectionImage = collection.image ? String(collection.image) : "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg";

      // Skip if essential data is missing
      if (!collectionId || !collectionName) {
        console.warn('Missing essential collection data:', { collectionId, collectionName });
        return null;
      }

      // Safely find matching collection with types
      const collectionWithTypes = Array.isArray(collectionsWithTypes)
        ? collectionsWithTypes.find(c => {
            if (!c || typeof c !== 'object') return false;
            const cId = c._id ? String(c._id) : (c.id ? String(c.id) : '');
            const cName = c.name ? String(c.name) : '';
            return cId === collectionId || cName === collectionName;
          })
        : null;

      // Safely extract types with validation - ensure only strings are used
      const types = [];
      if (collectionWithTypes && Array.isArray(collectionWithTypes.types)) {
        collectionWithTypes.types.slice(0, 2).forEach(type => {
          if (type && typeof type === 'object' && type.name) {
            const typeName = String(type.name);
            if (typeName) {
              types.push(typeName);
            }
          }
        });
      }

      // Get product count from the collection
      const productCount = collection.productCount || 0;

      return {
        id: collectionId,
        title: collectionName,
        imageUrl: collectionImage,
        exploreUrl: `/products/${collectionSlug}`,
        types: types,
        productCount: productCount
      };
    })
    .filter(Boolean); // Remove null entries

  // Don't render if no valid collections
  if (displayCollections.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Discover our premium certified refurbished electronics across different categories
          </p>

          {/* Trust Signals - Compact Design */}
          <div className="flex justify-center items-center gap-8 max-w-4xl mx-auto mt-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 text-sm">Warranty Protected</h4>
                <p className="text-xs text-gray-600">Comprehensive coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 text-sm">Quality Certified</h4>
                <p className="text-xs text-gray-600">Expert tested</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 text-sm">Secure Packaging</h4>
                <p className="text-xs text-gray-600">Safe delivery</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Horizontal Scrolling Collection Cards */}
        <div className="relative">
          {/* Scroll Container */}
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-6 min-w-max px-2">
              {displayCollections.map((collection, index) => (
                <div
                  key={collection.id}
                  className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-green-200"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={collection.imageUrl}
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Certified Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      <Shield className="w-3 h-3" />
                      CERTIFIED
                    </div>

                    {/* Product Count */}
                    {collection.productCount > 0 && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {collection.productCount} Products
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                      {collection.title}
                    </h3>
                    
                    {/* Top Brands */}
                    {collection.types && Array.isArray(collection.types) && collection.types.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Top Brands</p>
                        <div className="flex flex-wrap gap-2">
                          {collection.types.map((type, typeIndex) => (
                            <span
                              key={`${collection.id}-type-${typeIndex}`}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-green-100 hover:text-green-700 transition-colors"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explore Button */}
                    <Link
                      to={collection.exploreUrl}
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-emerald-700 transition-all duration-200 group/btn"
                    >
                      Explore {collection.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* View All Card */}
              <div className="flex-shrink-0 w-80 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-green-500">
                <div className="h-full flex flex-col justify-center items-center p-8 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Explore All</h3>
                  <p className="text-green-100 mb-6 text-sm">
                    Browse our complete collection of certified refurbished electronics
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center bg-white text-green-700 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors group/btn"
                  >
                    View All Products
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="w-8 h-1 bg-green-200 rounded-full"></div>
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <span className="text-xs text-gray-500 ml-3">Scroll to explore more →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionCards;