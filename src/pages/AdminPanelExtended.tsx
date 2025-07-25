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
  LogOut,
  BarChart3,
  AlertTriangle,
  DollarSign,
  Eye,
  Archive,
  Calendar,
  Star,
  Clock,
} from "lucide-react";
import type { Product, Category } from "../types";
import apiService from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ProductForm from "../components/admin/ProductForm";
import CategoryForm from "../components/admin/CategoryForm";
import AnalyticsCharts from "../components/admin/AnalyticsCharts";
import SpecialOrdersManagement from "../components/admin/SpecialOrdersManagement";
import OrdersManagement from "../components/admin/OrdersManagement";

interface AdminPanelExtendedProps {
  onLogout: () => void;
}

const AdminPanelExtended: React.FC<AdminPanelExtendedProps> = ({
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "products"
    | "categories"
    | "orders"
    | "analytics"
    | "inventory"
    | "special-orders"
  >("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  // Analytics data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[] | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[] | null>(null);

  // Modal states
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

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

      // Load analytics data
      await loadAnalyticsData();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const [dashboard, monthly, activity] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getMonthlyAnalytics(),
        apiService.getRecentActivity(),
      ]);

      setDashboardData(dashboard);
      setMonthlyData(monthly);
      setRecentActivity(activity);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      // Keep default/mock data on error
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Package,
      Edit,
      ShoppingCart,
      AlertTriangle,
      Archive,
      DollarSign,
      Star,
      Eye,
      Clock,
      Users,
      TrendingUp,
    };
    return iconMap[iconName] || Package;
  };

  // Расширенная аналитика и метрики
  const analytics = {
    // Основные метрики (используем реальные данные если доступны)
    totalProducts: products.length,
    totalOrders: dashboardData?.totalOrders || 347,
    totalRevenue:
      dashboardData?.totalRevenue ||
      products.reduce((sum, p) => sum + p.price * Math.min(p.stock, 15), 0),
    totalUsers: dashboardData?.totalUsers || 2485,

    // Инвентарь
    lowStockItems: products.filter((p) => p.stock < 5).length,
    outOfStockItems: products.filter((p) => p.stock === 0).length,
    totalInventoryValue: products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    ),
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    averageStockPerProduct:
      products.length > 0
        ? Math.round(
            products.reduce((sum, p) => sum + p.stock, 0) / products.length
          )
        : 0,

    // Ценообразование
    averagePrice:
      products.length > 0
        ? Math.round(
            products.reduce((sum, p) => sum + p.price, 0) / products.length
          )
        : 0,
    highestPrice:
      products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0,
    lowestPrice:
      products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0,

    // Продукты
    featuredProducts: products.filter((p) => p.featured).length,
    brandCount: new Set(products.map((p) => p.brand)).size,

    // Данные по месяцам (используем реальные данные если доступны)
    monthlyData:
      monthlyData && monthlyData.length > 0
        ? monthlyData
        : [
            { month: "Янв", revenue: 450000, orders: 87, products: 12 },
            { month: "Фев", revenue: 520000, orders: 94, products: 8 },
            { month: "Мар", revenue: 680000, orders: 112, products: 15 },
            { month: "Апр", revenue: 750000, orders: 134, products: 18 },
            { month: "Май", revenue: 890000, orders: 156, products: 22 },
            { month: "Июн", revenue: 920000, orders: 178, products: 19 },
          ],

    // Топ бренды
    topBrands: getTopBrands(products),

    // Активность (используем реальные данные если доступны)
    recentActivity:
      recentActivity && recentActivity.length > 0
        ? recentActivity.map((activity) => ({
            ...activity,
            icon: getIconComponent(activity.icon),
          }))
        : [
            {
              action: "Добавлен товар",
              item: "Nike Air Force 1",
              time: "5 мин назад",
              type: "create",
              icon: Package,
            },
            {
              action: "Обновлен остаток",
              item: "Adidas Stan Smith",
              time: "15 мин назад",
              type: "update",
              icon: Edit,
            },
            {
              action: "Новый заказ #2847",
              item: "Air Jordan 1 Retro High",
              time: "32 мин назад",
              type: "order",
              icon: ShoppingCart,
            },
            {
              action: "Низкий остаток",
              item: "Converse Chuck Taylor",
              time: "1 час назад",
              type: "warning",
              icon: AlertTriangle,
            },
            {
              action: "Товар закончился",
              item: "Vans Old Skool",
              time: "2 часа назад",
              type: "danger",
              icon: Archive,
            },
            {
              action: "Обновлена цена",
              item: "New Balance 990v5",
              time: "3 часа назад",
              type: "update",
              icon: DollarSign,
            },
          ],

    // Критические уведомления
    alerts: [
      {
        type: "danger" as const,
        message: `${products.filter((p) => p.stock === 0).length} товаров закончились`,
        count: products.filter((p) => p.stock === 0).length,
      },
      {
        type: "warning" as const,
        message: `${products.filter((p) => p.stock < 5 && p.stock > 0).length} товаров с низким остатком`,
        count: products.filter((p) => p.stock < 5 && p.stock > 0).length,
      },
      {
        type: "info" as const,
        message: `${products.filter((p) => p.featured).length} рекомендуемых товаров`,
        count: products.filter((p) => p.featured).length,
      },
    ],
  };

  function getTopBrands(products: Product[]) {
    const brandStats = products.reduce(
      (acc, product) => {
        if (!acc[product.brand]) {
          acc[product.brand] = {
            count: 0,
            revenue: 0,
            stock: 0,

            percentage: 0,
          };
        }
        acc[product.brand].count += 1;
        acc[product.brand].revenue +=
          product.price * Math.min(product.stock, 10);
        acc[product.brand].stock += product.stock;

        return acc;
      },
      {} as Record<
        string,
        { count: number; revenue: number; stock: number; percentage: number }
      >
    );

    // Calculate percentages
    const totalRevenue = Object.values(brandStats).reduce(
      (sum, brand) => sum + brand.revenue,
      0
    );
    Object.values(brandStats).forEach((brand) => {
      brand.percentage = (brand.revenue / totalRevenue) * 100;
    });

    return Object.entries(brandStats)
      .map(([brand, stats]) => ({ brand, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // CRUD Operations
  const handleAddProduct = async (productData: Partial<Product>) => {
    try {
      const newProduct = await apiService.createProduct(productData);
      setProducts((prev) => [...prev, newProduct]);
      alert("Товар успешно добавлен!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Ошибка при добавлении товара");
    }
  };

  const handleEditProduct = async (productData: Partial<Product>) => {
    if (!editingProduct) return;
    try {
      const updatedProduct = await apiService.updateProduct(
        editingProduct.id,
        productData
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      setEditingProduct(null);
      alert("Товар успешно обновлен!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Ошибка при обновлении товара");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот товар?")) {
      try {
        await apiService.deleteProduct(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        alert("Товар успешно удален!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Ошибка при удалении товара");
      }
    }
  };

  const handleAddCategory = async (categoryData: Partial<Category>) => {
    try {
      const newCategory = await apiService.createCategory(categoryData);
      setCategories((prev) => [...prev, newCategory]);
      alert("Категория успешно добавлена!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Ошибка при добавлении категории");
    }
  };

  const handleEditCategory = async (categoryData: Partial<Category>) => {
    if (!editingCategory) return;
    try {
      const updatedCategory = await apiService.updateCategory(
        editingCategory.id,
        categoryData
      );
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? updatedCategory : c))
      );
      setEditingCategory(null);
      alert("Категория успешно обновлена!");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Ошибка при обновлении категории");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту категорию?")) {
      try {
        await apiService.deleteCategory(categoryId);
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        alert("Категория успешно удалена!");
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Ошибка при удалении категории");
      }
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ru-RU").format(num);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: { value: number; positive: boolean };
  }> = ({ title, value, icon, color, subtitle, trend }) => (
    <div
      className="bg-neutral-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-neutral-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-black mt-1">{value}</p>
          {subtitle && (
            <p className="text-neutral-gray-500 text-xs mt-1">{subtitle}</p>
          )}
          {trend && (
            <div
              className={`flex items-center mt-2 text-xs ${trend.positive ? "text-green-600" : "text-red-600"}`}
            >
              <TrendingUp
                className={`w-3 h-3 mr-1 ${trend.positive ? "" : "rotate-180"}`}
              />
              {trend.positive ? "+" : ""}
              {trend.value}% к прошлому месяцу
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: color + "20" }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );

  const AlertCard: React.FC<{
    type: "danger" | "warning" | "info";
    message: string;
    count: number;
  }> = ({ type, message, count }) => {
    const colors = {
      danger: "border-red-500 bg-red-50 text-red-700",
      warning: "border-yellow-500 bg-yellow-50 text-yellow-700",
      info: "border-blue-500 bg-blue-50 text-blue-700",
    };

    const icons = {
      danger: <AlertTriangle className="w-5 h-5" />,
      warning: <Clock className="w-5 h-5" />,
      info: <Eye className="w-5 h-5" />,
    };

    return (
      <div className={`border-l-4 p-4 rounded-r-lg ${colors[type]}`}>
        <div className="flex items-center space-x-3">
          {icons[type]}
          <div className="flex-1">
            <p className="font-medium">{message}</p>
          </div>
          {count > 0 && (
            <span className="bg-neutral-white px-2 py-1 rounded-full text-xs font-bold">
              {count}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-black">
          Панель управления
        </h2>
        <div className="text-sm text-neutral-gray-600">
          Последнее обновление: {new Date().toLocaleString("ru-RU")}
        </div>
      </div>

      {/* Уведомления */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-neutral-black">
          Критические уведомления
        </h3>
        {analytics.alerts.map((alert, index) => (
          <AlertCard key={index} {...alert} />
        ))}
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Общий доход"
          value={formatPrice(analytics.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="#0957c3"
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          title="Всего заказов"
          value={analytics.totalOrders}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="#10b981"
          trend={{ value: 8.2, positive: true }}
        />
        <StatCard
          title="Товары в наличии"
          value={analytics.totalProducts}
          icon={<Package className="w-6 h-6" />}
          color="#f59e0b"
          subtitle={`${analytics.totalStock} единиц`}
        />
        <StatCard
          title="Пользователи"
          value={analytics.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="#8b5cf6"
          trend={{ value: 5.7, positive: true }}
        />
      </div>

      {/* Финансовые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Стоимость склада"
          value={formatPrice(analytics.totalInventoryValue)}
          icon={<Archive className="w-6 h-6" />}
          color="#ef4444"
          subtitle="Общая стоимость товаров"
        />
        <StatCard
          title="Средняя цена"
          value={formatPrice(analytics.averagePrice)}
          icon={<BarChart3 className="w-6 h-6" />}
          color="#06b6d4"
          subtitle={`От ${formatPrice(analytics.lowestPrice)} до ${formatPrice(analytics.highestPrice)}`}
        />
      </div>

      {/* Графики и таблицы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Месячная статистика */}
        <div className="bg-neutral-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-neutral-black mb-4">
            Статистика по месяцам
          </h3>
          <div className="space-y-4">
            {analytics.monthlyData.map((month) => (
              <div
                key={month.month}
                className="flex items-center justify-between py-2 border-b border-neutral-gray-100"
              >
                <div>
                  <div className="font-medium text-neutral-black">
                    {month.month}
                  </div>
                  <div className="text-sm text-neutral-gray-600">
                    {month.orders} заказов
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-black">
                    {formatPrice(month.revenue)}
                  </div>
                  <div className="text-sm text-neutral-gray-600">
                    +{month.products} товаров
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Топ бренды */}
        <div className="bg-neutral-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-neutral-black mb-4">
            Топ бренды
          </h3>
          <div className="space-y-4">
            {analytics.topBrands.slice(0, 6).map((brand, index) => (
              <div
                key={brand.brand}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-neutral-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-black">
                      {brand.brand}
                    </div>
                    <div className="text-sm text-neutral-gray-600">
                      {brand.count} товаров
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-black">
                    {formatPrice(brand.revenue)}
                  </div>
                  <div className="text-sm text-neutral-gray-600">
                    {brand.stock} в наличии
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Последняя активность */}
      <div className="bg-neutral-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-neutral-black mb-4">
          Последняя активность
        </h3>
        <div className="space-y-4">
          {analytics.recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 py-3 border-b border-neutral-gray-100 last:border-b-0"
            >
              <div
                className={`p-2 rounded-lg ${
                  activity.type === "create"
                    ? "bg-green-100 text-green-600"
                    : activity.type === "update"
                      ? "bg-blue-100 text-blue-600"
                      : activity.type === "order"
                        ? "bg-purple-100 text-purple-600"
                        : activity.type === "warning"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                }`}
              >
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-black">
                  {activity.action}
                </div>
                <div className="text-sm text-neutral-gray-600">
                  {activity.item}
                </div>
              </div>
              <div className="text-sm text-neutral-gray-500">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-black">
        Подробная аналитика
      </h2>
      <AnalyticsCharts
        monthlyData={analytics.monthlyData}
        brandData={analytics.topBrands}
        totalRevenue={analytics.totalRevenue}
        totalOrders={analytics.totalOrders}
      />
    </div>
  );

  const renderProductsManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-black">
          Управление товарами
        </h2>
        <button
          onClick={() => setIsProductFormOpen(true)}
          className="bg-brand-primary text-neutral-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить товар</span>
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="bg-neutral-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <select className="px-4 py-2 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <option value="">Все бренды</option>
              {analytics.topBrands.map((brand) => (
                <option key={brand.brand} value={brand.brand}>
                  {brand.brand}
                </option>
              ))}
            </select>
            <select className="px-4 py-2 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <option value="">Все статусы</option>
              <option value="in-stock">В наличии</option>
              <option value="low-stock">Низкий остаток</option>
              <option value="out-of-stock">Нет в наличии</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица товаров */}
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
              <tr
                key={product.id}
                className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50"
              >
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
                      <div className="text-sm text-neutral-gray-600">
                        {product.brand}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-neutral-black">
                    {formatPrice(product.price)}
                  </div>
                  {product.originalPrice && (
                    <div className="text-sm text-neutral-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-neutral-black font-medium">
                  {product.stock}
                </td>

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
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsProductFormOpen(true);
                      }}
                      className="p-2 text-neutral-gray-600 hover:text-brand-primary rounded-lg hover:bg-brand-primary/10"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-gray-600 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-neutral-gray-600 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategoriesManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-black">
          Управление категориями
        </h2>
        <button
          onClick={() => setIsCategoryFormOpen(true)}
          className="bg-brand-primary text-neutral-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить категорию</span>
        </button>
      </div>

      {/* Таблица категорий */}
      <div className="bg-neutral-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-gray-50">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Категория
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Slug
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Товаров
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-neutral-black">
                        {category.name}
                      </div>
                      <div className="text-sm text-neutral-gray-600">
                        {category.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-neutral-gray-600 font-mono text-sm">
                  {category.slug}
                </td>
                <td className="py-4 px-6 text-neutral-black font-medium">
                  {products.filter((p) => p.category_id === category.id).length}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setIsCategoryFormOpen(true);
                      }}
                      className="p-2 text-neutral-gray-600 hover:text-brand-primary rounded-lg hover:bg-brand-primary/10"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-neutral-gray-600 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventoryManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-black">
        Управление складом
      </h2>

      {/* Складские метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Общий остаток"
          value={analytics.totalStock}
          icon={<Package className="w-6 h-6" />}
          color="#0957c3"
          subtitle="единиц товара"
        />
        <StatCard
          title="Низкий остаток"
          value={analytics.lowStockItems}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="#f59e0b"
          subtitle="требует пополнения"
        />
        <StatCard
          title="Нет в наличии"
          value={analytics.outOfStockItems}
          icon={<Archive className="w-6 h-6" />}
          color="#ef4444"
          subtitle="товаров закончилось"
        />
        <StatCard
          title="Средний остаток"
          value={analytics.averageStockPerProduct}
          icon={<BarChart3 className="w-6 h-6" />}
          color="#10b981"
          subtitle="на товар"
        />
      </div>

      {/* Таблица товаров со складскими данными */}
      <div className="bg-neutral-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-neutral-gray-200">
          <h3 className="text-lg font-semibold text-neutral-black">
            Складские остатки
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                  Товар
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                  Остаток
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-neutral-gray-700">
                  Стоимость
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
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50"
                >
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
                        <div className="text-sm text-neutral-gray-600">
                          {product.brand}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-lg font-semibold text-neutral-black">
                      {product.stock}
                    </div>
                    <div className="text-sm text-neutral-gray-600">единиц</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-neutral-black">
                      {formatPrice(product.price * product.stock)}
                    </div>
                    <div className="text-sm text-neutral-gray-600">
                      {formatPrice(product.price)} за шт.
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0
                          ? "bg-red-100 text-red-800"
                          : product.stock < 5
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.stock === 0
                        ? "Нет в наличии"
                        : product.stock < 5
                          ? "Низкий остаток"
                          : "В наличии"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductFormOpen(true);
                        }}
                        className="p-2 text-neutral-gray-600 hover:text-brand-primary rounded-lg hover:bg-brand-primary/10"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // View functionality removed
                        }}
                        className="p-2 text-neutral-gray-600 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
          <p className="text-neutral-gray-600">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-gray-100">
      {/* Header */}
      <header className="bg-neutral-white shadow-sm border-b border-neutral-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-brand-primary">
                steepstep Admin
              </h1>
              <span className="text-sm text-neutral-gray-500 bg-neutral-gray-100 px-2 py-1 rounded">
                Полная панель управления
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-gray-600">{user?.name}</div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-neutral-gray-600 hover:text-brand-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </button>
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
                  { key: "inventory", label: "Склад", icon: Archive },
                  { key: "categories", label: "Категории", icon: Package },
                  { key: "orders", label: "Заказы", icon: ShoppingCart },
                  { key: "special-orders", label: "Спецзаказы", icon: Star },
                  { key: "analytics", label: "Аналитика", icon: BarChart3 },
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
            {activeTab === "products" && renderProductsManagement()}
            {activeTab === "inventory" && renderInventoryManagement()}
            {activeTab === "categories" && renderCategoriesManagement()}
            {activeTab === "orders" && <OrdersManagement />}
            {activeTab === "special-orders" && <SpecialOrdersManagement />}
            {activeTab === "analytics" && renderAnalytics()}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        product={editingProduct || undefined}
        categories={categories}
      />

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={() => {
          setIsCategoryFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
        category={editingCategory}
      />
    </div>
  );
};

export default AdminPanelExtended;
