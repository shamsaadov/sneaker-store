import type React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Award,
  Heart,
  Truck,
  Star,
  CheckCircle,
} from "lucide-react";

const AboutPage: React.FC = () => {
  const stats = [
    { number: "2500+", label: "Довольных клиентов", icon: Users },
    { number: "5", label: "Лет на рынке", icon: Award },
    { number: "50+", label: "Брендов в каталоге", icon: Heart },
    { number: "99%", label: "Положительных отзывов", icon: Star },
  ];

  const team = [
    {
      name: "Александр Смирнов",
      position: "Основатель и CEO",
      description: "15 лет в индустрии моды, бывший менеджер Nike Russia",
      avatar: "👨‍💼",
      specialty: "Стратегия и развитие",
    },
    {
      name: "Мария Козлова",
      position: "Директор по закупкам",
      description: "Эксперт по трендам, отвечает за ассортимент",
      avatar: "👩‍💼",
      specialty: "Закупки и качество",
    },
    {
      name: "Дмитрий Петров",
      position: "Технический директор",
      description: "Разработчик с опытом в e-commerce решениях",
      avatar: "👨‍💻",
      specialty: "IT и разработка",
    },
    {
      name: "Анна Федорова",
      position: "Менеджер по клиентам",
      description: "Заботится о каждом клиенте и их потребностях",
      avatar: "👩‍💻",
      specialty: "Клиентский сервис",
    },
  ];

  const values = [
    {
      icon: CheckCircle,
      title: "Качество",
      description:
        "Мы работаем только с официальными поставщиками и гарантируем 100% оригинальность всех товаров.",
    },
    {
      icon: Heart,
      title: "Забота о клиентах",
      description:
        "Каждый покупатель для нас важен. Мы готовы помочь с выбором и решить любые вопросы.",
    },
    {
      icon: Truck,
      title: "Надежность",
      description:
        "Быстрая доставка, удобные способы оплаты и гарантия возврата в течение 30 дней.",
    },
    {
      icon: Star,
      title: "Инновации",
      description:
        "Мы постоянно улучшаем наш сервис и следим за последними трендами в мире кроссовок.",
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "Основание компании",
      description: "Открыли первый интернет-магазин с 50 моделями кроссовок",
    },
    {
      year: "2020",
      title: "Расширение ассортимента",
      description: "Добавили 10 новых брендов и достигли 1000 продаж в месяц",
    },
    {
      year: "2021",
      title: "Собственный склад",
      description: "Открыли логистический центр в Москве площадью 2000 м²",
    },
    {
      year: "2022",
      title: "Мобильное приложение",
      description: "Запустили мобильное приложение с AR-примеркой",
    },
    {
      year: "2023",
      title: "Федеральная сеть",
      description: "Открыли офлайн-магазины в 15 городах России",
    },
    {
      year: "2024",
      title: "Международное расширение",
      description: "Начали доставку в страны СНГ и Европу",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-brand-primary to-brand-dark text-white overflow-hidden">
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
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">О Steep step</h1>
          <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Мы делаем мир кроссовок доступным для каждого. Наша миссия — помочь
            вам найти идеальную пару, которая подчеркнет ваш стиль и обеспечит
            максимальный комфорт.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-primary/20 transition-colors">
                  <stat.icon className="w-8 h-8 text-brand-primary" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-brand-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-black mb-6">
                Наша история
              </h2>
              <div className="space-y-6 text-lg text-neutral-gray-700 leading-relaxed">
                <p>
                  Steep step начался как мечта группы энтузиастов кроссовок в
                  2019 году. Мы заметили, что рынок кроссовок в России нуждается
                  в честном, надежном продавце с широким ассортиментом
                  оригинальной продукции.
                </p>
                <p>
                  Начав с небольшого интернет-магазина, мы быстро завоевали
                  доверие покупателей благодаря качественному сервису и
                  подлинности товаров. Сегодня мы — один из ведущих ритейлеров
                  кроссовок в России.
                </p>
                <p>
                  Наша команда состоит из экспертов моды, технологов и любителей
                  кроссовок, которые понимают потребности современного
                  покупателя и постоянно работают над улучшением shopping
                  experience.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-primary/20 to-brand-dark/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent" />
                <div className="relative z-10 text-center">
                  <div className="text-6xl mb-4">👟</div>
                  <h3 className="text-2xl font-bold text-neutral-black mb-4">
                    Более 100 000 пар продано
                  </h3>
                  <p className="text-neutral-gray-600">
                    За 5 лет работы мы помогли тысячам клиентов найти свою
                    идеальную пару кроссовок
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Наши ценности
            </h2>
            <p className="text-xl text-neutral-gray-600 max-w-2xl mx-auto">
              Принципы, которые определяют нашу работу и отношение к клиентам
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-neutral-black mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Путь развития
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Ключевые этапы нашего роста
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-brand-primary/20" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`lg:w-1/2 ${index % 2 === 0 ? "lg:pr-8" : "lg:pl-8"}`}
                  >
                    <div className="bg-neutral-white p-6 rounded-2xl shadow-lg">
                      <div className="text-brand-primary font-bold text-lg mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-bold text-neutral-black mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-neutral-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative z-10 w-6 h-6 bg-brand-primary rounded-full flex-shrink-0 border-4 border-white shadow-lg" />

                  <div className="lg:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Наша команда
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Люди, которые делают Steep step особенным
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-neutral-black mb-2">
                  {member.name}
                </h3>
                <div className="text-brand-primary font-semibold mb-3">
                  {member.position}
                </div>
                <p className="text-neutral-gray-600 text-sm mb-3">
                  {member.description}
                </p>
                <div className="text-xs text-neutral-gray-500 font-medium">
                  {member.specialty}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-black mb-4">
              Контакты
            </h2>
            <p className="text-xl text-neutral-gray-600">
              Мы всегда рады общению с нашими клиентами
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-black mb-2">
                    Главный офис
                  </h3>
                  <p className="text-neutral-gray-600">
                    г. Москва, ул. Арбат, д. 15, офис 301
                    <br />
                    Метро "Арбатская", 2 минуты пешком
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-black mb-2">Телефон</h3>
                  <p className="text-neutral-gray-600">
                    +7 (495) 123-45-67
                    <br />
                    Бесплатный звонок по России: 8-800-555-01-23
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-black mb-2">Email</h3>
                  <p className="text-neutral-gray-600">
                    info@sneakerstore.ru
                    <br />
                    support@sneakerstore.ru
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-black mb-2">
                    Время работы
                  </h3>
                  <p className="text-neutral-gray-600">
                    Пн-Пт: 09:00 - 21:00
                    <br />
                    Сб-Вс: 10:00 - 20:00
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <a
                href="https://yandex.ru/maps/org/steep_step/84114443168/?utm_medium=mapframe&utm_source=maps"
                style={{
                  color: "#eee",
                  fontSize: "12px",
                  position: "absolute",
                  top: "0px",
                }}
              >
                Steep step
              </a>
              <a
                href="https://yandex.ru/maps/1106/grozniy/category/shoe_store/184107941/?utm_medium=mapframe&utm_source=maps"
                style={{
                  color: "#eee",
                  fontSize: "12px",
                  position: "absolute",
                  top: "14px",
                }}
              >
                Магазин обуви в Грозном
              </a>
              <a
                href="https://yandex.ru/maps/1106/grozniy/category/sportswear_and_shoes/184107341/?utm_medium=mapframe&utm_source=maps"
                style={{
                  color: "#eee",
                  fontSize: "12px",
                  position: "absolute",
                  top: "28px",
                }}
              >
                Спортивная одежда и обувь в Грозном
              </a>
              <iframe
                src="https://yandex.ru/map-widget/v1/?indoorLevel=1&ll=45.710306%2C43.300654&mode=search&oid=84114443168&ol=biz&z=16.69"
                width="560"
                height="400"
                frameBorder="1"
                allowFullScreen
                style={{ position: "relative" }}
                title="Yandex Map"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-primary to-brand-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Остались вопросы?</h2>
          <p className="text-xl mb-8 opacity-90">
            Наша команда поддержки готова помочь вам в любое время
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

export default AboutPage;
