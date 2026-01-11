import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auctionAPI } from '../../api/auctionAPI';
import { useSocket } from '../../contexts/SocketContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Target, BarChart3, Award, Users, DollarSign, Activity, ArrowUp, ArrowDown, Clock, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const BuyerAnalytics = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedAuctionId = searchParams.get('auctionId');
  const [analytics, setAnalytics] = useState({
    totalBids: 0,
    winningBids: 0,
    totalSpent: 0,
    averageBid: 0,
    successRate: 0,
    rank: 0,
    topBidders: [],
    myBidHistory: []
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
    
    // Listen for live updates
    if (socket) {
      socket.on('bid-placed', (data) => {
        setLiveUpdates(prev => [data, ...prev].slice(0, 10));
        fetchAnalytics();
        if (selectedAuctionId && data.auction?._id === selectedAuctionId) {
          fetchAuctionAnalytics(selectedAuctionId);
        }
      });
      
      socket.on('auction-updated', (data) => {
        fetchAnalytics();
        if (selectedAuctionId && data.auctionId === selectedAuctionId) {
          fetchAuctionAnalytics(selectedAuctionId);
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
      
      const result = await auctionAPI.getAnalytics();
      if (result.success) {
        const data = result.data;
        
        if (user?.userType === 'buyer') {
          const auctionRankings = data.auctionRankings || [];
          setAnalytics({
            totalBids: data.bidStats.totalBids,
            winningBids: data.bidStats.wonBids,
            totalSpent: data.bidStats.totalSpent,
            averageBid: data.bidStats.averageBid,
            successRate: data.bidStats.totalBids > 0 
              ? (data.bidStats.wonBids / data.bidStats.totalBids) * 100 
              : 0,
            rank: data.overallRank,
            topBidders: [], // Will be populated from auctionRankings
            myBidHistory: auctionRankings.map(ar => ({
              auctionId: ar.auction._id || ar.auction,
              material: ar.auction.material?.name,
              bidAmount: ar.userBidAmount,
              isWinning: ar.rank === 1,
              endTime: ar.auction.endTime,
              rank: ar.rank,
              totalBidders: ar.totalBidders
            })),
            auctionRankings: auctionRankings,
            totalBidders: data.totalBidders || 0
          });
          
          // Set available auctions for dropdown
          setAvailableAuctions(auctionRankings.map(ar => ({
            _id: ar.auction._id || ar.auction,
            materialName: ar.auction.material?.name || 'Auction',
            currentBid: ar.highestBid || 0,
            status: ar.auction.status,
            endTime: ar.auction.endTime
          })));
        } else if (user?.userType === 'seller') {
          setAnalytics({
            totalBids: data.totalStats.totalBidsReceived,
            winningBids: data.totalStats.activeAuctions,
            totalSpent: data.totalStats.totalRevenue,
            averageBid: 0,
            successRate: 0,
            rank: 0,
            topBidders: [],
            myBidHistory: [],
            auctionStats: data.auctionStats,
            totalStats: data.totalStats
          });
        }
      }
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
              {auctionAnalytics ? 'Auction Analytics' : 'Live Analytics & Rankings'}
            </h1>
            <p className="text-gray-600">
              {auctionAnalytics 
                ? `Detailed analytics for "${auctionAnalytics.auction?.material?.name || 'Auction'}"`
                : 'Track your bidding performance in real-time and see where you rank'}
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
                          {auction.status === 'active' ? 'Active' : 'Ended'}
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

      {/* Auction-Specific Analytics */}
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
                <p className="text-sm text-gray-600 mb-1">Your Rank</p>
                <p className="text-2xl font-bold text-blue-600">
                  {auctionAnalytics.userRank ? `#${auctionAnalytics.userRank}` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of {auctionAnalytics.totalBidders || 0} bidders
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Your Bid</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{auctionAnalytics.userBidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Bids</p>
                <p className="text-2xl font-bold text-gray-900">{auctionAnalytics.totalBids || 0}</p>
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
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        bidder.bidder.isYou
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
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
                          <p className="font-semibold text-gray-900">
                            {bidder.bidder.name}
                            {bidder.bidder.isYou && (
                              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">You</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(bidder.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{bidder.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                        </p>
                        {bidder.isWinning && (
                          <span className="text-xs text-green-600 font-semibold">Winning</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Analytics (shown when no specific auction is selected or below auction analytics) */}
      {!auctionAnalytics && (
        <>

      {/* Your Rank Card */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">Your Current Rank</p>
            <div className="flex items-center gap-3">
              <Trophy className="h-12 w-12" />
              <div>
                <p className="text-5xl font-bold">#{analytics.rank}</p>
                <p className="text-sm opacity-90">Out of {analytics.topBidders.length + 1} active bidders</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 mb-1">Total Bids</p>
            <p className="text-3xl font-bold">{analytics.totalBids}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Winning Bids</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.winningBids}</p>
          <p className="text-xs text-gray-500 mt-1">Success Rate: {analytics.successRate.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-900">₹{analytics.totalSpent.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Average Bid</h3>
          <p className="text-2xl font-bold text-gray-900">₹{analytics.averageBid.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Success Rate</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.successRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Bidders Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Top Bidders Leaderboard
            </h2>
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          </div>
          
          {analytics.topBidders.length > 0 ? (
            <div className="space-y-3">
              {analytics.topBidders.map((bidder, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    bidder.name === user?.name
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index < 3 ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        <span>#{bidder.rank}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {bidder.name}
                        {bidder.name === user?.name && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">You</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{bidder.totalBids} bids</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{bidder.totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{bidder.winningBids} wins</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bidder rankings available yet</p>
            </div>
          )}
        </div>

        {/* Your Bid History / Overall Ranking */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              {user?.userType === 'buyer' ? 'Overall Ranking' : 'Total Statistics'}
            </h2>
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          </div>
          
          {user?.userType === 'buyer' ? (
            <>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 mb-4 text-white">
                <p className="text-sm opacity-90 mb-2">Your Overall Rank</p>
                <div className="flex items-center gap-3">
                  <Trophy className="h-12 w-12" />
                  <div>
                    <p className="text-5xl font-bold">#{analytics.rank || 'N/A'}</p>
                    <p className="text-sm opacity-90">Out of {analytics.totalBidders || 0} total bidders</p>
                  </div>
                </div>
              </div>
              
              {analytics.auctionRankings && analytics.auctionRankings.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-700 mb-2">Bid-Wise Rankings</h3>
                  {analytics.auctionRankings.map((ranking, index) => (
                    <Link
                      key={index}
                      to={`/auctions/${ranking.auction?._id || ranking.auction}`}
                      className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {ranking.auction?.material?.name || 'Auction'}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Your Rank: <strong className="text-gray-900">#{ranking.rank || 'N/A'}</strong>
                            </span>
                            <span className="text-gray-500">
                              of {ranking.totalBidders || 0} bidders
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          {ranking.rank === 1 ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Winning
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              Rank #{ranking.rank}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Your Bid</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{ranking.userBidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Highest Bid</p>
                          <p className="text-sm font-semibold text-green-600">
                            ₹{ranking.highestBid?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                          </p>
                        </div>
                      </div>
                      {ranking.auction?.endTime && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(ranking.auction.endTime) > new Date() 
                              ? `Ends: ${new Date(ranking.auction.endTime).toLocaleString()}`
                              : `Ended: ${new Date(ranking.auction.endTime).toLocaleString()}`
                            }
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bid history yet</p>
                  <Link to="/auctions" className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block">
                    Start Bidding →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Total Auctions</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.totalStats?.totalAuctions || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Active Auctions</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.totalStats?.activeAuctions || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 mb-1">Total Bids Received</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.totalStats?.totalBidsReceived || 0}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 mb-1">Highest Bid</p>
                  <p className="text-2xl font-bold text-orange-900">
                    ₹{(analytics.totalStats?.highestBidReceived || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

          {/* Recent Live Updates */}
          {liveUpdates.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600 animate-pulse" />
                Recent Bid Updates
              </h2>
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
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600 animate-pulse" />
            Recent Bid Updates
          </h2>
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

export default BuyerAnalytics;

