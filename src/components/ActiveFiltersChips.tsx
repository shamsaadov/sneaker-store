import React from "react";
import { X } from "lucide-react";
import type { FilterOptions } from "../types";
import { PRODUCT_TYPE_CONFIGS } from "../types";

interface ActiveFiltersChipsProps {
  filters: FilterOptions;
  onRemoveFilter: (type: string, value: any) => void;
  onClearAll: () => void;
  priceRange: [number, number];
}

const ActiveFiltersChips: React.FC<ActiveFiltersChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  priceRange,
}) => {
  const activeFilters: Array<{ type: string; label: string; value: any }> = [];

  // Product Types
  filters.productTypes.forEach((type) => {
    const config = PRODUCT_TYPE_CONFIGS[type];
    if (config) {
      activeFilters.push({
        type: "productType",
        label: config.label,
        value: type,
      });
    }
  });

  // Gender
  filters.gender.forEach((gender) => {
    const genderLabels: Record<string, string> = {
      men: "Мужские",
      women: "Женские",
      kids: "Детские",
      unisex: "Унисекс",
    };
    activeFilters.push({
      type: "gender",
      label: genderLabels[gender] || gender,
      value: gender,
    });
  });

  // Brands
  filters.brands.forEach((brand) => {
    activeFilters.push({
      type: "brand",
      label: brand,
      value: brand,
    });
  });

  // Sizes
  filters.sizes.forEach((size) => {
    activeFilters.push({
      type: "size",
      label: `Размер ${size}`,
      value: size,
    });
  });

  // Price Range
  if (
    filters.priceRange[0] !== priceRange[0] ||
    filters.priceRange[1] !== priceRange[1]
  ) {
    activeFilters.push({
      type: "price",
      label: `₽${filters.priceRange[0].toLocaleString("ru-RU")} - ₽${filters.priceRange[1].toLocaleString("ru-RU")}`,
      value: "price",
    });
  }

  // Special filters
  if (filters.hasDiscount) {
    activeFilters.push({
      type: "hasDiscount",
      label: "Со скидкой",
      value: "hasDiscount",
    });
  }

  if (filters.inStock) {
    activeFilters.push({
      type: "inStock",
      label: "В наличии",
      value: "inStock",
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-neutral-gray-700 mr-1">
        Активные фильтры:
      </span>
      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.type}-${filter.value}-${index}`}
          onClick={() => onRemoveFilter(filter.type, filter.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-gray-100 hover:bg-neutral-gray-200 text-neutral-black text-sm font-medium rounded-full transition-colors group"
        >
          <span>{filter.label}</span>
          <X className="w-3.5 h-3.5 text-neutral-gray-600 group-hover:text-neutral-black" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm font-medium text-brand-primary hover:text-brand-dark underline"
        >
          Очистить все
        </button>
      )}
    </div>
  );
};

export default ActiveFiltersChips;


