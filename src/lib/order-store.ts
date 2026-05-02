import 'server-only';

import type { RowDataPacket } from 'mysql2/promise';

import { getDb } from '@/lib/db';

export type OrderStatus = '已完成' | '已发货' | '待付款' | '已付款' | '已取消';

export interface OrderListItem {
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

export interface OrderDetailRecord extends OrderListItem {
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
  logs: Array<{
    time: string;
    title: string;
    description: string;
  }>;
}

type OrderRow = RowDataPacket & {
  id: number;
  customer_id: number | null;
  order_no: string;
  deal_date: Date | string;
  amount: string | number;
  status: OrderStatus;
  customer_name: string | null;
  company_name: string | null;
  phone: string | null;
  item_count: number;
};

type OrderItemRow = RowDataPacket & {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  product_name: string | null;
  product_code: string | null;
};

const baseCustomerProfiles = [
  {
    id: 1,
    customerName: '张三',
    company: '北京科技有限公司',
    phone: '13800138001',
    address: '北京市朝阳区建国路 88 号 A 座 1206 室',
    levelCode: 'C001',
  },
  {
    id: 2,
    customerName: '李四',
    company: '上海贸易集团',
    phone: '13800138002',
    address: '上海市浦东新区世纪大道 100 号 18 楼',
    levelCode: 'C002',
  },
  {
    id: 3,
    customerName: '王五',
    company: '广州制造业公司',
    phone: '13800138003',
    address: '广州市天河区珠江新城 88 号',
    levelCode: 'C003',
  },
  {
    id: 4,
    customerName: '赵六',
    company: '深圳电子科技',
    phone: '13800138004',
    address: '深圳市南山区科技园科苑路 18 号',
    levelCode: 'C004',
  },
  {
    id: 5,
    customerName: '孙七',
    company: '成都软件园',
    phone: '13800138005',
    address: '成都市高新区天府大道中段 66 号',
    levelCode: 'C005',
  },
];

const paymentMethodByStatus: Record<OrderStatus, string> = {
  待付款: '待确认',
  已付款: '银行转账',
  已完成: '银行转账',
  已发货: '微信',
  已取消: '未付款',
};

const shippingCompanyByStatus: Record<OrderStatus, string> = {
  待付款: '待分配',
  已付款: '顺丰速运',
  已完成: '顺丰速运',
  已发货: '京东物流',
  已取消: '未发货',
};

function formatOrderId(id: number) {
  return `ORD${String(id).padStart(3, '0')}`;
}

function formatCustomerId(id: number | null | undefined) {
  return id ? `C${String(id).padStart(3, '0')}` : '-';
}

function normalizeDate(value: Date | string) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

function createLogs(status: OrderStatus, date: string, orderNo: string) {
  const logs = [
    {
      time: `${date} 10:00`,
      title: '订单创建',
      description: `系统已创建订单 ${orderNo} 并进入流转。`,
    },
  ];

  if (status === '已付款' || status === '已发货' || status === '已完成') {
    logs.unshift({
      time: `${date} 14:00`,
      title: '收款确认',
      description: '财务已确认到账，订单进入履约阶段。',
    });
  }

  if (status === '已发货' || status === '已完成') {
    logs.unshift({
      time: `${date} 16:00`,
      title: '订单已发货',
      description: '仓库已完成出库，物流单号已同步。',
    });
  }

  if (status === '已完成') {
    logs.unshift({
      time: `${date} 18:00`,
      title: '订单已完成',
      description: '客户已签收，订单完成归档。',
    });
  }

  if (status === '已取消') {
    logs.unshift({
      time: `${date} 12:00`,
      title: '订单已取消',
      description: '订单已取消，库存已释放。',
    });
  }

  return logs;
}

function mapRowToOrder(row: OrderRow): OrderListItem {
  return {
    id: formatOrderId(row.id),
    customerId: formatCustomerId(row.customer_id),
    orderNo: row.order_no,
    customer: row.customer_name ?? '-',
    amount: Number(row.amount),
    status: row.status,
    date: normalizeDate(row.deal_date),
    items: Number(row.item_count ?? 0),
    shippingAddress: row.company_name
      ? `${row.company_name} / ${row.phone ?? '暂无联系方式'}`
      : undefined,
  };
}

async function getDatabaseOrders(): Promise<OrderDetailRecord[]> {
  const db = getDb();
  const [orderRows] = await db.query<OrderRow[]>(
    `
      SELECT
        o.id,
        o.customer_id,
        o.order_no,
        o.deal_date,
        o.amount,
        o.status,
        c.customer_name,
        c.company_name,
        c.phone,
        COUNT(oi.id) AS item_count
      FROM order_t o
      LEFT JOIN customer_t c ON c.id = o.customer_id
      LEFT JOIN order_item_t oi ON oi.order_id = o.id
      GROUP BY o.id, o.customer_id, o.order_no, o.deal_date, o.amount, o.status, c.customer_name, c.company_name, c.phone
      ORDER BY o.deal_date DESC, o.id DESC
    `
  );

  const [itemRows] = await db.query<OrderItemRow[]>(
    `
      SELECT
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        i.product_name,
        i.product_code
      FROM order_item_t oi
      LEFT JOIN inventory_t i ON i.id = oi.product_id
      ORDER BY oi.order_id ASC, oi.id ASC
    `
  );

  const itemsByOrderId = new Map<number, OrderDetailItem[]>();
  itemRows.forEach((row) => {
    const nextItem: OrderDetailItem = {
      productId: row.product_code ?? `P${String(row.product_id).padStart(3, '0')}`,
      productName: row.product_name ?? `商品 ${row.product_id}`,
      spec: row.product_name ? '标准规格' : '规格待补充',
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      subtotal: Number(row.subtotal),
    };
    const current = itemsByOrderId.get(row.order_id) ?? [];
    current.push(nextItem);
    itemsByOrderId.set(row.order_id, current);
  });

  return orderRows.map((row) => {
    const listItem = mapRowToOrder(row);
    const detailItems = itemsByOrderId.get(row.id) ?? [];
    const customerProfile = baseCustomerProfiles.find(
      (item) => item.levelCode === listItem.customerId
    );

    return {
      ...listItem,
      productName: detailItems[0]?.productName,
      contactName: listItem.customer,
      company: row.company_name ?? customerProfile?.company ?? `${listItem.customer}企业`,
      phone: row.phone ?? customerProfile?.phone ?? '暂无',
      address: customerProfile?.address ?? '地址信息待补充',
      salesperson: '系统创建',
      paymentMethod: paymentMethodByStatus[listItem.status],
      invoiceTitle: '电子普通发票',
      shippingCompany: shippingCompanyByStatus[listItem.status],
      trackingNo:
        listItem.status === '待付款' || listItem.status === '已取消'
          ? '待生成'
          : `AUTO-${listItem.orderNo.slice(-8)}`,
      remark: '数据库订单，支持在详情页查看商品明细。',
      detailItems,
      logs: createLogs(listItem.status, listItem.date, listItem.orderNo),
    };
  });
}

export async function getOrderRecords(): Promise<OrderDetailRecord[]> {
  const databaseOrders = await getDatabaseOrders();

  return databaseOrders.sort((a, b) => {
    if (a.date === b.date) {
      return b.orderNo.localeCompare(a.orderNo);
    }

    return b.date.localeCompare(a.date);
  });
}

export async function getOrders(): Promise<OrderListItem[]> {
  const records = await getOrderRecords();
  return records.map(
    ({
      detailItems,
      logs,
      contactName,
      company,
      phone,
      address,
      salesperson,
      paymentMethod,
      invoiceTitle,
      shippingCompany,
      trackingNo,
      remark,
      ...listItem
    }) => listItem
  );
}

export async function getOrderById(orderId: string): Promise<OrderDetailRecord | null> {
  const records = await getOrderRecords();
  return records.find((record) => record.id === orderId) ?? null;
}
