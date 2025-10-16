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
    // { name: "О нас", path: "/about" },
    // { name: "Контакты", path: "/contact" },
  ];

  const isActivePage = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };
  const heroSlides = [
    {
      title: "Новая коллекция Nike Air Max",
      subtitle: "Максимальный комфорт для каждого шага",
      image:
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png",
      discount: "Скидка до 30%",
    },
    {
      title: "Легендарные Air Jordan",
      subtitle: "Стиль, который никогда не выйдет из моды",
      image:
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-6xjv8n.png",
      discount: "Эксклюзивная серия",
    },
    {
      title: "Adidas Stan Smith",
      subtitle: "Минимализм и элегантность в каждой детали",
      image:
        "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ba8375a1c6b1439a8f9aaf8600a7ad03_9366/Stan_Smith_Shoes_White_FX5500_01_standard.jpg",
      discount: "Лимитированный выпуск",
    },
  ];
  return (
    <header className="bg-neutral-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              {/* Desktop logo */}
              <img
                src="/assets/logo.png"
                alt="Steep step logo"
                className="hidden md:block h-12 w-auto"
              />
              {/* Mobile logo */}
              <img
                src="/assets/shortLogo.svg"
                alt="Steep step logo"
                className="block md:hidden h-20 w-auto"
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
                    ? "text-brand-primary font-semibold"
                    : "text-gray-500 hover:text-gray-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4 ">
            {/* Admin Button */}
            <button
              onClick={onAdminClick}
              className="group relative p-2   hover:bg-white/10 rounded-lg transition-colors"
              title="Админ панель"
            >
              <Settings className="w-6 h-6 text-gray-500 font-semibold group-hover:text-gray-400 transition-colors" />

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
              <ShoppingCart className="w-6 h-6 text-gray-500" />
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
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-500" />
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
                      ? "text-black font-semibold"
                      : "text-gray-500 hover:text-gray-400"
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
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-400 transition-colors font-medium py-2"
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
