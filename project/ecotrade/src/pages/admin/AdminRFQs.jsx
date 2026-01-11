import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';
import { useToast } from '../../contexts/ToastContext';
import { FileText, DollarSign, User, Clock, Eye, Search, CheckCircle, XCircle, Phone, MapPin, Building, Mail, Edit, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminRFQs = () => {
  const { showSuccess, showError } = useToast();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });

  useEffect(() => {
    fetchRFQs();
  }, [filters, pagination.page]);

  const fetchRFQs = async () => {
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
      
      const result = await adminAPI.getAllRFQs(params);
      if (result.success) {
        setRfqs(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          pages: result.pagination.pages
        }));
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch RFQs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = (rfq) => {
    setSelectedRFQ(rfq);
    setShowDetails(true);
  };

  const handleApproveRFQ = async (id) => {
    if (!window.confirm('Approve this RFQ? This will finalize the transaction and it will proceed manually outside the platform.')) {
      return;
    }
    try {
      const result = await adminAPI.approveRFQ(id);
      if (result.success) {
        showSuccess('RFQ approved! Transaction will proceed manually.');
        fetchRFQs();
        if (selectedRFQ && selectedRFQ._id === id) {
          setSelectedRFQ(result.data);
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to approve RFQ');
    }
  };

  const handleRejectRFQ = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled
    
    if (!window.confirm('Reject this RFQ? This action cannot be undone.')) {
      return;
    }
    try {
      const result = await adminAPI.rejectRFQ(id, reason);
      if (result.success) {
        showSuccess('RFQ rejected successfully');
        fetchRFQs();
        if (selectedRFQ && selectedRFQ._id === id) {
          setSelectedRFQ(result.data);
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reject RFQ');
    }
  };

  const handleUpdateStatus = async (rfqId) => {
    if (!statusUpdate.status) {
      showError('Please select a status');
      return;
    }
    try {
      const result = await adminAPI.updateRFQStatus(rfqId, statusUpdate);
      if (result.success) {
        showSuccess('RFQ status updated successfully');
        setEditingStatus(null);
        setStatusUpdate({ status: '', notes: '' });
        fetchRFQs();
        if (selectedRFQ && selectedRFQ._id === rfqId) {
          setSelectedRFQ(result.data);
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update RFQ status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'admin-approved':
        return 'bg-green-100 text-green-800';
      case 'finalized':
        return 'bg-green-200 text-green-900';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      rfq.material?.name?.toLowerCase().includes(searchLower) ||
      rfq.buyer?.name?.toLowerCase().includes(searchLower) ||
      rfq.buyer?.email?.toLowerCase().includes(searchLower) ||
      rfq.buyer?.phoneNumber?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">RFQs Management</h1>
        <p className="text-gray-600">View and monitor all request for quotes. Contact buyers and sellers externally to finalize transactions.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Search RFQs by material, buyer name, email, phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              fullWidth
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="accepted">Accepted</option>
            <option value="admin-approved">Admin Approved</option>
            <option value="finalized">Finalized</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* RFQs Table */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading RFQs...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRFQs.map((rfq) => (
                    <tr key={rfq._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {rfq.material?.images && rfq.material.images[0] && (
                            <img
                              src={rfq.material.images[0]}
                              alt={rfq.material.name}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rfq.material?.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{rfq.material?.category}</div>
                            <div className="text-xs text-gray-500">Qty: {rfq.material?.quantity} {rfq.material?.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{rfq.buyer?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{rfq.buyer?.email || 'N/A'}</div>
                        {rfq.buyer?.phoneNumber && (
                          <div className="text-xs text-gray-500">{rfq.buyer.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{rfq.material?.seller?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{rfq.material?.seller?.email || 'N/A'}</div>
                        {rfq.material?.seller?.phoneNumber && (
                          <div className="text-xs text-gray-500">{rfq.material.seller.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq.status)}`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rfq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(rfq)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {rfq.status !== 'finalized' && rfq.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setEditingStatus(rfq._id);
                                setStatusUpdate({ status: rfq.status, notes: rfq.adminNotes || '' });
                              }}
                              className="inline-flex items-center text-green-600 hover:text-green-800"
                              title="Update Status"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} RFQs
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

          {filteredRFQs.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No RFQs found</p>
            </div>
          )}
        </>
      )}

      {/* Status Update Modal */}
      {editingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Update RFQ Status</h3>
              <button
                onClick={() => {
                  setEditingStatus(null);
                  setStatusUpdate({ status: '', notes: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="responded">Responded</option>
                  <option value="accepted">Accepted</option>
                  <option value="admin-approved">Admin Approved</option>
                  <option value="finalized">Finalized</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes (Optional)</label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  rows="3"
                  placeholder="Add notes about external communication, agreements, etc."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateStatus(editingStatus)}
                  variant="primary"
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button
                  onClick={() => {
                    setEditingStatus(null);
                    setStatusUpdate({ status: '', notes: '' });
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">RFQ Details</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedRFQ(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Material Info */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Material Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    {selectedRFQ.material?.images && selectedRFQ.material.images[0] && (
                      <img
                        src={selectedRFQ.material.images[0]}
                        alt={selectedRFQ.material.name}
                        className="h-20 w-20 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{selectedRFQ.material?.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{selectedRFQ.material?.category}</p>
                      <p className="text-sm text-gray-600">Qty: {selectedRFQ.material?.quantity} {selectedRFQ.material?.unit}</p>
                    </div>
                  </div>
                  <div>
                    <Link
                      to={`/materials/${selectedRFQ.material?._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Material Details →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Buyer Details - Full Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Buyer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="font-semibold">{selectedRFQ.buyer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-semibold">{selectedRFQ.buyer?.email || 'N/A'}</p>
                  </div>
                  {selectedRFQ.buyer?.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </p>
                      <p className="font-semibold">{selectedRFQ.buyer.phoneNumber}</p>
                    </div>
                  )}
                  {selectedRFQ.buyer?.companyName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Company
                      </p>
                      <p className="font-semibold">{selectedRFQ.buyer.companyName}</p>
                    </div>
                  )}
                  {selectedRFQ.buyer?.address && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Address
                      </p>
                      <p className="font-semibold">{selectedRFQ.buyer.address}</p>
                    </div>
                  )}
                  {(selectedRFQ.buyer?.city || selectedRFQ.buyer?.state) && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-semibold">
                        {selectedRFQ.buyer.city || ''} {selectedRFQ.buyer.city && selectedRFQ.buyer.state ? ',' : ''} {selectedRFQ.buyer.state || ''}
                        {selectedRFQ.buyer.pincode && ` - ${selectedRFQ.buyer.pincode}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Details */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Seller Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="font-semibold">{selectedRFQ.material?.seller?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-semibold">{selectedRFQ.material?.seller?.email || 'N/A'}</p>
                  </div>
                  {selectedRFQ.material?.seller?.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </p>
                      <p className="font-semibold">{selectedRFQ.material.seller.phoneNumber}</p>
                    </div>
                  )}
                  {selectedRFQ.material?.seller?.companyName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Company
                      </p>
                      <p className="font-semibold">{selectedRFQ.material.seller.companyName}</p>
                    </div>
                  )}
                  {(selectedRFQ.material?.seller?.city || selectedRFQ.material?.seller?.state) && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-semibold">
                        {selectedRFQ.material.seller.city || ''} {selectedRFQ.material.seller.city && selectedRFQ.material.seller.state ? ',' : ''} {selectedRFQ.material.seller.state || ''}
                        {selectedRFQ.material.seller.pincode && ` - ${selectedRFQ.material.seller.pincode}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RFQ Info */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">RFQ Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRFQ.status)}`}>
                      {selectedRFQ.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="font-semibold">{new Date(selectedRFQ.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedRFQ.message && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Buyer Message</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedRFQ.message}</p>
                    </div>
                  )}
                  {selectedRFQ.adminNotes && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Admin Notes</p>
                      <p className="text-sm bg-yellow-50 p-3 rounded">{selectedRFQ.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setEditingStatus(selectedRFQ._id);
                    setStatusUpdate({ status: selectedRFQ.status, notes: selectedRFQ.adminNotes || '' });
                    setShowDetails(false);
                  }}
                  variant="primary"
                  leftIcon={<Edit className="h-4 w-4" />}
                >
                  Update Status
                </Button>
                {selectedRFQ.status !== 'admin-approved' && selectedRFQ.status !== 'finalized' && selectedRFQ.status !== 'cancelled' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApproveRFQ(selectedRFQ._id);
                        setShowDetails(false);
                      }}
                      variant="primary"
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                    >
                      Approve RFQ
                    </Button>
                    <Button
                      onClick={() => {
                        handleRejectRFQ(selectedRFQ._id);
                        setShowDetails(false);
                      }}
                      variant="outline"
                      leftIcon={<XCircle className="h-4 w-4" />}
                    >
                      Reject RFQ
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedRFQ(null);
                  }}
                  variant="outline"
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

export default AdminRFQs;
