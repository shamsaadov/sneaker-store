import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { apiService } from "../utils/api";
import type { Category } from "../types";

interface MobileMegaMenuProps {
  onLinkClick: () => void;
}

const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({ onLinkClick }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-500">
        Загрузка категорий...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          level={0}
          expandedCategories={expandedCategories}
          onToggle={toggleCategory}
          onLinkClick={onLinkClick}
        />
      ))}
    </div>
  );
};

interface CategoryItemProps {
  category: Category;
  level: number;
  expandedCategories: Set<string>;
  onToggle: (categoryId: string) => void;
  onLinkClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  level,
  expandedCategories,
  onToggle,
  onLinkClick,
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  const paddingLeft = `${level * 16}px`;

  return (
    <div>
      <div
        className={`flex items-center justify-between py-3 transition-colors touch-manipulation ${
          level === 0
            ? "font-bold text-gray-900"
            : level === 1
              ? "font-semibold text-gray-800"
              : "text-gray-700"
        }`}
        style={{ paddingLeft }}
      >
        <Link
          to={`/catalog?category=${category.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick();
          }}
          className="flex-1 hover:text-brand-primary transition-colors active:text-brand-primary"
        >
          {category.name}
          {category.productCount !== undefined && category.productCount > 0 && (
            <span className="text-xs text-gray-500 ml-2 font-normal">
              ({category.productCount})
            </span>
          )}
        </Link>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(category.id);
            }}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded transition-colors touch-manipulation flex-shrink-0"
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {category.children?.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              expandedCategories={expandedCategories}
              onToggle={onToggle}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileMegaMenu;

