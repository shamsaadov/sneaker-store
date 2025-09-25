// Типы товаров
export type ProductType = "footwear" | "clothing" | "toys" | "accessories";

// Пол/гендер
export type Gender = "men" | "women" | "unisex" | "kids";

// Размеры для разных типов товаров
export type FootwearSize = number; // 19-47
export type ClothingSize =
  | "XXS"
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL";
export type UniversalSize = "One Size";

// Специфические поля для каждого типа товара
export interface FootwearAttributes {
  footwearType?:
    | "sneakers"
    | "boots"
    | "sandals"
    | "formal"
    | "sports"
    | "casual";
  material?: "leather" | "canvas" | "mesh" | "suede" | "synthetic" | "textile";
  season?: "spring" | "summer" | "autumn" | "winter" | "all-season";
  closure?: "laces" | "velcro" | "slip-on" | "buckle" | "zipper";
}

export interface ClothingAttributes {
  clothingType?:
    | "shirt"
    | "t-shirt"
    | "pants"
    | "dress"
    | "jacket"
    | "hoodie"
    | "shorts"
    | "skirt"
    | "jeans";
  material?:
    | "cotton"
    | "polyester"
    | "wool"
    | "silk"
    | "denim"
    | "leather"
    | "linen"
    | "synthetic";
  season?: "spring" | "summer" | "autumn" | "winter" | "all-season";
  fit?: "slim" | "regular" | "loose" | "oversized" | "tailored";
  sleeveLength?: "sleeveless" | "short" | "long" | "three-quarter";
}

export interface ToysAttributes {
  toyType?:
    | "action-figure"
    | "doll"
    | "puzzle"
    | "board-game"
    | "educational"
    | "vehicle"
    | "building"
    | "plush";
  ageGroup?: "0-2" | "3-5" | "6-8" | "9-12" | "13+" | "adult";
  material?: "plastic" | "wood" | "fabric" | "metal" | "rubber" | "cardboard";
  batteryRequired?: boolean;
  assemblyRequired?: boolean;
}

export interface AccessoriesAttributes {
  accessoryType?:
    | "bag"
    | "hat"
    | "belt"
    | "jewelry"
    | "watch"
    | "sunglasses"
    | "scarf"
    | "gloves";
  material?: "leather" | "fabric" | "metal" | "plastic" | "wood" | "synthetic";
  occasion?: "casual" | "formal" | "sport" | "party" | "work" | "travel";
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category_id: string;
  category?: Category;
  stock: number;
  featured: boolean;

  // Основные характеристики
  productType: ProductType;
  gender: Gender;
  color?: string;

  // Размеры (зависят от типа товара)
  sizes: (string | number)[]; // Может содержать числа (обувь) или строки (одежда, универсальные размеры)

  // Специфические атрибуты (зависят от типа товара)
  footwearAttributes?: FootwearAttributes;
  clothingAttributes?: ClothingAttributes;
  toysAttributes?: ToysAttributes;
  accessoriesAttributes?: AccessoriesAttributes;

  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productType: ProductType; // Привязываем категорию к типу товара
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string | number; // Поддерживаем как строковые (одежда), так и числовые (обувь) размеры
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address: Address;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface FilterOptions {
  brands: string[];
  sizes: (string | number)[]; // Поддерживаем как строковые, так и числовые размеры
  priceRange: [number, number];
  categories: string[];
  productTypes: ProductType[];
  gender: Gender[];
  colors: string[];

  // Специфические фильтры для разных типов товаров
  footwearTypes: string[];
  clothingTypes: string[];
  toyTypes: string[];
  accessoryTypes: string[];

  materials: string[];
  seasons: string[];
  ageGroups: string[]; // Для игрушек
  occasions: string[]; // Для аксессуаров

  hasDiscount: boolean;
  inStock: boolean;
  sortBy: "name" | "price" | "newest" | "popularity";
  sortOrder: "asc" | "desc";
}

export interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  salesByMonth: { month: string; sales: number }[];
  topProducts: Product[];
  recentOrders: Order[];
}

// Конфигурация для разных типов товаров
export interface ProductTypeConfig {
  label: string;
  sizeType: "footwear" | "clothing" | "universal";
  availableSizes: (string | number)[];
  specificFields: string[];
  requiredFields: string[];
}

export const PRODUCT_TYPE_CONFIGS: Record<ProductType, ProductTypeConfig> = {
  footwear: {
    label: "Обувь",
    sizeType: "footwear",
    availableSizes: Array.from({ length: 29 }, (_, i) => i + 19), // 19-47 (числа)
    specificFields: [
      "footwearType",
      "footwearMaterial",
      "footwearSeason",
      "footwearClosure",
    ],
    requiredFields: ["footwearType", "footwearMaterial"],
  },
  clothing: {
    label: "Одежда",
    sizeType: "clothing",
    availableSizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    specificFields: [
      "clothingType",
      "clothingMaterial",
      "clothingSeason",
      "clothingFit",
      "sleeveLength",
    ],
    requiredFields: ["clothingType", "clothingMaterial"],
  },
  toys: {
    label: "Игрушки",
    sizeType: "universal",
    availableSizes: ["One Size"],
    specificFields: [
      "toyType",
      "ageGroup",
      "toyMaterial",
      "batteryRequired",
      "assemblyRequired",
    ],
    requiredFields: ["toyType", "ageGroup"],
  },
  accessories: {
    label: "Аксессуары",
    sizeType: "universal",
    availableSizes: ["One Size", "S", "M", "L", "XL"],
    specificFields: ["accessoryType", "accessoryMaterial", "occasion"],
    requiredFields: ["accessoryType"],
  },
};
