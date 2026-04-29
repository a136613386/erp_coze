export interface OrderRow {
  id: string;
  orderNo: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  items: number;
  shippingAddress?: string;
  productName?: string;
}

export interface OrderDetailItem {
  name: string;
  spec: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDetailLog {
  time: string;
  title: string;
  description: string;
}

export interface OrderDetailProfile {
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
  items: OrderDetailItem[];
  logs: OrderDetailLog[];
}

export interface OrderOverride {
  status?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  shippingCompany?: string;
  trackingNo?: string;
  remark?: string;
  salesperson?: string;
  logs?: OrderDetailLog[];
}

export interface ResolvedOrderDetail extends OrderDetailProfile {
  status: string;
}

const STORAGE_KEY = 'erp-order-overrides';

export const statusColors: Record<string, string> = {
  VIP: 'bg-purple-100 text-purple-700',
  普通: 'bg-blue-100 text-blue-700',
  新客户: 'bg-green-100 text-green-700',
  已完成: 'bg-green-100 text-green-700',
  已发货: 'bg-blue-100 text-blue-700',
  待付款: 'bg-yellow-100 text-yellow-700',
  已付款: 'bg-green-100 text-green-700',
  已取消: 'bg-gray-100 text-gray-700',
  已确认: 'bg-green-100 text-green-700',
  low: 'bg-red-100 text-red-700',
  normal: 'bg-green-100 text-green-700',
};

export const mockOrders: OrderRow[] = [
  { id: 'ORD001', orderNo: 'ORD20240115001', customer: '张三', amount: 53000, status: '已完成', date: '2024-01-15', items: 2 },
  { id: 'ORD002', orderNo: 'ORD20240120002', customer: '李四', amount: 14000, status: '已发货', date: '2024-01-20', items: 1 },
  { id: 'ORD003', orderNo: 'ORD20240201003', customer: '张三', amount: 30000, status: '待付款', date: '2024-02-01', items: 2 },
  { id: 'ORD004', orderNo: 'ORD20240205004', customer: '王五', amount: 40000, status: '已付款', date: '2024-02-05', items: 1 },
  { id: 'ORD005', orderNo: 'ORD20240210005', customer: '赵六', amount: 65000, status: '待付款', date: '2024-02-10', items: 2 },
  { id: 'ORD006', orderNo: 'ORD20240212006', customer: '李四', amount: 7500, status: '已取消', date: '2024-02-12', items: 1 },
];

export const orderDetailProfiles: Record<string, OrderDetailProfile> = {
  ORD001: {
    contactName: '张三',
    company: '北京科技有限公司',
    phone: '13800138001',
    address: '北京市朝阳区建国路 88 号 A 座 1206 室',
    salesperson: '王敏',
    paymentMethod: '银行转账',
    invoiceTitle: '增值税专用发票',
    shippingCompany: '顺丰速运',
    trackingNo: 'SF1039485930241',
    remark: '客户要求随货附带质检报告，送货前提前 30 分钟电话联系仓库。',
    items: [
      { name: '工业控制器 A1', spec: '标准版 / 黑色', quantity: 10, price: 2800, subtotal: 28000 },
      { name: '传感器模块 S8', spec: '高灵敏度', quantity: 25, price: 720, subtotal: 18000 },
      { name: '安装辅材包', spec: '套装', quantity: 5, price: 1400, subtotal: 7000 },
    ],
    logs: [
      { time: '2024-01-18 16:20', title: '订单已完成', description: '客户已签收完成，系统自动归档为已完成订单。' },
      { time: '2024-01-17 09:35', title: '订单已发货', description: '仓库完成出库，顺丰运单已同步到系统。' },
      { time: '2024-01-16 15:42', title: '财务收款确认', description: '财务确认客户付款到账，订单状态更新为已付款。' },
      { time: '2024-01-15 10:26', title: '订单创建', description: '销售王敏创建订单并提交审批。' },
    ],
  },
  ORD002: {
    contactName: '李四',
    company: '上海贸易集团',
    phone: '13800138002',
    address: '上海市浦东新区世纪大道 100 号 18 楼',
    salesperson: '陈琳',
    paymentMethod: '微信',
    invoiceTitle: '电子普票',
    shippingCompany: '京东物流',
    trackingNo: 'JDVA882301923',
    remark: '客户要求工作日送货，收货窗口为 9:00 - 18:00。',
    items: [
      { name: '激光打印机', spec: '办公型 / 双面打印', quantity: 5, price: 2800, subtotal: 14000 },
    ],
    logs: [
      { time: '2024-01-22 09:00', title: '订单已发货', description: '货物已从上海仓发出，正在运输途中。' },
      { time: '2024-01-21 13:12', title: '客户已付款', description: '微信收款成功，财务已对账。' },
      { time: '2024-01-20 10:15', title: '订单创建', description: '客户采购办公设备，已生成销售订单。' },
    ],
  },
  ORD003: {
    contactName: '张三',
    company: '北京科技有限公司',
    phone: '13800138001',
    address: '北京市朝阳区建国路 88 号 A 座 1206 室',
    salesperson: '王敏',
    paymentMethod: '对公转账',
    invoiceTitle: '增值税专用发票',
    shippingCompany: '待分配',
    trackingNo: '待生成',
    remark: '待客户支付尾款后安排发货，目前库存已预留。',
    items: [
      { name: '显示器', spec: '27 英寸 / 2K', quantity: 15, price: 1800, subtotal: 27000 },
      { name: '键盘', spec: '静音款', quantity: 15, price: 200, subtotal: 3000 },
    ],
    logs: [
      { time: '2024-02-01 15:00', title: '等待付款', description: '客户尚未完成付款，订单处于待付款状态。' },
      { time: '2024-02-01 14:20', title: '订单创建', description: '系统已生成订单并锁定库存。' },
    ],
  },
};

export function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString()}`;
}

export function getPaymentStatus(status: string) {
  if (status === '待付款') return '待付款';
  if (status === '已取消') return '未付款';
  return '已付款';
}

export function getDeliveryStatus(status: string) {
  if (status === '已完成' || status === '已发货') return '已发货';
  if (status === '已取消') return '未发货';
  return '备货中';
}

export function getDetailBadgeClass(status: string) {
  if (status === '待付款') return 'bg-amber-100 text-amber-700';
  if (status === '备货中') return 'bg-slate-100 text-slate-700';
  if (status === '未付款' || status === '未发货') return 'bg-slate-100 text-slate-700';
  return 'bg-emerald-100 text-emerald-700';
}

export function getOrderById(orderId: string) {
  return mockOrders.find(order => order.id === orderId) || null;
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

export function writeOrderOverride(orderId: string, override: OrderOverride) {
  if (typeof window === 'undefined') return;

  const current = readOrderOverrides();
  current[orderId] = {
    ...current[orderId],
    ...override,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function mergeOrderRow(order: OrderRow, override?: OrderOverride): OrderRow {
  if (!override) return order;

  return {
    ...order,
    status: override.status || order.status,
    shippingAddress: override.shippingAddress || order.shippingAddress,
  };
}

export function resolveOrderDetail(order: OrderRow, override?: OrderOverride): ResolvedOrderDetail {
  const profile = orderDetailProfiles[order.id];
  const fallbackQuantity = Math.max(order.items, 1);
  const fallbackPrice = Math.round(order.amount / fallbackQuantity);

  const fallback: OrderDetailProfile = {
    contactName: order.customer,
    company: `${order.customer}企业`,
    phone: '暂无',
    address: order.shippingAddress || '地址信息待补充',
    salesperson: '系统创建',
    paymentMethod: order.status === '待付款' ? '待确认' : '银行转账',
    invoiceTitle: '电子普通发票',
    shippingCompany: order.status === '待付款' ? '待分配' : '顺丰速运',
    trackingNo: order.status === '待付款' ? '待生成' : `AUTO-${order.orderNo.slice(-8)}`,
    remark: '该订单暂无额外备注。',
    items: [
      {
        name: order.productName || '标准设备套装',
        spec: fallbackQuantity > 1 ? '组合配置' : '标准版',
        quantity: fallbackQuantity,
        price: fallbackPrice,
        subtotal: order.amount,
      },
    ],
    logs: [{ time: `${order.date} 10:00`, title: '订单创建', description: '系统已创建订单并进入流转。' }],
  };

  const merged = profile || fallback;

  return {
    ...merged,
    status: override?.status || order.status,
    address: override?.shippingAddress || merged.address,
    paymentMethod: override?.paymentMethod || merged.paymentMethod,
    shippingCompany: override?.shippingCompany || merged.shippingCompany,
    trackingNo: override?.trackingNo || merged.trackingNo,
    remark: override?.remark || merged.remark,
    salesperson: override?.salesperson || merged.salesperson,
    logs: override?.logs || merged.logs,
  };
}
