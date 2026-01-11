import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../api/auctionAPI';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Calendar, DollarSign, Package, ArrowRight, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const UpcomingBidsPage = () => {
  const { user } = useAuth();
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUpcomingAuctions();
    }
  }, [user]);

  const fetchUpcomingAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get upcoming auctions (scheduled or starting soon)
      const result = await auctionAPI.getUpcoming({ limit: 50 });
      
      if (result.success) {
        setUpcomingAuctions(result.data || []);
      } else {
        setError('Failed to fetch upcoming auctions');
      }
    } catch (err) {
      console.error('Error fetching upcoming auctions:', err);
      setError('Failed to load upcoming auctions');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeUntil = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;
    
    if (diff < 0) return 'Starting soon';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours}h`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes}m`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-2 pb-2">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-2 pb-2">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-2 pb-2">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Auctions</h1>
          <p className="text-gray-600">Get ready to bid on these upcoming auctions</p>
        </div>

        {upcomingAuctions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Auctions</h2>
            <p className="text-gray-600 mb-6">There are no scheduled auctions at the moment.</p>
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Active Auctions
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction) => (
              <div
                key={auction._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Image */}
                {auction.material?.images && auction.material.images.length > 0 ? (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={auction.material.images[0]}
                      alt={auction.material.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded mb-2 capitalize">
                    {auction.material?.category || 'Material'}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {auction.material?.name || 'Untitled Auction'}
                  </h3>

                  {/* Description */}
                  {auction.material?.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {auction.material.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        Starting Price: ₹{auction.startingPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                    
                    {auction.scheduledPublishDate ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>
                          Starts: {new Date(auction.scheduledPublishDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : auction.endTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>
                          Ends: {new Date(auction.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {auction.status === 'scheduled' && (
                      <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          Starts in: {formatTimeUntil(auction.scheduledPublishDate || auction.endTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/auctions/${auction._id}`}
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {auction.status === 'scheduled' ? 'View Details' : 'Place Bid'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingBidsPage;

