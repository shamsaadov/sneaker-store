import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Star,
  Shield,
  Truck,
  Headphones,
  ArrowRight,
  Play,
  Heart,
} from "lucide-react";
import type { Product } from "../types";
import MobileCarousel from "../components/MobileCarousel";
import apiService from "../utils/api";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await apiService.getFeaturedProducts(6);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error loading featured products:", error);
      }
    };

    loadFeaturedProducts();
    setIsVisible(true);
  }, []);

  

  // Карусель фона hero (из public/assets/pictures)
  const heroBgImages = [
    "/assets/pictures/IMG_2369.PNG",
    "/assets/pictures/IMG_2370.PNG",
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  // Автопрокрутка каждые 5с
  useEffect(() => {
    if (!isAuto) return;
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % heroBgImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isAuto, heroBgImages.length]);

  // Управление вручную
  const goNext = () => setBgIndex((i) => (i + 1) % heroBgImages.length);
  const goPrev = () =>
    setBgIndex((i) => (i - 1 + heroBgImages.length) % heroBgImages.length);

  // Свайп на мобильных
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAuto(false);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
    setIsAuto(true);
  };

  

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  };

  const features = [
    {
      icon: Shield,
      title: "Гарантия качества",
      description: "100% оригинальная продукция от официальных поставщиков",
    },
    {
      icon: Truck,
      title: "Быстрая доставка",
      description: "Доставка по всей России за 1-3 дня",
    },
    {
      icon: Headphones,
      title: "Поддержка в рабочее время",
      description: "Всегда готовы помочь с выбором и ответить на вопросы",
    },
  ];

  const testimonials = [
    {
      name: "Алексей Петров",
      rating: 5,
      comment:
        "Отличный магазин! Купил Nike Air Max - качество на высоте, доставка быстрая.",
      avatar: "АП",
    },
    {
      name: "Мария Иванова",
      rating: 5,
      comment:
        "Заказывала Adidas Stan Smith. Пришли быстро, размер точный. Рекомендую!",
      avatar: "МИ",
    },
    {
      name: "Дмитрий Козлов",
      rating: 5,
      comment:
        "Большой выбор, приятные цены. Буду заказывать еще. Спасибо за качественный сервис!",
      avatar: "ДК",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] lg:min-h-[85vh] overflow-hidden text-white"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Фоновая карусель */}
        <div className="absolute inset-0 z-0">
          {heroBgImages.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === bgIndex ? "opacity-100" : "opacity-0"}`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}
          {/* Лёгкое затемнение для читаемости текста */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Управление каруселью */}
        
        

        {/* Индикаторы */}
        

        {/* Контент секции (оставляем ваш текущий) */}
        <div className="relative z-10 container mx-auto px-4 py-8 lg:py-0 min-h-[85vh] lg:min-h-[85vh] flex items-center">
          <div className="grid lg:grid-cols-1 gap-8 lg:gap-12 items-center w-full">
            {/* Text Content */}
            <div
              className={`text-white space-y-6 lg:space-y-8 text-center lg:text-left transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block">Твой стиль</span>
                <span className="block ">начинается здесь</span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-neutral-gray-200 max-w-lg mx-auto lg:mx-0">
                Эксклюзивная коллекция кроссовок от мировых брендов. Найди свою
                идеальную пару уже сегодня.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/catalog")}
                  className="group border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-brand-primary transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Смотреть каталог</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* <button className="group border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-brand-primary transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Смотреть видео</span>
                </button> */}
              </div>

              {/* <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {["АП", "МИ", "ДК", "ЕС"].map((initials, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-xs sm:text-sm border-2 border-white text-brand-primary font-semibold"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm">
                    2,500+ довольных клиентов
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="ml-2 text-xs sm:text-sm">4.9/5 рейтинг</span>
                </div>
              </div> */}
            </div>

            
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        {/*<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce hidden lg:block">*/}
        {/*  <div className="flex flex-col items-center space-y-2">*/}
        {/*    <span className="text-sm">Листай вниз</span>*/}
        {/*    <ChevronRight className="w-6 h-6 rotate-90" />*/}
        {/*  </div>*/}
        {/*</div>*/}
      </section>

      {/* Мобильные карусели в каждой секции */}
      <section className="py-10 bg-neutral-gray-50 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-black mb-2">Почему выбирают нас?</h2>
            <p className="text-base text-neutral-gray-600">Мы делаем покупку кроссовок простой, безопасной и приятной</p>
          </div>
          <MobileCarousel
            items={features.map((feature, index) => (
              <div key={index} className="group bg-neutral-white p-6 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-lg font-bold text-neutral-black mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          />
        </div>
      </section>

      <section className="py-10 bg-neutral-white lg:hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-black mb-2">Популярные модели</h2>
            <p className="text-base text-neutral-gray-600">Самые востребованные кроссовки сезона</p>
          </div>
          <MobileCarousel
            items={featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-neutral-white rounded-xl overflow-hidden cursor-pointer shadow-lg"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.images[0] || "/api/placeholder/400/300"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="text-xs text-neutral-gray-500 mb-1">{product.brand}</div>
                  <h3 className="font-bold text-neutral-black mb-2">{product.name}</h3>
                  <div className="text-neutral-black font-bold">{formatPrice(product.price)}</div>
                </div>
              </div>
            ))}
          />
        </div>
      </section>

      <section className="py-10 bg-neutral-gray-50 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-black mb-2">Отзывы наших клиентов</h2>
            <p className="text-base text-neutral-gray-600">Что говорят о нас покупатели</p>
          </div>
          <MobileCarousel
            items={testimonials.map((testimonial, index) => (
              <div key={index} className="bg-neutral-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-gray-700 mb-4 leading-relaxed">"{testimonial.comment}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-brand-primary">
                    {testimonial.avatar}
                  </div>
                  <div className="text-neutral-black font-semibold">{testimonial.name}</div>
                </div>
              </div>
            ))}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="hidden lg:block py-12 sm:py-16 lg:py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-black mb-3 lg:mb-4">
              Почему выбирают нас?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-gray-600 max-w-2xl mx-auto">
              Мы делаем покупку кроссовок простой, безопасной и приятной
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-neutral-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-brand-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-brand-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-black mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="hidden lg:block py-12 sm:py-16 lg:py-20 bg-neutral-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
            <div className="text-center sm:text-left mb-6 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-black mb-2 sm:mb-4">
                Популярные модели
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-neutral-gray-600">
                Самые востребованные кроссовки сезона
              </p>
            </div>
            <button
              onClick={() => navigate("/catalog")}
              className="hidden sm:flex items-center space-x-2 text-brand-primary hover:text-brand-dark transition-colors font-semibold"
            >
              <span>Смотреть все</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-neutral-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0] || "/api/placeholder/400/300"}
                    alt={product.name}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    {product.originalPrice && (
                      <span className="bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                        -
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        %
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-gray-600" />
                  </button>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="text-xs sm:text-sm text-neutral-gray-500 mb-2">
                    {product.brand}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-black mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(4.5)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-neutral-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs sm:text-sm text-neutral-gray-500 ml-2">
                      (124)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                      <span className="text-lg sm:text-xl font-bold text-neutral-black">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs sm:text-sm text-neutral-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                      className="bg-brand-primary text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12 sm:hidden">
            <button
              onClick={() => navigate("/catalog")}
              className="bg-brand-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dark transition-colors w-full sm:w-auto"
            >
              Смотреть все товары
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="hidden lg:block py-12 sm:py-16 lg:py-20 bg-neutral-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-black mb-3 lg:mb-4">
              Отзывы наших клиентов
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-gray-600">
              Что говорят о нас покупатели
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-neutral-gray-700 mb-6 leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold text-brand-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-neutral-black">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-gray-500">
                      Покупатель
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-brand-primary to-brand-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
            Готов найти свою идеальную пару?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90">
            Присоединяйся к тысячам довольных покупателей. Начни свое
            путешествие в мир стиля уже сегодня.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/catalog")}
              className="bg-white text-brand-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-neutral-gray-100 transition-all duration-300 hover:scale-105"
            >
              Начать покупки
            </button>
            <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-brand-primary transition-all duration-300">
              Узнать больше
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
