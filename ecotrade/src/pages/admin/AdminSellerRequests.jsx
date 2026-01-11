import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Filter, Eye, Clock, Calendar, Package, DollarSign, MapPin, User, Check, X, Gavel } from 'lucide-react';
import { adminAPI } from '../../api/AdminAPI';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const AdminSellerRequests = () => {
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, 
    instant: 0, 
    scheduled: 0 
  });
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'instant', 'scheduled'
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingAuctionRequests(filters);
      if (response.success) {
        // Apply search filter on frontend if search is provided
        let filteredData = response.data || [];
        if (filters.search && filters.search.trim()) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(request => {
            const material = request.material || {};
            const seller = material.seller || {};
            return (
              material.name?.toLowerCase().includes(searchLower) ||
              material.category?.toLowerCase().includes(searchLower) ||
              seller.name?.toLowerCase().includes(searchLower) ||
              seller.email?.toLowerCase().includes(searchLower)
            );
          });
        }
        
        setRequests(filteredData);
        
        // Use stats from backend if available, otherwise calculate from filtered data
        if (response.stats) {
          setStats(response.stats);
        } else {
          const instant = filteredData.filter(a => 
            (a.isDraft && (!a.scheduledPublishDate || new Date(a.scheduledPublishDate) <= new Date()))
          ).length;
          const scheduled = filteredData.filter(a => 
            a.scheduledPublishDate && new Date(a.scheduledPublishDate) > new Date()
          ).length;
          setStats({
            total: filteredData.length,
            instant,
            scheduled
          });
        }
        
        setPagination(response.pagination || { total: filteredData.length, page: 1, pages: 1 });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch auction requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this auction request? It will go live immediately (or at scheduled time) and buyers can start bidding.')) {
      return;
    }

    setApprovingId(id);
    try {
      const result = await adminAPI.approveScheduledAuction(id);
      if (result.success) {
        showSuccess('Auction approved! It is now live and buyers can bid.');
        fetchRequests();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to approve auction');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id, reason = '') => {
    const rejectionReason = reason || window.prompt('Enter rejection reason (optional):');
    if (rejectionReason === null) {
      return; // User cancelled
    }

    if (!window.confirm('Reject this auction request? The seller will be notified.')) {
      return;
    }

    try {
      const result = await adminAPI.rejectAuctionRequest(id, rejectionReason || 'No reason provided');
      if (result.success) {
        showSuccess('Auction request rejected. Seller has been notified.');
        fetchRequests();
        if (showViewModal) {
          setShowViewModal(false);
          setSelectedRequest(null);
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reject auction request');
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleTypeChange = (type) => {
    setFilters(prev => ({ ...prev, type, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (auction) => {
    if (auction.scheduledPublishDate) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Scheduled
        </span>
      );
    } else if (auction.isDraft) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Instant
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Draft
      </span>
    );
  };

  // Requests are already filtered in fetchRequests, so use them directly
  const filteredRequests = requests;

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Auction Requests</h1>
        <p className="text-gray-600 mt-1">Approve seller auction requests to make them live</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Pending</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <Gavel className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Instant Requests</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.instant}</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Scheduled Requests</p>
              <p className="text-2xl font-bold text-purple-900">{stats.scheduled}</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by material name, category, seller name or email..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {['all', 'instant', 'scheduled'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filters.type === type
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending auction requests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredRequests.map((request) => {
              const material = request.material || {};
              const seller = material.seller || {};
              const isInstant = request.isDraft && !request.scheduledPublishDate;
              const isScheduled = request.scheduledPublishDate;

              return (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {material.name || 'Unnamed Material'}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{material.category}</p>
                    </div>
                    {getStatusBadge(request)}
                  </div>

                  {/* Image */}
                  {material.images && material.images[0] && (
                    <img
                      src={material.images[0]}
                      alt={material.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Starting: ₹{request.startingPrice?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2" />
                      <span>
                        {material.quantity} {material.unit || 'units'}
                      </span>
                    </div>
                    {material.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {material.location.city}, {material.location.state}
                        </span>
                      </div>
                    )}
                    {isScheduled && (
                      <div className="flex items-center text-sm text-purple-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Scheduled: {formatDate(request.scheduledPublishDate)}</span>
                      </div>
                    )}
                    {isInstant && (
                      <div className="flex items-center text-sm text-yellow-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Will go live immediately after approval</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Seller: {seller.name || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request._id)}
                      isLoading={approvingId === request._id}
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const reason = window.prompt('Enter rejection reason (optional):');
                        if (reason !== null) {
                          handleReject(request._id, reason || '');
                        }
                      }}
                      leftIcon={<XCircle className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowViewModal(true);
                      }}
                      className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.page}</span> of{' '}
              <span className="font-medium">{pagination.pages}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Auction Request Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-4">
              {selectedRequest.material && (
                <>
                  {/* Material Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Material Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                        <p className="text-gray-900">{selectedRequest.material.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <p className="text-gray-900 capitalize">{selectedRequest.material.category}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <p className="text-gray-900">
                          {selectedRequest.material.quantity} {selectedRequest.material.unit}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price</label>
                        <p className="text-gray-900 font-semibold">₹{selectedRequest.startingPrice?.toLocaleString() || '0'}</p>
                      </div>
                      {selectedRequest.material.location && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <p className="text-gray-900">{selectedRequest.material.location.city}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <p className="text-gray-900">{selectedRequest.material.location.state}</p>
                          </div>
                        </>
                      )}
                      {selectedRequest.scheduledPublishDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Publish Date</label>
                          <p className="text-gray-900">{formatDate(selectedRequest.scheduledPublishDate)}</p>
                        </div>
                      )}
                      {selectedRequest.tokenAmount > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Token Amount</label>
                          <p className="text-gray-900 font-semibold">₹{selectedRequest.tokenAmount.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {selectedRequest.material.description && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.material.description}</p>
                      </div>
                    )}
                    {selectedRequest.material.images && selectedRequest.material.images.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedRequest.material.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${selectedRequest.material.name} ${idx + 1}`}
                              className="w-full h-24 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seller Info */}
                  {selectedRequest.material.seller && (
                    <div className="mb-6 pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <p className="text-gray-900">{selectedRequest.material.seller.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <p className="text-gray-900">{selectedRequest.material.seller.email}</p>
                        </div>
                        {selectedRequest.material.seller.phoneNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <p className="text-gray-900">{selectedRequest.material.seller.phoneNumber}</p>
                          </div>
                        )}
                        {selectedRequest.material.seller.companyName && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <p className="text-gray-900">{selectedRequest.material.seller.companyName}</p>
                          </div>
                        )}
                        {selectedRequest.material.seller.address && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <p className="text-gray-900">{selectedRequest.material.seller.address}</p>
                          </div>
                        )}
                        {(selectedRequest.material.seller.city || selectedRequest.material.seller.state) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <p className="text-gray-900">
                              {selectedRequest.material.seller.city || ''}
                              {selectedRequest.material.seller.city && selectedRequest.material.seller.state ? ', ' : ''}
                              {selectedRequest.material.seller.state || ''}
                              {selectedRequest.material.seller.pincode ? ` - ${selectedRequest.material.seller.pincode}` : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Auction Info */}
                  <div className="mb-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Auction Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        {getStatusBadge(selectedRequest)}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <p className="text-gray-900">{formatDate(selectedRequest.endTime)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
                        <p className="text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="pt-6 border-t flex gap-3">
                <Button
                  onClick={() => {
                    handleApprove(selectedRequest._id);
                    setShowViewModal(false);
                  }}
                  isLoading={approvingId === selectedRequest._id}
                  leftIcon={<CheckCircle className="h-5 w-5" />}
                  className="flex-1"
                >
                  Approve & Make Live
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const reason = window.prompt('Enter rejection reason (optional):');
                    if (reason !== null) {
                      handleReject(selectedRequest._id, reason || '');
                    }
                  }}
                  leftIcon={<XCircle className="h-5 w-5" />}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRequest(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellerRequests;
