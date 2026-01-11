import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { notificationAPI } from "../../api/notificationAPI";
import {
  Menu,
  X,
  User,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  Gavel,
  Package,
  ShoppingBag,
  FileText,
  BarChart3,
  Cog,
  Code,
  Bell,
} from "lucide-react";
import Button from "../ui/Button";
import NotificationsPanel from "../NotificationsPanel";

const Header = () => {
  const headerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const infoRef = useRef(null);

  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        isInfoOpen &&
        infoRef.current &&
        !infoRef.current.contains(event.target)
      ) {
        setIsInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen, isInfoOpen]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      try {
        const h = headerRef.current ? headerRef.current.offsetHeight : 0;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      } catch (err) {
        // ignore
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [isMenuOpen, isScrolled, isSearchOpen]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const result = await notificationAPI.getAll({ limit: 100 });
        if (result.success && result.data) {
          const unread = result.data.filter(n => !n.isRead).length;
          setUnreadNotificationCount(unread);
        }
      } catch (error) {
        console.error('Failed to fetch unread notification count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refetch when notifications panel closes (in case notifications were marked as read)
    if (!isNotificationsOpen) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, user, isNotificationsOpen]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        if (!notification.isRead) {
          setUnreadNotificationCount(prev => prev + 1);
        }
      };

      socket.on('new-notification', handleNewNotification);

      return () => {
        socket.off('new-notification', handleNewNotification);
      };
    }
  }, [socket]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md"
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <img 
              src="/logo_light.png" 
              alt="EcoTrade Logo" 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            />
            <div className="text-xl sm:text-2xl font-bold text-green-600 hidden sm:block">EcoTrade</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors whitespace-nowrap"
            >
              Home
            </Link>
            <Link
              to="/auctions"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Gavel className="h-4 w-4" />
              Auctions
            </Link>

            {user?.userType === 'seller' && user?.isVerified && (
              <>
                <Link
                  to="/seller/my-auctions"
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors whitespace-nowrap"
                >
                  My Auctions
                </Link>
                <Link
                  to="/seller/create-auction"
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors whitespace-nowrap"
                >
                  Add New Auction
                </Link>
              </>
            )}
            {user?.userType === 'buyer' && user?.isVerified && (
              <Link
                to="/buyer/my-bids"
                className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors whitespace-nowrap"
              >
                My Bids
              </Link>
            )}
            
            {/* Info Dropdown */}
            <div className="relative" ref={infoRef}>
              <button
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                Info
                <ChevronDown className={`h-4 w-4 transition-transform ${isInfoOpen ? 'rotate-180' : ''}`} />
              </button>
              {isInfoOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                    onClick={() => setIsInfoOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                    onClick={() => setIsInfoOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-3 lg:mx-6">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full px-3 lg:px-4 py-1.5 lg:py-2 pl-9 lg:pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute left-2.5 lg:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications Bell */}
            {isAuthenticated && (
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium max-w-[120px] truncate">{user?.name}</span>
                  <ChevronDown className="hidden lg:block h-4 w-4" />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Account
                    </Link>
                    {user?.userType === 'seller' && user?.isVerified && (
                      <>
                        <Link
                          to="/seller/create-auction"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          Add New Auction
                        </Link>
                        <Link
                          to="/seller/my-auctions"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <FileText className="h-4 w-4" />
                          My Auctions
                        </Link>
                        <Link
                          to="/seller/analytics"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </Link>
                      </>
                    )}
                    {user?.userType === 'buyer' && user?.isVerified && (
                      <>
                        <Link
                          to="/buyer/my-bids"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Gavel className="h-4 w-4" />
                          My Bids
                        </Link>
                        <Link
                          to="/buyer/analytics"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          Live Analytics
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-gray-200 px-3 sm:px-4 py-3 bg-white">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="container mx-auto px-3 sm:px-4 py-4 space-y-1">
              {/* Main Navigation */}
              <Link
                to="/"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/auctions"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gavel className="h-4 w-4" />
                Auctions
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* User-specific links */}
              {user?.userType === 'seller' && user?.isVerified && (
                <>
                  <Link
                    to="/seller/my-auctions"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    My Auctions
                  </Link>
                  <Link
                    to="/seller/create-auction"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    Add New Auction
                  </Link>
                  <Link
                    to="/seller/analytics"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Link>
                </>
              )}
              {user?.userType === 'buyer' && user?.isVerified && (
                <>
                  <Link
                    to="/buyer/my-bids"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Gavel className="h-4 w-4" />
                    My Bids
                  </Link>
                  <Link
                    to="/buyer/analytics"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Live Analytics
                  </Link>
                </>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* General Links */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Info</p>
                <Link
                  to="/about"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              {/* Admin Link */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
    
    {/* Notifications Panel */}
    {isAuthenticated && (
      <NotificationsPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationRead={() => {
          // Refetch unread count when notifications are marked as read
          notificationAPI.getAll({ limit: 100 }).then(result => {
            if (result.success && result.data) {
              const unread = result.data.filter(n => !n.isRead).length;
              setUnreadNotificationCount(unread);
            }
          }).catch(err => console.error('Failed to fetch unread count:', err));
        }}
      />
    )}
  </>
  );
};

export default Header;
