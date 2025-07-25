import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Grid, List } from 'lucide-react';
import type { Product, FilterOptions } from '../types';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductModal from './ProductModal';

interface ProductCatalogProps {
  searchQuery: string;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ searchQuery }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterOptions>({
    brands: [],
    sizes: [],
    priceRange: [0, 50000],
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
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const apiService = (await import('../utils/api')).default;
        const data = await apiService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fall back to empty array on error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load filters data
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const apiService = (await import('../utils/api')).default;
        const [brands, priceRangeData] = await Promise.all([
          apiService.getBrands(),
          apiService.getPriceRange()
        ]);
        setAvailableBrands(brands);
        setPriceRange([priceRangeData.min, priceRangeData.max]);
      } catch (error) {
        console.error('Error loading filters data:', error);
      }
    };

    loadFiltersData();
  }, []);

  // Load products with filters
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadFilteredProducts = async () => {
      try {
        setLoading(true);
        const apiService = (await import('../utils/api')).default;

        let data: Product[];

        if (searchQuery) {
          // Use search API
          data = await apiService.searchProducts(searchQuery);
        } else {
          // Use regular products API with filters
          const apiFilters = {
            brands: filters.brands.length > 0 ? filters.brands : undefined,
            sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
            priceRange: filters.priceRange,
            type: filters.productTypes.length > 0 ? filters.productTypes : undefined,
            colors: filters.colors.length > 0 ? filters.colors : undefined,
            materials: filters.materials.length > 0 ? filters.materials : undefined,
            seasons: filters.seasons.length > 0 ? filters.seasons : undefined,
            hasDiscount: filters.hasDiscount || undefined,
            inStock: filters.inStock || undefined,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          };
          data = await apiService.getProducts(apiFilters);
        }

        setFilteredProducts(data);
        setProducts(data); // Update products for other uses
      } catch (error) {
        console.error('Error loading filtered products:', error);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFilteredProducts();
  }, [searchQuery, filters]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-neutral-gray-200 animate-pulse rounded-lg h-96"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableBrands={availableBrands}
            priceRange={priceRange}
            isOpen={isFiltersOpen}
            onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-black">
                Каталог товаров
              </h1>
              <p className="text-neutral-gray-600 mt-1">
                Найдено {filteredProducts.length} товаров
                {searchQuery && ` по запросу "${searchQuery}"`}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-neutral-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-neutral-white text-brand-primary'
                    : 'text-neutral-gray-600 hover:text-neutral-black'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-neutral-white text-brand-primary'
                    : 'text-neutral-gray-600 hover:text-neutral-black'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-gray-500 mb-4">
                {searchQuery
                  ? `Товары по запросу "${searchQuery}" не найдены`
                  : 'Товары не найдены'
                }
              </div>
              <button
                onClick={() => {
                  setFilters({
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
                    sortBy: 'name',
                    sortOrder: 'asc',
                  });
                }}
                className="text-brand-primary hover:text-brand-dark font-medium"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'
                : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProductCatalog;
