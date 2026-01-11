import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { materialAPI } from '../../api/materialAPI';
import { auctionAPI } from '../../api/auctionAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import VerificationStatusBanner from '../../components/VerificationStatusBanner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Gavel, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  MapPin,
  Search,
  BarChart3
} from 'lucide-react';

const MyAuctionsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, active, sold, cancelled
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, ewaste, fmgc, metal, plastics, paper, textile, other
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user?.userType === 'seller') {
      fetchMaterials();
      fetchSellerAuctions();
    }
  }, [user, filter, categoryFilter, searchTerm]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const result = await materialAPI.getSellerMaterials();
      if (result.success) {
        let filtered = result.data;
        
        // Filter by status
        if (filter !== 'all') {
          filtered = filtered.filter(m => m.status === filter);
        }
        
        // Filter by category
        if (categoryFilter !== 'all') {
          filtered = filtered.filter(m => m.category === categoryFilter);
        }
        
        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(m => 
            m.name?.toLowerCase().includes(term) ||
            m.description?.toLowerCase().includes(term) ||
            m.category?.toLowerCase().includes(term)
          );
        }
        
        setMaterials(filtered);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerAuctions = async () => {
    try {
      const result = await auctionAPI.getSellerAuctions();
      if (result.success) {
        setAuctions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch seller auctions:', error);
    }
  };

  const handleAcceptBid = async (auctionId) => {
    if (!window.confirm('Are you sure you want to accept this bid? This will end the auction and wait for admin final approval.')) {
      return;
    }

    try {
      const result = await auctionAPI.acceptBidSeller(auctionId);
      if (result.success) {
        showSuccess('Bid accepted successfully! Waiting for admin final approval.');
        fetchSellerAuctions();
        fetchMaterials();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await materialAPI.delete(id);
      if (result.success) {
        showSuccess('Listing deleted successfully');
        fetchMaterials();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status, isVerified) => {
    if (!isVerified) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Pending Verification
        </span>
      );
    }

    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      sold: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sold' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getAuctionForMaterial = (materialId) => {
    return auctions.find(a => a.material?._id === materialId || a.material === materialId);
  };

  if (user?.userType !== 'seller') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">This page is only accessible to sellers.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VerificationStatusBanner user={user} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Auctions</h1>
          <p className="text-gray-600">Manage your auction listings</p>
        </div>
        <Link to="/seller/create-auction">
          <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
            Add New Auction
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              fullWidth
            />
          </div>
        </div>
        
        {/* Status and Category Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'active', 'sold', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === status
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'ewaste', 'fmgc', 'metal', 'plastics', 'paper', 'textile', 'other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                      categoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Auctions Found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You haven't created any auctions yet."
              : `No auctions with status "${filter}" found.`
            }
          </p>
          <Link to="/seller/create-auction">
            <Button variant="primary" leftIcon={<Plus className="h-5 w-5" />}>
              Add Your First Auction
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div
              key={material._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 relative">
                {material.images && material.images.length > 0 ? (
                  <img
                    src={material.images[0]}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(material.status, material.isVerified)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{material.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span className="capitalize">{material.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>
                      Starting: ₹{material.startingPrice?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{material.location?.city}, {material.location?.state}</span>
                  </div>
                  {material.auctionEndTime && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Ends: {new Date(material.auctionEndTime).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Auction Status for Seller */}
                {(() => {
                  const auction = getAuctionForMaterial(material._id);
                  if (auction) {
                    return (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Auction Status</span>
                          {auction.adminApproved ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Admin Accepted
                            </span>
                          ) : auction.status === 'ended' ? (
                            <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                              Ended - Pending Admin Approval
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Current Bid:</span>
                            <span className="font-semibold text-green-600 ml-1">₹{auction.currentBid?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Bids:</span>
                            <span className="font-semibold ml-1">{auction.bidCount || 0}</span>
                          </div>
                        </div>
                        {auction.sellerApproved && !auction.adminApproved && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                              <p className="text-xs text-blue-800 font-medium mb-1">✓ Bid Accepted by You (Seller)</p>
                              <p className="text-xs text-blue-700">
                                Waiting for admin final approval. Winner: {auction.winner?.name || auction.currentBidder?.name || 'N/A'}
                              </p>
                              {auction.sellerApprovedAt && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Accepted on {new Date(auction.sellerApprovedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {auction.adminApproved && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
                              <p className="text-xs text-green-800 font-medium mb-1">✓ Bid Accepted by Admin</p>
                              <p className="text-xs text-green-700">
                                Transaction will proceed manually. Winner: {auction.winner?.name || 'N/A'}
                              </p>
                              {auction.adminApprovedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  Accepted on {new Date(auction.adminApprovedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {!auction.sellerApproved && !auction.adminApproved && auction.currentBid > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleAcceptBid(auction._id)}
                              className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Accept Current Bid
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {(() => {
                    const auction = getAuctionForMaterial(material._id);
                    if (auction && auction.status === 'active' && auction.bidCount > 0) {
                      return (
                        <Link
                          to={`/seller/analytics?auctionId=${auction._id}`}
                          className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </Link>
                      );
                    }
                    return null;
                  })()}
                  {material.isVerified && (
                    <Link
                      to={`/auctions/${material._id}`}
                      className="flex-1 text-center px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Gavel className="h-4 w-4" />
                      View Auction
                    </Link>
                  )}
                  <button
                    onClick={() => navigate(`/seller/edit-auction/${material._id}`)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(material._id)}
                    disabled={deletingId === material._id}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === material._id ? (
                      <LoadingSpinner />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {materials.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Auction Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{materials.length}</div>
              <div className="text-sm text-gray-600">Total Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {materials.filter(m => !m.isVerified).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {materials.filter(m => m.status === 'active' && m.isVerified).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {materials.filter(m => m.status === 'sold').length}
              </div>
              <div className="text-sm text-gray-600">Sold</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAuctionsPage;
