import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { rfqAPI } from '../../api/rfqAPI';
import { materialAPI } from '../../api/materialAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import VerificationStatusBanner from '../../components/VerificationStatusBanner';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Package, MapPin, FileText, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';

const RFQPage = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [materialId]);

  const fetchMaterial = async () => {
    try {
      const result = await materialAPI.getById(materialId);
      if (result.success) {
        setMaterial(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch material:', error);
      showError('Failed to load material details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!user?.isVerified || user?.userType !== 'buyer') {
      showError('Only verified buyers can request quotes');
      return;
    }

    if (!window.confirm('Send request for quote? Admin will contact you and the seller to finalize the details.')) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await rfqAPI.create({ materialId });
      if (result.success) {
        showSuccess('Quote request sent successfully! Admin will contact you soon.');
        navigate('/buyer/my-rfqs');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send quote request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Material Not Found</h2>
          <p className="text-gray-500 mb-6">The material you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/materials')}>Back to Materials</Button>
        </div>
      </div>
    );
  }

  const imageUrl = material.images && material.images.length > 0 
    ? material.images[0] 
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container mx-auto px-4 py-8">
        <VerificationStatusBanner user={user} />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Material Info */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold mb-4">Request Quote</h1>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={material.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                </div>

                {/* Material Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{material.name}</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Category:</span>
                      <span className="capitalize">{material.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      <span>Quantity: {material.quantity} {material.unit}</span>
                    </div>
                    {material.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{material.location.city}, {material.location.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Info */}
            <div className="p-6">
              {(!user?.isVerified || user?.userType !== 'buyer') ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      {!user ? (
                        <>Please <Link to="/login" className="underline font-medium">log in</Link> as a buyer to request quotes.</>
                      ) : user?.userType !== 'buyer' ? (
                        <>Register as a buyer to request quotes.</>
                      ) : (
                        <>Your buyer account needs to be verified to request quotes. Admin will verify within 24 hours.</>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>Click "Send Request" to submit your quote request</li>
                          <li>Admin will review your request and contact you</li>
                          <li>Admin will also contact the seller to finalize details</li>
                          <li>You'll be updated about the status through the platform</li>
                          <li>Final transaction happens outside the platform</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Information</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div><span className="font-medium">Name:</span> {user.name}</div>
                      <div><span className="font-medium">Email:</span> {user.email}</div>
                      {user.phoneNumber && (
                        <div><span className="font-medium">Phone:</span> {user.phoneNumber}</div>
                      )}
                      {user.address && (
                        <div><span className="font-medium">Address:</span> {user.address}</div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Admin will use this information to contact you about the quote.
                    </p>
                  </div>

                  <Button
                    onClick={handleRequestQuote}
                    isLoading={submitting}
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<FileText className="h-5 w-5" />}
                  >
                    {submitting ? 'Sending Request...' : 'Send Request for Quote'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQPage;

