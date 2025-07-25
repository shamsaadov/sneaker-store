import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Users,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import type { Product, Category } from "../types";
import apiService from "../utils/api";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "categories" | "orders"
  >("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dashboardStats = {
    totalProducts: products.length,
    totalOrders: 127,
    totalRevenue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    totalUsers: 1248,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-neutral-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-neutral-black mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const ProductRow: React.FC<{ product: Product }> = ({ product }) => (
    <tr className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50">
      <td className="py-4 px-6">
        <div className="flex items-center space-x-3">
          <img
            src={product.images[0] || "/api/placeholder/60/60"}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <div className="font-semibold text-neutral-black">
              {product.name}
            </div>
            <div className="text-sm text-neutral-gray-600">{product.brand}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-neutral-black">
        {formatPrice(product.price)}
      </td>
      <td className="py-4 px-6 text-neutral-black">{product.stock}</td>
      <td className="py-4 px-6">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.featured
              ? "bg-brand-primary/10 text-brand-primary"
              : "bg-neutral-gray-200 text-neutral-gray-600"
          }`}
        >
          {product.featured ? "Рекомендуемый" : "Обычный"}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-neutral-gray-600 hover:text-brand-primary rounded-lg hover:bg-brand-primary/10">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-neutral-gray-600 hover:text-red-500 rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-black">
        Панель управления
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Товары"
          value={dashboardStats.totalProducts}
          icon={<Package className="w-6 h-6 text-neutral-white" />}
          color="bg-brand-primary"
        />
        <StatCard
          title="Заказы"
          value={dashboardStats.totalOrders}
          icon={<ShoppingCart className="w-6 h-6 text-neutral-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Выручка"
          value={formatPrice(dashboardStats.totalRevenue)}
          icon={<TrendingUp className="w-6 h-6 text-neutral-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Пользователи"
          value={dashboardStats.totalUsers}
          icon={<Users className="w-6 h-6 text-neutral-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Products */}
      <div className="bg-neutral-white rounded-lg shadow-md">
        <div className="p-6 border-b border-neutral-gray-200">
          <h3 className="text-lg font-semibold text-neutral-black">
            Недавние товары
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.images[0] || "/api/placeholder/40/40"}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <div>
                    <div className="font-medium text-neutral-black">
                      {product.name}
                    </div>
                    <div className="text-sm text-neutral-gray-600">
                      {product.brand}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-black">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-neutral-gray-600">
                    Осталось: {product.stock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-black">
          Управление товарами
        </h2>
        <button className="bg-brand-primary text-neutral-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить товар</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-neutral-white rounded-lg shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-gray-50">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Товар
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Цена
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Остаток
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Статус
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-black">
          Управление категориями
        </h2>
        <button className="bg-brand-primary text-neutral-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить категорию</span>
        </button>
      </div>

      <div className="bg-neutral-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-neutral-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-black mb-2">
            Управление категориями
          </h3>
          <p className="text-neutral-gray-600">
            Функционал управления категориями будет добавлен в следующих версиях
          </p>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-black">
        Управление заказами
      </h2>

      <div className="bg-neutral-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-neutral-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-black mb-2">
            Управление заказами
          </h3>
          <p className="text-neutral-gray-600">
            Функционал управления заказами будет добавлен в следующих версиях
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-gray-600">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-gray-100">
      {/* Header */}
      <header className="bg-neutral-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-brand-primary">
                steepstep Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-gray-600">Администратор</div>
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                <span className="text-neutral-white text-sm font-semibold">
                  A
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-neutral-white rounded-lg shadow-md p-4">
              <nav className="space-y-2">
                {[
                  {
                    key: "dashboard",
                    label: "Панель управления",
                    icon: TrendingUp,
                  },
                  { key: "products", label: "Товары", icon: Package },
                  { key: "categories", label: "Категории", icon: Package },
                  { key: "orders", label: "Заказы", icon: ShoppingCart },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === key
                        ? "bg-brand-primary text-neutral-white"
                        : "text-neutral-gray-700 hover:bg-neutral-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "products" && renderProducts()}
            {activeTab === "categories" && renderCategories()}
            {activeTab === "orders" && renderOrders()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
