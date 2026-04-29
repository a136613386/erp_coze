export type DashboardOverviewStats = {
  customerCount: number;
  orderCount: number;
  productCount: number;
  cumulativeSales: number;
  pendingPaymentCount: number;
  lowStockCount: number;
  recentOrders: OrderListItem[];
  lowStockProducts: InventoryListItem[];
};

export type OrderItemListItem = {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type OrderListItem = {
  id: number;
  orderNo: string;
  customerId: number | null;
  customerName: string;
  amount: number;
  status: '待付款' | '已付款' | '已发货' | '已完成' | '已取消';
  dealDate: string;
  itemCount: number;
  items: OrderItemListItem[];
};

export type InventoryListItem = {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  safeStock: number;
  price: number;
  cost: number;
  status: 'normal' | 'low';
};

export type FinanceListItem = {
  id: number;
  financeDate: string;
  type: '收款' | '付款';
  counterparty: string;
  customerId: number | null;
  customerName: string | null;
  orderId: number | null;
  orderNo: string | null;
  amount: number;
  paymentMethod: '银行转账' | '微信';
  status: '已确认' | '待确认';
  remark: string;
};

export type CustomerOption = {
  id: number;
  label: string;
};

export type InventoryOption = {
  id: number;
  label: string;
  unit: string;
  price: number;
  stock: number;
};

export type OrderOption = {
  id: number;
  label: string;
  customerId: number | null;
  customerName: string;
  amount: number;
};

export const orderStatusOptions = ['待付款', '已付款', '已发货', '已完成', '已取消'] as const;
export const financeTypeOptions = ['收款', '付款'] as const;
export const financeStatusOptions = ['已确认', '待确认'] as const;
export const paymentMethodOptions = ['银行转账', '微信'] as const;
export const inventoryStatusOptions = ['正常', '库存不足'] as const;
