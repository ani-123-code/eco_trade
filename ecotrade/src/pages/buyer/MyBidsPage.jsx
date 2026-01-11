import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../api/auctionAPI';
import { useAuth } from '../../contexts/AuthContext';
import VerificationStatusBanner from '../../components/VerificationStatusBanner';
import { Gavel, DollarSign, Clock, CheckCircle, XCircle, Trophy, Package, History, TrendingUp, Award, Search } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Input from '../../components/ui/Input';

const MyBidsPage = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [closedBids, setClosedBids] = useState([]);
  const [wonBids, setWonBids] = useState([]);
  const [lostBids, setLostBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'closed', 'won', 'lost'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.isVerified && user?.userType === 'buyer') {
      fetchBids();
    }
  }, [user]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const [activeResult, closedResult] = await Promise.all([
        auctionAPI.getMyBids(),
        auctionAPI.getClosedBids()
      ]);
      
      if (activeResult.success) {
        setBids(activeResult.data || []);
      }
      
      if (closedResult.success) {
        const closed = closedResult.data || [];
        setClosedBids(closed);
        
        // Separate won and lost bids
        const won = closed.filter(bid => {
          const auction = bid.auction;
          const isWinner = auction?.winner?._id === user?._id || auction?.winner === user?._id || bid.status === 'won';
          return isWinner || bid.isWinning;
        });
        const lost = closed.filter(bid => {
          const auction = bid.auction;
          const isWinner = auction?.winner?._id === user?._id || auction?.winner === user?._id || bid.status === 'won';
          return !isWinner && (bid.status === 'lost' || (!bid.isWinning && bid.status === 'closed'));
        });
        
        setWonBids(won);
        setLostBids(lost);
      }
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group bids by auction ID
  const groupBidsByAuction = (bidsList) => {
    const grouped = {};
    bidsList.forEach(bid => {
      const auctionId = bid.auction?._id || bid.auction;
      if (!grouped[auctionId]) {
        grouped[auctionId] = {
          auction: bid.auction,
          bids: []
        };
      }
      grouped[auctionId].bids.push(bid);
    });
    
    // Sort bids within each group by timestamp (newest first)
    Object.keys(grouped).forEach(auctionId => {
      grouped[auctionId].bids.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });
    
    return Object.values(grouped);
  };

  // Filter grouped bids by search term
  const filterGroupedBids = (groupedBids) => {
    if (!searchTerm.trim()) return groupedBids;
    
    const searchLower = searchTerm.toLowerCase();
    return groupedBids.filter(group => {
      const materialName = group.auction?.material?.name?.toLowerCase() || '';
      const category = group.auction?.material?.category?.toLowerCase() || '';
      const auctionId = group.auction?._id?.toString() || '';
      return materialName.includes(searchLower) || 
             category.includes(searchLower) || 
             auctionId.includes(searchLower);
    });
  };

  // Get filtered and grouped bids based on active tab
  const getDisplayBids = () => {
    let bidsList = [];
    if (activeTab === 'active') {
      bidsList = bids;
    } else if (activeTab === 'closed') {
      bidsList = closedBids;
    } else if (activeTab === 'won') {
      bidsList = wonBids;
    } else if (activeTab === 'lost') {
      bidsList = lostBids;
    }
    
    const grouped = groupBidsByAuction(bidsList);
    return filterGroupedBids(grouped);
  };

  // Get counts for tabs (grouped by auction)
  const getTabCounts = () => {
    return {
      active: groupBidsByAuction(bids).length,
      closed: groupBidsByAuction(closedBids).length,
      won: groupBidsByAuction(wonBids).length,
      lost: groupBidsByAuction(lostBids).length
    };
  };

  const tabCounts = getTabCounts();

  const renderAuctionCard = (group) => {
    const auction = group.auction;
    const allBids = group.bids;
    const latestBid = allBids[0]; // Newest bid (sorted)
    const olderBids = allBids.slice(1); // All other bids
    
    const isWinning = auction?.currentBidder?._id === user?._id || auction?.currentBidder === user?._id;
    const isAdminApproved = auction?.status === 'admin-approved';
    const isSellerApproved = auction?.sellerApproved;
    const isWinner = auction?.winner?._id === user?._id || auction?.winner === user?._id;
    const isEnded = auction?.status === 'ended' || auction?.status === 'admin-approved' || auction?.status === 'seller-approved';
    const isLost = !isWinner && isEnded;
    
    return (
      <div 
        key={auction?._id} 
        className={`bg-white border-2 rounded-lg p-6 hover:shadow-lg transition ${
          isWinner && isAdminApproved ? 'border-green-300 bg-green-50' : 
          isWinner ? 'border-blue-300 bg-blue-50' :
          isLost ? 'border-gray-200 bg-gray-50' :
          'border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {auction?.material?.images && auction.material.images[0] && (
                <img
                  src={auction.material.images[0]}
                  alt={auction.material.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div>
                <Link to={`/auctions/${auction?._id}`}>
                  <h3 className="font-bold text-lg text-gray-900 hover:text-green-600">
                    {auction?.material?.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 capitalize">{auction?.material?.category}</p>
                {allBids.length > 1 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {allBids.length} bids placed on this auction
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            {isAdminApproved && isWinner ? (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 mr-1" />
                Won & Approved
              </span>
            ) : isSellerApproved && isWinner ? (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                <CheckCircle className="h-4 w-4 mr-1" />
                Seller Accepted
              </span>
            ) : isWinner ? (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                <Trophy className="h-4 w-4 mr-1" />
                Won
              </span>
            ) : isLost ? (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                <XCircle className="h-4 w-4 mr-1" />
                Lost
              </span>
            ) : isWinning && !isEnded ? (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                <Trophy className="h-4 w-4 mr-1" />
                Winning
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Latest Bid */}
        <div className="mb-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Latest Bid</p>
                <p className="text-xl font-bold text-blue-900">₹{latestBid.amount?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">{new Date(latestBid.timestamp).toLocaleString()}</p>
                {latestBid.isWinning && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-200 rounded-full mt-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    Winning
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Older Bids */}
          {olderBids.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium mb-2">Previous Bids ({olderBids.length})</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {olderBids.map((bid, index) => (
                  <div key={bid._id} className="flex items-center justify-between text-sm bg-white rounded p-2">
                    <div>
                      <span className="font-medium text-gray-700">₹{bid.amount?.toFixed(2) || '0.00'}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(bid.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {bid.isOutbid && (
                      <span className="text-xs text-red-600">Outbid</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Your Latest Bid</p>
            <p className="text-lg font-bold text-gray-900">₹{latestBid.amount?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Current/Final Bid</p>
            <p className="text-lg font-bold text-green-600">₹{auction?.currentBid?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {isAdminApproved && isWinner && (
          <div className="space-y-3 mb-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800 mb-1">Bid Accepted by Admin</h4>
                  <p className="text-sm text-green-700 mb-2">
                    Your bid has been accepted! The transaction will proceed manually outside the platform. 
                    You'll be contacted for supply and delivery arrangements.
                  </p>
                  {auction?.adminApprovedAt && (
                    <p className="text-xs text-green-600">
                      Accepted on {new Date(auction.adminApprovedAt).toLocaleDateString()}
                    </p>
                  )}
                  {auction?.purchaseOrder && (
                    <div className="mt-2 p-2 bg-white rounded border border-green-200">
                      <p className="text-xs font-semibold text-green-800">Purchase Order: {auction.purchaseOrder}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Token Payment Section */}
            {auction?.tokenAmount && auction.tokenAmount > 0 && (
              <div className={`p-4 rounded-lg border ${
                auction?.tokenPaid 
                  ? 'bg-green-50 border-green-300' 
                  : auction?.tokenPaymentDeadline && new Date(auction.tokenPaymentDeadline) < new Date()
                    ? 'bg-red-50 border-red-300'
                    : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Token Payment Required</h4>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{auction.tokenAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {auction?.tokenPaid ? (
                    <div className="text-right">
                      <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
                      <p className="text-xs text-green-700 font-medium">Approved</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <Clock className="h-6 w-6 text-yellow-600 mb-1" />
                      <p className="text-xs text-yellow-700 font-medium">Pending</p>
                    </div>
                  )}
                </div>
                
                {!auction?.tokenPaid && (
                  <>
                    {auction?.tokenPaymentDeadline && (
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Payment Deadline:</strong>{' '}
                        {new Date(auction.tokenPaymentDeadline).toLocaleString()}
                        {new Date(auction.tokenPaymentDeadline) < new Date() && (
                          <span className="ml-2 text-red-600 font-semibold">(Overdue)</span>
                        )}
                      </p>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Payment Information:</strong>
                      </p>
                      <p className="text-xs text-gray-700 mb-2">
                        <strong>Payment will be done externally.</strong> The admin will contact you to complete the token payment process outside the platform.
                      </p>
                      <p className="text-xs text-gray-600">
                        You will be notified once the payment is processed and confirmed.
                      </p>
                    </div>
                    {auction?.tokenPaymentDeadline && new Date(auction.tokenPaymentDeadline) < new Date() && (
                      <div className="bg-red-100 border border-red-300 rounded p-2 mb-2">
                        <p className="text-xs text-red-800 font-medium">
                          ⚠️ Payment deadline has passed. Please contact admin immediately.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {isSellerApproved && isWinner && !isAdminApproved && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Bid Accepted by Seller</h4>
                <p className="text-sm text-blue-700">
                  Waiting for admin final approval. You'll be notified once approved.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {isEnded 
                ? `Ended: ${new Date(auction?.endTime).toLocaleDateString()}`
                : `Ends: ${new Date(auction?.endTime).toLocaleString()}`
              }
            </span>
          </div>
          <div className="flex items-center">
            <Gavel className="h-4 w-4 mr-1" />
            <span>{auction?.bidCount || 0} total bids</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <VerificationStatusBanner user={user} />
      
      {(!user?.isVerified || user?.userType !== 'buyer') && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> Only verified buyers can place bids. Admin will verify your account within 24 hours.
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Bids</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by auction name, category, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          leftIcon={<Search className="h-5 w-5 text-gray-400" />}
        />
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'active'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Bids ({tabCounts.active})
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'closed'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="inline h-4 w-4 mr-1" />
          Closed Bids ({tabCounts.closed})
        </button>
        <button
          onClick={() => setActiveTab('won')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'won'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Trophy className="inline h-4 w-4 mr-1" />
          Won Bids ({tabCounts.won})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'lost'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <XCircle className="inline h-4 w-4 mr-1" />
          Lost Bids ({tabCounts.lost})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your bids...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const displayBids = getDisplayBids();
            const emptyMessages = {
              active: { icon: Gavel, title: 'No Active Bids', message: 'Start bidding on auctions to see your bids here.', showLink: true },
              closed: { icon: History, title: 'No Closed Bids', message: 'Closed bids from completed auctions will appear here.', showLink: false },
              won: { icon: Trophy, title: 'No Won Bids', message: 'Bids you\'ve won will appear here.', showLink: false },
              lost: { icon: XCircle, title: 'No Lost Bids', message: 'Bids you\'ve lost will appear here.', showLink: false }
            };
            const emptyMsg = emptyMessages[activeTab];

            if (displayBids.length === 0) {
              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <emptyMsg.icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{emptyMsg.title}</h3>
                  <p className="text-gray-600 mb-6">{emptyMsg.message}</p>
                  {emptyMsg.showLink && (
                    <Link to="/auctions" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Browse Auctions
                    </Link>
                  )}
                </div>
              );
            }

            return displayBids.map(group => renderAuctionCard(group));
          })()}
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;
