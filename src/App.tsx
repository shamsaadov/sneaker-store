import type React from "react";
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import CartSidebar from "./components/CartSidebar";
import ScrollToTop from "./components/ScrollToTop";
import AdminLogin from "./pages/AdminLogin";
import AdminPanelExtended from "./pages/AdminPanelExtended";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SpecialOrdersPage from "./pages/SpecialOrdersPage";
import SpecialOrdersInfoPage from "./pages/SpecialOrdersInfoPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ToastContainer from "./components/ToastContainer";

// Admin Routes Component
const AdminRoutes: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated || user?.role !== "admin") {
    return <AdminLogin onLoginSuccess={() => {}} />;
  }

  return <AdminPanelExtended onLogout={logout} />;
};

// Main Store Layout Component
const StoreLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handleAdminClick = () => {
    window.location.href = "/admin";
  };

  return (
    <CartProvider>
      <div className="min-h-screen">
        <Header onCartClick={handleCartClick} onAdminClick={handleAdminClick} />

        <main>{children}</main>

        <CartSidebar isOpen={isCartOpen} onClose={handleCartClose} />

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </CartProvider>
  );
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Store Routes */}
        <Route
          path="/"
          element={
            <StoreLayout>
              <HomePage />
            </StoreLayout>
          }
        />

        <Route
          path="/catalog"
          element={
            <StoreLayout>
              <CatalogPage />
            </StoreLayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <StoreLayout>
              <ProductDetailPage />
            </StoreLayout>
          }
        />

        <Route
          path="/about"
          element={
            <StoreLayout>
              <AboutPage />
            </StoreLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <StoreLayout>
              <ContactPage />
            </StoreLayout>
          }
        />

        <Route
          path="/special-orders-info"
          element={
            <StoreLayout>
              <SpecialOrdersInfoPage />
            </StoreLayout>
          }
        />

        <Route
          path="/special-orders"
          element={
            <StoreLayout>
              <SpecialOrdersPage />
            </StoreLayout>
          }
        />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
