import type React from 'react';
import { useState } from 'react';
import { X, Heart, Star, Plus, Minus } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  if (!product || !isOpen) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Пожалуйста, выберите размер');
      return;
    }
    addToCart(product, selectedSize, quantity);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-neutral-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-neutral-white/80 hover:bg-neutral-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid lg:grid-cols-2 gap-8 p-6">
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div className="mb-4">
                <img
                  src={product.images[selectedImage] || '/api/placeholder/500/500'}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-brand-primary'
                          : 'border-neutral-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="text-sm text-neutral-gray-600 uppercase tracking-wider">
                  {product.brand}
                </div>
                <h1 className="text-2xl font-bold text-neutral-black mt-1">
                  {product.name}
                </h1>
              </div>



              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-neutral-black">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-neutral-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="bg-red-500 text-neutral-white px-2 py-1 rounded text-sm font-semibold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-neutral-black mb-2">Описание</h3>
                <p className="text-neutral-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="font-semibold text-neutral-black mb-3">
                  Размер {selectedSize && <span className="text-brand-primary">({selectedSize})</span>}
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-3 border rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-brand-primary bg-brand-primary text-neutral-white'
                          : 'border-neutral-gray-300 text-neutral-black hover:border-brand-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-semibold text-neutral-black mb-3">Количество</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-neutral-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-neutral-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-neutral-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {product.stock > 0 && (
                    <span className="text-sm text-neutral-gray-600">
                      В наличии: {product.stock} шт.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || product.stock === 0}
                  className="w-full bg-brand-primary text-neutral-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:bg-neutral-gray-300 disabled:cursor-not-allowed"
                >
                  {product.stock === 0
                    ? 'Нет в наличии'
                    : !selectedSize
                    ? 'Выберите размер'
                    : 'Добавить в корзину'
                  }
                </button>

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="w-full flex items-center justify-center space-x-2 border border-neutral-gray-300 text-neutral-black py-3 px-6 rounded-lg font-semibold hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isLiked ? 'В избранном' : 'Добавить в избранное'}</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="bg-neutral-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-neutral-black">Информация о товаре</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-gray-600">Артикул:</span>
                    <span className="ml-2 font-medium">{product.id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray-600">Бренд:</span>
                    <span className="ml-2 font-medium">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray-600">В наличии:</span>
                    <span className="ml-2 font-medium">{product.stock} шт.</span>
                  </div>
                  <div>
                    <span className="text-neutral-gray-600">Рейтинг:</span>
                    <span className="ml-2 font-medium">4.5/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductModal;
