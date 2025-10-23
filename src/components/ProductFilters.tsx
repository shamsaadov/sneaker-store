import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Percent,
  Package,
} from "lucide-react";
import type { FilterOptions, ProductType } from "../types";
import { PRODUCT_TYPE_CONFIGS } from "../types";

// Небольшой, простой ползунок — без debounce на уровне родителя.
// Важно: он меняет только локальное состояние через onChange, не вызывает родителя.
const PriceSlider = React.memo<{
  min: number;
  max: number;
  value: number;
  index: number;
  onChange: (value: number, index: number) => void;
}>(({ min, max, value, index, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value), index);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={handleChange}
      className="w-full accent-brand-primary cursor-pointer"
    />
  );
});

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableBrands: string[];
  priceRange: [number, number];
  isOpen: boolean;
  onToggle: () => void;
  expandedSections: {
    sort: boolean;
    productType: boolean;
    gender: boolean;
    brands: boolean;
    sizes: boolean;
    price: boolean;
    special: boolean;
  };
  onExpandedSectionsChange: (sections: {
    sort: boolean;
    productType: boolean;
    gender: boolean;
    brands: boolean;
    sizes: boolean;
    price: boolean;
    special: boolean;
  }) => void;
}

const DEFAULT_FILTERS = (priceRange: [number, number]): FilterOptions => ({
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

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  availableBrands,
  priceRange,
  isOpen,
  onToggle,
  expandedSections,
  onExpandedSectionsChange,
}) => {
  // --- ЛОКАЛЬНОЕ СОСТОЯНИЕ: храним все фильтры локально и применяем в конце ---
  const [local, setLocal] = useState<FilterOptions>(() => ({
    ...DEFAULT_FILTERS(priceRange),
    ...filters,
  }));

  // При изменениях извне (например при смене категории/сбросе) синхронизируем локальные
  useEffect(() => {
    setLocal((prev) => {
      // если объект идентичен по содержимому — не менять (экономим ререндеры)
      // простая поверхностная проверка для priceRange и длины массивов
      const samePrice =
        prev.priceRange[0] === filters.priceRange[0] &&
        prev.priceRange[1] === filters.priceRange[1];
      const sameCounts =
        prev.brands.length === filters.brands.length &&
        prev.sizes.length === filters.sizes.length &&
        prev.productTypes.length === filters.productTypes.length;
      if (samePrice && sameCounts) {
        return prev;
      }
      return { ...prev, ...filters };
    });
  }, [filters]);

  // Утилиты для обновления локального состояния
  const setLocalKey = useCallback(<K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleInArray = useCallback(<K extends keyof FilterOptions>(
    key: K,
    value: any
  ) => {
    setLocal((prev) => {
      const arr = (prev[key] as unknown as any[]) || [];
      const exists = arr.includes(value);
      const next = exists ? arr.filter((a) => a !== value) : [...arr, value];
      return { ...prev, [key]: next } as FilterOptions;
    });
  }, []);

  // --- размеры (memoized) ---
  const shoeSizeRanges = useMemo(
    () => ({
      kids: Array.from({ length: 12 }, (_, i) => i + 19), // 19-30
      women: Array.from({ length: 13 }, (_, i) => i + 30), // 30-42
      men: Array.from({ length: 13 }, (_, i) => i + 35), // 35-47
    }),
    []
  );

  const clothingSizes = useMemo(
    () => ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    []
  );

  const genderOptions = useMemo(
    () => [
      { value: "men", label: "Мужские" },
      { value: "women", label: "Женские" },
      { value: "kids", label: "Детские" },
      { value: "unisex", label: "Унисекс" },
    ],
    []
  );


  // Получаем доступные размеры согласно выбранным типам и полу
  const getAvailableSizes = useCallback(() => {
    const selectedTypes = local.productTypes;

    if (selectedTypes.length === 0) {
      return [
        ...new Set([
          ...shoeSizeRanges.kids,
          ...shoeSizeRanges.women,
          ...shoeSizeRanges.men,
        ]),
      ].sort((a, b) => Number(a) - Number(b));
    }

    const allSizes: (string | number)[] = [];

    selectedTypes.forEach((type) => {
      const config = PRODUCT_TYPE_CONFIGS[type as ProductType];
      if (config) allSizes.push(...config.availableSizes);
    });

    if (selectedTypes.includes("footwear" as ProductType)) {
      if (local.gender.includes("kids")) allSizes.push(...shoeSizeRanges.kids);
      if (local.gender.includes("women")) allSizes.push(...shoeSizeRanges.women);
      if (local.gender.includes("men")) allSizes.push(...shoeSizeRanges.men);
      if (local.gender.length === 0) {
        allSizes.push(
          ...shoeSizeRanges.kids,
          ...shoeSizeRanges.women,
          ...shoeSizeRanges.men
        );
      }
    }

    return [...new Set(allSizes)].sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
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
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        return a.localeCompare(b);
      }
      return typeof a === "number" ? -1 : 1;
    });
  }, [local.productTypes, local.gender, shoeSizeRanges]);

  // --- Handlers локально ---
  const handleArrayToggle = useCallback(
    (key: keyof Pick<
      FilterOptions,
      "brands" | "colors" | "materials" | "seasons"
    >,
      value: string
    ) => {
      toggleInArray(key as any, value);
    },
    [toggleInArray]
  );

  const handleProductTypeChange = useCallback(
    (value: ProductType) => {
      setLocal((prev) => {
        const current = prev.productTypes;
        const next = current.includes(value)
          ? current.filter((x) => x !== value)
          : [...current, value];
        return { ...prev, productTypes: next, sizes: [] };
      });
    },
    []
  );

  const handleGenderChange = useCallback((value: string) => {
    setLocal((prev) => {
      const current = prev.gender as string[];
      const next = current.includes(value)
        ? current.filter((x) => x !== value)
        : [...current, value];
      return { ...prev, gender: next as any, sizes: [] };
    });
  }, []);

  const handleSizeChange = useCallback((size: string | number) => {
    setLocal((prev) => {
      const current = prev.sizes;
      const next = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      return { ...prev, sizes: next };
    });
  }, []);

  // Ползунки цены и инпуты работают над local.priceRange
  const handleLocalPriceChange = useCallback((value: number, index: number) => {
    setLocal((prev) => {
      const updated: [number, number] =
        index === 0 ? [value, prev.priceRange[1]] : [prev.priceRange[0], value];
      return { ...prev, priceRange: updated };
    });
  }, []);

  // Особые фильтры (скидка, в наличии)
  const handleSpecialToggle = useCallback((k: "hasDiscount" | "inStock") => {
    setLocal((prev) => ({ ...prev, [k]: !prev[k] }));
  }, []);

  // Сброс локальных фильтров (не затрагиваем родителя)
  const resetLocalFilters = useCallback(() => {
    setLocal(DEFAULT_FILTERS(priceRange));
  }, [priceRange]);

  // Применить: единственный вызов onFiltersChange
  const applyFilters = useCallback(() => {
    // передаём новый объект — родитель обновит фильтры в store/state
    onFiltersChange({ ...local });
  }, [local, onFiltersChange]);

  const getActiveFiltersCount = useCallback(() => {
    return (
      local.brands.length +
      local.sizes.length +
      local.productTypes.length +
      local.gender.length +
      (local.hasDiscount ? 1 : 0) +
      (local.inStock ? 1 : 0)
    );
  }, [local]);

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // Вспомогательный компонент секции
  const FilterSection: React.FC<{
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
    icon?: React.ReactNode;
    badge?: number;
  }> = React.useCallback(
    ({ title, section, children, icon, badge }) => (
      <div className="border-b border-neutral-gray-200 last:border-b-0">
        <button
          onClick={() =>
            onExpandedSectionsChange({
              ...expandedSections,
              [section]: !expandedSections[section],
            })
          }
          className="flex items-center justify-between w-full text-left font-semibold text-neutral-black mb-4 hover:text-brand-primary transition-colors"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
            {badge !== undefined && badge > 0 && (
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
    ),
    [expandedSections, onExpandedSectionsChange]
  );

  // --- UI ---
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
              
              <button
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-neutral-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
        </div>

        <div className="p-6 space-y-6">
          {/* Sort */}
          <FilterSection title="Сортировка" section="sort" >
            <div className="grid gap-2">
              {[
                { value: "name", label: "По названию А-Я", order: "asc" as const },
                { value: "name", label: "По названию Я-А", order: "desc" as const },
                { value: "price", label: "Сначала дешевые", order: "asc" as const },
                { value: "price", label: "Сначала дорогие", order: "desc" as const },
                { value: "newest", label: "Новинки первыми", order: "desc" as const },
                { value: "popularity", label: "По популярности", order: "desc" as const },
              ].map((option) => (
                <label
                  key={`${option.value}-${option.order}`}
                  className="flex items-center p-2 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="sort"
                    checked={local.sortBy === option.value && local.sortOrder === option.order}
                    onChange={() => {
                      setLocalKey("sortBy", option.value as any);
                      setLocalKey("sortOrder", option.order);
                    }}
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm text-neutral-black">{option.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Product Type */}
          <FilterSection title="Тип товара" section="productType" icon={null} badge={local.productTypes.length}>
            <div className="grid gap-2">
              {Object.entries(PRODUCT_TYPE_CONFIGS).map(([key, config]) => (
                <label
                  key={key}
                  className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={local.productTypes.includes(key as ProductType)}
                    onChange={() => handleProductTypeChange(key as ProductType)}
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">{config.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Gender */}
          <FilterSection title="Пол" section="gender" icon={null} badge={local.gender.length}>
            <div className="grid gap-2">
              {genderOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={local.gender.includes(option.value as any)}
                    onChange={() => handleGenderChange(option.value)}
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">{option.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Brands */}
          <FilterSection title="Бренды" section="brands" badge={local.brands.length}>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {availableBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center p-2 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={local.brands.includes(brand)}
                    onChange={() => handleArrayToggle("brands", brand)}
                    className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-black">{brand}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Sizes */}
          <FilterSection title="Размеры" section="sizes" icon={null} badge={local.sizes.length}>
            <div className="space-y-4">
              {(local.productTypes.length > 0 || local.gender.length > 0) && (
                <div className="text-xs text-neutral-gray-600 bg-neutral-gray-50 p-2 rounded">
                  {local.productTypes.includes("footwear" as ProductType) && "Обувь: "}
                  {local.productTypes.includes("footwear" as ProductType) &&
                    local.gender.includes("kids") &&
                    "Детские: 19-30, "}
                  {local.productTypes.includes("footwear" as ProductType) &&
                    local.gender.includes("women") &&
                    "Женские: 30-42, "}
                  {local.productTypes.includes("footwear" as ProductType) &&
                    local.gender.includes("men") &&
                    "Мужские: 35-47, "}
                  {local.productTypes.includes("clothing" as ProductType) &&
                    "Одежда: XXS-XXXL, "}
                  {(local.productTypes.includes("toys" as ProductType) ||
                    local.productTypes.includes("accessories" as ProductType)) &&
                    "Универсальные: One Size"}
                </div>
              )}
              <div className="grid grid-cols-6 gap-2">
                {getAvailableSizes().map((size) => (
                  <button
                    key={String(size)}
                    onClick={() => handleSizeChange(size)}
                    className={`aspect-square flex items-center justify-center text-sm font-medium border-2 rounded-lg transition-all hover:scale-105 ${local.sizes.includes(size)
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

          {/* Price */}
          <FilterSection title="Цена" section="price" icon={null}>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-gray-600 mb-2">От, ₽</label>
                  <input
                    type="number"
                    value={local.priceRange[0]}
                    onChange={(e) => handleLocalPriceChange(Number(e.target.value), 0)}
                    className="w-full px-3 py-2 border border-neutral-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-gray-600 mb-2">До, ₽</label>
                  <input
                    type="number"
                    value={local.priceRange[1]}
                    onChange={(e) => handleLocalPriceChange(Number(e.target.value), 1)}
                    className="w-full px-3 py-2 border border-neutral-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
              </div>

              

              <div className="text-center text-sm text-neutral-gray-600 bg-neutral-gray-50 p-2 rounded">
                {new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(local.priceRange[0])}{" "}
                -{" "}
                {new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(local.priceRange[1])}
              </div>
            </div>
          </FilterSection>

          {/* Special */}
          <FilterSection
            title="Особые условия"
            section="special"
            badge={(local.hasDiscount ? 1 : 0) + (local.inStock ? 1 : 0)}
          >
            <div className="space-y-3">
              <label className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200">
                <input
                  type="checkbox"
                  checked={local.hasDiscount}
                  onChange={() => handleSpecialToggle("hasDiscount")}
                  className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                />
                <Percent className="w-5 h-5 mr-3 text-red-500" />
                <div>
                  <div className="text-sm font-medium text-neutral-black">Только со скидкой</div>
                  <div className="text-xs text-neutral-gray-600">Товары с выгодной ценой</div>
                </div>
              </label>

              <label className="flex items-center p-3 hover:bg-neutral-gray-50 rounded-lg cursor-pointer transition-colors border border-neutral-gray-200">
                <input
                  type="checkbox"
                  checked={local.inStock}
                  onChange={() => handleSpecialToggle("inStock")}
                  className="mr-3 text-brand-primary focus:ring-brand-primary focus:ring-2"
                />
                <Package className="w-5 h-5 mr-3 text-green-500" />
                <div>
                  <div className="text-sm font-medium text-neutral-black">Только в наличии</div>
                  <div className="text-xs text-neutral-gray-600">Товары доступные для покупки</div>
                </div>
              </label>
            </div>
          </FilterSection>
          <div className="fixed left-0 right-0 bottom-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:mt-4 w-full px-6 pb-6 lg:px-0 lg:pb-0">
            <button
              onClick={applyFilters}
              className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg text-sm font-semibold shadow hover:bg-brand-dark transition-all"
            >
              Применить
            </button>
      </div>
        </div>

        {/* Пустой паддинг, чтобы не перекрывать фикс. панель */}
        <div />
      </div>

      {/* Фиксированная панель Apply / Reset (вариант 1) */}
      
    </>
  );
};

export default React.memo(ProductFilters);
