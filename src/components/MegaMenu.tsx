import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { apiService } from "../utils/api";
import type { Category } from "../types";

const MegaMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategoriesTree();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryHover = useCallback((categoryId: string) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }

    // Set new category immediately if menu is already open
    if (isOpen) {
      setActiveCategory(categoryId);
    } else {
      // Add slight delay before opening menu
      openTimeoutRef.current = setTimeout(() => {
        setActiveCategory(categoryId);
        setIsOpen(true);
      }, 150);
    }
  }, [isOpen]);

  const handleMenuLeave = useCallback(() => {
    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    // Add delay before closing to prevent flickering
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveCategory(null);
    }, 200);
  }, []);

  const handleMenuEnter = useCallback(() => {
    // Clear close timeout when mouse enters menu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const handleLinkClick = useCallback(() => {
    // Clear all timeouts
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    setIsOpen(false);
    setActiveCategory(null);
  }, []);

  const getActiveCategoryData = () => {
    return categories.find((cat) => cat.id === activeCategory);
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={handleLinkClick}
          style={{ animation: 'fadeIn 0.2s ease-in' }}
        />
      )}
      
      <div 
        className="relative" 
        onMouseLeave={handleMenuLeave}
        onMouseEnter={handleMenuEnter}
      >
        {/* Top level categories */}
        <nav className="flex items-center space-x-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => handleCategoryHover(category.id)}
            >
              <Link
                to={`/catalog?category=${category.id}`}
                onClick={handleLinkClick}
                className={`transition-colors font-medium py-6 block ${
                  activeCategory === category.id
                    ? "text-brand-primary font-semibold border-b-2 border-brand-primary"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {category.name}
              </Link>
            </div>
          ))}
        </nav>

        {/* Mega menu dropdown */}
        {isOpen && activeCategory && (
          <div 
            className="fixed left-0 right-0 top-[72px] bg-white shadow-2xl border-t border-gray-200 z-50"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
            style={{ animation: 'fadeIn 0.2s ease-in' }}
          >
            <div className="container mx-auto px-8 py-8 max-w-7xl">
              <MegaMenuContent 
                category={getActiveCategoryData()} 
                onLinkClick={handleLinkClick}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

interface MegaMenuContentProps {
  category: Category | undefined;
  onLinkClick: () => void;
}

const MegaMenuContent: React.FC<MegaMenuContentProps> = ({ category, onLinkClick }) => {
  if (!category || !category.children || category.children.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Подкатегории отсутствуют
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl">
      {category.children.map((subCategory) => (
        <div key={subCategory.id} className="space-y-3">
          {/* Level 1 - Category */}
          <Link
            to={`/catalog?category=${subCategory.id}`}
            onClick={onLinkClick}
            className="block font-bold text-gray-900 hover:text-brand-primary transition-colors text-base mb-3"
          >
            {subCategory.name}
            {subCategory.productCount !== undefined && subCategory.productCount > 0 && (
              <span className="text-xs text-gray-500 ml-2 font-normal">
                ({subCategory.productCount})
              </span>
            )}
          </Link>

          {/* Level 2 - Subcategories */}
          {subCategory.children && subCategory.children.length > 0 && (
            <ul className="space-y-2">
              {subCategory.children.map((subSubCategory) => (
                <li key={subSubCategory.id}>
                  <Link
                    to={`/catalog?category=${subSubCategory.id}`}
                    onClick={onLinkClick}
                    className="group flex items-center justify-between text-sm text-gray-600 hover:text-brand-primary transition-colors py-1.5"
                  >
                    <span className="line-clamp-1">{subSubCategory.name}</span>
                    {subSubCategory.productCount !== undefined && subSubCategory.productCount > 0 && (
                      <span className="text-xs text-gray-400 group-hover:text-brand-primary flex-shrink-0 ml-2">
                        {subSubCategory.productCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Direct link if no children */}
          {(!subCategory.children || subCategory.children.length === 0) && subCategory.productCount !== undefined && subCategory.productCount > 0 && (
            <Link
              to={`/catalog?category=${subCategory.id}`}
              onClick={onLinkClick}
              className="inline-flex items-center text-sm text-brand-primary hover:underline mt-2"
            >
              Смотреть все
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default MegaMenu;

