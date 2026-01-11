import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, LogOut, Menu, X, ChevronRight, MessageSquare, ChartBar as BarChart3, Hop as Home, ChevronLeft, CheckCircle, Package, Gavel, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboardStats, fetchAllUsers } from '../../store/slices/adminSlice';
import AdminCustomers from './AdminCustomers';
import AdminContactForm from './AdminContactForm/AdminContactForm';
import AdminVerifications from './AdminVerifications';
import AdminAuctions from './AdminAuctions';
import AdminAnalytics from './AdminAnalytics';
import AdminSellerRequests from './AdminSellerRequests';
import AdminCreateAuction from './AdminCreateAuction';
import Button from '../../components/ui/Button';


const AdminTab = {
  DASHBOARD: 'dashboard',
  ANALYTICS: 'analytics',
  VERIFICATIONS: 'verifications',
  CUSTOMERS: 'customers',
  AUCTIONS: 'auctions',
  CREATE_AUCTION: 'create-auction',
  SELLER_REQUESTS: 'seller-requests',
  CONTACT: 'contact',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(AdminTab.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null); 
  const { user, logout, isAdmin, isInitialized } = useAuth();
  const { users } = useSelector(state => state.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if screen is mobile
 useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isInitialized && user && isAdmin) {
      dispatch(fetchDashboardStats());
      if (users.length === 0) {
        dispatch(fetchAllUsers());
      }
    }
  }, [user, isAdmin, isInitialized,dispatch, users.length]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMainWebsite = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleViewDetails = (tabName) => {
    setActiveTab(tabName);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSelectedOrderId(null); // Reset selected order when changing tab
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    { key: AdminTab.DASHBOARD, label: 'Dashboard', icon: BarChart3 },
    { key: AdminTab.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { key: AdminTab.VERIFICATIONS, label: 'User Verifications', icon: CheckCircle },
    { key: AdminTab.CUSTOMERS, label: 'Users', icon: Users },
    { key: AdminTab.AUCTIONS, label: 'Auctions', icon: Gavel },
    { key: AdminTab.CREATE_AUCTION, label: 'Create Auction', icon: Plus },
    { key: AdminTab.SELLER_REQUESTS, label: 'Seller Requests', icon: Users },
    { key: AdminTab.CONTACT, label: 'Contact Forms', icon: MessageSquare },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case AdminTab.DASHBOARD:
        return <AdminDashboardContent onViewDetails={handleViewDetails} />;
      case AdminTab.ANALYTICS:
        return <AdminAnalytics />;
      case AdminTab.VERIFICATIONS:
        return <AdminVerifications />;
      case AdminTab.CUSTOMERS:
        return <AdminCustomers />;
      case AdminTab.AUCTIONS:
        return <AdminAuctions />;
      case AdminTab.CREATE_AUCTION:
        return <AdminCreateAuction />;
      case AdminTab.SELLER_REQUESTS:
        return <AdminSellerRequests />;
      case AdminTab.CONTACT:
        return <AdminContactForm />;
      default:
        return <AdminDashboardContent onViewDetails={handleViewDetails} />;
    }
  };

return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar toggle */}
          {!sidebarOpen && (
  <button
    onClick={toggleSidebar}
    className="fixed top-4 right-0  z-50 xl:hidden bg-green-600   text-white p-4  shadow-lg hover:bg-[#3D5980] transition-all duration-300 transform hover:scale-105"
  >
    <Menu size={22} />
  </button>
)}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-green-600 text-white transition-all duration-300 ease-in-out ${
          isMobile 
            ? `${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}`
            : `${sidebarOpen ? 'w-52' : 'w-16'} translate-x-0`
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-[#3D5980]">
            <div className="flex items-center">
              
               {(!isMobile ) && (
                <span className="-ml-2 text font-bold">Admin</span>
              )}
              {( isMobile ) && (
                <>
                  <span className="text-lg font-bold text-white">EcoTrade</span>
                  <span className="ml-2 text-lg font-bold">Admin</span>
                </>
              )}
            </div>
            {/* Close button for mobile */}
            {isMobile && sidebarOpen && (
              <button
                onClick={closeSidebar}
                className="p-1 rounded-md hover:bg-[#3D5980] transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Main Website Button */}
          <div className="px-2 py-4 border-b border-[#3D5980]">
            <button
              onClick={handleMainWebsite}
              className="flex items-center w-full px-3 py-3 rounded-md transition-colors text-gray-300 hover:bg-[#3D5980] hover:text-white"
              title="Main Website"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="ml-3 text-sm font-medium">Main Website</span>
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleTabChange(item.key)}
                    className={`flex items-center w-full px-3 py-3 rounded-md transition-colors group ${
                      activeTab === item.key
                        ? 'bg-[#3D5980] text-white'
                        : 'text-gray-300 hover:bg-[#3D5980] hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {(sidebarOpen || isMobile) && (
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User section */}
          <div className="border-t border-[#3D5980] p-4">
            <div className="flex items-center justify-center mb-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              {(sidebarOpen || isMobile) && (
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{user?.name}</div>
                  <div className="text-xs text-gray-300 truncate">{user?.email}</div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-[#3D5980] hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="ml-2">Sign out</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${
        isMobile ? 'ml-0' : (sidebarOpen ? 'ml-52' : 'ml-16')
      }`}>
        <div className="p-3 lg:p-4 xl:p-6">
          <div className="rounded-lg bg-white shadow-sm">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Desktop sidebar toggle */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 z-40 bg-green-600 text-white p-2 rounded-r-md transform -translate-y-1/2 transition-all duration-300 "
          style={{ left: sidebarOpen ? '12rem' : '3rem' }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
    </div>
  );
};

const AdminDashboardContent = ({ onViewDetails }) => {
  const { stats, loading: adminLoading } = useSelector(state => state.admin);

  if (adminLoading || !stats) {
    return (
      <div className="p-3 lg:p-4 xl:p-6">
        <div className="animate-pulse">
          <div className="h-6 lg:h-8 bg-gray-200 rounded w-1/4 mb-4 lg:mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-6 mb-6 lg:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-20 lg:h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-4 xl:p-6">
      <div className="mb-4 lg:mb-6 xl:mb-8">
        <h1 className="text-lg lg:text-xl xl:text-2xl font-bold mb-3 lg:mb-4 xl:mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 xl:gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-blue-200">
            <p className="text-xs lg:text-sm text-blue-600 font-medium">Total Users</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-blue-800">
              {stats.totalUsers || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {stats.totalBuyers || 0} Buyers • {stats.totalSellers || 0} Sellers
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-yellow-200">
            <p className="text-xs lg:text-sm text-yellow-600 font-medium">Pending Verifications</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-yellow-800">
              {stats.pendingVerifications || 0}
            </p>
            <button
              onClick={() => onViewDetails('verifications')}
              className="text-xs text-yellow-700 hover:text-yellow-900 mt-1 underline"
            >
              Review Now →
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-purple-200">
            <p className="text-xs lg:text-sm text-purple-600 font-medium">Active Auctions</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-purple-800">
              {stats.activeAuctions || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {stats.approvedBids || 0} Approved • {stats.totalBids || 0} Total Bids
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 xl:gap-6 mt-4 lg:mt-6">
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-pink-200">
            <p className="text-xs lg:text-sm text-pink-600 font-medium">Auction Requests</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-pink-800">
              {stats.pendingAuctionRequests || 0}
            </p>
            <button
              onClick={() => onViewDetails('seller-requests')}
              className="text-xs text-pink-700 hover:text-pink-900 mt-1 underline"
            >
              Review Now →
            </button>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-orange-200">
            <p className="text-xs lg:text-sm text-orange-600 font-medium">Total Bids</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-orange-800">
              {stats.totalBids || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {stats.approvedBids || 0} Approved by Admin
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-4 lg:mb-6 xl:mb-8">
        <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Quick Actions</h2>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onViewDetails('verifications')}
              className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">User Verifications</h3>
                  <p className="text-sm text-gray-600">Approve buyers and sellers</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => onViewDetails('auctions')}
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Gavel className="h-8 w-8 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Auctions</h3>
                  <p className="text-sm text-gray-600">Approve bids and close auctions</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => onViewDetails('seller-requests')}
              className="p-4 border-2 border-pink-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Gavel className="h-8 w-8 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Auction Requests</h3>
                  <p className="text-sm text-gray-600">Approve seller auction requests</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;