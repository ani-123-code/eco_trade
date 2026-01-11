import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../api/auctionAPI';
import HeroSlider from './components/HeroSlider';
import ActionBoxes from './components/ActionBoxes';
import StatsSection from './components/StatsSection';
import BenefitsSection from './components/BenefitsSection';
import Newsletter from './components/Newsletter';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HomePage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const auctionsResult = await auctionAPI.getAll({ status: 'active', limit: 6 });
        if (auctionsResult.success) setAuctions(auctionsResult.data);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <HeroSlider />
      <ActionBoxes />
      <StatsSection />
      
      {/* Active Auctions Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Live Auctions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Participate in real-time auctions for recyclable materials. Bid competitively and get the best deals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {auctions.slice(0, 6).map((auction) => (
              <Link 
                key={auction._id} 
                to={`/auctions/${auction._id}`} 
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
              >
                {auction.material?.images && auction.material.images[0] && (
                  <img 
                    src={auction.material.images[0]} 
                    alt={auction.material.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                    {auction.material?.category}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {auction.bidCount || 0} bids
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">{auction.material?.name}</h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">{auction.material?.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                    <p className="text-2xl font-bold text-green-600">₹{auction.currentBid?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Ends In</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(auction.endTime) > new Date() 
                        ? `${Math.ceil((new Date(auction.endTime) - new Date()) / (1000 * 60 * 60))}h`
                        : 'Ended'}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((auction.bidCount / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link 
              to="/auctions" 
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              View All Auctions →
            </Link>
          </div>
        </div>
      </section>
      
      
      <BenefitsSection />
      <Newsletter />
    </div>
  );
};

export default HomePage;