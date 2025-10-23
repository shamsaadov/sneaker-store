import type React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Grid, List, Search } from 'lucide-react';
import type { Product, FilterOptions } from '../types';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductModal from './ProductModal';

interface ProductCatalogProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ searchQuery, onSearchChange }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Lazy loading state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  // Состояние для раскрытых секций фильтров
  const [expandedFilterSections, setExpandedFilterSections] = useState({
    sort: false,
    productType: false,
    gender: false,
    brands: false,
    sizes: false,
    price: false,
    special: false,
  });

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

  // Мемоизированный callback для изменения фильтров
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
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

  // Load more products function
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const apiService = (await import('../utils/api')).default;

      let data: Product[];
      const offset = page * ITEMS_PER_PAGE;

      if (searchQuery) {
        // Use search API
        data = await apiService.searchProducts(searchQuery);
        // For search, we load all at once, so no more after first load
        setHasMore(false);
      } else {
        // Use regular products API with filters and pagination
        const apiFilters = {
          brands: filters.brands.length > 0 ? filters.brands : undefined,
          sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
          priceRange: filters.priceRange,
          categories: filters.categories.length > 0 ? filters.categories : undefined,
          productTypes: filters.productTypes.length > 0 ? filters.productTypes : undefined,
          gender: filters.gender.length > 0 ? filters.gender : undefined,
          colors: filters.colors.length > 0 ? filters.colors : undefined,
          inStock: filters.inStock || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          limit: ITEMS_PER_PAGE,
          offset: offset,
        };
        data = await apiService.getProducts(apiFilters);
        
        // If we got less than ITEMS_PER_PAGE, we've reached the end
        if (data.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }
      }

      // Append new products to existing ones
      setFilteredProducts((prev: Product[]) => [...prev, ...data]);
      setProducts((prev: Product[]) => [...prev, ...data]);
      setPage((prev: number) => prev + 1);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, searchQuery, filters, ITEMS_PER_PAGE]);

  // Reset and load initial products when filters or search changes
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const searchKey = searchQuery;

  useEffect(() => {
    const resetAndLoad = async () => {
      try {
        setProductsLoading(true);
        setPage(0);
        setHasMore(true);
        setFilteredProducts([]);
        setProducts([]);

        const apiService = (await import('../utils/api')).default;
        let data: Product[];

        if (searchQuery) {
          data = await apiService.searchProducts(searchQuery);
          setHasMore(false);
        } else {
          const apiFilters = {
            brands: filters.brands.length > 0 ? filters.brands : undefined,
            sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
            priceRange: filters.priceRange,
            categories: filters.categories.length > 0 ? filters.categories : undefined,
            productTypes: filters.productTypes.length > 0 ? filters.productTypes : undefined,
            gender: filters.gender.length > 0 ? filters.gender : undefined,
            colors: filters.colors.length > 0 ? filters.colors : undefined,
            inStock: filters.inStock || undefined,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            limit: ITEMS_PER_PAGE,
            offset: 0,
          };
          data = await apiService.getProducts(apiFilters);
          
          if (data.length < ITEMS_PER_PAGE) {
            setHasMore(false);
          }
        }

        setFilteredProducts(data);
        setProducts(data);
        setPage(1);
      } catch (error) {
        console.error('Error loading filtered products:', error);
        setFilteredProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    resetAndLoad();
  }, [searchKey, filtersKey]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMoreProducts]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (productsLoading && filteredProducts.length === 0) {
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
            onFiltersChange={handleFiltersChange}
            availableBrands={availableBrands}
            priceRange={priceRange}
            isOpen={isFiltersOpen}
            onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
            expandedSections={expandedFilterSections}
            onExpandedSectionsChange={setExpandedFilterSections}
          />
          
          {/* Mobile Search - Below Filters */}
          <form 
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              onSearchChange(localSearchQuery);
            }}
            className="relative lg:hidden mt-4"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск кроссовок..."
              value={localSearchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-primary text-white px-2.5 rounded hover:bg-brand-dark transition-colors text-[11px] font-medium !h-6 !min-h-0 flex items-center justify-center"
            >
              Найти
            </button>
          </form>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            {/* Title, Search and View Toggle Row */}
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold text-neutral-black whitespace-nowrap">
                Каталог товаров
              </h1>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Desktop Search Input - Hidden on Mobile */}
              <form 
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  onSearchChange(localSearchQuery);
                }}
                className="relative w-80 hidden lg:block"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск кроссовок..."
                  value={localSearchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-16 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-primary text-white px-3 py-1 rounded-md hover:bg-brand-dark transition-colors text-xs font-medium"
                >
                  Найти
                </button>
              </form>

              {/* View Mode Toggle - Hidden on Mobile */}
              <div className="hidden lg:flex items-center space-x-2 bg-neutral-gray-100 rounded-lg p-1">
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

            <p className="text-neutral-gray-600">
              Найдено {filteredProducts.length} товаров
              {searchQuery && ` по запросу "${searchQuery}"`}
            </p>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-neutral-gray-200 animate-pulse rounded-lg h-96"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
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
                  // Очищаем поисковое поле
                  setLocalSearchQuery('');
                  onSearchChange('');
                }}
                className="text-brand-primary hover:text-brand-dark font-medium"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            
          )}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              <p className="mt-2 text-neutral-gray-600">Загрузка товаров...</p>
            </div>
          )}

          {/* Intersection observer target */}
          <div 
            ref={observerTarget} 
            className="h-20 flex items-center justify-center"
            style={{ minHeight: '80px' }}
          >
            {hasMore && !isLoadingMore && (
              <p className="text-gray-400 text-sm">Прокрутите вниз для загрузки...</p>
            )}
          </div>
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
