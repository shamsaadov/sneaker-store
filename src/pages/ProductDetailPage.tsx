import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus,
  ArrowLeft,
  Share2,
  ZoomIn,
  ThumbsUp,
  Award,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import apiService from "../utils/api";
import { showToast } from "../components/ToastContainer";
import ImageGallery from "../components/ImageGallery";

interface SizeOption {
  size: string | number;
  available: boolean;
  price?: number; // Возможна разная цена для разных размеров
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string | number | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
      loadRelatedProducts();
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const productData = await apiService.getProduct(productId);
      setProduct(productData);
    } catch (error) {
      console.error("Error loading product:", error);
      showToast({
        type: "error",
        title: "Ошибка",
        message: "Не удалось загрузить информацию о товаре",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const products = await apiService.getProducts();
      setRelatedProducts(products.slice(0, 4));
    } catch (error) {
      console.error("Error loading related products:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      showToast({
        type: "warning",
        title: "Выберите размер",
        message: "Пожалуйста, выберите размер перед добавлением в корзину",
      });
      return;
    }

    addToCart(product, selectedSize, quantity);
    showToast({
      type: "success",
      title: "Добавлено в корзину",
      message: `${product.name} (размер ${selectedSize}) добавлен в корзину`,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast({
      type: isWishlisted ? "info" : "success",
      title: isWishlisted ? "Удалено из избранного" : "Добавлено в избранное",
      message: `${product?.name} ${isWishlisted ? "удален из" : "добавлен в"} избранное`,
    });
  };

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  };

  const getGenderLabel = (gender: string) => {
    const genderLabels = {
      men: "Мужской",
      women: "Женский",
      kids: "Детский",
      unisex: "Унисекс",
    };
    return genderLabels[gender as keyof typeof genderLabels] || gender;
  };

  const getProductTypeLabel = (productType: string) => {
    const typeLabels = {
      footwear: "Обувь",
      clothing: "Одежда",
      toys: "Игрушки",
      accessories: "Аксессуары",
    };
    return typeLabels[productType as keyof typeof typeLabels] || productType;
  };

  // Создаем SizeOption из sizes товара
  const sizeOptions: SizeOption[] =
    product?.sizes.map((size) => ({
      size,
      available: true, // В реальном приложении будет из API
      price: undefined,
    })) || [];

  const currentImage = product ? product.images[currentImageIndex] : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
          <p className="text-gray-600">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Товар не найден
          </h2>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Вернуться к каталогу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-brand-primary transition-colors"
            >
              Главная
            </button>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => navigate("/catalog")}
              className="text-gray-500 hover:text-brand-primary transition-colors"
            >
              Каталог
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowImageGallery(true)}
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Zoom Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5" />
              </div>

              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  %
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index
                      ? "border-brand-primary"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Product Info */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span className="font-medium">{product.brand}</span>
                <span>•</span>
                <span>{getProductTypeLabel(product.productType)}</span>
                <span>•</span>
                <span>{getGenderLabel(product.gender)}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Product Attributes */}
              {product.footwearAttributes && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.footwearAttributes.footwearType && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {product.footwearAttributes.footwearType}
                    </span>
                  )}
                  {product.footwearAttributes.material && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {product.footwearAttributes.material}
                    </span>
                  )}
                  {product.footwearAttributes.season && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {product.footwearAttributes.season}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Описание
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Размер
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.size}
                    onClick={() =>
                      option.available && setSelectedSize(option.size)
                    }
                    disabled={!option.available}
                    className={`py-2 px-3 rounded-lg border-2 flex items-center justify-center font-semibold text-sm transition-all ${
                      selectedSize === option.size
                        ? "border-brand-primary bg-brand-primary text-white"
                        : option.available
                          ? "border-gray-200 hover:border-brand-primary"
                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {option.size}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedSize
                  ? `Выбран размер: ${selectedSize}`
                  : "Выберите размер"}
              </p>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Количество
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  В наличии: {product.stock} шт.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                  selectedSize
                    ? "bg-brand-primary text-white hover:bg-brand-dark transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Добавить в корзину • {formatPrice(product.price * quantity)}
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                    isWishlisted
                      ? "border-red-500 text-red-500 bg-red-50"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 inline mr-2 ${isWishlisted ? "fill-current" : ""}`}
                  />
                  {isWishlisted ? "В избранном" : "В избранное"}
                </button>

                <button className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Быстрая доставка
                  </div>
                  <div className="text-sm text-gray-600">1-3 дня по России</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Гарантия качества
                  </div>
                  <div className="text-sm text-gray-600">100% оригинал</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Возврат</div>
                  <div className="text-sm text-gray-600">
                    14 дней на возврат
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Поддержка 24/7
                  </div>
                  <div className="text-sm text-gray-600">Всегда на связи</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Похожие товары
              </h2>
              <p className="text-gray-600">Вам также может понравиться</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={
                        relatedProduct.images[0] || "/api/placeholder/300/300"
                      }
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {relatedProduct.originalPrice && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -
                        {Math.round(
                          ((relatedProduct.originalPrice -
                            relatedProduct.price) /
                            relatedProduct.originalPrice) *
                            100
                        )}
                        %
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="text-sm text-gray-600 mb-1">
                      {relatedProduct.brand}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">
                          {formatPrice(relatedProduct.price)}
                        </div>
                        {relatedProduct.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(relatedProduct.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      {product && (
        <ImageGallery
          images={product.images}
          productName={product.name}
          isOpen={showImageGallery}
          onClose={() => setShowImageGallery(false)}
          initialIndex={currentImageIndex}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
