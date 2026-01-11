import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/AdminAPI';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Calendar, Filter, X } from 'lucide-react';
import Input from '../../components/ui/Input';

const AdminVerifications = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ userType: '', status: 'pending' });

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchVerifications = async () => {
    try {
      const result = await adminAPI.getPendingVerifications(filter);
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      const result = await adminAPI.verifyUser(id);
      if (result.success) {
        showSuccess('User verified successfully');
        fetchVerifications();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await adminAPI.rejectUser(id);
      if (result.success) {
        showSuccess('User verification rejected');
        fetchVerifications();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reject user');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">User Verifications</h1>
        <p className="text-gray-600">Review and approve buyer and seller accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filter.userType}
            onChange={(e) => setFilter({ ...filter, userType: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verifications...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{user.userType}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.verificationStatus)}`}>
                  {getStatusIcon(user.verificationStatus)}
                  <span className="ml-1 capitalize">{user.verificationStatus}</span>
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{user.address}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {user.verifiedBy && (
                <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  Verified by: {user.verifiedBy.name} on {new Date(user.verifiedAt).toLocaleDateString()}
                </div>
              )}

              {user.verificationStatus === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerify(user._id)}
                    size="sm"
                    className="flex-1"
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(user._id)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    leftIcon={<XCircle className="h-4 w-4" />}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No users found with the selected filters</p>
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;

