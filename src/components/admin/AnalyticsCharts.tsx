import type React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, DollarSign } from 'lucide-react';

interface ChartData {
  month: string;
  revenue: number;
  orders: number;
  products: number;
}

interface BrandData {
  brand: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface AnalyticsChartsProps {
  monthlyData: ChartData[];
  brandData: BrandData[];
  totalRevenue: number;
  totalOrders: number;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  monthlyData,
  brandData,
  totalRevenue,
  totalOrders
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  // Calculate growth
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const revenueGrowth = previousMonth
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : 0;
  const ordersGrowth = previousMonth
    ? ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) * 100
    : 0;

  const colors = [
    '#0957c3', '#4a90e2', '#7b68ee', '#9370db',
    '#ba55d3', '#da70d6', '#ff69b4', '#ff1493'
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-gray-600 text-sm">Доход этого месяца</p>
              <p className="text-2xl font-bold text-neutral-black">
                {formatPrice(currentMonth.revenue)}
              </p>
              <div className={`flex items-center mt-2 text-xs ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% к прошлому месяцу
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-gray-600 text-sm">Заказы этого месяца</p>
              <p className="text-2xl font-bold text-neutral-black">{currentMonth.orders}</p>
              <div className={`flex items-center mt-2 text-xs ${ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ordersGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth.toFixed(1)}% к прошлому месяцу
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-gray-600 text-sm">Средний чек</p>
              <p className="text-2xl font-bold text-neutral-black">
                {formatPrice(currentMonth.revenue / currentMonth.orders)}
              </p>
              <div className="text-xs text-neutral-gray-500 mt-2">
                За {currentMonth.month}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-gray-600 text-sm">Общий доход</p>
              <p className="text-2xl font-bold text-neutral-black">
                {formatPrice(totalRevenue)}
              </p>
              <div className="text-xs text-neutral-gray-500 mt-2">
                За все время
              </div>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-neutral-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-neutral-black mb-6">Доходы по месяцам</h3>
        <div className="relative">
          <div className="flex items-end justify-between h-64 bg-neutral-gray-50 rounded-lg p-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center space-y-2 flex-1">
                <div className="relative w-full max-w-12 mx-auto">
                  <div
                    className="bg-brand-primary rounded-t-lg transition-all duration-1000 hover:bg-brand-dark"
                    style={{
                      height: `${(data.revenue / maxRevenue) * 200}px`,
                      minHeight: '8px'
                    }}
                  />
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity bg-neutral-black text-neutral-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {formatPrice(data.revenue)}
                  </div>
                </div>
                <div className="text-sm font-medium text-neutral-gray-600">{data.month}</div>
              </div>
            ))}
          </div>

          {/* Chart Legend */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-4 text-sm text-neutral-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-brand-primary rounded"></div>
                <span>Доход</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Distribution */}
      <div className="bg-neutral-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-neutral-black mb-6">Распределение по брендам</h3>

        {/* Pie Chart Simulation */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="relative">
            <div className="w-64 h-64 mx-auto relative">
              {/* Simple pie chart visualization */}
              <div className="w-full h-full rounded-full bg-gradient-conic from-brand-primary via-blue-500 to-purple-500 relative">
                <div className="absolute inset-8 bg-neutral-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-black">{brandData.length}</div>
                    <div className="text-sm text-neutral-gray-600">брендов</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {brandData.slice(0, 6).map((brand, index) => (
              <div key={brand.brand} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="font-medium text-neutral-black">{brand.brand}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-black">
                    {formatPrice(brand.revenue)}
                  </div>
                  <div className="text-sm text-neutral-gray-500">
                    {brand.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders vs Revenue Comparison */}
      <div className="bg-neutral-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-neutral-black mb-6">Заказы vs Доходы</h3>

        <div className="relative">
          <div className="flex justify-between h-64 bg-neutral-gray-50 rounded-lg p-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex flex-col justify-end items-center space-y-2 flex-1">
                <div className="flex items-end space-x-1 h-48">
                  {/* Revenue bar */}
                  <div className="relative">
                    <div
                      className="bg-brand-primary rounded-t-lg w-6"
                      style={{
                        height: `${(data.revenue / maxRevenue) * 180}px`,
                        minHeight: '4px'
                      }}
                    />
                  </div>

                  {/* Orders bar */}
                  <div className="relative">
                    <div
                      className="bg-green-500 rounded-t-lg w-6"
                      style={{
                        height: `${(data.orders / Math.max(...monthlyData.map(d => d.orders))) * 180}px`,
                        minHeight: '4px'
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs font-medium text-neutral-gray-600">{data.month}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-6 text-sm text-neutral-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-brand-primary rounded"></div>
                <span>Доход</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Заказы</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
