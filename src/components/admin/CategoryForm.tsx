import type React from 'react';
import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: Partial<Category>) => void;
  category?: Category | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: ''
      });
    }
  }, [category, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
                placeholder="Мужские кроссовки"
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
