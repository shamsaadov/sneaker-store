import type React from 'react';
import { useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutModalClose = () => {
    setIsCheckoutModalOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-neutral-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-gray-200">
          <h2 className="text-xl font-semibold text-neutral-black">
            Корзина ({cart.count})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-gray-500 mb-4">
                Ваша корзина пуста
              </div>
              <button
                onClick={onClose}
                className="text-brand-primary hover:text-brand-dark font-medium"
              >
                Продолжить покупки
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-start space-x-4 p-4 bg-neutral-gray-50 rounded-lg">
                  {/* Product Image */}
                  <img
                    src={item.product.images[0] || '/api/placeholder/80/80'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-black text-sm line-clamp-2">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-neutral-gray-600 mt-1">
                      {item.product.brand}
                    </p>
                    <p className="text-sm text-neutral-gray-600">
                      Размер: {item.size}
                    </p>
                    <p className="text-sm font-semibold text-neutral-black mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-gray-200 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 bg-neutral-white border border-neutral-gray-300 rounded text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-gray-200 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-red-500 hover:text-red-700 py-2 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                >
                  Очистить корзину
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-neutral-gray-200 p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Итого:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-brand-primary text-neutral-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Оформить заказ
            </button>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full text-brand-primary border border-brand-primary py-3 rounded-lg font-semibold hover:bg-brand-primary hover:text-neutral-white transition-colors"
            >
              Продолжить покупки
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCheckoutModalClose}
      />
    </>
  );
};

export default CartSidebar;
