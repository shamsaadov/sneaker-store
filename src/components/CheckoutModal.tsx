import type React from "react";
import { useState } from "react";
import { X, CreditCard, Truck, MapPin, User, Phone, Check } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1);

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
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    return formData.customer_name.trim() && formData.customer_phone.trim();
  };

  const validateStep2 = () => {
    return formData.shipping_address.trim();
  };

  const handleSubmitOrder = async () => {
    if (!validateStep1() || !validateStep2()) {
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
      setCurrentStep(1);
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
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Оформление заказа
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
                </div>
                <span className="font-medium">Контактные данные</span>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div
                className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  {currentStep > 2 ? <Check className="w-5 h-5" /> : "2"}
                </div>
                <span className="font-medium">Доставка</span>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div
                className={`flex items-center space-x-2 ${currentStep >= 3 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  {currentStep > 3 ? <Check className="w-5 h-5" /> : "3"}
                </div>
                <span className="font-medium">Подтверждение</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 p-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Контактная информация</span>
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>Доставка и оплата</span>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Дополнительные пожелания или комментарии..."
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>Подтверждение заказа</span>
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <strong>Покупатель:</strong> {formData.customer_name}
                    </div>
                    <div>
                      <strong>Телефон:</strong> {formData.customer_phone}
                    </div>
                    <div>
                      <strong>Адрес доставки:</strong>{" "}
                      {formData.shipping_address}
                    </div>
                    <div>
                      <strong>Способ оплаты:</strong> Наличными при получении
                    </div>
                    {formData.notes && (
                      <div>
                        <strong>Комментарий:</strong> {formData.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Назад
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={() => {
                      if (currentStep === 1 && !validateStep1()) {
                        showToast({
                          type: "error",
                          title: "Заполните обязательные поля",
                          message: "Имя и телефон обязательны для заполнения",
                        });
                        return;
                      }
                      if (currentStep === 2 && !validateStep2()) {
                        showToast({
                          type: "error",
                          title: "Укажите адрес доставки",
                          message:
                            "Адрес доставки обязателен для оформления заказа",
                        });
                        return;
                      }
                      setCurrentStep(currentStep + 1);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Далее
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {isSubmitting ? "Оформляем заказ..." : "Подтвердить заказ"}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Размер: {item.size} • Кол-во: {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
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
