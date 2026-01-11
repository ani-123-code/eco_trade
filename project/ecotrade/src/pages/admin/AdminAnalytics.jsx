import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/adminAPI';
import { BarChart3, TrendingUp, Users, DollarSign, Gavel, Package, FileText, Activity, CheckCircle } from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalMaterials: 0,
    activeAuctions: 0,
    totalRFQs: 0,
    pendingVerifications: 0,
    totalBids: 0,
    totalRevenue: 0,
    approvedBids: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get dashboard stats
      const statsResult = await adminAPI.getDashboardStats();
      
      // Get all auctions to calculate additional metrics
      const auctionsResult = await adminAPI.getAllAuctions();
      const auctions = auctionsResult.success ? auctionsResult.data : [];
      
      // Get all materials
      const materialsResult = await adminAPI.getAllMaterials();
      const materials = materialsResult.success ? materialsResult.data : [];
      
      // Get all RFQs
      const rfqsResult = await adminAPI.getAllRFQs();
      const rfqs = rfqsResult.success ? rfqsResult.data : [];
      
      // Calculate metrics
      const totalBids = auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0);
      const approvedBids = auctions.filter(a => a.adminApproved).length;
      const totalRevenue = auctions
        .filter(a => a.adminApproved)
        .reduce((sum, a) => sum + (a.currentBid || 0), 0);
      const conversionRate = auctions.length > 0 
        ? (approvedBids / auctions.length) * 100 
        : 0;

      setAnalytics({
        totalUsers: statsResult.totalUsers || 0,
        totalMaterials: statsResult.totalMaterials || materials.length,
        activeAuctions: statsResult.activeAuctions || auctions.filter(a => a.status === 'active').length,
        totalRFQs: statsResult.totalRFQs || rfqs.length,
        pendingVerifications: statsResult.pendingVerifications || 0,
        totalBids,
        totalRevenue,
        approvedBids,
        conversionRate
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into platform performance</p>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.pendingVerifications} pending verification
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total Materials</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalMaterials}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Gavel className="h-6 w-6 text-green-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Active Auctions</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.activeAuctions}</p>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.totalBids} total bids
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Total RFQs</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalRFQs}</p>
        </div>
      </div>

      {/* Revenue & Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8" />
            <Activity className="h-5 w-5" />
          </div>
          <h3 className="text-sm opacity-90 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{analytics.totalRevenue.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-2">
            From {analytics.approvedBids} approved bids
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Approved Bids</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.approvedBids}</p>
          <p className="text-xs text-gray-500 mt-2">
            Ready for manual processing
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">
            Auctions to approved bids
          </p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
          Platform Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">User Growth</h3>
            <p className="text-sm text-gray-600">
              {analytics.totalUsers} registered users with {analytics.pendingVerifications} pending verifications
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Material Listings</h3>
            <p className="text-sm text-gray-600">
              {analytics.totalMaterials} materials listed across all categories
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Auction Activity</h3>
            <p className="text-sm text-gray-600">
              {analytics.activeAuctions} active auctions with {analytics.totalBids} total bids placed
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">RFQ Requests</h3>
            <p className="text-sm text-gray-600">
              {analytics.totalRFQs} quote requests from buyers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

