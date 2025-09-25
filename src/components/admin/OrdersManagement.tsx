import type React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Package,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import apiService from "../../utils/api";
import { showToast } from "../ToastContainer";

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  size: number;
  image: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  notes: string;
  created_at: string;
  updated_at: string;
}

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchQuery]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        sort_by: "created_at",
        sort_order: "desc",
      };

      const data = await apiService.getOrders(filters);
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      showToast({
        type: "error",
        title: "Ошибка загрузки",
        message: "Не удалось загрузить заказы",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: string,
    notes = ""
  ) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus, notes);
      await loadOrders(); // Reload data
      showToast({
        type: "success",
        title: "Статус обновлен",
        message: "Статус заказа успешно изменен",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      showToast({
        type: "error",
        title: "Ошибка",
        message: "Не удалось обновить статус заказа",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот заказ?")) {
      try {
        await apiService.deleteOrder(orderId);
        await loadOrders(); // Reload data
        showToast({
          type: "success",
          title: "Заказ удален",
          message: "Заказ успешно удален из системы",
        });
      } catch (error) {
        console.error("Error deleting order:", error);
        showToast({
          type: "error",
          title: "Ошибка",
          message: "Не удалось удалить заказ",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Ожидает",
        icon: Clock,
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800",
        label: "Подтвержден",
        icon: CheckCircle,
      },
      processing: {
        color: "bg-purple-100 text-purple-800",
        label: "Обрабатывается",
        icon: Package,
      },
      shipped: {
        color: "bg-orange-100 text-orange-800",
        label: "Отправлен",
        icon: Package,
      },
      delivered: {
        color: "bg-green-100 text-green-800",
        label: "Доставлен",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        label: "Отменен",
        icon: XCircle,
      },
      refunded: {
        color: "bg-gray-100 text-gray-800",
        label: "Возврат",
        icon: XCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
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

  const OrderDetailModal: React.FC<{ order: Order }> = ({ order }) => (
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
                Заказ #{order.order_number}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(order.status)}
                <span className="text-sm text-gray-500">
                  от {formatDate(order.created_at)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
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
                    <span>{order.customer_name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.customer_phone}
                    </a>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <span className="text-sm">{order.shipping_address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Детали заказа
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Способ оплаты:</span>{" "}
                    {order.payment_method === "cash"
                      ? "Наличными"
                      : order.payment_method === "card"
                        ? "Картой"
                        : "Онлайн-оплата"}
                  </div>
                  <div>
                    <span className="font-medium">Сумма товаров:</span>{" "}
                    {formatPrice(order.subtotal)}
                  </div>
                  <div>
                    <span className="font-medium">Доставка:</span>{" "}
                    {formatPrice(order.shipping_cost)}
                  </div>
                  <div className="text-lg font-semibold">
                    <span>Итого:</span> {formatPrice(order.total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Товары в заказе
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Товар
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Размер
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Количество
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Цена
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Сумма
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image || "/api/placeholder/50/50"}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.brand}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{item.size}</td>
                        <td className="py-3 px-4 text-sm">{item.quantity}</td>
                        <td className="py-3 px-4 text-sm">
                          {formatPrice(item.price)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Комментарии
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {order.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Действия</h3>
              <div className="flex flex-wrap gap-2">
                <select
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  value={order.status}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Ожидает</option>
                  <option value="confirmed">Подтвержден</option>
                  <option value="processing">Обрабатывается</option>
                  <option value="shipped">Отправлен</option>
                  <option value="delivered">Доставлен</option>
                  <option value="cancelled">Отменен</option>
                  <option value="refunded">Возврат</option>
                </select>

                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Удалить заказ
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
          Управление заказами
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
            <option value="pending">Ожидает</option>
            <option value="confirmed">Подтвержден</option>
            <option value="processing">Обрабатывается</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменен</option>
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
          <div className="p-8 text-center text-gray-500">Заказы не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    № Заказа
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Клиент
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Товары
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Сумма
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Статус
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Дата
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
                      #{order.order_number}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {order.items.length} товар(ов)
                    </td>
                    <td className="py-4 px-6 text-sm font-medium">
                      {formatPrice(order.total)}
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

export default OrdersManagement;
