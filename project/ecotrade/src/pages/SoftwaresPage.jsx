import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { materialAPI } from '../api/materialAPI';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Code, Search, AlertCircle, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SoftwaresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showError } = useToast();
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchSoftwares();
  }, [page, searchTerm]);

  const fetchSoftwares = async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        limit: 12,
        category: 'software',
        listingType: 'rfq' // Softwares are always RFQ
      };
      if (searchTerm) params.search = searchTerm;
      
      const result = await materialAPI.getAll(params);
      if (result.success) {
        // Filter to only show softwares
        const filtered = result.data.filter(m => m.category === 'software');
        setSoftwares(filtered);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch softwares:', error);
      showError('Failed to load softwares. Please try again.');
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
    fetchSoftwares();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-2 pb-2">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Software Marketplace</h1>
            <p className="text-xl text-gray-200">
              Browse available software solutions and request quotes from sellers
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search software by name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  fullWidth
                />
              </div>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Softwares Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : softwares.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Software Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search to see more results.'
                : 'There are currently no software available. Check back later!'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams({});
                  fetchSoftwares();
                }}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {softwares.map((software) => {
                const imageUrl = software.images && software.images.length > 0 
                  ? software.images[0] 
                  : 'https://via.placeholder.com/400x300?text=No+Image';

                return (
                  <div
                    key={software._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img
                        src={imageUrl}
                        alt={software.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                          Software
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {software.name || 'Unnamed Software'}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {software.description || 'No description available'}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Code className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{software.quantity || 0} {software.unit || 'license'}</span>
                        </div>
                        {software.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-purple-600 mr-2">📍</span>
                            <span className="truncate">
                              {software.location.city}, {software.location.state}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="border-t pt-4">
                        {user?.isVerified && user?.userType === 'buyer' ? (
                          <Link
                            to={`/buyer/rfq/${software._id}`}
                            className="block w-full text-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Request Quote
                          </Link>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-yellow-800">
                              {!user ? (
                                <>Please <Link to="/login" className="underline font-medium">log in</Link> as a verified buyer to request quotes.</>
                              ) : user?.userType !== 'buyer' ? (
                                <>Only verified buyers can request quotes.</>
                              ) : (
                                <>Your buyer account is pending verification.</>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 flex items-center">Page {page} of {pagination.pages}</span>
                <Button
                  variant="outline"
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default SoftwaresPage;

