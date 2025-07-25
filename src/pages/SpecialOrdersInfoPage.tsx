import type React from "react";
import {
  Search,
  Clock,
  Shield,
  Star,
  Truck,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  Award,
  Users,
  Target,
  Camera,
  Zap,
} from "lucide-react";

const SpecialOrdersInfoPage: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: "Поиск по всему миру",
      description:
        "Находим любые кроссовки через международную сеть партнеров и поставщиков в 45+ странах",
    },
    {
      icon: Shield,
      title: "100% оригинал",
      description:
        "Гарантируем подлинность каждой пары с документальным подтверждением и чеками",
    },
    {
      icon: Clock,
      title: "Быстрые сроки",
      description: "От 3 до 14 дней в зависимости от модели и региона поставки",
    },
    {
      icon: Star,
      title: "Эксклюзивные модели",
      description:
        "Лимитированные выпуски, коллаборации и раритетные кроссовки любых годов",
    },
    {
      icon: Truck,
      title: "Безопасная доставка",
      description:
        "Застрахованная доставка с трекингом и SMS/email уведомлениями",
    },
    {
      icon: Award,
      title: "Экспертная проверка",
      description:
        "Наши специалисты проверяют каждую пару на подлинность перед отправкой",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Заявка",
      description:
        "Опишите желаемую модель через форму или загрузите фото с устройства",
      icon: Camera,
    },
    {
      number: "02",
      title: "Поиск",
      description:
        "Ищем товар среди проверенных поставщиков по всему миру в течение 24 часов",
      icon: Search,
    },
    {
      number: "03",
      title: "Согласование",
      description:
        "Сообщаем цену, сроки доставки и получаем ваше подтверждение",
      icon: CheckCircle,
    },
    {
      number: "04",
      title: "Предоплата",
      description:
        "Оплачиваете 100% от стоимости для бронирования и начала поиска",
      icon: Target,
    },
    {
      number: "05",
      title: "Получение",
      description:
        "Получаете оригинальные кроссовки с полным комплектом документов",
      icon: Award,
    },
  ];

  const successCases = [
    {
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop",
      title: "Nike x Off-White Air Jordan 1 'Chicago'",
      timeFrame: "5 дней",
      price: "₽185,000",
      difficulty: "Очень высокая",
      region: "Япония",
    },
    {
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      title: "Adidas Yeezy Boost 350 V2 'Zebra'",
      timeFrame: "3 дня",
      price: "₽95,000",
      difficulty: "Средняя",
      region: "США",
    },
    {
      image:
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=200&fit=crop",
      title: "Travis Scott x Air Jordan 1 Low 'Reverse Mocha'",
      timeFrame: "12 дней",
      price: "₽120,000",
      difficulty: "Очень высокая",
      region: "Европа",
    },
  ];

  const stats = [
    { number: "500+", label: "Выполненных заказов", icon: CheckCircle },
    { number: "98%", label: "Успешных поисков", icon: Target },
    { number: "7", label: "Дней средний срок", icon: Clock },
    { number: "45", label: "Стран поставщиков", icon: Globe },
  ];

  const reasons = [
    {
      title: "Модель снята с производства",
      description:
        "Находим винтажные и discontinued модели любых годов выпуска",
    },
    {
      title: "Ограниченный релиз",
      description:
        "Получаем доступ к лимитированным коллекциям и эксклюзивным дропам",
    },
    {
      title: "Региональный эксклюзив",
      description:
        "Заказываем модели, которые продаются только в определенных странах",
    },
    {
      title: "Коллаборации",
      description:
        "Специализируемся на поиске коллабораций с дизайнерами и брендами",
    },
    {
      title: "Редкие размеры",
      description:
        "Находим нестандартные размеры, которых нет в обычных магазинах",
    },
    {
      title: "Специальные цветовые решения",
      description: "Ищем уникальные расцветки и спецсерии любых брендов",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-brand-primary via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />

        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 80 + 20}px`,
                height: `${Math.random() * 80 + 20}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 12 + 6}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2" />
            Эксклюзивная услуга поиска редких кроссовок
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Спецзаказы
            <span className="block text-yellow-300">любой обуви</span>
          </h1>

          <p className="text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed opacity-90 mb-8">
            Не можете найти кроссовки своей мечты? Мы найдем{" "}
            <strong>ЛЮБУЮ</strong> модель, даже если её нет нигде в продаже.
            Лимитированные выпуски, винтажные раритеты, эксклюзивные
            коллаборации — всё возможно!
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mb-3 mx-auto w-12 h-12 flex items-center justify-center bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-sm lg:text-base opacity-90">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (window.location.href = "/special-orders")}
              className="bg-white text-brand-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Оформить спецзаказ
            </button>
            <button
              onClick={() =>
                window.scrollTo({
                  top: document.getElementById("how-it-works")?.offsetTop,
                  behavior: "smooth",
                })
              }
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-brand-primary transition-all duration-300"
            >
              Как это работает
            </button>
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Когда нужен спецзаказ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Множество ситуаций, когда обычные магазины не могут помочь
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {reason.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Почему выбирают нас?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Профессиональный поиск эксклюзивных кроссовок с гарантией качества
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Как работает спецзаказ?
            </h2>
            <p className="text-xl text-gray-600">
              Простой и прозрачный процесс от заявки до получения
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-brand-primary/20 transform -translate-y-1/2" />

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative text-center">
                  {/* Step Circle */}
                  <div className="relative z-10 w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-6 shadow-lg">
                    <step.icon className="w-8 h-8" />
                  </div>

                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-brand-primary rounded-full flex items-center justify-center font-bold text-brand-primary text-sm">
                    {step.number}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Успешные кейсы
            </h2>
            <p className="text-xl text-gray-600">
              Реальные примеры найденных для клиентов кроссовок
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {successCases.map((case_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={case_.image}
                    alt={case_.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {case_.region}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight">
                    {case_.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Срок поиска:</span>
                      <span className="font-medium">{case_.timeFrame}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Стоимость:</span>
                      <span className="font-bold text-brand-primary text-lg">
                        {case_.price}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Сложность:</span>
                      <span
                        className={`font-medium px-2 py-1 rounded text-xs ${
                          case_.difficulty === "Очень высокая"
                            ? "bg-red-100 text-red-600"
                            : case_.difficulty === "Высокая"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {case_.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Успешно найдено и доставлено
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Прозрачное ценообразование
            </h2>
            <p className="text-xl text-gray-600">
              Без скрытых комиссий и доплат
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-green-600 font-bold text-sm uppercase tracking-wide mb-4">
                Обычный поиск
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">7-14</div>
              <div className="text-gray-600 mb-6">дней</div>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div>• Поиск среди основных поставщиков</div>
                <div>• Бесплатная предварительная оценка</div>
                <div>• Стандартная доставка включена</div>
                <div>• Без доплат за срочность</div>
              </div>
            </div>

            <div className="bg-brand-primary text-white rounded-2xl p-8 text-center relative transform hover:scale-105 transition-transform">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                ПОПУЛЯРНО
              </div>
              <div className="text-yellow-200 font-bold text-sm uppercase tracking-wide mb-4">
                Срочный поиск
              </div>
              <div className="text-4xl font-bold mb-2">3-7</div>
              <div className="text-blue-100 mb-6">дней</div>
              <div className="space-y-3 text-sm text-blue-100 mb-6">
                <div>• Приоритетный поиск</div>
                <div>• Расширенная сеть поставщиков</div>
                <div>• Экспресс-доставка курьером</div>
                <div className="text-yellow-200 font-medium">
                  • +20% к стоимости товара
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-red-600 font-bold text-sm uppercase tracking-wide mb-4">
                Экстренный поиск
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">1-3</div>
              <div className="text-gray-600 mb-6">дня</div>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div>• Максимальный приоритет</div>
                <div>• Все возможные каналы поиска</div>
                <div>• Курьерская доставка в день</div>
                <div className="text-red-600 font-medium">
                  • +50% к стоимости товара
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="text-blue-800 font-semibold mb-2 text-lg">
                💡 Как формируется цена?
              </div>
              <div className="text-blue-700 leading-relaxed">
                <strong>
                  Цена товара + наша комиссия 15% + доставка + доплата за
                  срочность (если выбрана).
                </strong>
                <br />
                Предоплата составляет 50% от итоговой суммы. Остальные 50%
                оплачиваете при получении товара.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Готовы найти свою идеальную пару?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам довольных покупателей. Начните свое
            путешествие в мир стиля уже сегодня.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <Phone className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Телефон консультации</h3>
              <p className="text-2xl font-bold mb-1">+7 (495) 123-45-67</p>
              <p className="text-sm opacity-80">Ежедневно с 10:00 до 22:00</p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <Mail className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Email для спецзаказов</h3>
              <p className="text-xl font-bold mb-1">special@steepstep.ru</p>
              <p className="text-sm opacity-80">Ответим в течение 1 часа</p>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = "/special-orders")}
            className="bg-white text-brand-primary px-10 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center space-x-3"
          >
            <span>Оформить спецзаказ</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default SpecialOrdersInfoPage;
