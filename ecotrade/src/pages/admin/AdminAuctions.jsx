import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/AdminAPI';
import { auctionAPI } from '../../api/auctionAPI';
import { useToast } from '../../contexts/ToastContext';
import { Gavel, Clock, DollarSign, Users, Eye, Filter, CheckCircle, XCircle, History, X, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminAuctions = () => {
  const { showSuccess, showError } = useToast();
  
  const handleAcceptBid = async (id) => {
    if (!window.confirm('Accept this bid? This will end the auction and transaction will proceed manually outside the platform (supply, delivery, etc.).')) {
      return;
    }
    try {
      const result = await adminAPI.acceptBid(id);
      if (result.success) {
        showSuccess('Bid accepted! Transaction will proceed manually.');
        fetchAuctions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleCloseAuction = async (id) => {
    if (!window.confirm('Close this auction? This will end the auction immediately. You can accept the bid later.')) {
      return;
    }
    try {
      const result = await adminAPI.closeAuction(id);
      if (result.success) {
        showSuccess('Auction closed successfully');
        fetchAuctions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to close auction');
    }
  };

  const handleDeleteAuction = async (id) => {
    const auction = auctions.find(a => a._id === id);
    const auctionName = auction?.material?.name || 'Auction';
    
    if (!window.confirm(`Are you sure you want to delete this auction "${auctionName}"? This will permanently delete the auction, all associated bids, and the material. This action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await adminAPI.deleteAuction(id);
      if (result.success) {
        showSuccess('Auction deleted successfully');
        fetchAuctions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete auction');
    }
  };

  const handleTokenReceived = async (id) => {
    if (!window.confirm('Mark token payment as received? This will approve the token status for the buyer.')) {
      return;
    }
    try {
      const result = await adminAPI.markTokenReceived(id);
      if (result.success) {
        showSuccess('Token payment marked as received! Buyer status updated to approved.');
        fetchAuctions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to mark token as received');
    }
  };
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [editBidData, setEditBidData] = useState({
    amount: '',
    timestamp: '',
    bidderId: '',
    status: 'active',
    isWinning: false,
    isOutbid: false,
    closedAt: ''
  });
  const [showAddBid, setShowAddBid] = useState(false);
  const [newBidData, setNewBidData] = useState({
    amount: '',
    bidderId: '',
    timestamp: '',
    status: 'active'
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [auctionDetails, setAuctionDetails] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, [filters, pagination.page]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const result = await adminAPI.getAllAuctions(params);
      if (result.success) {
        setAuctions(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          pages: result.pagination.pages
        }));
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const filteredAuctions = auctions.filter(auction => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      auction.material?.name?.toLowerCase().includes(searchLower) ||
      auction.material?.category?.toLowerCase().includes(searchLower)
    );
  });

  const isEnded = (endTime) => {
    return new Date(endTime) <= new Date();
  };

  const handleViewBidHistory = async (auctionId) => {
    setSelectedAuction(auctionId);
    setLoadingBids(true);
    setShowBidHistory(true);
    try {
      const [bidResult, usersResult, auctionResult] = await Promise.all([
        auctionAPI.getBidHistory(auctionId),
        adminAPI.getUsers(),
        auctionAPI.getById(auctionId)
      ]);
      if (bidResult.success) {
        setBidHistory(bidResult.data || []);
      }
      if (usersResult) {
        // Include verified buyers and admin users as potential bidders
        const buyers = usersResult.filter(u => (u.userType === 'buyer' && u.isVerified) || u.role === 'admin');
        setUsers(buyers);
      }
      if (auctionResult.success) {
        setAuctionDetails(auctionResult.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch bid history');
    } finally {
      setLoadingBids(false);
    }
  };

  const handleEditBid = (bid) => {
    setEditingBid(bid);
    // Format date for input (YYYY-MM-DDTHH:mm)
    const timestamp = bid.timestamp ? new Date(bid.timestamp).toISOString().slice(0, 16) : '';
    const closedAt = bid.closedAt ? new Date(bid.closedAt).toISOString().slice(0, 16) : '';
    
    setEditBidData({
      amount: bid.amount?.toString() || '',
      timestamp: timestamp,
      bidderId: bid.bidder?._id || bid.bidder || '',
      status: bid.status || 'active',
      isWinning: bid.isWinning || false,
      isOutbid: bid.isOutbid || false,
      closedAt: closedAt
    });
  };

  const handleSaveEdit = async () => {
    if (!editBidData.amount || parseFloat(editBidData.amount) <= 0) {
      showError('Please enter a valid bid amount');
      return;
    }
    try {
      const updateData = {
        amount: parseFloat(editBidData.amount),
        timestamp: editBidData.timestamp || undefined,
        bidderId: editBidData.bidderId || undefined,
        status: editBidData.status,
        isWinning: editBidData.isWinning,
        isOutbid: editBidData.isOutbid,
        closedAt: editBidData.closedAt || undefined
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      const result = await adminAPI.updateBid(editingBid._id, updateData);
      if (result.success) {
        showSuccess('Bid updated successfully');
        setEditingBid(null);
        setEditBidData({
          amount: '',
          timestamp: '',
          bidderId: '',
          status: 'active',
          isWinning: false,
          isOutbid: false,
          closedAt: ''
        });
        handleViewBidHistory(selectedAuction);
        fetchAuctions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update bid');
    }
  };

  const handleDeleteBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to delete this bid? This action cannot be undone.')) {
      return;
    }
    try {
      const result = await adminAPI.deleteBid(bidId);
      if (result.success) {
        showSuccess('Bid deleted successfully');
        handleViewBidHistory(selectedAuction);
        fetchAuctions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete bid');
    }
  };

  const handleAddBid = async () => {
    if (!newBidData.bidderId || !newBidData.amount || parseFloat(newBidData.amount) <= 0) {
      showError('Please select a bidder and enter a valid bid amount');
      return;
    }
    try {
      const result = await adminAPI.createBid(
        selectedAuction, 
        newBidData.bidderId, 
        parseFloat(newBidData.amount),
        newBidData.timestamp || undefined,
        newBidData.status || undefined
      );
      if (result.success) {
        showSuccess('Bid added successfully');
        setShowAddBid(false);
        setNewBidData({
          amount: '',
          bidderId: '',
          timestamp: '',
          status: 'active'
        });
        handleViewBidHistory(selectedAuction);
        fetchAuctions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add bid');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Auctions Management</h1>
        <p className="text-gray-600">View and monitor all active and completed auctions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Search auctions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={<Gavel className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="seller-approved">Seller Approved</option>
            <option value="admin-approved">Admin Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auctions...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAuctions.map((auction) => (
              <div key={auction._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {auction.material?.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {auction.material?.category}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      auction.status === 'active' && !isEnded(auction.endTime)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {auction.status === 'active' && !isEnded(auction.endTime) ? 'Active' : 'Ended'}
                    </span>
                  </div>

                  {auction.material?.images && auction.material.images[0] && (
                    <img
                      src={auction.material.images[0]}
                      alt={auction.material.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="space-y-3">
                    {/* Seller Information */}
                    {auction.material?.seller && (
                      <div className="pb-3 border-b">
                        <p className="text-xs font-medium text-gray-500 mb-1">Seller Information</p>
                        <p className="text-sm font-semibold text-gray-900">{auction.material.seller.name || 'N/A'}</p>
                        {auction.material.seller.email && (
                          <p className="text-xs text-gray-600">Email: {auction.material.seller.email}</p>
                        )}
                        {auction.material.seller.phoneNumber && (
                          <p className="text-xs text-gray-600">Phone: {auction.material.seller.phoneNumber}</p>
                        )}
                        {auction.material.seller.address && (
                          <p className="text-xs text-gray-600">Address: {auction.material.seller.address}</p>
                        )}
                        {auction.adminApprovedAt && (
                          <p className="text-xs text-gray-500 mt-1">Accepted: {new Date(auction.adminApprovedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="text-sm">Current Bid</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ₹{auction.currentBid?.toFixed(2) || '0.00'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">Total Bids</span>
                      </div>
                      <span className="text-sm font-medium">{auction.bidCount || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">Ends</span>
                      </div>
                      <span className="text-sm">
                        {new Date(auction.endTime).toLocaleString()}
                      </span>
                    </div>

                    {auction.winner && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600">Winner:</p>
                        <p className="text-sm font-medium">{auction.winner.name}</p>
                      </div>
                    )}

                    {auction.adminApproved && (
                      <div className="pt-3 border-t mt-3">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Admin Approved
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Approved on {new Date(auction.adminApprovedAt).toLocaleDateString()}
                        </p>
                        {auction.purchaseOrder && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs font-semibold text-green-800">Purchase Order:</p>
                            <p className="text-sm font-bold text-green-900">{auction.purchaseOrder}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {auction.winner && auction.tokenAmount && auction.tokenAmount > 0 && (
                      <div className="pt-3 border-t mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="text-sm">Token Amount</span>
                          </div>
                          <span className="text-sm font-medium">
                            ₹{auction.tokenAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Token Status:</span>
                          {auction.tokenPaid ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Received
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/auctions/${auction._id}`}
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                      <button
                        onClick={() => handleViewBidHistory(auction._id)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        title="View Bid History"
                      >
                        <History className="h-4 w-4 mr-1" />
                        Bid History ({auction.bidCount || 0})
                      </button>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <div className="flex gap-2">
                        {auction.status === 'active' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCloseAuction(auction._id)}
                            leftIcon={<XCircle className="h-4 w-4" />}
                            className="flex-1"
                          >
                            Close Auction
                          </Button>
                        )}
                        {!auction.adminApproved && (auction.status === 'ended' || auction.status === 'active') && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptBid(auction._id)}
                            leftIcon={<CheckCircle className="h-4 w-4" />}
                            className="flex-1"
                          >
                            Accept Bid
                          </Button>
                        )}
                        {/* Delete button - show for all auctions except those with processed PO */}
                        {!(auction.adminApproved && auction.purchaseOrder) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAuction(auction._id)}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            className="flex-1 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      {/* Token Received button - show when auction has winner, token amount, and token not yet paid */}
                      {auction.winner && auction.tokenAmount && auction.tokenAmount > 0 && !auction.tokenPaid && (
                        <Button
                          size="sm"
                          onClick={() => handleTokenReceived(auction._id)}
                          leftIcon={<DollarSign className="h-4 w-4" />}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Token Received
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} auctions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {filteredAuctions.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No auctions found</p>
            </div>
          )}
        </>
      )}

      {/* Bid History Modal */}
      {showBidHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Bid History</h2>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowAddBid(!showAddBid)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Bid
                </Button>
                <button
                  onClick={() => {
                    setShowBidHistory(false);
                    setBidHistory([]);
                    setSelectedAuction(null);
                    setEditingBid(null);
                    setShowAddBid(false);
                    setAuctionDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingBids ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading bid history...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Seller Form Data - Material Details */}
                  {auctionDetails && auctionDetails.material && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-blue-900 mb-3 text-lg">Seller Form Data - Material Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Material Name:</span>
                          <p className="text-gray-900">{auctionDetails.material.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Category:</span>
                          <p className="text-gray-900 capitalize">{auctionDetails.material.category || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Quantity:</span>
                          <p className="text-gray-900">{auctionDetails.material.quantity || '0'} {auctionDetails.material.unit || 'kg'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Condition:</span>
                          <p className="text-gray-900 capitalize">{auctionDetails.material.condition || 'N/A'}</p>
                        </div>
                        {auctionDetails.material.description && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Description:</span>
                            <p className="text-gray-900 mt-1 whitespace-pre-wrap">{auctionDetails.material.description}</p>
                          </div>
                        )}
                        {auctionDetails.material.location && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Location:</span>
                            <p className="text-gray-900">
                              {auctionDetails.material.location.address && `${auctionDetails.material.location.address}, `}
                              {auctionDetails.material.location.city}, {auctionDetails.material.location.state}
                              {auctionDetails.material.location.pincode && ` - ${auctionDetails.material.location.pincode}`}
                            </p>
                          </div>
                        )}
                        {auctionDetails.material.seller && (
                          <div className="md:col-span-2 border-t pt-3 mt-2">
                            <span className="font-medium text-gray-700">Seller Information:</span>
                            <div className="mt-2 space-y-1">
                              <p className="text-gray-900"><strong>Name:</strong> {auctionDetails.material.seller.name || 'N/A'}</p>
                              {auctionDetails.material.seller.email && (
                                <p className="text-gray-900"><strong>Email:</strong> {auctionDetails.material.seller.email}</p>
                              )}
                              {auctionDetails.material.seller.phoneNumber && (
                                <p className="text-gray-900"><strong>Phone:</strong> {auctionDetails.material.seller.phoneNumber}</p>
                              )}
                              {auctionDetails.material.seller.address && (
                                <p className="text-gray-900"><strong>Address:</strong> {auctionDetails.material.seller.address}</p>
                              )}
                              {auctionDetails.material.seller.city && (
                                <p className="text-gray-900">
                                  <strong>Location:</strong> {auctionDetails.material.seller.city}
                                  {auctionDetails.material.seller.state && `, ${auctionDetails.material.seller.state}`}
                                  {auctionDetails.material.seller.pincode && ` - ${auctionDetails.material.seller.pincode}`}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Category-specific fields */}
                        {auctionDetails.material.ewasteType && (
                          <div>
                            <span className="font-medium text-gray-700">E-Waste Type:</span>
                            <p className="text-gray-900">{auctionDetails.material.ewasteType}</p>
                          </div>
                        )}
                        {auctionDetails.material.metalType && (
                          <div>
                            <span className="font-medium text-gray-700">Metal Type:</span>
                            <p className="text-gray-900">{auctionDetails.material.metalType}</p>
                          </div>
                        )}
                        {auctionDetails.material.plasticType && (
                          <div>
                            <span className="font-medium text-gray-700">Plastic Type:</span>
                            <p className="text-gray-900">{auctionDetails.material.plasticType}</p>
                          </div>
                        )}
                        {auctionDetails.material.paperType && (
                          <div>
                            <span className="font-medium text-gray-700">Paper Type:</span>
                            <p className="text-gray-900">{auctionDetails.material.paperType}</p>
                          </div>
                        )}
                        {auctionDetails.material.textileType && (
                          <div>
                            <span className="font-medium text-gray-700">Textile Type:</span>
                            <p className="text-gray-900">{auctionDetails.material.textileType}</p>
                          </div>
                        )}
                        {auctionDetails.material.brand && (
                          <div>
                            <span className="font-medium text-gray-700">Brand:</span>
                            <p className="text-gray-900">{auctionDetails.material.brand}</p>
                          </div>
                        )}
                        {auctionDetails.material.brandList && (
                          <div>
                            <span className="font-medium text-gray-700">Brand List:</span>
                            <p className="text-gray-900">{auctionDetails.material.brandList}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {bidHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No bids found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                  {/* Add Bid Form */}
                  {showAddBid && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Add New Bid</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bidder *</label>
                          <select
                            value={newBidData.bidderId}
                            onChange={(e) => setNewBidData({...newBidData, bidderId: e.target.value})}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          >
                            <option value="">Select a buyer...</option>
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount (₹) *</label>
                          <Input
                            type="number"
                            value={newBidData.amount}
                            onChange={(e) => setNewBidData({...newBidData, amount: e.target.value})}
                            placeholder="Enter bid amount"
                            fullWidth
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bid Date & Time</label>
                          <Input
                            type="datetime-local"
                            value={newBidData.timestamp}
                            onChange={(e) => setNewBidData({...newBidData, timestamp: e.target.value})}
                            fullWidth
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty to use current time</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={newBidData.status}
                            onChange={(e) => setNewBidData({...newBidData, status: e.target.value})}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAddBid}
                            className="flex-1"
                          >
                            Add Bid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowAddBid(false);
                              setNewBidData({
                                amount: '',
                                bidderId: '',
                                timestamp: '',
                                status: 'active'
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                      {bidHistory.map((bid, index) => (
                    <div
                      key={bid._id}
                      className={`p-4 rounded-lg border ${
                        bid.isWinning
                          ? 'bg-green-50 border-green-200'
                          : bid.isOutbid
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {editingBid?._id === bid._id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount (₹) *</label>
                              <Input
                                type="number"
                                value={editBidData.amount}
                                onChange={(e) => setEditBidData({...editBidData, amount: e.target.value})}
                                placeholder="Enter bid amount"
                                fullWidth
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Bidder</label>
                              <select
                                value={editBidData.bidderId}
                                onChange={(e) => setEditBidData({...editBidData, bidderId: e.target.value})}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                              >
                                <option value="">Select bidder...</option>
                                {users.map(user => (
                                  <option key={user._id} value={user._id}>
                                    {user.name} ({user.email})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Bid Date & Time</label>
                              <Input
                                type="datetime-local"
                                value={editBidData.timestamp}
                                onChange={(e) => setEditBidData({...editBidData, timestamp: e.target.value})}
                                fullWidth
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                value={editBidData.status}
                                onChange={(e) => setEditBidData({...editBidData, status: e.target.value})}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                              >
                                <option value="active">Active</option>
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Closed Date & Time</label>
                              <Input
                                type="datetime-local"
                                value={editBidData.closedAt}
                                onChange={(e) => setEditBidData({...editBidData, closedAt: e.target.value})}
                                fullWidth
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editBidData.isWinning}
                                  onChange={(e) => setEditBidData({...editBidData, isWinning: e.target.checked, isOutbid: false})}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700">Is Winning Bid</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editBidData.isOutbid}
                                  onChange={(e) => setEditBidData({...editBidData, isOutbid: e.target.checked, isWinning: false})}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700">Is Outbid</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="flex-1"
                            >
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingBid(null);
                                setEditBidData({
                                  amount: '',
                                  timestamp: '',
                                  bidderId: '',
                                  status: 'active',
                                  isWinning: false,
                                  isOutbid: false,
                                  closedAt: ''
                                });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">#{bidHistory.length - index}</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {bid.bidder?.name || 'Unknown'}
                              </span>
                              {bid.isWinning && (
                                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                  Winning
                                </span>
                              )}
                              {bid.isOutbid && (
                                <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                  Outbid
                                </span>
                              )}
                              {(bid.status === 'won' || bid.status === 'lost') && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  bid.status === 'won' 
                                    ? 'text-green-800 bg-green-100' 
                                    : 'text-gray-600 bg-gray-100'
                                }`}>
                                  {bid.status === 'won' ? 'Won' : 'Lost'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                ₹{bid.amount?.toFixed(2) || '0.00'}
                              </span>
                              {/* Admin can edit/delete any bid except from cancelled auctions */}
                              <button
                                onClick={() => handleEditBid(bid)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit Bid"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBid(bid._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete Bid"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">Time:</span> {new Date(bid.timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            <span className="font-medium">Date:</span> {new Date(bid.timestamp).toLocaleDateString()}
                          </div>
                          {/* Full Profile Details for Admin */}
                          <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Bidder Profile Details:</div>
                            {bid.bidder?.name && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Name:</span> {bid.bidder.name}
                              </div>
                            )}
                            {bid.bidder?.email && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Email:</span> {bid.bidder.email}
                              </div>
                            )}
                            {bid.bidder?.phoneNumber && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Phone:</span> {bid.bidder.phoneNumber}
                              </div>
                            )}
                            {bid.bidder?.companyName && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Company:</span> {bid.bidder.companyName}
                              </div>
                            )}
                            {bid.bidder?.address && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Address:</span> {bid.bidder.address}
                              </div>
                            )}
                            {(bid.bidder?.city || bid.bidder?.state) && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Location:</span> {bid.bidder.city || ''} {bid.bidder.city && bid.bidder.state ? ',' : ''} {bid.bidder.state || ''} {bid.bidder.pincode ? `- ${bid.bidder.pincode}` : ''}
                              </div>
                            )}
                            {(bid.bidder?.userType || bid.bidder?.role) && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Type:</span> {bid.bidder.role === 'admin' ? 'Admin' : bid.bidder.userType || 'N/A'} {bid.bidder.isVerified && <span className="text-green-600">(Verified)</span>}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t space-y-2">
              {selectedAuction && !auctions.find(a => a._id === selectedAuction)?.adminApproved && (
                <Button
                  onClick={() => {
                    const auction = auctions.find(a => a._id === selectedAuction);
                    if (auction) {
                      handleAcceptBid(selectedAuction);
                    }
                  }}
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                  fullWidth
                  className="mb-2"
                >
                  Approve Bid & Generate PO
                </Button>
              )}
              <Button
                onClick={() => {
                  setShowBidHistory(false);
                  setBidHistory([]);
                  setSelectedAuction(null);
                  setEditingBid(null);
                  setShowAddBid(false);
                  setAuctionDetails(null);
                }}
                variant="outline"
                fullWidth
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuctions;

