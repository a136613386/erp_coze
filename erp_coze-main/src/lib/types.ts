// 客户数据类型
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  level: 'VIP' | '普通' | '新客户';
  followRecords: FollowRecord[];
  createdAt: string;
}

export interface FollowRecord {
  date: string;
  content: string;
  type: '电话' | '拜访' | '邮件' | '其他';
}

// 订单数据类型
export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: '待付款' | '已付款' | '已发货' | '已完成' | '已取消';
  createTime: string;
  deliveryTime?: string;
  shippingAddress: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// 库存数据类型
export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  safeStock: number;
  price: number;
  cost: number;
}

export interface StockRecord {
  id: string;
  productId: string;
  productName: string;
  type: '入库' | '出库';
  quantity: number;
  operator: string;
  time: string;
  remark?: string;
}

// 财务数据类型
export interface FinanceRecord {
  id: string;
  type: '收款' | '付款';
  amount: number;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  orderId?: string;
  orderNo?: string;
  paymentMethod: '银行转账' | '现金' | '微信' | '支付宝';
  status: '已确认' | '待确认' | '已取消';
  time: string;
  remark?: string;
}

// 供应商数据类型
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  contact: string;
  address: string;
}

// AI对话消息类型
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// 业务意图类型
export type BusinessIntent =
  | 'query_customer'      // 查询客户
  | 'query_order'         // 查询订单
  | 'query_inventory'     // 查询库存
  | 'query_finance'       // 查询财务
  | 'create_order'        // 创建订单
  | 'add_customer'        // 添加客户
  | 'stock_in'            // 入库
  | 'stock_out'           // 出库
  | 'payment_received'    // 收款
  | 'payment_paid'        // 付款
  | 'generate_report'     // 生成报表
  | 'anomaly_alert'       // 异常提醒
  | 'general_chat'        // 闲聊
  | 'unknown';            // 未知意图
