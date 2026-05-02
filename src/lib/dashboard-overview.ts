export interface DashboardOverviewMetrics {
  customerTotal: number;
  orderTotal: number;
  productTotal: number;
  monthlySales: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNo: string;
  customer: string;
  amount: number;
  status: '已完成' | '已发货' | '待付款' | '已付款' | '已取消';
  date: string;
}

export interface DashboardLowStockItem {
  id: string;
  name: string;
  stock: number;
  safeStock: number;
  unit: string;
  status: '正常' | '库存不足';
}

export interface DashboardOverviewPayload {
  metrics: DashboardOverviewMetrics;
  pendingPaymentCount: number;
  lowStockCount: number;
  recentOrders: DashboardRecentOrder[];
  lowStockItems: DashboardLowStockItem[];
}

export type DashboardOverviewCardKey =
  | 'customerTotal'
  | 'orderTotal'
  | 'productTotal'
  | 'monthlySales';

export interface DashboardOverviewCard {
  key: DashboardOverviewCardKey;
  label: string;
  value: string;
  icon: DashboardOverviewCardKey;
  iconClassName: string;
  iconWrapperClassName: string;
}

export function createDashboardOverviewMetrics(metrics: DashboardOverviewMetrics): DashboardOverviewMetrics {
  return metrics;
}

export function formatOverviewAmount(amount: number): string {
  if (amount >= 10000) {
    const value = Math.round(amount / 1000) / 10;
    return `${value}万`;
  }

  return amount.toLocaleString();
}

export function createDashboardOverviewCards(metrics: DashboardOverviewMetrics): DashboardOverviewCard[] {
  return [
    {
      key: 'customerTotal',
      label: '客户总数',
      value: String(metrics.customerTotal),
      icon: 'customerTotal',
      iconClassName: 'text-blue-600',
      iconWrapperClassName: 'bg-blue-100',
    },
    {
      key: 'orderTotal',
      label: '订单总数',
      value: String(metrics.orderTotal),
      icon: 'orderTotal',
      iconClassName: 'text-green-600',
      iconWrapperClassName: 'bg-green-100',
    },
    {
      key: 'productTotal',
      label: '产品种类',
      value: String(metrics.productTotal),
      icon: 'productTotal',
      iconClassName: 'text-purple-600',
      iconWrapperClassName: 'bg-purple-100',
    },
    {
      key: 'monthlySales',
      label: '本月销售额',
      value: formatOverviewAmount(metrics.monthlySales),
      icon: 'monthlySales',
      iconClassName: 'text-orange-600',
      iconWrapperClassName: 'bg-orange-100',
    },
  ];
}
