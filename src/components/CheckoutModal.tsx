import type React from "react";
import { useState } from "react";
import { X, User, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";
import apiService from "../utils/api";
import { showToast } from "./ToastContainer";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, clearCart, getCartTotal } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    shipping_address: "",
    payment_method: "cash",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return (
      formData.customer_name.trim() &&
      formData.customer_phone.trim() &&
      formData.shipping_address.trim()
    );
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      showToast({
        type: "error",
        title: "Заполните все обязательные поля",
        message: "Проверьте правильность введенных данных",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Подготовить товары для заказа
      const orderItems = cart.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        image: item.product.images[0] || "",
      }));

      const orderData = {
        ...formData,
        items: orderItems,
      };

      const order = await apiService.createOrder(orderData);

      // Показать успешное уведомление
      showToast({
        type: "success",
        title: "Заказ успешно оформлен!",
        message: `Номер заказа: ${order.order_number}. Мы свяжемся с вами в ближайшее время.`,
        duration: 8000,
      });

      // Очистить корзину и закрыть модальное окно
      clearCart();
      onClose();

      // Сбросить форму
      setFormData({
        customer_name: "",
        customer_phone: "",
        shipping_address: "",
        payment_method: "cash",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      showToast({
        type: "error",
        title: "Ошибка при оформлении заказа",
        message: "Попробуйте еще раз или свяжитесь с нами по телефону",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shipping = 500; // Фиксированная стоимость доставки
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto overflow-x-hidden">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] my-auto overflow-y-auto overflow-x-hidden mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Оформление заказа
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 w-full">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Контактная информация</span>
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+7 (937) 505-46-45"
                  />
                </div>
              </div>

              {/* Delivery Information */}
              <div className="space-y-4 border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Доставка</span>
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес доставки *
                  </label>
                  <textarea
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Город, улица, дом, квартира..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Комментарий к заказу
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Дополнительные пожелания или комментарии..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Оформляем заказ..." : "Оформить заказ"}
                </button>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg h-fit min-w-0 lg:sticky lg:top-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Ваш заказ
              </h3>

              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={item.product.images[0] || "/api/placeholder/60/60"}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Размер: {item.size} • Кол-во: {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Товары:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Доставка:</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>Итого:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>• Доставка по Москве в течение 1-2 дней</p>
                <p>• Примерка при получении</p>
                <p>• Возврат в течение 14 дней</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;
