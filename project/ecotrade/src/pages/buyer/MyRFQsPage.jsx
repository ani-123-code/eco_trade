import React, { useState, useEffect } from 'react';
import { rfqAPI } from '../../api/rfqAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import VerificationStatusBanner from '../../components/VerificationStatusBanner';
import Button from '../../components/ui/Button';

const MyRFQsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isVerified && user?.userType === 'buyer') {
      fetchRFQs();
    }
  }, [user]);

  const fetchRFQs = async () => {
    try {
      const result = await rfqAPI.getMyRFQs();
      if (result.success) {
        setRfqs(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const result = await rfqAPI.accept(id);
      if (result.success) {
        showSuccess('RFQ accepted!');
        fetchRFQs();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to accept RFQ');
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await rfqAPI.reject(id);
      if (result.success) {
        showSuccess('RFQ rejected');
        fetchRFQs();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reject RFQ');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <VerificationStatusBanner user={user} />
      
      {(!user?.isVerified || user?.userType !== 'buyer') && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> Only verified buyers can view RFQs. Admin will verify your account within 24 hours.
          </p>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-8">My RFQs</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div key={rfq._id} className="border rounded-lg p-4">
              <h3 className="font-bold">{rfq.material?.name}</h3>
              <p>Status: {rfq.status}</p>
              {rfq.sellerResponse && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p>Quoted Price: ₹{rfq.sellerResponse.quotedPrice}</p>
                  <p>{rfq.sellerResponse.message}</p>
                </div>
              )}
              {rfq.status === 'responded' && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleAccept(rfq._id)}>Accept</Button>
                  <Button onClick={() => handleReject(rfq._id)} variant="secondary">Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRFQsPage;

