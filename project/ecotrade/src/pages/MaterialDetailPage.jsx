import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { materialAPI } from '../api/materialAPI';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Package,
  MapPin,
  ChevronLeft,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  User,
  CheckCircle
} from 'lucide-react';

const MaterialDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const result = await materialAPI.getById(id);
      if (result.success) {
        setMaterial(result.data);
      } else {
        showError('Material not found');
        navigate('/materials');
      }
    } catch (error) {
      console.error('Failed to fetch material:', error);
      showError('Failed to load material details');
      navigate('/materials');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-2 pb-2 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 pt-2 pb-2 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Material Not Found</h2>
          <p className="text-gray-500 mb-6">The material you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/materials')}>Back to Materials</Button>
        </div>
      </div>
    );
  }

  const images = material.images && material.images.length > 0 
    ? material.images 
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/materials')}
          className="mb-6"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Back to Materials
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {images.length > 0 && (
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
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                      >
                        <ChevronLeft className="h-5 w-5 rotate-180" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
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
            )}

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
                    <p className="text-gray-700 capitalize">{material.category || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Condition</h3>
                    <p className="text-gray-700 capitalize">{material.condition || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
                    <p className="text-gray-700">{material.quantity || 0} {material.unit || 'kg'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Listing Type</h3>
                    <p className="text-gray-700 capitalize">Auction</p>
                  </div>
                </div>

                {material.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      <span>
                        {material.location.address && `${material.location.address}, `}
                        {material.location.city}, {material.location.state} - {material.location.pincode}
                      </span>
                    </div>
                  </div>
                )}

                {material.seller && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Seller</h3>
                    <div className="flex items-center text-gray-700">
                      <User className="h-4 w-4 mr-2 text-green-600" />
                      <span>{material.seller.name || 'N/A'}</span>
                      {material.seller.isVerified && (
                        <CheckCircle className="h-4 w-4 ml-2 text-green-600" title="Verified Seller" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Action Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="space-y-4">
                {/* Listing Type Badge */}
                <div className="text-center">
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    Auction Listing
                  </span>
                </div>

                {/* Price Info */}
                {material.startingPrice && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Starting Price</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{material.startingPrice?.toLocaleString() || '0'}
                    </div>
                    <Link
                      to={`/auctions/${material._id}`}
                      className="mt-3 block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      View Auction & Place Bid
                    </Link>
                  </div>
                )}

                {/* Material Info */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold text-gray-900">
                      {material.quantity || 0} {material.unit || 'kg'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold text-gray-900 capitalize">{material.category || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-semibold text-gray-900 capitalize">{material.condition || 'N/A'}</span>
                  </div>
                  {material.location && (
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {material.location.city}, {material.location.state}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage;

