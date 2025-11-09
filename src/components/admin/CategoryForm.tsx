import type React from 'react';
import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: Partial<Category>) => void;
  category?: Category | null;
  allCategories: Category[]; // Все существующие категории для выбора родителя
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  allCategories
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '' as string | null
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        parentId: category.parentId || null
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        parentId: null
      });
    }
  }, [category, isOpen]);

  // Определяем уровень категории на основе родителя
  const getCurrentLevel = () => {
    if (!formData.parentId) return 0;
    const parent = allCategories.find(cat => cat.id === formData.parentId);
    return parent ? parent.level + 1 : 0;
  };

  // Получаем доступные категории для выбора родителя
  const getAvailableParents = () => {
    return allCategories.filter(cat => {
      // Исключаем текущую категорию (при редактировании)
      if (category && cat.id === category.id) return false;
      
      // Исключаем потомков текущей категории (при редактировании)
      if (category && cat.parentId === category.id) return false;
      
      // Показываем только категории уровня 0 и 1 (не подкатегории)
      // так как максимальная глубина 3 уровня
      if (cat.level >= 2) return false;
      
      return true;
    });
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return 'Корневая категория';
      case 1:
        return 'Категория';
      case 2:
        return 'Подкатегория';
      default:
        return 'Неизвестный уровень';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = value === '' ? null : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Auto-generate slug from name
    if (name === 'name' && !category) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-gray-200">
            <h2 className="text-2xl font-bold text-neutral-black">
              {category ? 'Редактировать категорию' : 'Добавить категорию'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Parent Category Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-black mb-2">
                Родительская категория
              </label>
              <select
                name="parentId"
                value={formData.parentId || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="">Без родителя (Корневая категория)</option>
                {getAvailableParents().map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.level === 0 ? cat.name : `  └─ ${cat.name}`} ({getLevelLabel(cat.level)})
                  </option>
                ))}
              </select>
              <p className="text-sm text-neutral-gray-500 mt-1">
                Текущий уровень: <span className="font-semibold">{getLevelLabel(getCurrentLevel())}</span>
                {getCurrentLevel() === 2 && ' (максимальный уровень)'}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-black mb-2">
                Название категории *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="Например: Мужское, Одежда, Jordan"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-neutral-black mb-2">
                URL slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="men-sneakers"
              />
              <p className="text-sm text-neutral-gray-500 mt-1">
                URL-адрес категории (автоматически генерируется из названия)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-black mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                placeholder="Описание категории..."
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-black mb-2">
                Изображение категории
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="https://example.com/category-image.jpg"
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-gray-400" />
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-neutral-black mb-2">Предварительный просмотр:</p>
                  <div className="w-32 h-32 border border-neutral-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Предварительный просмотр"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-neutral-gray-300 text-neutral-black rounded-lg font-medium hover:bg-neutral-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-brand-primary text-neutral-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
              >
                {category ? 'Сохранить изменения' : 'Добавить категорию'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CategoryForm;
