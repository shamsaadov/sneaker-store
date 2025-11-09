import React from "react";
import type { FilterOptions, Gender, ProductType } from "../types";
import { PRODUCT_TYPE_CONFIGS } from "../types";

interface QuickFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ filters, onFilterChange }) => {
  const genderOptions: Array<{ value: Gender; label: string }> = [
    { value: "men", label: "Мужские" },
    { value: "women", label: "Женские" },
    { value: "kids", label: "Детские" },
    { value: "unisex", label: "Унисекс" },
  ];

  const productTypeOptions: Array<{ value: ProductType; label: string }> = Object.entries(
    PRODUCT_TYPE_CONFIGS
  ).map(([key, config]) => ({
    value: key as ProductType,
    label: config.label,
  }));

  const handleGenderClick = (gender: Gender) => {
    const isSelected = filters.gender.includes(gender);
    const newGender = isSelected
      ? filters.gender.filter((g) => g !== gender)
      : [...filters.gender, gender];

    onFilterChange({
      ...filters,
      gender: newGender,
    });
  };

  const handleProductTypeClick = (productType: ProductType) => {
    const isSelected = filters.productTypes.includes(productType);
    const newProductTypes = isSelected
      ? filters.productTypes.filter((t) => t !== productType)
      : [...filters.productTypes, productType];

    onFilterChange({
      ...filters,
      productTypes: newProductTypes,
    });
  };

  // Объединяем все опции в один массив для вертикального скролла
  const allOptions = [
    ...genderOptions.map((opt) => ({
      type: "gender" as const,
      value: opt.value,
      label: opt.label,
    })),
    ...productTypeOptions.map((opt) => ({
      type: "productType" as const,
      value: opt.value,
      label: opt.label,
    })),
  ];

  const handleOptionClick = (
    type: "gender" | "productType",
    value: Gender | ProductType
  ) => {
    if (type === "gender") {
      handleGenderClick(value as Gender);
    } else {
      handleProductTypeClick(value as ProductType);
    }
  };

  const isOptionSelected = (
    type: "gender" | "productType",
    value: Gender | ProductType
  ) => {
    if (type === "gender") {
      return filters.gender.includes(value as Gender);
    } else {
      return filters.productTypes.includes(value as ProductType);
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 pb-2 min-w-max">
        {allOptions.map((option) => {
          const isSelected = isOptionSelected(option.type, option.value);
          return (
            <button
              key={`${option.type}-${option.value}`}
              onClick={() => handleOptionClick(option.type, option.value)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all flex-shrink-0 ${
                isSelected
                  ? "bg-brand-primary text-white hover:bg-brand-dark"
                  : "bg-neutral-gray-100 text-neutral-black hover:bg-neutral-gray-200"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickFilters;

