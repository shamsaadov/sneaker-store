import type React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, Settings } from "lucide-react";
import { useCart } from "../context/CartContext";

interface HeaderProps {
  onCartClick: () => void;
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onAdminClick }) => {
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/catalog" },
    { name: "Спецзаказы", path: "/special-orders-info" },
    { name: "О нас", path: "/about" },
    // { name: "Контакты", path: "/contact" },
  ];

  const isActivePage = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-[#073a8a] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/assets/logo.png"
                alt="Steep step logo"
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors font-medium ${
                  isActivePage(link.path)
                    ? "text-white font-semibold"
                    : "text-gray-200 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Admin Button */}
            <button
              onClick={onAdminClick}
              className="group relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Админ панель"
            >
              <Settings className="w-6 h-6 text-white group-hover:text-gray-200 transition-colors" />

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-black text-neutral-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Админ панель
              </div>
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-4 border-t border-white/20">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-left transition-colors font-medium py-2 ${
                    isActivePage(link.path)
                      ? "text-white font-semibold"
                      : "text-gray-200 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Admin Link for Mobile */}
              <div className="border-t border-white/20 pt-4 mt-4">
                <button
                  onClick={() => {
                    onAdminClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors font-medium py-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Админ панель</span>
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
