import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { materialAPI } from '../../api/materialAPI';
import { auctionAPI } from '../../api/auctionAPI';
import { useSocket } from '../../contexts/SocketContext';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, DollarSign, Gavel, Clock, Package, Activity, Trophy, ChevronDown, X } from 'lucide-react';
import Button from '../../components/ui/Button';

const SellerAnalytics = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAuctionId = searchParams.get('auctionId');
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    activeAuctions: 0,
    totalBids: 0,
    highestBid: 0,
    averageBid: 0,
    totalViews: 0,
    conversionRate: 0,
    liveBids: []
  });
  const [auctionAnalytics, setAuctionAnalytics] = useState(null);
  const [availableAuctions, setAvailableAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAuction, setLoadingAuction] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [showAuctionSelector, setShowAuctionSelector] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    
    // Fetch specific auction analytics if auctionId is in URL
    if (selectedAuctionId) {
      fetchAuctionAnalytics(selectedAuctionId);
    } else {
      setAuctionAnalytics(null);
    }
    
    // Listen for live bid updates
    if (socket) {
      socket.on('bid-placed', (data) => {
        setLiveUpdates(prev => [data, ...prev].slice(0, 10));
        if (data.auction?.material?.seller === user?._id) {
          fetchAnalytics();
          if (selectedAuctionId && data.auction?._id === selectedAuctionId) {
            fetchAuctionAnalytics(selectedAuctionId);
          }
        }
      });
      
      socket.on('auction-updated', (data) => {
        if (data.auction?.material?.seller === user?._id || data.auctionId === selectedAuctionId) {
          fetchAnalytics();
          if (selectedAuctionId && (data.auctionId === selectedAuctionId || data.auction?._id === selectedAuctionId)) {
            fetchAuctionAnalytics(selectedAuctionId);
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('bid-placed');
        socket.off('auction-updated');
      }
    };
  }, [socket, user, selectedAuctionId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get seller's materials
      const materialsResult = await materialAPI.getSellerMaterials();
      const materials = materialsResult.success ? materialsResult.data : [];
      
      // Get auctions for seller's materials
      const materialIds = materials.map(m => m._id);
      let totalBids = 0;
      let highestBid = 0;
      let bidAmounts = [];
      let activeAuctions = 0;
      const liveBids = [];

      for (const materialId of materialIds) {
        try {
          const auctionResult = await auctionAPI.getAll({ material: materialId });
          if (auctionResult.success && auctionResult.data.length > 0) {
            const auction = auctionResult.data[0];
            if (auction.status === 'active' && new Date(auction.endTime) > new Date()) {
              activeAuctions++;
              totalBids += auction.bidCount || 0;
              if (auction.currentBid > highestBid) {
                highestBid = auction.currentBid;
              }
              bidAmounts.push(auction.currentBid);
              
              liveBids.push({
                material: auction.material?.name,
                currentBid: auction.currentBid,
                bidCount: auction.bidCount,
                endTime: auction.endTime,
                auctionId: auction._id
              });
            }
          }
        } catch (error) {
          console.error('Error fetching auction:', error);
        }
      }

      const averageBid = bidAmounts.length > 0 
        ? bidAmounts.reduce((a, b) => a + b, 0) / bidAmounts.length 
        : 0;

      setAnalytics({
        totalListings: materials.length,
        activeAuctions,
        totalBids,
        highestBid,
        averageBid,
        totalViews: materials.reduce((sum, m) => sum + (m.views || 0), 0),
        conversionRate: materials.length > 0 ? (activeAuctions / materials.length) * 100 : 0,
        liveBids
      });

      // Set available auctions for dropdown (only active auctions with bids)
      const activeAuctionsWithBids = liveBids.filter(bid => bid.bidCount > 0);
      setAvailableAuctions(activeAuctionsWithBids.map(bid => ({
        _id: bid.auctionId,
        materialName: bid.material,
        currentBid: bid.currentBid,
        bidCount: bid.bidCount,
        endTime: bid.endTime
      })));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctionAnalytics = async (auctionId) => {
    try {
      setLoadingAuction(true);
      const result = await auctionAPI.getAnalytics(auctionId);
      if (result.success) {
        setAuctionAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch auction analytics:', error);
    } finally {
      setLoadingAuction(false);
    }
  };

  const handleAuctionSelect = (auctionId) => {
    setSearchParams({ auctionId });
    fetchAuctionAnalytics(auctionId);
    setShowAuctionSelector(false);
  };

  const handleClearSelection = () => {
    setSearchParams({});
    setAuctionAnalytics(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {auctionAnalytics ? 'Auction Analytics' : 'Live Bidding Analytics'}
            </h1>
            <p className="text-gray-600">
              {auctionAnalytics 
                ? `Detailed analytics for "${auctionAnalytics.auction?.material?.name || 'Auction'}"`
                : 'Real-time insights into your material listings and auctions'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {auctionAnalytics && (
              <Button
                variant="outline"
                onClick={handleClearSelection}
                leftIcon={<X className="h-4 w-4" />}
              >
                View All Analytics
              </Button>
            )}
            {!auctionAnalytics && availableAuctions.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowAuctionSelector(!showAuctionSelector)}
                  rightIcon={<ChevronDown className="h-4 w-4" />}
                >
                  Select Auction
                </Button>
                {showAuctionSelector && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {availableAuctions.map((auction) => (
                      <button
                        key={auction._id}
                        onClick={() => handleAuctionSelect(auction._id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="font-semibold text-gray-900 text-sm mb-1">{auction.materialName}</div>
                        <div className="text-xs text-gray-600">
                          Current Bid: ₹{auction.currentBid?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {auction.bidCount || 0} bids
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auction-Specific Analytics for Seller */}
      {auctionAnalytics && (
        <div className="mb-8 space-y-6">
          {/* Auction Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{auctionAnalytics.auction?.material?.name || 'Auction'}</h2>
                <p className="text-gray-600">{auctionAnalytics.auction?.material?.category || ''}</p>
              </div>
              <Link to={`/auctions/${auctionAnalytics.auction?._id}`}>
                <Button variant="outline" size="sm">
                  View Auction
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Current Bid</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{auctionAnalytics.auction?.currentBid?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Bids</p>
                <p className="text-2xl font-bold text-blue-600">{auctionAnalytics.bidStats?.totalBids || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Unique Bidders</p>
                <p className="text-2xl font-bold text-purple-600">{auctionAnalytics.bidStats?.uniqueBidders || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Average Bid</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{auctionAnalytics.bidStats?.averageBid?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            </div>

            {/* Top Bidders Leaderboard */}
            {auctionAnalytics.topBidders && auctionAnalytics.topBidders.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Top Bidders Leaderboard
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auctionAnalytics.topBidders.map((bidder, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          bidder.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                          bidder.rank === 2 ? 'bg-gray-300 text-gray-700' :
                          bidder.rank === 3 ? 'bg-orange-300 text-orange-900' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {bidder.rank <= 3 ? (
                            <Trophy className="h-5 w-5" />
                          ) : (
                            <span>#{bidder.rank}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{bidder.bidder.name}</p>
                          {bidder.bidder.companyName && (
                            <p className="text-xs text-gray-500">{bidder.bidder.companyName}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {bidder.bidder.email} {bidder.bidder.phoneNumber && `• ${bidder.bidder.phoneNumber}`}
                          </p>
                          {bidder.bidder.address && (
                            <p className="text-xs text-gray-400 mt-1">
                              {bidder.bidder.address}, {bidder.bidder.city}, {bidder.bidder.state} {bidder.bidder.pincode}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{bidder.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                        </p>
                        {bidder.isWinning && (
                          <span className="text-xs text-green-600 font-semibold">Winning</span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(bidder.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Analytics (shown when no specific auction is selected) */}
      {!auctionAnalytics && (
        <>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Listings</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalListings}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Gavel className="h-6 w-6 text-purple-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Active Auctions</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.activeAuctions}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Bids</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalBids}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Highest Bid</h3>
          <p className="text-2xl font-bold text-gray-900">₹{analytics.highestBid.toFixed(2)}</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Average Bid</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{analytics.averageBid.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Total Views</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalViews}</p>
        </div>
      </div>

      {/* Live Bidding Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Live Bidding Activity</h2>
          <div className="flex items-center text-green-600">
            <Activity className="h-4 w-4 mr-2 animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
        
        {analytics.liveBids.length > 0 ? (
          <div className="space-y-4">
            {analytics.liveBids.map((bid, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{bid.material}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Current: ₹{bid.currentBid.toFixed(2)}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Bids: {bid.bidCount}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Ends: {new Date(bid.endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No active auctions at the moment</p>
          </div>
        )}
          </div>

          {/* Recent Live Updates */}
          {liveUpdates.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Recent Bid Updates</h2>
              <div className="space-y-2">
                {liveUpdates.map((update, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600 p-2 bg-green-50 rounded">
                    <Activity className="h-4 w-4 text-green-600 mr-2 animate-pulse" />
                    <span>New bid of ₹{update.bid?.amount?.toFixed(2)} placed on {update.auction?.material?.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(update.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Recent Live Updates for Auction Analytics */}
      {auctionAnalytics && liveUpdates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Recent Bid Updates</h2>
          <div className="space-y-2">
            {liveUpdates
              .filter(update => update.auction?._id === selectedAuctionId || update.auction?.material?._id === selectedAuctionId)
              .map((update, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600 p-2 bg-green-50 rounded">
                  <Activity className="h-4 w-4 text-green-600 mr-2 animate-pulse" />
                  <span>New bid of ₹{update.bid?.amount?.toFixed(2)} placed</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {new Date(update.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics;

