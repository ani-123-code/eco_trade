import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auctionAPI } from '../../api/auctionAPI';
import { useToast } from '../../contexts/ToastContext';
import { 
  Clock, 
  Gavel, 
  Users, 
  MapPin, 
  Search, 
  Filter,
  TrendingUp,
  Calendar,
  Package,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AuctionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showError } = useToast();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all'); // all, live, latest, upcoming
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'ending-soon');
  const searchTimeoutRef = useRef(null);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { filter }; // Use filter instead of status
      
      // Only send category if it's not empty (not "All Categories")
      if (category && category.trim() !== '') {
        params.category = category;
      }
      
      if (sortBy) {
        params.sortBy = sortBy;
      }
      
      // Send search term to backend
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      
      const result = await auctionAPI.getAll(params);
      if (result.success) {
        setAuctions(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
      showError('Failed to load auctions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, filter, searchTerm, showError]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Clear any pending debounce and trigger immediate search on form submit
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    // Immediately update searchTerm to trigger fetch
    setSearchTerm(searchTerm);
    fetchAuctions();
  };

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Update URL params immediately for better UX (so URL stays in sync)
    setSearchParams(prev => {
      if (value && value.trim() !== '') {
        prev.set('search', value.trim());
      } else {
        prev.delete('search');
      }
      return prev;
    });

    // Debounce state update - wait 500ms after user stops typing before updating searchTerm
    // This delays the useEffect trigger, reducing API calls
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const updateFilter = (key, value) => {
    setSearchParams(prev => {
      // For category, if empty string, delete it (means "All Categories")
      if (key === 'category' && (!value || value.trim() === '')) {
        prev.delete(key);
      } else if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    });
    if (key === 'category') setCategory(value || '');
    if (key === 'sortBy') setSortBy(value);
    if (key === 'filter') setFilter(value);
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return { ended: true, text: 'Ended' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { ended: false, text: `${days}d ${hours}h` };
    if (hours > 0) return { ended: false, text: `${hours}h ${minutes}m` };
    return { ended: false, text: `${minutes}m` };
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'ewaste', label: 'E-Waste' },
    { value: 'fmgc', label: 'FMGC' },
    { value: 'metal', label: 'Metal' },
    { value: 'plastics', label: 'Plastics' },
    { value: 'paper', label: 'Paper' }
  ];

  const sortOptions = [
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'newest', label: 'Newest First' },
    { value: 'highest-bid', label: 'Highest Bid' },
    { value: 'most-bids', label: 'Most Bids' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Live Auctions</h1>
            <p className="text-xl text-gray-200">
              Bid on quality recyclable materials and get the best deals through real-time auctions
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { value: 'all', label: 'ALL', icon: Filter },
              { value: 'live', label: 'LIVE', icon: Gavel },
              { value: 'latest', label: 'LATEST', icon: TrendingUp },
              { value: 'upcoming', label: 'UPCOMING', icon: Calendar }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateFilter('filter', value)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filter === value
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search */}
            <form onSubmit={handleSearch} className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Search auctions by name, category..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                    fullWidth
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-6 whitespace-nowrap"
                >
                  <Search className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Search</span>
                </Button>
              </div>
            </form>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 h-10"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 h-10"
                disabled={filter === 'latest'} // Disable sort for latest (always sorted by createdAt)
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : auctions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Auctions Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || category 
                ? 'Try adjusting your filters to see more results.'
                : 'There are currently no active auctions. Check back later!'}
            </p>
            {(searchTerm || category || filter !== 'all' || sortBy !== 'ending-soon') && (
              <Button
                variant="outline"
                onClick={() => {
                  // Clear any pending search debounce
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                    searchTimeoutRef.current = null;
                  }
                  setSearchTerm('');
                  setCategory('');
                  setFilter('all');
                  setSortBy('ending-soon');
                  setSearchParams({});
                  // fetchAuctions will be called by useEffect when state updates
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => {
              const timeRemaining = getTimeRemaining(auction.endTime);
              const material = auction.material || {};
              const imageUrl = material.images && material.images.length > 0 
                ? material.images[0] 
                : 'https://via.placeholder.com/400x300?text=No+Image';

              return (
                <Link
                  key={auction._id}
                  to={`/auctions/${auction._id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={material.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        auction.status === 'closed' || auction.status === 'completed' || timeRemaining.ended
                          ? 'bg-red-500 text-white' 
                          : auction.status === 'active' && !timeRemaining.ended
                          ? 'bg-green-500 text-white'
                          : auction.status === 'scheduled' || auction.status === 'draft'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {auction.status === 'closed' || auction.status === 'completed' || timeRemaining.ended
                          ? 'Ended'
                          : auction.status === 'active' && !timeRemaining.ended
                          ? 'Live'
                          : auction.status === 'scheduled' || auction.status === 'draft'
                          ? 'Upcoming'
                          : auction.status || 'Unknown'}
                      </span>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 capitalize">
                        {material.category || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {material.name || 'Unnamed Material'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {material.description || 'No description available'}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2 text-green-600" />
                        <span>{material.quantity || 0} {material.unit || 'kg'}</span>
                      </div>
                      {material.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-green-600" />
                          <span className="truncate">
                            {material.location.city}, {material.location.state}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bidding Info */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Bid</span>
                        <span className="text-xl font-bold text-green-600">
                          ₹{auction.currentBid?.toLocaleString() || auction.startingPrice?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Gavel className="h-4 w-4 mr-1" />
                          <span>{auction.bidCount || 0} bids</span>
                        </div>
                        <div className={`flex items-center ${timeRemaining.ended ? 'text-red-600' : 'text-orange-600'}`}>
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="font-semibold">{timeRemaining.text}</span>
                        </div>
                      </div>
                    </div>

                    {/* Starting Price */}
                    {auction.currentBid === 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        Starting: ₹{auction.startingPrice?.toLocaleString() || '0'}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuctionPage;
