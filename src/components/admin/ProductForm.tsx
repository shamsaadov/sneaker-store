import type React from "react";
import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import type { Product, Category, ProductType, Gender } from "../../types";
import { PRODUCT_TYPE_CONFIGS } from "../../types";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => void;
  product?: Product | null;
  categories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    originalPrice: "",
    description: "",
    images: [""],
    sizes: [] as string[],
    category_id: "",
    stock: "",
    featured: false,
    productType: "footwear" as ProductType,
    gender: "unisex" as Gender,
    color: "",

    // Специфические атрибуты для обуви
    footwearType: "",
    footwearMaterial: "",
    footwearSeason: "",
    footwearClosure: "",

    // Специфические атрибуты для одежды
    clothingType: "",
    clothingMaterial: "",
    clothingSeason: "",
    clothingFit: "",
    sleeveLength: "",

    // Специфические атрибуты для игрушек
    toyType: "",
    ageGroup: "",
    toyMaterial: "",
    batteryRequired: false,
    assemblyRequired: false,

    // Специфические атрибуты для аксессуаров
    accessoryType: "",
    accessoryMaterial: "",
    occasion: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Опции для разных типов товаров
  const genderOptions = [
    { value: "men", label: "Мужской" },
    { value: "women", label: "Женский" },
    { value: "kids", label: "Детский" },
    { value: "unisex", label: "Унисекс" },
  ];

  const footwearOptions = {
    types: [
      { value: "sneakers", label: "Кроссовки" },
      { value: "boots", label: "Ботинки" },
      { value: "sandals", label: "Сандалии" },
      { value: "formal", label: "Классические" },
      { value: "sports", label: "Спортивные" },
      { value: "casual", label: "Повседневные" },
    ],
    materials: [
      { value: "leather", label: "Кожа" },
      { value: "canvas", label: "Канвас" },
      { value: "mesh", label: "Сетка" },
      { value: "suede", label: "Замша" },
      { value: "synthetic", label: "Синтетика" },
      { value: "textile", label: "Текстиль" },
    ],
    seasons: [
      { value: "spring", label: "Весна" },
      { value: "summer", label: "Лето" },
      { value: "autumn", label: "Осень" },
      { value: "winter", label: "Зима" },
      { value: "all-season", label: "Всесезонные" },
    ],
    closures: [
      { value: "laces", label: "Шнурки" },
      { value: "velcro", label: "Липучки" },
      { value: "slip-on", label: "Без застежки" },
      { value: "buckle", label: "Пряжки" },
      { value: "zipper", label: "Молния" },
    ],
  };

  const clothingOptions = {
    types: [
      { value: "shirt", label: "Рубашка" },
      { value: "t-shirt", label: "Футболка" },
      { value: "pants", label: "Брюки" },
      { value: "dress", label: "Платье" },
      { value: "jacket", label: "Куртка" },
      { value: "hoodie", label: "Худи" },
      { value: "shorts", label: "Шорты" },
      { value: "skirt", label: "Юбка" },
      { value: "jeans", label: "Джинсы" },
    ],
    materials: [
      { value: "cotton", label: "Хлопок" },
      { value: "polyester", label: "Полиэстер" },
      { value: "wool", label: "Шерсть" },
      { value: "silk", label: "Шелк" },
      { value: "denim", label: "Деним" },
      { value: "leather", label: "Кожа" },
      { value: "linen", label: "Лен" },
      { value: "synthetic", label: "Синтетика" },
    ],
    fits: [
      { value: "slim", label: "Приталенный" },
      { value: "regular", label: "Обычный" },
      { value: "loose", label: "Свободный" },
      { value: "oversized", label: "Оверсайз" },
      { value: "tailored", label: "Скроенный" },
    ],
    seasons: [
      { value: "spring", label: "Весна" },
      { value: "summer", label: "Лето" },
      { value: "autumn", label: "Осень" },
      { value: "winter", label: "Зима" },
      { value: "all-season", label: "Всесезонные" },
    ],
    sleeveLengths: [
      { value: "sleeveless", label: "Без рукавов" },
      { value: "short", label: "Короткие" },
      { value: "long", label: "Длинные" },
      { value: "three-quarter", label: "Три четверти" },
    ],
  };

  const toyOptions = {
    types: [
      { value: "action-figure", label: "Фигурки" },
      { value: "doll", label: "Куклы" },
      { value: "puzzle", label: "Пазлы" },
      { value: "board-game", label: "Настольные игры" },
      { value: "educational", label: "Развивающие" },
      { value: "vehicle", label: "Транспорт" },
      { value: "building", label: "Конструкторы" },
      { value: "plush", label: "Мягкие игрушки" },
    ],
    ageGroups: [
      { value: "0-2", label: "0-2 года" },
      { value: "3-5", label: "3-5 лет" },
      { value: "6-8", label: "6-8 лет" },
      { value: "9-12", label: "9-12 лет" },
      { value: "13+", label: "13+ лет" },
      { value: "adult", label: "Взрослые" },
    ],
    materials: [
      { value: "plastic", label: "Пластик" },
      { value: "wood", label: "Дерево" },
      { value: "fabric", label: "Ткань" },
      { value: "metal", label: "Металл" },
      { value: "rubber", label: "Резина" },
      { value: "cardboard", label: "Картон" },
    ],
  };

  const accessoryOptions = {
    types: [
      { value: "bag", label: "Сумки" },
      { value: "hat", label: "Шапки" },
      { value: "belt", label: "Ремни" },
      { value: "jewelry", label: "Украшения" },
      { value: "watch", label: "Часы" },
      { value: "sunglasses", label: "Очки" },
      { value: "scarf", label: "Шарфы" },
      { value: "gloves", label: "Перчатки" },
    ],
    materials: [
      { value: "leather", label: "Кожа" },
      { value: "fabric", label: "Ткань" },
      { value: "metal", label: "Металл" },
      { value: "plastic", label: "Пластик" },
      { value: "wood", label: "Дерево" },
      { value: "synthetic", label: "Синтетика" },
    ],
    occasions: [
      { value: "casual", label: "Повседневные" },
      { value: "formal", label: "Формальные" },
      { value: "sport", label: "Спортивные" },
      { value: "party", label: "Вечерние" },
      { value: "work", label: "Рабочие" },
      { value: "travel", label: "Для путешествий" },
    ],
  };

  const colors = [
    "Белый",
    "Черный",
    "Красный",
    "Синий",
    "Зеленый",
    "Желтый",
    "Коричневый",
    "Серый",
    "Розовый",
    "Фиолетовый",
    "Оранжевый",
    "Голубой",
    "Бежевый",
    "Золотой",
    "Серебряный",
  ];

  // Получить доступные размеры в зависимости от типа товара
  const getAvailableSizes = () => {
    const config = PRODUCT_TYPE_CONFIGS[formData.productType];
    return config.availableSizes;
  };

  // Получить все доступные категории (убираем фильтрацию по типу)
  const getAvailableCategories = () => {
    return categories; // Все категории доступны для всех типов товаров
  };

  // Получить читаемое название поля для валидации
  const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
      footwearType: "Тип обуви",
      footwearMaterial: "Материал обуви",
      clothingType: "Тип одежды",
      clothingMaterial: "Материал одежды",
      toyType: "Тип игрушки",
      ageGroup: "Возрастная группа",
      accessoryType: "Тип аксессуара",
    };
    return fieldLabels[field] || field;
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        brand: product.brand || "",
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        description: product.description || "",
        images: product.images?.length ? product.images : [""],
        sizes: product.sizes?.map((s) => s.toString()) || [],
        category_id: product.category_id || "",
        stock: product.stock?.toString() || "",
        featured: product.featured || false,
        productType: product.productType || "footwear",
        gender: product.gender || "unisex",
        color: product.color || "",

        // Обувь
        footwearType: product.footwearAttributes?.footwearType || "",
        footwearMaterial: product.footwearAttributes?.material || "",
        footwearSeason: product.footwearAttributes?.season || "",
        footwearClosure: product.footwearAttributes?.closure || "",

        // Одежда
        clothingType: product.clothingAttributes?.clothingType || "",
        clothingMaterial: product.clothingAttributes?.material || "",
        clothingSeason: product.clothingAttributes?.season || "",
        clothingFit: product.clothingAttributes?.fit || "",
        sleeveLength: product.clothingAttributes?.sleeveLength || "",

        // Игрушки
        toyType: product.toysAttributes?.toyType || "",
        ageGroup: product.toysAttributes?.ageGroup || "",
        toyMaterial: product.toysAttributes?.material || "",
        batteryRequired: product.toysAttributes?.batteryRequired || false,
        assemblyRequired: product.toysAttributes?.assemblyRequired || false,

        // Аксессуары
        accessoryType: product.accessoriesAttributes?.accessoryType || "",
        accessoryMaterial: product.accessoriesAttributes?.material || "",
        occasion: product.accessoriesAttributes?.occasion || "",
      });
    } else {
      // Сброс формы
      setFormData({
        name: "",
        brand: "",
        price: "",
        originalPrice: "",
        description: "",
        images: [""],
        sizes: [] as string[],
        category_id: "",
        stock: "",
        featured: false,
        productType: "footwear" as ProductType,
        gender: "unisex" as Gender,
        color: "",
        footwearType: "",
        footwearMaterial: "",
        footwearSeason: "",
        footwearClosure: "",
        clothingType: "",
        clothingMaterial: "",
        clothingSeason: "",
        clothingFit: "",
        sleeveLength: "",
        toyType: "",
        ageGroup: "",
        toyMaterial: "",
        batteryRequired: false,
        assemblyRequired: false,
        accessoryType: "",
        accessoryMaterial: "",
        occasion: "",
      });
    }

    // Очистка загруженных файлов при открытии формы
    setUploadedFiles([]);
    setFilePreviewUrls([]);
  }, [product, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Если изменился тип товара, сбрасываем только размеры и специфические поля
      if (name === "productType") {
        // Показываем предупреждение если есть выбранные размеры
        const hasSelectedSizes = formData.sizes.length > 0;
        if (hasSelectedSizes) {
          const confirmReset = window.confirm(
            "При смене типа товара будут сброшены выбранные размеры и специфические характеристики. Продолжить?"
          );
          if (!confirmReset) {
            return; // Отменяем изменение
          }
        }

        setFormData((prev) => ({
          ...prev,
          sizes: [], // Сбрасываем только размеры, категорию оставляем
          // Сбрасываем специфические поля предыдущего типа
          footwearType: "",
          footwearMaterial: "",
          footwearSeason: "",
          footwearClosure: "",
          clothingType: "",
          clothingMaterial: "",
          clothingSeason: "",
          clothingFit: "",
          sleeveLength: "",
          toyType: "",
          ageGroup: "",
          toyMaterial: "",
          batteryRequired: false,
          assemblyRequired: false,
          accessoryType: "",
          accessoryMaterial: "",
          occasion: "",
          [name]: value as any,
        }));
      }
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  // Функция сжатия изображения
  const compressImage = (
    file: File,
    maxWidth = 800,
    quality = 0.7
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Вычисляем новые размеры с сохранением пропорций
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Рисуем сжатое изображение
        ctx?.drawImage(img, 0, 0, width, height);

        // Конвертируем в base64 с заданным качеством
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Обработка загрузки файлов
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => {
      // Проверяем тип файла и размер (максимум 10MB)
      if (!file.type.startsWith("image/")) {
        alert(`Файл ${file.name} не является изображением`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой (максимум 10MB)`);
        return false;
      }
      return true;
    });

    if (imageFiles.length > 0) {
      setIsCompressing(true);
      setUploadedFiles((prev) => [...prev, ...imageFiles].slice(0, 10));

      for (const file of imageFiles) {
        try {
          // Сжимаем изображение перед добавлением
          const compressedImage = await compressImage(file);

          setFilePreviewUrls((prev) => [...prev, compressedImage].slice(0, 10));

          setFormData((prevData) => ({
            ...prevData,
            images: [
              ...prevData.images.filter((img) => img !== ""),
              compressedImage,
            ],
          }));
        } catch (error) {
          console.error("Error compressing image:", error);
          // В случае ошибки используем оригинальный файл
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setFilePreviewUrls((prev) => [...prev, result].slice(0, 10));

            setFormData((prevData) => ({
              ...prevData,
              images: [...prevData.images.filter((img) => img !== ""), result],
            }));
          };
          reader.readAsDataURL(file);
        }
      }
      setIsCompressing(false);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      setFormData((prevData) => ({
        ...prevData,
        images: prevData.images.filter(
          (_, i) => i !== index || prevData.images[i].startsWith("http")
        ),
      }));
      return newUrls;
    });
  };

  const toggleSize = (size: string | number) => {
    const sizeStr = size.toString();
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(sizeStr)
        ? prev.sizes.filter((s) => s !== sizeStr)
        : [...prev.sizes, sizeStr],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация размеров
    if (formData.sizes.length === 0) {
      alert("Пожалуйста, выберите хотя бы один размер");
      return;
    }

    // Валидация категории
    if (!formData.category_id) {
      alert("Пожалуйста, выберите категорию");
      return;
    }

    // Валидация цвета
    if (!formData.color) {
      alert("Пожалуйста, выберите цвет товара");
      return;
    }

    // Валидация изображений
    const filteredImages = formData.images.filter((img) => img.trim() !== "");
    if (filteredImages.length === 0) {
      alert("Пожалуйста, добавьте хотя бы одно изображение товара");
      return;
    }

    // Валидация цен
    const price = Number.parseFloat(formData.price);
    const originalPrice = formData.originalPrice
      ? Number.parseFloat(formData.originalPrice)
      : null;

    if (price <= 0) {
      alert("Цена должна быть больше 0");
      return;
    }

    if (originalPrice && originalPrice <= price) {
      alert("Старая цена должна быть больше текущей цены");
      return;
    }

    // Валидация специфических обязательных полей
    const config = PRODUCT_TYPE_CONFIGS[formData.productType];
    for (const field of config.requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert(
          `Пожалуйста, заполните обязательное поле: ${getFieldLabel(field)}`
        );
        return;
      }
    }

    // Создаем специфические атрибуты в зависимости от типа товара
    const productData: Partial<Product> = {
      name: formData.name,
      brand: formData.brand,
      price: Number.parseFloat(formData.price),
      originalPrice: formData.originalPrice
        ? Number.parseFloat(formData.originalPrice)
        : undefined,
      stock: Number.parseInt(formData.stock),
      images: filteredImages,
      description: formData.description,
      sizes: formData.sizes,
      category_id: formData.category_id,
      featured: formData.featured,
      productType: formData.productType,
      gender: formData.gender,
      color: formData.color || undefined,
    };

    // Добавляем специфические атрибуты в зависимости от типа товара
    switch (formData.productType) {
      case "footwear":
        productData.footwearAttributes = {
          footwearType: formData.footwearType as any,
          material: formData.footwearMaterial as any,
          season: formData.footwearSeason as any,
          closure: formData.footwearClosure as any,
        };
        break;
      case "clothing":
        productData.clothingAttributes = {
          clothingType: formData.clothingType as any,
          material: formData.clothingMaterial as any,
          season: formData.clothingSeason as any,
          fit: formData.clothingFit as any,
          sleeveLength: formData.sleeveLength as any,
        };
        break;
      case "toys":
        productData.toysAttributes = {
          toyType: formData.toyType as any,
          ageGroup: formData.ageGroup as any,
          material: formData.toyMaterial as any,
          batteryRequired: formData.batteryRequired,
          assemblyRequired: formData.assemblyRequired,
        };
        break;
      case "accessories":
        productData.accessoriesAttributes = {
          accessoryType: formData.accessoryType as any,
          material: formData.accessoryMaterial as any,
          occasion: formData.occasion as any,
        };
        break;
    }

    onSubmit(productData);
    onClose();
  };

  // Рендер специфических полей для каждого типа товара
  const renderSpecificFields = () => {
    const config = PRODUCT_TYPE_CONFIGS[formData.productType];

    switch (formData.productType) {
      case "footwear":
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Характеристики обуви
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип обуви{" "}
                  {config.requiredFields.includes("footwearType") && "*"}
                </label>
                <select
                  name="footwearType"
                  value={formData.footwearType}
                  onChange={handleInputChange}
                  required={config.requiredFields.includes("footwearType")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {footwearOptions.types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Материал{" "}
                  {config.requiredFields.includes("footwearMaterial") && "*"}
                </label>
                <select
                  name="footwearMaterial"
                  value={formData.footwearMaterial}
                  onChange={handleInputChange}
                  required={config.requiredFields.includes("footwearMaterial")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите материал</option>
                  {footwearOptions.materials.map((material) => (
                    <option key={material.value} value={material.value}>
                      {material.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сезон
                </label>
                <select
                  name="footwearSeason"
                  value={formData.footwearSeason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите сезон</option>
                  {footwearOptions.seasons.map((season) => (
                    <option key={season.value} value={season.value}>
                      {season.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Застежка
                </label>
                <select
                  name="footwearClosure"
                  value={formData.footwearClosure}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип застежки</option>
                  {footwearOptions.closures.map((closure) => (
                    <option key={closure.value} value={closure.value}>
                      {closure.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case "clothing":
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Характеристики одежды
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип одежды{" "}
                  {config.requiredFields.includes("clothingType") && "*"}
                </label>
                <select
                  name="clothingType"
                  value={formData.clothingType}
                  onChange={handleInputChange}
                  required={config.requiredFields.includes("clothingType")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {clothingOptions.types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Материал{" "}
                  {config.requiredFields.includes("clothingMaterial") && "*"}
                </label>
                <select
                  name="clothingMaterial"
                  value={formData.clothingMaterial}
                  onChange={handleInputChange}
                  required={config.requiredFields.includes("clothingMaterial")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите материал</option>
                  {clothingOptions.materials.map((material) => (
                    <option key={material.value} value={material.value}>
                      {material.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сезон
                </label>
                <select
                  name="clothingSeason"
                  value={formData.clothingSeason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите сезон</option>
                  {clothingOptions.seasons.map((season) => (
                    <option key={season.value} value={season.value}>
                      {season.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Посадка
                </label>
                <select
                  name="clothingFit"
                  value={formData.clothingFit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите посадку</option>
                  {clothingOptions.fits.map((fit) => (
                    <option key={fit.value} value={fit.value}>
                      {fit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Длина рукава
                </label>
                <select
                  name="sleeveLength"
                  value={formData.sleeveLength}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите длину</option>
                  {clothingOptions.sleeveLengths.map((length) => (
                    <option key={length.value} value={length.value}>
                      {length.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case "toys":
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Характеристики игрушки
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип игрушки {config.requiredFields.includes("toyType") && "*"}
                </label>
                <select
                  name="toyType"
                  value={formData.toyType}
                  onChange={handleInputChange}
                  required={config.requiredFields.includes("toyType")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {toyOptions.types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Возрастная группа{" "}
                  {config.requiredFields.includes("ageGroup") && "*"}
                </label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                  required={config.requiredFields.includes("ageGroup")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите возраст</option>
                  {toyOptions.ageGroups.map((age) => (
                    <option key={age.value} value={age.value}>
                      {age.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Материал
                </label>
                <select
                  name="toyMaterial"
                  value={formData.toyMaterial}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите материал</option>
                  {toyOptions.materials.map((material) => (
                    <option key={material.value} value={material.value}>
                      {material.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="batteryRequired"
                  checked={formData.batteryRequired}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Требуются батарейки
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="assemblyRequired"
                  checked={formData.assemblyRequired}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Требуется сборка
                </label>
              </div>
            </div>
          </div>
        );

      case "accessories":
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Характеристики аксессуара
            </h4>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип аксессуара{" "}
                  {config.requiredFields.includes("accessoryType") && "*"}
                </label>
                <select
                  name="accessoryType"
                  value={formData.accessoryType}
                  onChange={handleInputChange}
                  required={config.requiredFields.includes("accessoryType")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {accessoryOptions.types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Материал
                </label>
                <select
                  name="accessoryMaterial"
                  value={formData.accessoryMaterial}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите материал</option>
                  {accessoryOptions.materials.map((material) => (
                    <option key={material.value} value={material.value}>
                      {material.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Повод
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите повод</option>
                  {accessoryOptions.occasions.map((occasion) => (
                    <option key={occasion.value} value={occasion.value}>
                      {occasion.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Редактировать товар" : "Добавить новый товар"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Основная информация
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название товара *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nike Air Max 90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Бренд *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nike"
                />
              </div>
            </div>
          </div>

          {/* Product Type and Gender */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Тип и категория товара
            </h3>

            <div className="space-y-6">
              {/* Product Type - отдельно с описанием */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип товара *
                </label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PRODUCT_TYPE_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Определяет доступные размеры и специфические характеристики
                  товара
                </p>
              </div>

              {/* Gender and Category - в одном ряду */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пол *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={getAvailableCategories().length === 0}
                  >
                    <option value="">
                      {getAvailableCategories().length === 0
                        ? "Нет созданных категорий"
                        : "Выберите категорию"}
                    </option>
                    {getAvailableCategories().map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {getAvailableCategories().length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Нет созданных категорий. Создайте категории во вкладке
                      "Категории".
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Категории используются для организации товаров в каталоге
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prices and Stock */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Цена и количество
            </h3>

            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8990"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Старая цена
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15990"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Для отображения скидки. Должна быть больше текущей цены.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цвет *
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите цвет</option>
                  {colors.map((color) => (
                    <option key={color} value={color.toLowerCase()}>
                      {color}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Основной цвет товара для фильтрации
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Подробное описание товара..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Детальное описание поможет покупателям лучше понять товар
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Изображения *
            </label>

            {/* File Upload */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isCompressing}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-3 ${isCompressing ? "pointer-events-none opacity-50" : ""}`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {isCompressing ? (
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    {isCompressing ? (
                      <span className="text-gray-600 font-medium">
                        Сжимаем изображения...
                      </span>
                    ) : (
                      <>
                        <span className="text-blue-600 font-medium">
                          Нажмите для загрузки
                        </span>
                        <span className="text-gray-600">
                          {" "}
                          или перетащите файлы сюда
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP до 10 МБ (максимум 10 файлов). Изображения
                    автоматически сжимаются.
                  </p>
                </label>
              </div>

              {/* Uploaded Files Preview */}
              {filePreviewUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Загруженные фото ({filePreviewUrls.length}/10):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {filePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={url}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specific Fields for Product Type */}
          {renderSpecificFields()}

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Доступные размеры *
              <span className="text-blue-600 ml-2">
                (Выбрано: {formData.sizes.length})
              </span>
            </label>
            {/* Кнопки быстрого выбора */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    sizes: getAvailableSizes().map((s) => s.toString()),
                  }))
                }
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                Выбрать все
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, sizes: [] }))}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Очистить
              </button>
              {formData.productType === "footwear" && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        sizes: Array.from({ length: 12 }, (_, i) =>
                          (i + 19).toString()
                        ),
                      }))
                    }
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                  >
                    Детские (19-30)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        sizes: Array.from({ length: 13 }, (_, i) =>
                          (i + 30).toString()
                        ),
                      }))
                    }
                    className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors"
                  >
                    Женские (30-42)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        sizes: Array.from({ length: 13 }, (_, i) =>
                          (i + 35).toString()
                        ),
                      }))
                    }
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    Мужские (35-47)
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-2">
              {getAvailableSizes().map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`aspect-square flex items-center justify-center text-sm font-medium border-2 rounded-lg transition-all hover:scale-105 ${
                    formData.sizes.includes(size.toString())
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                      : "border-gray-300 text-gray-700 hover:border-blue-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                {PRODUCT_TYPE_CONFIGS[formData.productType].label}:{" "}
                {getAvailableSizes().join(", ")}
              </p>
              {formData.sizes.length === 0 && (
                <p className="text-xs text-red-500">
                  ⚠️ Необходимо выбрать хотя бы один размер
                </p>
              )}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-gray-700"
            >
              Рекомендуемый товар (будет показан на главной странице)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {product ? "Сохранить изменения" : "Добавить товар"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
