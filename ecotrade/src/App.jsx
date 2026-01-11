import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import ProtectedAdminRoute from "./pages/admin/ProtectedAdminRoute";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage/HomePage";
import MaterialsPage from "./pages/MaterialsPage";
import MaterialDetailPage from "./pages/MaterialDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import MobileLoginPage from "./pages/auth/MobileLoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import AccountPage from "./pages/AccountPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminVerifications from "./pages/admin/AdminVerifications";
import CreateAuctionPage from "./pages/seller/CreateAuctionPage";
import MyAuctionsPage from "./pages/seller/MyAuctionsPage";
import EditAuctionPage from "./pages/seller/EditAuctionPage";
import AuctionPage from "./pages/buyer/AuctionPage";
import AuctionDetailPage from "./pages/buyer/AuctionDetailPage";
import MyBidsPage from "./pages/buyer/MyBidsPage";
import BuyerAnalytics from "./pages/buyer/BuyerAnalytics";
import UpcomingBidsPage from "./pages/buyer/UpcomingBidsPage";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import ToastContainer from "./components/ui/ToastContainer";
import { ToastProvider } from "./contexts/ToastContext";
import ScrollToTop from "./components/ScrollToTop";
import { Provider } from "react-redux";
import { store } from "./store/store";

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isHomePage = location.pathname === "/";

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-screen">{children}</main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1" style={{ paddingTop: 'var(--header-height)' }}>
        {children}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Router>
              <ScrollToTop />
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/materials" element={<MaterialsPage />} />
                  <Route path="/materials/:id" element={<MaterialDetailPage />} />
                  <Route path="/auctions" element={<AuctionPage />} />
                  <Route path="/auctions/:id" element={<AuctionDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/mobile-login" element={<MobileLoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email" element={<EmailVerificationPage />} />
                  <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* User Account Routes */}
                  <Route path="/account" element={<AccountPage />} />
                  
                  {/* Buyer Routes */}
                  <Route path="/buyer/my-bids" element={<MyBidsPage />} />
                  <Route path="/buyer/upcoming-bids" element={<UpcomingBidsPage />} />
                  <Route path="/buyer/analytics" element={<BuyerAnalytics />} />
                  
                  {/* Seller Routes */}
                  <Route path="/seller/create-auction" element={<CreateAuctionPage />} />
                  <Route path="/seller/my-auctions" element={<MyAuctionsPage />} />
                  <Route path="/seller/edit-auction/:id" element={<EditAuctionPage />} />
                  <Route path="/seller/analytics" element={<SellerAnalytics />} />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/customers"
                    element={
                      <ProtectedAdminRoute>
                        <AdminCustomers />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/verifications"
                    element={
                      <ProtectedAdminRoute>
                        <AdminVerifications />
                      </ProtectedAdminRoute>
                    }
                  />
                </Routes>
              </Layout>
            </Router>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
