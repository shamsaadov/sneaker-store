import type React from 'react';
import { X, Star, Package, Tag, Calendar, Eye, ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { color: 'text-red-600 bg-red-100', label: 'Нет в наличии' };
    } else if (stock < 5) {
      return { color: 'text-yellow-600 bg-yellow-100', label: 'Низкий остаток' };
    } else {
      return { color: 'text-green-600 bg-green-100', label: 'В наличии' };
    }
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-sm text-gray-500">ID: {product.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.images[0] || '/api/placeholder/400/400'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/400/400';
                    }}
                  />
                </div>

                {/* Additional Images */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${product.name} ${index + 2}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {product.brand}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>



                  {/* Featured Badge */}
                  {product.featured && (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                      <Star className="w-3 h-3 mr-1" />
                      Рекомендуемый товар
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Скидка {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Information */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Остаток на складе:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{product.stock}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Available Sizes */}
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Доступные размеры:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <span
                          key={size}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Описание:</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Category */}
                {product.category && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Категория:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm">
                        {product.category.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Создан: {formatDate(product.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Обновлен: {formatDate(product.updated_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>Просмотров: {Math.floor(Math.random() * 1000) + 100}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.open(`/product/${product.id}`, '_blank')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Посмотреть в магазине</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(product.id);
                        // Could add toast notification here
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Копировать ID
                    </button>
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

export default ProductViewModal;
