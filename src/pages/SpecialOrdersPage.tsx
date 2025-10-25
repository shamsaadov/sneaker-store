import type React from "react";
import { useState, useRef } from "react";
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
import MobileCarousel from "../components/MobileCarousel";

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
  const [phoneError, setPhoneError] = useState<string>("");
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [colorSuggestions, setColorSuggestions] = useState<string[]>([]);
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const [photoError, setPhotoError] = useState<string>("");

  // Add refs for all required fields
  const nameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const photoUploadRef = useRef<HTMLDivElement>(null);

  // Список популярных брендов кроссовок
  const popularBrands = [
    "Nike",
    "Adidas",
    "Jordan",
    "New Balance",
    "Puma",
    "Reebok",
    "Converse",
    "Vans",
    "Asics",
    "Saucony",
    "Under Armour",
    "Yeezy",
    "Off-White",
    "Balenciaga",
    "Gucci",
    "Louis Vuitton",
    "Alexander McQueen",
    "Rick Owens",
    "Salomon",
    "Hoka One One",
    "On Running",
    "Brooks",
    "Mizuno",
    "Diadora",
    "Fila",
    "Kappa",
    "Champion",
    "DC Shoes",
    "Lacoste",
    "Tommy Hilfiger",
  ];

  // Список популярных цветов кроссовок
  const popularColors = [
    "Белый",
    "Черный",
    "Серый",
    "Красный",
    "Синий",
    "Зеленый",
    "Желтый",
    "Оранжевый",
    "Розовый",
    "Фиолетовый",
    "Коричневый",
    "Бежевый",
    "Кремовый",
    "Мятный",
    "Турquoise",
    "Бордовый",
    "Темно-синий",
    "Светло-серый",
    "Темно-серый",
    "Мультиколор",
    "Металлик",
    "Золотой",
    "Серебряный",
    "Медный",
    "Хаки",
    "Оливковый",
    "Неоновый",
    "Пастельный",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработка ввода бюджета - только цифры
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, budget: numericValue }));
  };

  // Обработка ввода размера - только цифры с автоматическими запятыми
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры
    const digitsOnly = value.replace(/[^0-9]/g, "");
    
    // Добавляем запятую после каждых двух цифр
    let formattedValue = "";
    for (let i = 0; i < digitsOnly.length; i += 2) {
      const chunk = digitsOnly.slice(i, i + 2);
      if (i > 0) {
        formattedValue += ", ";
      }
      formattedValue += chunk;
    }
    
    setFormData((prev) => ({ ...prev, size: formattedValue }));
  };

  // Обработка ввода бренда с автодополнением
  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: typeof formData) => ({ ...prev, brand: value }));

    if (value.trim().length > 0) {
      // Фильтруем бренды по введенному значению
      const filtered = popularBrands.filter((brand) =>
        brand.toLowerCase().includes(value.toLowerCase()),
      );

      // Если точных совпадений нет, показываем похожие варианты
      if (filtered.length === 0) {
        // Используем алгоритм схожести для поиска похожих брендов
        const similar = popularBrands
          .map((brand) => ({
            brand,
            similarity: calculateSimilarity(
              value.toLowerCase(),
              brand.toLowerCase(),
            ),
          }))
          .filter((item) => item.similarity > 0.3) // Порог схожести
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5) // Топ 5 похожих
          .map((item) => item.brand);

        setBrandSuggestions(similar);
      } else {
        setBrandSuggestions(filtered);
      }

      setShowBrandSuggestions(true);
    } else {
      setBrandSuggestions([]);
      setShowBrandSuggestions(false);
    }
  };

  // Простой алгоритм вычисления схожести строк (Dice's coefficient)
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1;
    if (str1.length < 2 || str2.length < 2) return 0;

    const bigrams1 = new Set<string>();
    for (let i = 0; i < str1.length - 1; i++) {
      bigrams1.add(str1.substring(i, i + 2));
    }

    let intersectionSize = 0;
    for (let i = 0; i < str2.length - 1; i++) {
      const bigram = str2.substring(i, i + 2);
      if (bigrams1.has(bigram)) {
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (str1.length + str2.length - 2);
  };

  // Выбор бренда из подсказок
  const selectBrand = (brand: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, brand }));
    setBrandSuggestions([]);
    setShowBrandSuggestions(false);
  };

  // Обработка ввода цвета с автодополнением
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: typeof formData) => ({ ...prev, color: value }));

    if (value.trim().length > 0) {
      // Фильтруем цвета по введенному значению
      const filtered = popularColors.filter((color) =>
        color.toLowerCase().includes(value.toLowerCase()),
      );

      // Если точных совпадений нет, показываем похожие варианты
      if (filtered.length === 0) {
        // Используем алгоритм схожести для поиска похожих цветов
        const similar = popularColors
          .map((color) => ({
            color,
            similarity: calculateSimilarity(
              value.toLowerCase(),
              color.toLowerCase(),
            ),
          }))
          .filter((item) => item.similarity > 0.3) // Порог схожести
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5) // Топ 5 похожих
          .map((item) => item.color);

        setColorSuggestions(similar);
      } else {
        setColorSuggestions(filtered);
      }

      setShowColorSuggestions(true);
    } else {
      setColorSuggestions([]);
      setShowColorSuggestions(false);
    }
  };

  // Выбор цвета из подсказок
  const selectColor = (color: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, color }));
    setColorSuggestions([]);
    setShowColorSuggestions(false);
  };

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, "");

    // Если начинается с 8, заменяем на 7
    const normalizedDigits = digits.startsWith("8")
      ? "7" + digits.slice(1)
      : digits;

    // Форматируем номер
    if (normalizedDigits.length === 0) return "";
    if (normalizedDigits.length <= 1) return `+${normalizedDigits}`;
    if (normalizedDigits.length <= 4)
      return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1)}`;
    if (normalizedDigits.length <= 7)
      return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4)}`;
    if (normalizedDigits.length <= 9)
      return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7)}`;
    return `+${normalizedDigits.slice(0, 1)} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7, 9)}-${normalizedDigits.slice(9, 11)}`;
  };

  // Валидация российского номера телефона
  const validatePhoneNumber = (value: string): boolean => {
    const digits = value.replace(/\D/g, "");
    const normalizedDigits = digits.startsWith("8")
      ? "7" + digits.slice(1)
      : digits;

    // Проверяем, что номер начинается с 7 и содержит 11 цифр
    if (normalizedDigits.length !== 11 || !normalizedDigits.startsWith("7")) {
      setPhoneError("Введите корректный номер телефона");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev: typeof formData) => ({ ...prev, phone: formatted }));

    // Валидация при вводе (только если введено достаточно символов)
    const digits = formatted.replace(/\D/g, "");
    if (digits.length >= 11) {
      validatePhoneNumber(formatted);
    } else if (phoneError) {
      setPhoneError("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...imageFiles].slice(0, 5)); // Максимум 5 файлов
      setPhotoError(""); // Clear photo error when files are uploaded

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

    // Validate all required fields
    let firstErrorField: React.RefObject<HTMLDivElement> | null = null as any;

    const setErrorAndScroll = (
      ref: React.RefObject<HTMLDivElement>,
      message: string,
    ) => {
      showToast({
        type: "error",
        title: "Ошибка валидации",
        message,
        duration: 4000,
      });
      if (!firstErrorField) {
        firstErrorField = ref;
      }
    };

    if (!formData.name.trim()) {
      setErrorAndScroll(nameRef, "Пожалуйста, введите ваше имя");
    } else if (!validatePhoneNumber(formData.phone)) {
      setErrorAndScroll(
        phoneRef,
        "Пожалуйста, введите корректный номер телефона",
      );
    } else if (!formData.brand.trim()) {
      setErrorAndScroll(brandRef, "Пожалуйста, введите бренд");
    } else if (!formData.model.trim()) {
      setErrorAndScroll(modelRef, "Пожалуйста, введите модель");
    } else if (!formData.size.trim()) {
      setErrorAndScroll(sizeRef, "Пожалуйста, введите размер");
    } else if (uploadedFiles.length === 0) {
      setPhotoError("Пожалуйста, загрузите хотя бы одно фото");
      setErrorAndScroll(
        photoUploadRef,
        "Пожалуйста, загрузите хотя бы одно фото модели",
      );
    }

    // Если есть ошибка — скроллим
    if (firstErrorField && firstErrorField.current) {
      firstErrorField.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    // ✅ Если ошибок нет — выполняем отправку
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setPhotoError("");

    try {
      const imageBase64Array = await convertFilesToBase64(uploadedFiles);

      const orderData = {
        ...formData,
        images: imageBase64Array,
      };

      await apiService.createSpecialOrder(orderData);
      setSubmitStatus("success");

      showToast({
        type: "success",
        title: "Заявка отправлена!",
        message: "Мы свяжемся с вами в течение 2 часов для уточнения деталей.",
        duration: 6000,
      });

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
      setUploadedFiles([]);
      setFilePreviewUrls([]);

      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      setSubmitStatus("error");

      showToast({
        type: "error",
        title: "Ошибка при отправке",
        message: "Попробуйте еще раз или свяжитесь с нами по телефону.",
        duration: 6000,
      });

      setTimeout(() => setSubmitStatus("idle"), 3000);
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
      <section className="relative py-20 bg-gradient-to-r from-brand-primary to-brand-dark  text-white overflow-hidden">
        

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

      {/* Features Section - Mobile Carousel */}
      <section className="py-10 bg-neutral-gray-50 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-black mb-2">
              Почему выбирают наш сервис спецзаказов?
            </h2>
            <p className="text-base text-neutral-gray-600 max-w-2xl mx-auto">
              Профессиональный поиск эксклюзивных кроссовок с гарантией
              подлинности
            </p>
          </div>

          <MobileCarousel
            items={features.map((feature, index) => (
              <div
                key={index}
                className="bg-neutral-white p-6 rounded-2xl shadow-lg text-center"
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
          />
        </div>
      </section>

      {/* Features Section - Desktop Grid */}
      <section className="hidden lg:block py-20 bg-neutral-gray-50">
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

      {/* Success Stories */}

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
                  <div ref={nameRef}>
                    <label className="block text-sm font-medium text-neutral-black mb-2">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div ref={phoneRef}>
                    <label className="block text-sm font-medium text-neutral-black mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                        phoneError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-neutral-gray-300 focus:ring-brand-primary"
                      }`}
                      placeholder="+7 (937) 505-46-45"
                      maxLength={18}
                    />
                    {phoneError && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span> {phoneError}
                      </p>
                    )}
                    <p className="text-neutral-gray-500 text-xs mt-1">
                      Формат: +7 (XXX) XXX-XX-XX
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="border-t border-neutral-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-black mb-4">
                    Детали заказа
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div ref={brandRef} className="relative">
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Бренд *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleBrandChange}
                        onFocus={() => {
                          if (formData.brand.trim().length > 0) {
                            setShowBrandSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Задержка чтобы клик по подсказке успел сработать
                          setTimeout(() => setShowBrandSuggestions(false), 200);
                        }}
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                        placeholder="Введите бренд"
                        autoComplete="off"
                      />

                      {/* Подсказки брендов */}
                      {showBrandSuggestions && brandSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {brandSuggestions.map((brand, index) => (
                            <div
                              key={index}
                              onClick={() => selectBrand(brand)}
                              className="px-4 py-3 hover:bg-brand-primary/10 cursor-pointer transition-colors border-b border-neutral-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-neutral-black">
                                  {brand}
                                </span>
                                {formData.brand.toLowerCase() ===
                                  brand.toLowerCase() && (
                                  <Check className="w-4 h-4 text-brand-primary" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-neutral-gray-500 text-xs mt-1">
                        Выберите из списка или введите свой вариант
                      </p>
                    </div>

                    <div ref={modelRef}>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Модель *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="Air Jordan 1, Yeezy 350..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div ref={sizeRef}>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Размер *
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleSizeChange}
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="42,43,44"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Цвет
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleColorChange}
                        onFocus={() => {
                          if (formData.color.trim().length > 0) {
                            setShowColorSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Небольшая задержка, чтобы пользователь мог кликнуть на подсказку
                          setTimeout(() => setShowColorSuggestions(false), 200);
                        }}
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="Начните вводить цвет..."
                        autoComplete="off"
                      />

                      {/* Подсказки цветов */}
                      {showColorSuggestions && colorSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {colorSuggestions.map((color, index) => (
                            <div
                              key={index}
                              onClick={() => selectColor(color)}
                              className="px-4 py-3 hover:bg-brand-primary/10 cursor-pointer transition-colors border-b border-neutral-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-neutral-black">
                                  {color}
                                </span>
                                {formData.color.toLowerCase() ===
                                  color.toLowerCase() && (
                                  <Check className="w-4 h-4 text-brand-primary" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-black mb-2">
                        Бюджет
                      </label>
                      <input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleBudgetChange}
                        className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder="Введите сумму"
                      />
                    </div>
                  </div>

                  {/*<div>*/}
                  {/*  <label className="block text-sm font-medium text-neutral-black mb-2">*/}
                  {/*    Срочность заказа*/}
                  {/*  </label>*/}
                  {/*  <select*/}
                  {/*    name="urgency"*/}
                  {/*    value={formData.urgency}*/}
                  {/*    onChange={handleInputChange}*/}
                  {/*    className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"*/}
                  {/*  >*/}
                  {/*    <option value="normal">Обычная (7-14 дней)</option>*/}
                  {/*    <option value="urgent">*/}
                  {/*      Срочная (3-7 дней) +20% к стоимости*/}
                  {/*    </option>*/}
                  {/*    <option value="emergency">*/}
                  {/*      Экстренная (1-3 дня) +50% к стоимости*/}
                  {/*    </option>*/}
                  {/*  </select>*/}
                  {/*</div>*/}
                </div>

                {/* Images Upload */}
                <div
                  ref={photoUploadRef}
                  className="border-t border-neutral-gray-200 pt-6"
                >
                  <h3 className="text-lg font-semibold text-neutral-black mb-4">
                    Фотографии желаемой модели *
                  </h3>
                  <p className="text-sm text-neutral-gray-600 mb-4">
                    Загрузите фото с вашего устройства для точного поиска
                    (максимум 5 фото, до 10 МБ каждое)
                  </p>

                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-brand-primary transition-colors ${
                      photoError
                        ? "border-red-500 bg-red-50"
                        : "border-neutral-gray-300"
                    }`}
                  >
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

                  {/* Photo Error Message */}
                  {photoError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠</span> {photoError}
                    </p>
                  )}

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
                    rows={2}
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
                <a href="tel:+79375054645" className="hover:underline">+7 (937) 505-46-45</a>
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
                <a href="mailto:special@steepstep.ru" className="hover:underline">special@steepstep.ru</a>
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
