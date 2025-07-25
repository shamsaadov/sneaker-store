import type React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Phone,
  ExternalLink,
  Calendar,
} from "lucide-react";
import apiService from "../../utils/api";

interface SpecialOrder {
  id: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  size: string;
  color: string;
  budget: string;
  urgency: "normal" | "urgent" | "emergency";
  description: string;
  images: string[];
  status:
    | "new"
    | "in_progress"
    | "quoted"
    | "confirmed"
    | "found"
    | "ordered"
    | "delivered"
    | "completed"
    | "cancelled";
  admin_notes: string;
  estimated_price: number | null;
  estimated_delivery: string | null;
  found_product_url: string | null;
  created_at: string;
  updated_at: string;
}

const SpecialOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<SpecialOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SpecialOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, urgencyFilter, searchQuery]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter || undefined,
        urgency: urgencyFilter || undefined,
        search: searchQuery || undefined,
        sort_by: "created_at",
        sort_order: "desc",
      };

      const data = await apiService.getSpecialOrders(filters);
      setOrders(data);
    } catch (error) {
      console.error("Error loading special orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: string,
    adminNotes = ""
  ) => {
    try {
      await apiService.updateSpecialOrderStatus(orderId, newStatus, adminNotes);
      await loadOrders(); // Reload data
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Ошибка при обновлении статуса");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот спецзаказ?")) {
      try {
        await apiService.deleteSpecialOrder(orderId);
        await loadOrders(); // Reload data
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Ошибка при удалении заказа");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: "bg-blue-100 text-blue-800", label: "Новый" },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        label: "В обработке",
      },
      quoted: { color: "bg-purple-100 text-purple-800", label: "Оценен" },
      confirmed: {
        color: "bg-indigo-100 text-indigo-800",
        label: "Подтвержден",
      },
      found: { color: "bg-green-100 text-green-800", label: "Найден" },
      ordered: { color: "bg-orange-100 text-orange-800", label: "Заказан" },
      delivered: {
        color: "bg-emerald-100 text-emerald-800",
        label: "Доставлен",
      },
      completed: { color: "bg-green-100 text-green-800", label: "Завершен" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Отменен" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      normal: {
        color: "bg-gray-100 text-gray-800",
        label: "Обычная",
        icon: Clock,
      },
      urgent: {
        color: "bg-orange-100 text-orange-800",
        label: "Срочная",
        icon: AlertTriangle,
      },
      emergency: {
        color: "bg-red-100 text-red-800",
        label: "Экстренная",
        icon: AlertTriangle,
      },
    };

    const config =
      urgencyConfig[urgency as keyof typeof urgencyConfig] ||
      urgencyConfig.normal;
    const Icon = config.icon;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  };

  const OrderDetailModal: React.FC<{ order: SpecialOrder }> = ({ order }) => (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setIsDetailModalOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Спецзаказ #{order.id.slice(-8)}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(order.status)}
                {getUrgencyBadge(order.urgency)}
              </div>
            </div>
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Информация о клиенте
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Имя:</span>
                    <span>{order.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${order.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Детали заказа
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Бренд:</span> {order.brand}
                  </div>
                  <div>
                    <span className="font-medium">Модель:</span> {order.model}
                  </div>
                  {order.size && (
                    <div>
                      <span className="font-medium">Размер:</span> {order.size}
                    </div>
                  )}
                  {order.color && (
                    <div>
                      <span className="font-medium">Цвет:</span> {order.color}
                    </div>
                  )}
                  {order.budget && (
                    <div>
                      <span className="font-medium">Бюджет:</span>{" "}
                      {order.budget}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {order.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Описание</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {order.description}
                </p>
              </div>
            )}

            {/* Images */}
            {order.images.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Изображения
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {order.images.map((image, index) => (
                    <a
                      key={index}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={image}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Info */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Административная информация
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Создан:</span>{" "}
                    {formatDate(order.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Обновлен:</span>{" "}
                    {formatDate(order.updated_at)}
                  </div>
                  {order.estimated_price && (
                    <div>
                      <span className="font-medium">Цена:</span>{" "}
                      {formatPrice(order.estimated_price)}
                    </div>
                  )}
                  {order.estimated_delivery && (
                    <div>
                      <span className="font-medium">Доставка:</span>{" "}
                      {order.estimated_delivery}
                    </div>
                  )}
                </div>

                <div>
                  {order.found_product_url && (
                    <div className="mb-3">
                      <span className="font-medium">Найденный товар:</span>
                      <a
                        href={order.found_product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <span>Открыть</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {order.admin_notes && (
                    <div>
                      <span className="font-medium">Заметки админа:</span>
                      <p className="text-gray-700 bg-yellow-50 p-2 rounded mt-1 text-sm">
                        {order.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Действия</h3>
              <div className="flex flex-wrap gap-2">
                <select
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  value={order.status}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">Новый</option>
                  <option value="in_progress">В обработке</option>
                  <option value="quoted">Оценен</option>
                  <option value="confirmed">Подтвержден</option>
                  <option value="found">Найден</option>
                  <option value="ordered">Заказан</option>
                  <option value="delivered">Доставлен</option>
                  <option value="completed">Завершен</option>
                  <option value="cancelled">Отменен</option>
                </select>

                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Управление спецзаказами
        </h2>
        <div className="text-sm text-gray-600">
          Всего заказов: {orders.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск заказов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="new">Новые</option>
            <option value="in_progress">В обработке</option>
            <option value="quoted">Оценены</option>
            <option value="found">Найдены</option>
            <option value="completed">Завершены</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все приоритеты</option>
            <option value="normal">Обычная</option>
            <option value="urgent">Срочная</option>
            <option value="emergency">Экстренная</option>
          </select>

          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Обновить
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Загрузка заказов...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Спецзаказы не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Клиент
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Товар
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Срочность
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Статус
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Создан
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6 text-sm font-mono">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.brand} {order.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.size && `Размер: ${order.size}`}
                          {order.color && ` • Цвет: ${order.color}`}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getUrgencyBadge(order.urgency)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-gray-600 hover:text-red-500 rounded-lg hover:bg-red-50"
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
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <OrderDetailModal order={selectedOrder} />
      )}
    </div>
  );
};

export default SpecialOrdersManagement;
