import React, { useState, useEffect } from 'react';
import { rfqAPI } from '../../api/rfqAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';

const RFQManagementPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseData, setResponseData] = useState({ quotedPrice: '', message: '' });

  useEffect(() => {
    if (user?.isVerified && user?.userType === 'seller') {
      fetchRFQs();
    }
  }, [user]);

  const fetchRFQs = async () => {
    try {
      const result = await rfqAPI.getSellerRFQs();
      if (result.success) {
        setRfqs(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (rfqId) => {
    try {
      const result = await rfqAPI.respond(rfqId, responseData);
      if (result.success) {
        showSuccess('RFQ response submitted');
        setRespondingTo(null);
        setResponseData({ quotedPrice: '', message: '' });
        fetchRFQs();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to respond');
    }
  };

  if (!user?.isVerified || user?.userType !== 'seller') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">RFQ Management</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div key={rfq._id} className="border rounded-lg p-4">
              <h3 className="font-bold">{rfq.material?.name}</h3>
              <p>Buyer: {rfq.buyer?.name}</p>
              <p>Status: {rfq.status}</p>
              {rfq.status === 'pending' && (
                <div className="mt-4">
                  {respondingTo === rfq._id ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Quoted Price"
                        value={responseData.quotedPrice}
                        onChange={(e) => setResponseData({ ...responseData, quotedPrice: e.target.value })}
                        className="border rounded p-2 w-full"
                      />
                      <textarea
                        placeholder="Message"
                        value={responseData.message}
                        onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                        className="border rounded p-2 w-full"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleRespond(rfq._id)}>Submit Response</Button>
                        <Button onClick={() => setRespondingTo(null)} variant="secondary">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setRespondingTo(rfq._id)}>Respond</Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RFQManagementPage;

