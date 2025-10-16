import type React from "react";
import { useState } from "react";
import {
  Search,
  Clock,
  Shield,
  Star,
  CheckCircle,
  Send,
  Package,
  Truck,
  Phone,
  Mail,
  Check,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import apiService from "../utils/api";
import { showToast } from "../components/ToastContainer";

const SpecialOrdersPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    size: "",
    color: "",
    budget: "",
    urgency: "normal",
    description: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...imageFiles].slice(0, 5)); // Максимум 5 файлов

      // Создаем preview URL для каждого файла
      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFilePreviewUrls((prev) => [...prev, result].slice(0, 5));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Конвертация файлов в Base64 для отправки
  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Конвертируем загруженные файлы в Base64 для отправки
      const imageBase64Array = await convertFilesToBase64(uploadedFiles);

      // Prepare data for API
      const orderData = {
        name: formData.name,
        phone: formData.phone,
        brand: formData.brand,
        model: formData.model,
        size: formData.size,
        color: formData.color,
        budget: formData.budget,
        urgency: formData.urgency,
        description: formData.description,
        images: imageBase64Array,
      };

      await apiService.createSpecialOrder(orderData);

      setSubmitStatus("success");

      // Show success toast
      showToast({
        type: "success",
        title: "Заявка отправлена!",
        message: "Мы свяжемся с вами в течение 2 часов для уточнения деталей.",
        duration: 6000,
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        brand: "",
        model: "",
        size: "",
        color: "",
        budget: "",
        urgency: "normal",
        description: "",
      });

      // Очищаем загруженные файлы
      setUploadedFiles([]);
      setFilePreviewUrls([]);

      // Hide success message
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error submitting special order:", error);
      setSubmitStatus("error");

      // Show error toast
      showToast({
        type: "error",
        title: "Ошибка при отправке",
        message: "Попробуйте еще раз или свяжитесь с нами по телефону.",
        duration: 6000,
      });

      // Hide error message
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: "Поиск по всему миру",
      description:
        "Находим кроссовки в любой точке планеты через сеть партнеров и поставщиков",
    },
    {
      icon: Shield,
      title: "Гарантия подлинности",
      description:
        "100% оригинальная продукция с документальным подтверждением",
    },
    {
      icon: Clock,
      title: "Быстрые сроки",
      description: "От 3 до 14 дней в зависимости от модели и региона поставки",
    },
    {
      icon: Star,
      title: "Эксклюзивные модели",
      description: "Лимитированные выпуски, коллаборации и раритетные модели",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Заявка",
      description:
        "Заполните форму с описанием желаемой модели и ваших требований",
    },
    {
      number: "02",
      title: "Поиск",
      description: "Наши специалисты ищут товар среди официальных поставщиков",
    },
    {
      number: "03",
      title: "Согласование",
      description:
        "Сообщаем цену, сроки доставки и получаем ваше подтверждение",
    },
    {
      number: "04",
      title: "Оплата",
      description: "Оплачиваете 50% предоплату, остальное при получении товара",
    },
    {
      number: "05",
      title: "Доставка",
      description:
        "Получаете оригинальные кроссовки с полным комплектом документов",
    },
  ];

  const successStories = [
    {
      model: "Nike Air Jordan 1 x Travis Scott",
      time: "7 дней",
      price: "₽185,000",
      customer: "Михаил К.",
      story: "Искали по всей Москве, но нашли только в Steep step!",
    },
    {
      model: "Adidas Yeezy Boost 350 V2 'Zebra'",
      time: "5 дней",
      price: "₽95,000",
      customer: "Анна М.",
      story: "Быстро, качественно, без переплат. Рекомендую!",
    },
    {
      model: "Off-White x Nike Air Max 90",
      time: "12 дней",
      price: "₽120,000",
      customer: "Дмитрий П.",
      story: "Думал, что такие модели уже не найти. Ошибался!",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-brand-primary text-white overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 8 + 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">Спецзаказы</h1>
          <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90 mb-8">
            Не можете найти кроссовки своей мечты? Мы найдем любую модель, даже
            если её нет в нашем каталоге. Лимитированные выпуски, эксклюзивные
            коллаборации, раритетные модели — всё возможно!
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-sm opacity-90">Выполненных заказов</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-2">7 дней</div>
              <div className="text-sm opacity-90">Средний срок поиска</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-sm opacity-90">Успешных поисков</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Почему выбирают наш сервис спецзаказов?
            </h2>
            <p className="text-xl text-neutral-gray-600 max-w-2xl mx-auto">
              Профессиональный поиск эксклюзивных кроссовок с гарантией
              подлинности
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-neutral-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Как работает спецзаказ?
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Простой и прозрачный процесс от заявки до получения
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-brand-primary/20 transform -translate-y-1/2" />

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative text-center">
                  {/* Step Circle */}
                  <div className="relative z-10 w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {step.number}
                  </div>

                  <h3 className="text-xl font-bold text-neutral-black mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Истории успеха
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Реальные заказы, которые мы выполнили для наших клиентов
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-brand-primary font-bold text-2xl">
                    {story.price}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {story.time}
                  </span>
                </div>

                <h3 className="font-bold text-neutral-black mb-3 text-lg">
                  {story.model}
                </h3>

                <p className="text-neutral-gray-600 mb-4 italic">
                  "{story.story}"
                </p>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold mr-3">
                    {story.customer.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-black">
                      {story.customer}
                    </div>
                    <div className="text-sm text-neutral-gray-500">
                      Покупатель
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-black mb-4">
                Оформить спецзаказ
              </h2>
              <p className="text-xl text-neutral-gray-600">
                Заполните форму ниже, и мы начнем поиск вашей идеальной пары
              </p>
            </div>

            <div className="bg-neutral-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-black mb-2">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-black mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="border-t border-neutral-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-black mb-4">
                    Детали заказа
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Бренд *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="Nike, Adidas, Jordan..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Модель *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="Air Jordan 1, Yeezy 350..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Размер *
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="42, 43, 44..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Цвет
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="Белый, черный..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Бюджет
                      </label>
                      <input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="До 50,000 ₽"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-black mb-2">
                      Срочность заказа
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      <option value="normal">Обычная (7-14 дней)</option>
                      <option value="urgent">
                        Срочная (3-7 дней) +20% к стоимости
                      </option>
                      <option value="emergency">
                        Экстренная (1-3 дня) +50% к стоимости
                      </option>
                    </select>
                  </div>
                </div>

                {/* Images Upload */}
                <div className="border-t border-neutral-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-black mb-4">
                    Фотографии желаемой модели
                  </h3>
                  <p className="text-sm text-neutral-gray-600 mb-4">
                    Загрузите фото с вашего устройства для точного поиска
                    (максимум 5 фото, до 10 МБ каждое)
                  </p>

                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-neutral-gray-300 rounded-lg p-6 text-center hover:border-brand-primary transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center space-y-3"
                    >
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div>
                        <span className="text-brand-primary font-medium">
                          Нажмите для загрузки
                        </span>
                        <span className="text-neutral-gray-600">
                          {" "}
                          или перетащите файлы сюда
                        </span>
                      </div>
                      <p className="text-xs text-neutral-gray-500">
                        PNG, JPG, WEBP до 10 МБ
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Files Preview */}
                  {filePreviewUrls.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-neutral-black mb-3">
                        Загруженные фото ({filePreviewUrls.length}/5):
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {filePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-neutral-gray-100">
                              <img
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {uploadedFiles[index]?.name.slice(0, 15)}...
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Helpful Tips */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-800 mb-1">
                          Советы для лучшего результата:
                        </div>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>• Загружайте четкие фото с разных ракурсов</li>
                          <li>• Включите фото подошвы и боковых сторон</li>
                          <li>• Покажите уникальные детали модели</li>
                          <li>
                            • Если есть бирки или коробка - тоже сфотографируйте
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-black mb-2">
                    Дополнительные пожелания
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                    placeholder="Укажите дополнительные требования, предпочтения по году выпуска, состоянию (новые/б/у) и другие важные детали..."
                  />
                </div>

                {/* Submit Button */}
                <div className="border-t border-neutral-gray-200 pt-6">
                  {/* Success Message */}
                  {submitStatus === "success" && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-800">
                        <Check className="w-5 h-5" />
                        <span className="font-semibold">
                          Заявка успешно отправлена!
                        </span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Мы получили ваш запрос и свяжемся с вами в течение 2
                        часов для уточнения деталей.
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {submitStatus === "error" && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-red-800 font-semibold">
                        Ошибка при отправке заявки
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        Попробуйте еще раз или свяжитесь с нами по телефону.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                      isSubmitting
                        ? "bg-neutral-gray-400 text-neutral-gray-600 cursor-not-allowed"
                        : "bg-brand-primary text-white hover:bg-brand-dark"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Отправляем заявку...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Отправить заявку на спецзаказ</span>
                      </>
                    )}
                  </button>

                  <p className="text-sm text-neutral-gray-500 text-center mt-4">
                    После отправки заявки мы свяжемся с вами в течение 2 часов
                    для уточнения деталей
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-black mb-4">
              Есть вопросы по спецзаказу?
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Свяжитесь с нашими специалистами для консультации
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-neutral-white p-8 rounded-2xl shadow-lg text-center">
              <Phone className="w-12 h-12 text-brand-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-black mb-3">
                Телефон горячей линии
              </h3>
              <p className="text-brand-primary text-2xl font-bold mb-2">
                +7 (495) 123-45-67
              </p>
              <p className="text-neutral-gray-600 text-sm">
                Ежедневно с 10:00 до 22:00
              </p>
            </div>

            <div className="bg-neutral-white p-8 rounded-2xl shadow-lg text-center">
              <Mail className="w-12 h-12 text-brand-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-black mb-3">
                Email для спецзаказов
              </h3>
              <p className="text-brand-primary text-xl font-bold mb-2">
                special@steepstep.ru
              </p>
              <p className="text-neutral-gray-600 text-sm">
                Ответим в течение 1 часа
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SpecialOrdersPage;
