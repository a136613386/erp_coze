export type OrderStatus = '已完成' | '已发货' | '待付款' | '已付款' | '已取消';

export interface OrderRow {
  id: string;
  customerId: string;
  orderNo: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  date: string;
  items: number;
  shippingAddress?: string;
  productName?: string;
}

export interface OrderDetailItem {
  productId: string;
  productName: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDetailLog {
  time: string;
  title: string;
  description: string;
}

export interface OrderDetailRecord extends OrderRow {
  contactName: string;
  company: string;
  phone: string;
  address: string;
  salesperson: string;
  paymentMethod: string;
  invoiceTitle: string;
  shippingCompany: string;
  trackingNo: string;
  remark: string;
  detailItems: OrderDetailItem[];
  logs: OrderDetailLog[];
}

export interface OrderOverride {
  status?: OrderStatus;
  shippingAddress?: string;
}

const STORAGE_KEY = 'erp-order-overrides';

export const orderStatusOptions: OrderStatus[] = ['已完成', '已发货', '待付款', '已付款', '已取消'];

export const statusColors: Record<string, string> = {
  VIP: 'bg-purple-100 text-purple-700',
  普通: 'bg-blue-100 text-blue-700',
  新客户: 'bg-green-100 text-green-700',
  已完成: 'bg-green-100 text-green-700',
  已发货: 'bg-blue-100 text-blue-700',
  待付款: 'bg-yellow-100 text-yellow-700',
  已付款: 'bg-emerald-100 text-emerald-700',
  已取消: 'bg-gray-100 text-gray-700',
  已确认: 'bg-green-100 text-green-700',
  low: 'bg-red-100 text-red-700',
  normal: 'bg-green-100 text-green-700',
};

export function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString()}`;
}

export function normalizeOrderStatus(status: string): OrderStatus {
  return orderStatusOptions.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : '待付款';
}

export function readOrderOverrides(): Record<string, OrderOverride> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, OrderOverride>) : {};
  } catch {
    return {};
  }
}

export function writeOrderOverrides(overrides: Record<string, OrderOverride>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function writeOrderOverride(orderId: string, override: OrderOverride) {
  if (typeof window === 'undefined') return;

  const current = readOrderOverrides();
  current[orderId] = {
    ...current[orderId],
    ...override,
  };
  writeOrderOverrides(current);
}

export function mergeOrderRow(order: OrderRow, override?: OrderOverride): OrderRow {
  if (!override) return order;

  return {
    ...order,
    status: override.status ?? order.status,
    shippingAddress: override.shippingAddress ?? order.shippingAddress,
  };
}

export function mergeOrderDetail(order: OrderDetailRecord, override?: OrderOverride): OrderDetailRecord {
  if (!override) return order;

  return {
    ...order,
    status: override.status ?? order.status,
    shippingAddress: override.shippingAddress ?? order.shippingAddress,
    address: override.shippingAddress ?? order.address,
  };
}
