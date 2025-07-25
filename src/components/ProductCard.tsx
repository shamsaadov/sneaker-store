import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | number | null>(null);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize) {
      // If no size selected, go to product details page
      navigate(`/product/${product.id}`);
      return;
    }
    addToCart(product, selectedSize);
    setSelectedSize(null);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string | number) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  return (
    <div
      className="bg-neutral-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={product.images[0] || '/api/placeholder/300/300'}
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={handleLike}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-neutral-white/80 hover:bg-neutral-white rounded-full transition-colors"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-gray-600'}`}
          />
        </button>

        {/* Sale Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-neutral-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-neutral-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleAddToCart}
            className="bg-brand-primary text-neutral-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 text-sm sm:text-base"
          >
            {selectedSize ? `Добавить размер ${selectedSize}` : 'Выбрать размер'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Brand */}
        <div className="text-xs sm:text-sm text-neutral-gray-600 uppercase tracking-wider">
          {product.brand}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-neutral-black mt-1 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors text-sm sm:text-base">
          {product.name}
        </h3>



        {/* Size Selection */}
        <div className="mb-2 sm:mb-3">
          <div className="text-xs sm:text-sm text-neutral-gray-600 mb-1">Размер:</div>
          <div className="flex flex-wrap gap-1">
            {product.sizes.slice(0, 4).map((size) => (
              <button
                key={size}
                onClick={(e) => handleSizeSelect(e, size)}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs border rounded transition-colors ${
                  selectedSize === size
                    ? 'border-brand-primary bg-brand-primary text-neutral-white'
                    : 'border-neutral-gray-300 text-neutral-gray-600 hover:border-brand-primary'
                }`}
              >
                {size}
              </button>
            ))}
            {product.sizes.length > 4 && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs text-neutral-gray-500">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-base sm:text-lg font-bold text-neutral-black">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-neutral-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="p-1.5 sm:p-2 hover:bg-brand-primary hover:text-neutral-white rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
