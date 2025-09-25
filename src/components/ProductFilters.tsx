import type React from "react";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Star,
  Percent,
  Package,
} from "lucide-react";
import type { FilterOptions, ProductType } from "../types";
import { PRODUCT_TYPE_CONFIGS } from "../types";

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableBrands: string[];
  priceRange: [number, number];
  isOpen: boolean;
  onToggle: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  availableBrands,
  priceRange,
  isOpen,
  onToggle,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    productType: true,
    gender: true,
    brands: true,
    sizes: true,
    price: true,
    colors: false,
    materials: false,
    seasons: false,
    special: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Размерные ряды для обуви
  const shoeSizeRanges = {
    kids: Array.from({ length: 12 }, (_, i) => i + 19), // 19-30
    women: Array.from({ length: 13 }, (_, i) => i + 30), // 30-42
    men: Array.from({ length: 13 }, (_, i) => i + 35), // 35-47
  };

  // Размеры одежды
  const clothingSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Универсальные размеры
  const universalSizes = ["One Size"];

  const genderOptions = [
    { value: "men", label: "Мужские" },
    { value: "women", label: "Женские" },
    { value: "kids", label: "Детские" },
    { value: "unisex", label: "Унисекс" },
  ];

  const colors = [
    { value: "белый", label: "Белый", color: "#FFFFFF" },
    { value: "черный", label: "Черный", color: "#000000" },
    { value: "красный", label: "Красный", color: "#DC2626" },
    { value: "синий", label: "Синий", color: "#2563EB" },
    { value: "зеленый", label: "Зеленый", color: "#16A34A" },
    { value: "желтый", label: "Желтый", color: "#EAB308" },
    { value: "коричневый", label: "Коричневый", color: "#A16207" },
    { value: "серый", label: "Серый", color: "#6B7280" },
    { value: "розовый", label: "Розовый", color: "#EC4899" },
    { value: "фиолетовый", label: "Фиолетовый", color: "#9333EA" },
  ];

  const materials = [
    { value: "leather", label: "Кожа" },
    { value: "cotton", label: "Хлопок" },
    { value: "polyester", label: "Полиэстер" },
    { value: "canvas", label: "Канвас" },
    { value: "mesh", label: "Сетка" },
    { value: "suede", label: "Замша" },
    { value: "synthetic", label: "Синтетика" },
    { value: "plastic", label: "Пластик" },
    { value: "wood", label: "Дерево" },
    { value: "fabric", label: "Ткань" },
    { value: "metal", label: "Металл" },
  ];

  const seasons = [
    { value: "spring", label: "Весна" },
    { value: "summer", label: "Лето" },
    { value: "autumn", label: "Осень" },
    { value: "winter", label: "Зима" },
    { value: "all-season", label: "Всесезонные" },
  ];

  // Получить доступные размеры в зависимости от выбранных типов товаров
  const getAvailableSizes = () => {
    const selectedTypes = filters.productTypes;

    if (selectedTypes.length === 0) {
      // Если типы не выбраны, показываем размеры обуви по умолчанию
      return [
        ...new Set([
          ...shoeSizeRanges.kids,
          ...shoeSizeRanges.women,
          ...shoeSizeRanges.men,
        ]),
      ].sort((a, b) => a - b);
    }

    const allSizes: (string | number)[] = [];

    selectedTypes.forEach((type) => {
      const config = PRODUCT_TYPE_CONFIGS[type];
      if (config) {
        allSizes.push(...config.availableSizes);
      }
    });

    // Если есть обувь, добавляем размеры в зависимости от пола
    if (selectedTypes.includes("footwear")) {
      if (filters.gender.includes("kids"))
        allSizes.push(...shoeSizeRanges.kids);
      if (filters.gender.includes("women"))
        allSizes.push(...shoeSizeRanges.women);
      if (filters.gender.includes("men")) allSizes.push(...shoeSizeRanges.men);
      if (filters.gender.length === 0) {
        // Если пол не выбран, показываем все размеры обуви
        allSizes.push(
          ...shoeSizeRanges.kids,
          ...shoeSizeRanges.women,
          ...shoeSizeRanges.men
        );
      }
    }

    return [...new Set(allSizes)].sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }
      if (typeof a === "string" && typeof b === "string") {
        const sizeOrder = [
          "XXS",
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "XXL",
          "XXXL",
          "One Size",
        ];
        const aIndex = sizeOrder.indexOf(a);
        const bIndex = sizeOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        return a.localeCompare(b);
      }
      // Числа перед строками
      return typeof a === "number" ? -1 : 1;
    });
  };

  const handleArrayFilterChange = (
    filterKey: keyof Pick<
      FilterOptions,
      "brands" | "colors" | "materials" | "seasons"
    >,
    value: string
  ) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    onFiltersChange({ ...filters, [filterKey]: newArray });
  };

  const handleProductTypeChange = (value: ProductType) => {
    const currentArray = filters.productTypes;
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    // При изменении типа товара сбрасываем размеры, так как они могут быть неактуальными
    onFiltersChange({
      ...filters,
      productTypes: newArray,
      sizes: [], // сбрасываем размеры
    });
  };

  const handleGenderChange = (value: string) => {
    const currentArray = filters.gender;
    const newArray = currentArray.includes(value as any)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value as any];

    // При изменении пола для обуви также может изменяться доступность размеров
    onFiltersChange({
      ...filters,
      gender: newArray,
      sizes: [], // сбрасываем размеры при изменении пола
    });
  };

  const handleSizeChange = (size: string | number) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];

    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const handlePriceChange = (value: number, index: number) => {
    const newPriceRange: [number, number] = [...filters.priceRange];
    newPriceRange[index] = value;
    onFiltersChange({ ...filters, priceRange: newPriceRange });
  };

  const handleSortChange = (
    sortBy: FilterOptions["sortBy"],
    sortOrder: FilterOptions["sortOrder"]
  ) => {
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  const handleSpecialFilterChange = (filterKey: "hasDiscount" | "inStock") => {
    onFiltersChange({ ...filters, [filterKey]: !filters[filterKey] });
  };

  const clearFilters = () => {
    onFiltersChange({
      brands: [],
      sizes: [],
      priceRange: priceRange,
      categories: [],
      productTypes: [],
      gender: [],
      colors: [],
      footwearTypes: [],
      clothingTypes: [],
      toyTypes: [],
      accessoryTypes: [],
      materials: [],
      seasons: [],
      ageGroups: [],
      occasions: [],
      hasDiscount: false,
      inStock: false,
      sortBy: "name",
      sortOrder: "asc",
    });
  };

  const getActiveFiltersCount = () => {
    return (
      filters.brands.length +
      filters.sizes.length +
      filters.productTypes.length +
      filters.gender.length +
      filters.colors.length +
      filters.materials.length +
      filters.seasons.length +
      (filters.hasDiscount ? 1 : 0) +
      (filters.inStock ? 1 : 0)
    );
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  const FilterSection: React.FC<{
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
    icon?: React.ReactNode;
    badge?: number;
  }> = ({ title, section, children, icon, badge }) => (
    <div className="border-b border-neutral-gray-200 pb-6 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left font-semibold text-neutral-black mb-4 hover:text-brand-primary transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
          {badge && badge > 0 && (
            <span className="bg-brand-primary text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
              {badge}
            </span>
          )}
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-neutral-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-gray-500" />
        )}
      </button>
      {expandedSections[section] && <div className="space-y-3">{children}</div>}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full px-4 py-3 border border-neutral-gray-300 rounded-xl bg-white hover:bg-neutral-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-brand-primary" />
            <span className="font-semibold">Фильтры</span>
            {hasActiveFilters && (
              <span className="bg-brand-primary text-white text-sm px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Filters Panel */}
      <div
        className={`${isOpen ? "block" : "hidden"} lg:block bg-white rounded-xl shadow-lg border border-neutral-gray-200 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-gray-200 bg-neutral-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-black flex items-center">
              <Filter className="w-6 h-6 mr-3 text-brand-primary" />
              Фильтры
            </h3>
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-brand-primary hover:text-brand-dark font-medium transition-colors"
                >
                  Очистить все
                </button>
              )}
              <button
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-neutral-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-2 text-sm text-neutral-gray-600">
              Активных фильтров: {getActiveFiltersCount()}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Sort Options */}
          <FilterSection
            title="Сортировка"
            section="sort"
            icon={<Filter className="w-4 h-4" />}
          >
            <div className="grid gap-2">
              {[
                {
                  value: "name",
                  label: "По названию А-Я",
                  order: "asc" as const,
                },
                {
                  value: "name",
                  label: "По названию Я-А",
                  order: "desc" as const,
                },
                {
                  value: "price",
                  label: "Сначала дешевые",
                  order: "asc" as const,
                },
                {
                  value: "price",
                  label: "Сначала дорогие",
                  order: "desc" as const,
                },
                {
                  value: "newest",
                  label: "Новинки первыми",
                  order: "desc" as const,
                },
                {
                  value: "popularity",
                  label: "По популярности",
                  order: "desc" as const,
                },
              ].map((option) => (
                <label
                  key={`${option.value}-${option.order}`}
                  className="flex items-center p-2 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="sort"
                    checked={
                      filters.sortBy === option.value &&
                      filters.sortOrder === option.order
                    }
                    onChange={() =>
                      handleSortChange(
                        option.value as FilterOptions["sortBy"],
                        option.order
                      )
                    }
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm text-neutral-black">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Product Type */}
          <FilterSection
            title="Тип товара"
            section="productType"
            icon={null}
            badge={filters.productTypes.length}
          >
            <div className="grid gap-2">
              {Object.entries(PRODUCT_TYPE_CONFIGS).map(([key, config]) => (
                <label
                  key={key}
                  className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={filters.productTypes.includes(key as ProductType)}
                    onChange={() => handleProductTypeChange(key as ProductType)}
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">
                    {config.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Gender */}
          <FilterSection
            title="Пол"
            section="gender"
            icon={null}
            badge={filters.gender.length}
          >
            <div className="grid gap-2">
              {genderOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={filters.gender.includes(option.value as any)}
                    onChange={() => handleGenderChange(option.value)}
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Brands */}
          <FilterSection
            title="Бренды"
            section="brands"
            icon={<Star className="w-4 h-4" />}
            badge={filters.brands.length}
          >
            <div className="max-h-48 overflow-y-auto space-y-2">
              {availableBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center p-2 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleArrayFilterChange("brands", brand)}
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Sizes */}
          <FilterSection
            title="Размеры"
            section="sizes"
            icon={null}
            badge={filters.sizes.length}
          >
            <div className="space-y-4">
              {(filters.productTypes.length > 0 ||
                filters.gender.length > 0) && (
                <div className="text-xs text-neutral-gray-600 bg-neutral-gray-50 p-2 rounded">
                  {filters.productTypes.includes("footwear") && "Обувь: "}
                  {filters.productTypes.includes("footwear") &&
                    filters.gender.includes("kids") &&
                    "Детские: 19-30, "}
                  {filters.productTypes.includes("footwear") &&
                    filters.gender.includes("women") &&
                    "Женские: 30-42, "}
                  {filters.productTypes.includes("footwear") &&
                    filters.gender.includes("men") &&
                    "Мужские: 35-47, "}
                  {filters.productTypes.includes("clothing") &&
                    "Одежда: XXS-XXXL, "}
                  {(filters.productTypes.includes("toys") ||
                    filters.productTypes.includes("accessories")) &&
                    "Универсальные: One Size"}
                </div>
              )}
              <div className="grid grid-cols-6 gap-2">
                {getAvailableSizes().map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`aspect-square flex items-center justify-center text-sm font-medium border-2 rounded-lg transition-all hover:scale-105 ${
                      filters.sizes.includes(size)
                        ? "border-brand-primary bg-brand-primary text-white shadow-lg"
                        : "border-neutral-gray-300 text-neutral-black hover:border-brand-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Colors */}
          <FilterSection
            title="Цвета"
            section="colors"
            icon={null}
            badge={filters.colors.length}
          >
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleArrayFilterChange("colors", color.value)}
                  className={`group relative flex flex-col items-center p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                    filters.colors.includes(color.value)
                      ? "border-brand-primary bg-brand-primary/10"
                      : "border-neutral-gray-200 hover:border-neutral-gray-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 mb-1 ${
                      color.value === "белый"
                        ? "border-neutral-gray-300"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-xs text-neutral-black text-center leading-tight">
                    {color.label}
                  </span>
                  {filters.colors.includes(color.value) && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Materials */}
          <FilterSection
            title="Материалы"
            section="materials"
            icon={null}
            badge={filters.materials.length}
          >
            <div className="grid gap-2">
              {materials.map((material) => (
                <label
                  key={material.value}
                  className="flex items-center p-2 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.materials.includes(material.value)}
                    onChange={() =>
                      handleArrayFilterChange("materials", material.value)
                    }
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">
                    {material.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Seasons */}
          <FilterSection
            title="Сезон"
            section="seasons"
            icon={null}
            badge={filters.seasons.length}
          >
            <div className="grid gap-2">
              {seasons.map((season) => (
                <label
                  key={season.value}
                  className="flex items-center p-2 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.seasons.includes(season.value)}
                    onChange={() =>
                      handleArrayFilterChange("seasons", season.value)
                    }
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">
                    {season.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Цена" section="price" icon={null}>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-gray-600 mb-2">
                    От, ₽
                  </label>
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      handlePriceChange(Number(e.target.value), 0)
                    }
                    className="w-full px-3 py-2 border border-neutral-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-gray-600 mb-2">
                    До, ₽
                  </label>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      handlePriceChange(Number(e.target.value), 1)
                    }
                    className="w-full px-3 py-2 border border-neutral-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                  className="w-full accent-brand-primary"
                />
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                  className="w-full accent-brand-primary"
                />
              </div>

              <div className="text-center text-sm text-neutral-gray-600 bg-neutral-gray-50 p-2 rounded">
                {new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                }).format(filters.priceRange[0])}{" "}
                -{" "}
                {new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                }).format(filters.priceRange[1])}
              </div>
            </div>
          </FilterSection>

          {/* Special Filters */}
          <FilterSection
            title="Особые условия"
            section="special"
            icon={<Percent className="w-4 h-4" />}
            badge={(filters.hasDiscount ? 1 : 0) + (filters.inStock ? 1 : 0)}
          >
            <div className="space-y-3">
              <label className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200">
                <input
                  type="checkbox"
                  checked={filters.hasDiscount}
                  onChange={() => handleSpecialFilterChange("hasDiscount")}
                  className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                />
                <Percent className="w-5 h-5 mr-3 text-red-500" />
                <div>
                  <div className="text-sm font-medium text-neutral-black">
                    Только со скидкой
                  </div>
                  <div className="text-xs text-neutral-gray-600">
                    Товары с выгодной ценой
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={() => handleSpecialFilterChange("inStock")}
                  className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                />
                <Package className="w-5 h-5 mr-3 text-green-500" />
                <div>
                  <div className="text-sm font-medium text-neutral-black">
                    Только в наличии
                  </div>
                  <div className="text-xs text-neutral-gray-600">
                    Товары доступные для покупки
                  </div>
                </div>
              </label>
            </div>
          </FilterSection>
        </div>
      </div>
    </>
  );
};

export default ProductFilters;
