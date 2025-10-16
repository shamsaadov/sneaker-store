import type React from "react";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Calendar,
} from "lucide-react";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    alert("Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Телефон",
      primary: "+7 (495) 123-45-67",
      secondary: "8-800-555-01-23 (бесплатно)",
      description: "Звоните с 9:00 до 21:00",
    },
    {
      icon: Mail,
      title: "Email",
      primary: "info@steepstep.ru",
      secondary: "support@steepstep.ru",
      description: "Ответим в течение 2 часов",
    },

    {
      icon: Calendar,
      title: "Встреча в офисе",
      primary: "По предварительной записи",
      secondary: "г. Москва, ул. Арбат, 15",
      description: "Понедельник - Пятница",
    },
  ];

  const faqItems = [
    {
      question: "Как проверить подлинность кроссовок?",
      answer:
        "Все наши товары поставляются напрямую от официальных дистрибьюторов. К каждой паре прилагается сертификат подлинности.",
    },
    {
      question: "Сколько времени занимает доставка?",
      answer:
        "По Москве - 1-2 дня, по России - 2-5 дней. Экспресс-доставка по Москве - в день заказа.",
    },
    {
      question: "Можно ли вернуть или обменять товар?",
      answer:
        "Да, в течение 30 дней с момента покупки. Товар должен быть в оригинальной упаковке и без следов носки.",
    },
    {
      question: "Какие способы оплаты вы принимаете?",
      answer:
        "Банковские карты, наличные при получении, переводы через СБП, Apple Pay, Google Pay.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-white">
      {/* Hero Section */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Свяжитесь с нами
          </h1>
          <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Мы готовы ответить на все ваши вопросы и помочь с выбором идеальной
            пары кроссовок
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Как с нами связаться
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Выберите удобный для вас способ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-neutral-black mb-3">
                  {method.title}
                </h3>
                <div className="space-y-2 mb-3">
                  <div className="font-semibold text-brand-primary">
                    {method.primary}
                  </div>
                  <div className="text-neutral-gray-600">
                    {method.secondary}
                  </div>
                </div>
                <div className="text-sm text-neutral-gray-500">
                  {method.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-black mb-6">
                Напишите нам
              </h2>
              <p className="text-neutral-gray-600 mb-8">
                Заполните форму ниже, и мы обязательно свяжемся с вами в
                ближайшее время
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="ivan@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-black mb-2">
                    Тема сообщения *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="">Выберите тему</option>
                    <option value="order">Вопрос по заказу</option>
                    <option value="product">Вопрос о товаре</option>
                    <option value="delivery">Доставка</option>
                    <option value="return">Возврат/обмен</option>
                    <option value="partnership">Сотрудничество</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-black mb-2">
                    Сообщение *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                    placeholder="Опишите ваш вопрос подробно..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-primary text-white py-4 px-6 rounded-lg font-semibold hover:bg-brand-dark transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Отправить сообщение</span>
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-black mb-6">
                Контактная информация
              </h2>

              <div className="space-y-8 mb-12">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-black mb-2">Адрес</h3>
                    <p className="text-neutral-gray-600">
                      г. Москва, ул. Арбат, д. 15, офис 301
                      <br />
                      Метро "Арбатская", 2 минуты пешком
                      <br />
                      Вход с главного входа, 3 этаж
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-black mb-2">
                      Часы работы
                    </h3>
                    <div className="text-neutral-gray-600 space-y-1">
                      <div>Понедельник - Пятница: 09:00 - 21:00</div>
                      <div>Суббота - Воскресенье: 10:00 - 20:00</div>
                      <div className="text-brand-primary font-medium">
                        Онлайн поддержка: 24/7
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-neutral-gray-100 rounded-2xl h-64 flex items-center justify-center mb-8">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-neutral-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-gray-600 mb-2">
                    Карта офиса
                  </h3>
                  <p className="text-neutral-gray-500">
                    Интерактивная карта
                    <br />
                    будет добавлена в следующих версиях
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Часто задаваемые вопросы
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Возможно, ответ на ваш вопрос уже есть здесь
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-lg font-bold text-neutral-black mb-3">
                  {item.question}
                </h3>
                <p className="text-neutral-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Не нашли ответ на свой вопрос?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Свяжитесь с нами любым удобным способом, и мы обязательно поможем!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-brand-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-neutral-gray-100 transition-all duration-300">
              Написать в чат
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-brand-primary transition-all duration-300">
              Заказать звонок
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
