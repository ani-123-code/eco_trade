import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { auctionAPI } from '../../api/auctionAPI';
import { adminAPI } from '../../api/adminAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useToast } from '../../contexts/ToastContext';
import VerificationStatusBanner from '../../components/VerificationStatusBanner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  Clock,
  Gavel,
  MapPin,
  Package,
  User,
  TrendingUp,
  Calendar,
  AlertCircle,
  ChevronLeft,
  Image as ImageIcon,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  BarChart3
} from 'lucide-react';

const AuctionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinAuction, leaveAuction } = useSocket();
  const { showSuccess, showError } = useToast();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });
  const [bidHistory, setBidHistory] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [userRole, setUserRole] = useState('buyer'); // 'admin', 'seller', 'buyer'

  useEffect(() => {
    fetchAuction();
    if (socket) {
      joinAuction(id);
      socket.on('bid-updated', (data) => {
        if (data.auction && data.auction.currentBid) {
          setAuction(prev => ({
            ...prev,
            currentBid: data.auction.currentBid,
            bidCount: data.auction.bidCount,
            currentBidder: data.auction.currentBidder
          }));
          // Update minimum bid amount
          const newMinBid = data.auction.currentBid * 1.02;
          setBidAmount(newMinBid.toFixed(2));
          showSuccess('New bid placed!');
          // Refresh bid history if user is seller/admin
          if (userRole === 'seller' || userRole === 'admin') {
            fetchBidHistory();
          }
        }
      });
      socket.on('auction-updated', (data) => {
        if (data.status === 'ended' || data.status === 'seller-approved' || data.status === 'admin-approved') {
          setTimeRemaining({ ended: true });
          fetchAuction();
          if (userRole === 'seller' || userRole === 'admin') {
            fetchBidHistory();
          }
        }
        // Update auction status
        if (data.auctionId === id) {
          setAuction(prev => ({
            ...prev,
            status: data.status,
            adminApproved: data.adminApproved || prev.adminApproved,
            sellerApproved: data.sellerApproved || prev.sellerApproved,
            purchaseOrder: data.purchaseOrder || prev.purchaseOrder
          }));
        }
      });
    }
    return () => {
      if (socket) {
        leaveAuction(id);
      }
    };
  }, [id, socket]);

  useEffect(() => {
    if (auction && !timeRemaining.ended) {
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [auction]);

  const updateCountdown = () => {
    if (!auction) return;
    const now = new Date();
    const end = new Date(auction.endTime);
    const diff = end - now;

    if (diff <= 0) {
      setTimeRemaining({ ended: true });
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeRemaining({ days, hours, minutes, seconds, ended: false });
  };

  const fetchAuction = async () => {
    try {
      const result = await auctionAPI.getById(id);
      if (result.success) {
        setAuction(result.data);
        const minBid = result.data.currentBid > 0 
          ? result.data.currentBid * 1.02 
          : result.data.startingPrice;
        setBidAmount(minBid.toFixed(2));
        updateCountdown();
        
        // Check if user is seller
        const material = result.data.material || {};
        if (material.seller && user) {
          const isSeller = material.seller._id === user._id || material.seller === user._id;
          if (isSeller) {
            setUserRole('seller');
            fetchBidHistory();
          } else if (user.role === 'admin') {
            setUserRole('admin');
            fetchBidHistory();
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch auction:', error);
      showError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBidHistory = async () => {
    if (!id) return;
    setLoadingBids(true);
    try {
      const result = await auctionAPI.getBidHistory(id);
      if (result.success) {
        setBidHistory(result.data || []);
        if (result.userRole) {
          setUserRole(result.userRole);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bid history:', error);
    } finally {
      setLoadingBids(false);
    }
  };

  const handleAcceptBidSeller = async () => {
    if (!id) {
      showError('Auction ID is missing');
      return;
    }

    if (!window.confirm('Are you sure you want to accept this bid? This will close the auction for new bids and wait for admin final approval.')) {
      return;
    }

    setBidding(true);
    try {
      console.log('Accepting bid for auction ID:', id);
      const result = await auctionAPI.acceptBidSeller(id);
      if (result.success) {
        showSuccess('Bid accepted successfully! Waiting for admin final approval.');
        fetchAuction();
        fetchBidHistory();
      }
    } catch (error) {
      console.error('Accept bid error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept bid';
      showError(errorMessage);
    } finally {
      setBidding(false);
    }
  };

  const handleDeleteBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to delete this bid? This action cannot be undone.')) {
      return;
    }

    setBidding(true);
    try {
      let result;
      if (userRole === 'admin') {
        result = await adminAPI.deleteBid(bidId);
      } else if (userRole === 'seller') {
        result = await auctionAPI.deleteBidSeller(id, bidId);
      } else {
        showError('You do not have permission to delete bids');
        return;
      }
      
      if (result.success) {
        showSuccess('Bid deleted successfully');
        fetchAuction();
        fetchBidHistory();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete bid');
    } finally {
      setBidding(false);
    }
  };

  const handleBid = async () => {
    if (!user?.isVerified || user?.userType !== 'buyer') {
      showError('Only verified buyers can place bids');
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = auction.currentBid > 0 ? auction.currentBid * 1.02 : auction.startingPrice;

    if (amount < minBid) {
      showError(`Minimum bid is ₹${minBid.toFixed(2)}`);
      return;
    }

    setBidding(true);
    try {
      const result = await auctionAPI.placeBid(id, amount);
      if (result.success) {
        showSuccess('Bid placed successfully!');
        fetchAuction();
        setBidAmount((amount * 1.02).toFixed(2));
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Auction Not Found</h2>
          <p className="text-gray-500 mb-6">The auction you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/auctions')}>Back to Auctions</Button>
        </div>
      </div>
    );
  }

  const material = auction.material || {};
  const images = material.images && material.images.length > 0 
    ? material.images 
    : ['https://via.placeholder.com/800x600?text=No+Image'];
  const minBid = auction.currentBid > 0 ? auction.currentBid * 1.02 : auction.startingPrice;
  // Auction is ended if: time expired, seller approved bid, admin approved bid, or status is ended/cancelled
  // Note: adminApproved flag means admin approved auction to go live (status: active) - NOT ended
  // status: 'admin-approved' means admin approved the bid and generated PO - THIS is ended
  const isEnded = timeRemaining.ended || 
    new Date(auction.endTime) <= new Date() || 
    auction.status === 'seller-approved' || 
    auction.status === 'admin-approved' || 
    auction.status === 'ended' || 
    auction.status === 'cancelled' ||
    auction.status === 'completed';
  const isWinning = auction.winner && user && auction.winner._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <VerificationStatusBanner user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/auctions')}
          className="mb-6"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Back to Auctions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                <img
                  src={images[selectedImage]}
                  alt={material.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
                  }}
                />
                {images.length > 1 && (
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {images.length > 1 && (
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5 rotate-180" />
                  </button>
                )}
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                        selectedImage === index ? 'border-green-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt={`${material.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Material Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{material.name || 'Unnamed Material'}</h1>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-600">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {material.description || 'No detailed description available. Please contact the seller for more information.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold capitalize">
                      {material.category || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
                    <div className="flex items-center text-gray-700">
                      <Package className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-semibold">{material.quantity || 0} {material.unit || 'kg'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Condition</h3>
                    <span className="capitalize text-gray-700">{material.condition || 'N/A'}</span>
                  </div>
                  {material.location && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-4 w-4 mr-2 text-green-600" />
                        <span>
                          {material.location.city}, {material.location.state}
                          {material.location.pincode && ` - ${material.location.pincode}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Info - Only show name and address, not email/phone */}
              {material.seller && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Seller Information</h3>
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{material.seller.name || 'N/A'}</p>
                      {material.seller.address && (
                        <p className="text-sm text-gray-600 mb-1">{material.seller.address}</p>
                      )}
                      {(material.seller.city || material.seller.state) && (
                        <p className="text-sm text-gray-600">
                          {material.seller.city || ''}{material.seller.city && material.seller.state ? ', ' : ''}{material.seller.state || ''}
                          {material.seller.pincode ? ` - ${material.seller.pincode}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bid History */}
            {(bidHistory.length > 0 || (auction.bidHistory && auction.bidHistory.length > 0)) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center">
                    <Gavel className="h-5 w-5 mr-2 text-green-600" />
                    Bid History ({bidHistory.length || auction.bidHistory?.length || 0})
                  </h2>
                  <div className="flex items-center gap-2">
                    {(userRole === 'seller' || userRole === 'buyer') && auction.status === 'active' && auction.bidCount > 0 && (
                      <Link to={userRole === 'seller' ? `/seller/analytics?auctionId=${auction._id}` : `/buyer/analytics?auctionId=${auction._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<BarChart3 className="h-4 w-4" />}
                        >
                          Analytics
                        </Button>
                      </Link>
                    )}
                    {userRole === 'seller' && !auction.sellerApproved && auction.status === 'active' && auction.currentBid > 0 && (
                      <Button
                        onClick={handleAcceptBidSeller}
                        isLoading={bidding}
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                      >
                        Accept Bid
                      </Button>
                    )}
                  </div>
                </div>
                {loadingBids ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(bidHistory.length > 0 ? bidHistory : auction.bidHistory || []).slice(0, 20).map((bid, index) => (
                      <div
                        key={bid._id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center flex-1">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-700 font-semibold text-sm">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {bid.bidder?.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(bid.timestamp).toLocaleString()}
                            </p>
                            {/* Show additional info for admin */}
                            {userRole === 'admin' && bid.bidder && (
                              <div className="text-xs text-gray-400 mt-1">
                                {bid.bidder.email && <span>Email: {bid.bidder.email}</span>}
                                {bid.bidder.phone && <span className="ml-2">Phone: {bid.bidder.phone}</span>}
                                {bid.bidder.companyName && <span className="ml-2">Company: {bid.bidder.companyName}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ₹{bid.amount?.toLocaleString() || '0'}
                            </p>
                            {bid.isWinning && (
                              <span className="text-xs text-green-600 font-semibold">Winning</span>
                            )}
                          </div>
                          {/* Delete button for admin only */}
                          {userRole === 'admin' && 
                           auction.status !== 'cancelled' && 
                           auction.status !== 'admin-approved' && 
                           auction.status !== 'seller-approved' && (
                            <button
                              onClick={() => handleDeleteBid(bid._id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Delete Bid"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Bidding Panel / Seller Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              {/* Admin View - Accept Bid Button */}
              {userRole === 'admin' && auction.status === 'seller-approved' && auction.sellerApproved && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <h3 className="font-semibold text-green-900 mb-2">Admin Actions</h3>
                  <p className="text-sm text-green-800 mb-3">
                    Approve the winning bid to finalize the auction. This will generate a Purchase Order and notify the winner.
                  </p>
                  <Button
                    onClick={async () => {
                      if (!window.confirm('Accept this bid? This will finalize the auction and generate a Purchase Order.')) {
                        return;
                      }
                      setBidding(true);
                      try {
                        const result = await adminAPI.acceptBid(id);
                        if (result.success) {
                          showSuccess('Bid accepted! Purchase Order generated.');
                          fetchAuction();
                          fetchBidHistory();
                        }
                      } catch (error) {
                        showError(error.response?.data?.message || 'Failed to accept bid');
                      } finally {
                        setBidding(false);
                      }
                    }}
                    isLoading={bidding}
                    variant="primary"
                    fullWidth
                    leftIcon={<CheckCircle className="h-5 w-5" />}
                  >
                    Approve Bid & Generate PO
                  </Button>
                </div>
              )}

              {/* Seller View - Accept Bid Button */}
              {userRole === 'seller' && !auction.sellerApproved && !auction.adminApproved && auction.currentBid > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h3 className="font-semibold text-blue-900 mb-2">Seller Actions</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    You can accept the current bid at any time. This will end the auction and wait for admin final approval.
                  </p>
                  <Button
                    onClick={handleAcceptBidSeller}
                    isLoading={bidding}
                    variant="primary"
                    fullWidth
                    leftIcon={<CheckCircle className="h-5 w-5" />}
                  >
                    Accept Current Bid (₹{auction.currentBid?.toLocaleString() || '0'})
                  </Button>
                </div>
              )}
              
              {/* Seller Approval Status */}
              {userRole === 'seller' && auction.sellerApproved && !auction.adminApproved && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    ✓ Bid Accepted by You
                  </p>
                  <p className="text-xs text-blue-700">
                    Waiting for admin final approval. Winner: {auction.winner?.name || auction.currentBidder?.name || 'N/A'}
                  </p>
                </div>
              )}
              
              {/* Admin Approval Status - Only show when bid is approved (status: admin-approved) */}
              {auction.status === 'admin-approved' && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    ✓ Bid Accepted by Admin
                  </p>
                  <p className="text-xs text-green-700">
                    Transaction will proceed manually. Winner: {auction.winner?.name || 'N/A'}
                  </p>
                  {auction.purchaseOrder && (
                    <p className="text-xs text-green-700 mt-1">
                      Purchase Order: {auction.purchaseOrder}
                    </p>
                  )}
                </div>
              )}
              {/* Status Badge */}
              <div className="mb-6">
                {isEnded ? (
                  <div className={`p-3 rounded-lg mb-4 ${
                    isWinning ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {isWinning ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-600 mr-2" />
                      )}
                      <span className={`font-semibold ${isWinning ? 'text-green-700' : 'text-gray-700'}`}>
                        {isWinning ? 'You Won!' : 'Auction Ended'}
                      </span>
                    </div>
                    {auction.winner && (
                      <p className="text-sm text-gray-600">
                        Winner: {auction.winner.name || 'N/A'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="font-semibold text-green-700">Live Auction</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              {!isEnded && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="flex items-center mb-3">
                    <Clock className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-orange-700">Time Remaining</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white rounded p-2">
                      <div className="text-2xl font-bold text-orange-600">{timeRemaining.days}</div>
                      <div className="text-xs text-gray-600">Days</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-2xl font-bold text-orange-600">{timeRemaining.hours}</div>
                      <div className="text-xs text-gray-600">Hours</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-2xl font-bold text-orange-600">{timeRemaining.minutes}</div>
                      <div className="text-xs text-gray-600">Mins</div>
                    </div>
                    <div className="bg-white rounded p-2">
                      <div className="text-2xl font-bold text-orange-600">{timeRemaining.seconds}</div>
                      <div className="text-xs text-gray-600">Secs</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bidding Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Current Bid</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{auction.currentBid?.toLocaleString() || auction.startingPrice?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Starting Price</span>
                  <span className="font-semibold text-gray-900">
                    ₹{auction.startingPrice?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center">
                    <Gavel className="h-4 w-4 mr-1" />
                    Total Bids
                  </span>
                  <span className="font-semibold text-gray-900">{auction.bidCount || 0}</span>
                </div>
                {auction.currentBidder && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Current Bidder
                    </span>
                    <span className="font-semibold text-gray-900">
                      {auction.currentBidder.name || 'Anonymous'}
                    </span>
                  </div>
                )}
              </div>

              {/* Bid Form */}
              {/* Allow bidding only when auction is active and seller hasn't accepted a bid */}
              {!isEnded && auction.status === 'active' && !auction.sellerApproved && auction.status !== 'admin-approved' && (
                <>
                  {user?.isVerified && user?.userType === 'buyer' ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <h3 className="font-semibold text-blue-900 mb-2">Bidding Information</h3>
                        <div className="space-y-2 text-sm text-blue-800">
                          <p>• Your bid must be at least <strong>2% higher</strong> than the current bid</p>
                          <p>• Minimum bid amount: <strong>₹{minBid.toFixed(2)}</strong></p>
                          <p>• If you're outbid, you'll be notified in real-time</p>
                          <p>• Winning bid will be subject to admin approval</p>
                          <p>• All transactions proceed manually outside the platform</p>
                        </div>
                      </div>
                      <div>
                        <Input
                          type="number"
                          label="Your Bid Amount (₹)"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={minBid}
                          step="0.01"
                          fullWidth
                          placeholder={`Enter amount (min: ₹${minBid.toFixed(2)})`}
                        />
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-gray-600">
                            Minimum bid: <span className="font-semibold text-green-600">₹{minBid.toFixed(2)}</span>
                          </p>
                          {auction.tokenAmount > 0 && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-blue-800 font-semibold text-sm mb-1">Token Amount Required:</p>
                              <p className="text-blue-900 font-bold text-lg">₹{auction.tokenAmount.toFixed(2)}</p>
                              <p className="text-blue-700 text-xs mt-1">Payment will be processed externally after winning the bid.</p>
                            </div>
                          )}
                          {bidAmount && parseFloat(bidAmount) >= minBid && (
                            <p className="text-green-600 font-medium mt-2">
                              ✓ Your bid is valid and will be placed immediately
                            </p>
                          )}
                          {bidAmount && parseFloat(bidAmount) < minBid && (
                            <p className="text-red-600 mt-2">
                              ✗ Bid must be at least ₹{minBid.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleBid}
                          isLoading={bidding}
                          fullWidth
                          size="lg"
                          disabled={!bidAmount || parseFloat(bidAmount) < minBid}
                          leftIcon={<TrendingUp className="h-5 w-5" />}
                          className="flex-1"
                        >
                          {bidding ? 'Placing Bid...' : `Place Bid (₹${bidAmount || minBid.toFixed(2)})`}
                        </Button>
                        {auction.bidCount > 0 && (
                          <Link to={`/buyer/analytics?auctionId=${auction._id}`}>
                            <Button
                              variant="outline"
                              size="lg"
                              leftIcon={<BarChart3 className="h-5 w-5" />}
                            >
                              Analytics
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          {!user ? (
                            <>Please <Link to="/login" className="underline font-medium">log in</Link> to place bids.</>
                          ) : user?.userType !== 'buyer' ? (
                            <>Only verified buyers can place bids. <Link to="/register" className="underline font-medium">Register as buyer</Link> to participate.</>
                          ) : (
                            <>Your buyer account is pending admin verification. <strong>Admin will verify within 24 hours.</strong> Once verified, you can place bids.</>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Show message when seller has approved but admin hasn't */}
              {auction.status === 'seller-approved' && auction.sellerApproved && auction.status !== 'admin-approved' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Bidding Closed</p>
                      <p>The seller has accepted a bid. This auction is now closed and waiting for admin final approval. No further bids can be placed.</p>
                      {auction.winner && (
                        <p className="mt-2 font-medium">Winner: {auction.winner.name || auction.currentBidder?.name || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show message when admin has approved the bid (status: admin-approved) */}
              {auction.status === 'admin-approved' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mt-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">Auction Closed - Bid Approved by Admin</p>
                      <p>This auction is permanently closed. Admin has approved the bid and generated Purchase Order. No further bids are allowed.</p>
                      {auction.winner && (
                        <p className="mt-2 font-medium">Winner: {auction.winner.name || auction.currentBidder?.name || 'N/A'}</p>
                      )}
                      {auction.purchaseOrder && (
                        <p className="mt-1 font-medium">Purchase Order: {auction.purchaseOrder}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Auction End Time */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {isEnded ? 'Ended' : 'Ends'}: {new Date(auction.endTime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
