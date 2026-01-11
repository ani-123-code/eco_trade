import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { materialAPI } from '../api/materialAPI';
import { useAuth } from '../contexts/AuthContext';
import { Package, MapPin, Eye, Gavel, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MaterialsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchMaterials();
  }, [category, page]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, listingType: 'auction' }; // Only auctions
      if (category) params.category = category;
      if (searchTerm) params.search = searchTerm;
      
      const result = await materialAPI.getAll(params);
      if (result.success) {
        // Filter out machines and softwares on frontend as well
        const filtered = result.data.filter(m => 
          m.category !== 'software' && m.category !== 'machines' && m.listingType === 'auction'
        );
        setMaterials(filtered);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchTerm) {
        prev.set('search', searchTerm);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
    fetchMaterials();
  };

  const updateFilter = (key, value) => {
    setSearchParams(prev => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  // Materials page only shows regular material categories
  const categories = [
    { value: 'ewaste', label: 'E-Waste' },
    { value: 'fmgc', label: 'FMGC' },
    { value: 'metal', label: 'Metal' },
    { value: 'plastics', label: 'Plastics' },
    { value: 'paper', label: 'Paper' },
    { value: 'textile', label: 'Textile' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-2 pb-2">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Materials Marketplace</h1>
          <p className="text-gray-600">Browse recyclable materials available for auction</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search materials by name, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    fullWidth
                  />
                </div>
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {materials.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Materials Found</h3>
                <p className="text-gray-500">
                  {searchTerm || category
                    ? 'Try adjusting your filters to see more results.'
                    : 'There are currently no materials available. Check back later!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {materials.map((material) => {
                  const imageUrl = material.images && material.images.length > 0 
                    ? material.images[0] 
                    : null;

                  return (
                    <div
                      key={material._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={material.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
                        >
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 capitalize backdrop-blur-sm">
                            {material.category || 'N/A'}
                          </span>
                        </div>
                        
                        {/* Auction Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-green-500/90 text-white">
                            Auction
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 min-h-[3rem]">
                          {material.name || 'Unnamed Material'}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                          {material.description || 'No description available'}
                        </p>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Package className="h-4 w-4 mr-2 text-green-600" />
                            <span>Quantity: {material.quantity || 0} {material.unit || 'kg'}</span>
                          </div>
                          {material.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-green-600" />
                              <span className="truncate">
                                {material.location.city}, {material.location.state}
                              </span>
                            </div>
                          )}
                          {material.startingPrice && (
                            <div className="flex items-center text-sm font-semibold text-green-600">
                              <Gavel className="h-4 w-4 mr-2" />
                              <span>Starting: ₹{material.startingPrice?.toLocaleString() || '0'}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                          <Link
                            to={`/auctions/${material._id}`}
                            className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Gavel className="h-4 w-4" />
                            View Auction
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
