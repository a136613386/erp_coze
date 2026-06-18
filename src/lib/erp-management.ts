import 'server-only';

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';

import { queryRows, withTransaction } from '@/lib/mysql';

export const orderStatusOptions = ['待付款', '已付款', '已发货', '已完成', '已取消'] as const;
export const financeTypeOptions = ['收款', '付款'] as const;
export const financeStatusOptions = ['已确认', '待确认'] as const;
export const paymentMethodOptions = ['银行转账', '微信'] as const;
export const stockMovementTypeOptions = ['入库', '出库'] as const;
export const inventoryStatusOptions = ['正常', '库存不足'] as const;

export type DashboardData = {
  customerCount: number;
  orderCount: number;
  productCount: number;
  cumulativeSales: number;
  pendingPaymentCount: number;
  lowStockCount: number;
  recentOrders: OrderListItem[];
  lowStockProducts: InventoryListItem[];
};

export type OrderListItem = {
  id: number;
  orderNo: string;
  customerId: number | null;
  customerName: string;
  amount: number;
  status: (typeof orderStatusOptions)[number];
  dealDate: string;
  itemCount: number;
  items: OrderItemListItem[];
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
  type: (typeof financeTypeOptions)[number];
  counterparty: string;
  customerId: number | null;
  customerName: string | null;
  orderId: number | null;
  orderNo: string | null;
  amount: number;
  paymentMethod: (typeof paymentMethodOptions)[number];
  status: (typeof financeStatusOptions)[number];
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

export const createOrderSchema = z.object({
  customerId: z.coerce.number().int().positive('请选择客户'),
  dealDate: z.string().min(1, '请选择成交日期'),
  status: z.enum(orderStatusOptions).default('待付款'),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive('请选择商品'),
        quantity: z.coerce.number().int().positive('数量必须大于 0'),
      })
    )
    .min(1, '至少添加 1 个商品'),
});

export const createStockMovementSchema = z.object({
  productId: z.coerce.number().int().positive('请选择商品'),
  type: z.enum(stockMovementTypeOptions),
  status: z.enum(inventoryStatusOptions),
  quantity: z.coerce.number().int().positive('数量必须大于 0'),
  operatorName: z.string().trim().min(1, '请输入操作人'),
  remark: z.string().trim().max(255, '备注不能超过 255 字').optional().default(''),
});

export const createFinanceRecordSchema = z
  .object({
    type: z.enum(financeTypeOptions),
    financeDate: z.string().min(1, '请选择日期'),
    amount: z.coerce.number().positive('金额必须大于 0'),
    paymentMethod: z.enum(paymentMethodOptions),
    status: z.enum(financeStatusOptions).default('已确认'),
    customerId: z.coerce.number().int().positive().optional(),
    orderId: z.coerce.number().int().positive().optional(),
    counterparty: z.string().trim().max(200, '对方名称不能超过 200 字').optional().default(''),
    remark: z.string().trim().max(255, '备注不能超过 255 字').optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.type === '收款' && !value.customerId && !value.orderId && !value.counterparty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '收款至少需要选择客户、订单或填写对方名称',
        path: ['customerId'],
      });
    }

    if (value.type === '付款' && !value.counterparty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '付款请输入对方名称',
        path: ['counterparty'],
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type CreateFinanceRecordInput = z.infer<typeof createFinanceRecordSchema>;

type DashboardStatsRow = RowDataPacket & {
  customerCount: number | string;
  orderCount: number | string;
  productCount: number | string;
  cumulativeSales: number | string;
  pendingPaymentCount: number | string;
  lowStockCount: number | string;
};

type OrderRow = RowDataPacket & {
  id: number;
  order_no: string;
  customer_id: number | null;
  customer_name: string | null;
  amount: number | string;
  status: OrderListItem['status'];
  deal_date: Date | string;
  item_count: number | string;
};

type OrderItemRow = RowDataPacket & {
  id: number;
  order_id: number;
  product_id: number;
  product_code: string;
  product_name: string;
  quantity: number | string;
  unit_price: number | string;
  subtotal: number | string;
};

type InventoryRow = RowDataPacket & {
  id: number;
  product_code: string;
  product_name: string;
  category: string | null;
  unit: string | null;
  current_stock: number | string;
  safe_stock: number | string;
  unit_price: number | string;
  cost: number | string | null;
  status: '正常' | '库存不足';
};

type FinanceRow = RowDataPacket & {
  id: number;
  finance_date: Date | string;
  type: FinanceListItem['type'];
  counterparty: string;
  customer_id: number | null;
  customer_name: string | null;
  order_id: number | null;
  order_no: string | null;
  amount: number | string;
  payment_method: FinanceListItem['paymentMethod'];
  status: FinanceListItem['status'];
  remark: string | null;
};

type ProductLookupRow = RowDataPacket & {
  id: number;
  product_name: string;
  product_code: string;
  current_stock: number | string;
  safe_stock: number | string;
  unit_price: number | string;
  unit: string | null;
};

type CustomerLookupRow = RowDataPacket & {
  id: number;
  customer_name: string;
};

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateString(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

function mapInventoryStatus(status: InventoryRow['status']) {
  return status === '库存不足' ? 'low' : 'normal';
}

function mapInventoryRow(row: InventoryRow): InventoryListItem {
  return {
    id: row.id,
    code: row.product_code,
    name: row.product_name,
    category: row.category ?? '-',
    unit: row.unit ?? '件',
    stock: toNumber(row.current_stock),
    safeStock: toNumber(row.safe_stock),
    price: toNumber(row.unit_price),
    cost: toNumber(row.cost),
    status: mapInventoryStatus(row.status),
  };
}

function mapOrderItemRow(row: OrderItemRow): OrderItemListItem {
  return {
    id: row.id,
    productId: row.product_id,
    productCode: row.product_code,
    productName: row.product_name,
    quantity: toNumber(row.quantity),
    unitPrice: toNumber(row.unit_price),
    subtotal: toNumber(row.subtotal),
  };
}

function makeOrderNo() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const timePart = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  return `ORD${datePart}${timePart}${String(now.getMilliseconds()).padStart(3, '0')}`;
}

async function getOrderItemsMap(orderIds: number[]) {
  if (orderIds.length === 0) {
    return new Map<number, OrderItemListItem[]>();
  }

  const placeholders = orderIds.map(() => '?').join(', ');
  const rows = await queryRows<OrderItemRow>(
    `
      SELECT
        oi.id,
        oi.order_id,
        oi.product_id,
        i.product_code,
        i.product_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal
      FROM order_item_t oi
      INNER JOIN inventory_t i ON i.id = oi.product_id
      WHERE oi.order_id IN (${placeholders})
      ORDER BY oi.id ASC
    `,
    orderIds
  );

  const map = new Map<number, OrderItemListItem[]>();
  for (const row of rows) {
    const current = map.get(row.order_id) ?? [];
    current.push(mapOrderItemRow(row));
    map.set(row.order_id, current);
  }
  return map;
}

export async function getDashboardData(): Promise<DashboardData> {
  const statsRows = await queryRows<DashboardStatsRow>(`
    SELECT
      (SELECT COUNT(*) FROM customer_t) AS customerCount,
      (SELECT COUNT(*) FROM order_t) AS orderCount,
      (SELECT COUNT(*) FROM inventory_t) AS productCount,
      (SELECT COALESCE(SUM(amount), 0) FROM order_t) AS cumulativeSales,
      (SELECT COUNT(*) FROM order_t WHERE status = '待付款') AS pendingPaymentCount,
      (SELECT COUNT(*) FROM inventory_t WHERE status = '库存不足') AS lowStockCount
  `);

  const recentOrders = await getOrders({ limit: 5 });
  const lowStockProducts = await getInventory({ onlyLowStock: true, limit: 5 });
  const stats = statsRows[0];

  return {
    customerCount: toNumber(stats?.customerCount),
    orderCount: toNumber(stats?.orderCount),
    productCount: toNumber(stats?.productCount),
    cumulativeSales: toNumber(stats?.cumulativeSales),
    pendingPaymentCount: toNumber(stats?.pendingPaymentCount),
    lowStockCount: toNumber(stats?.lowStockCount),
    recentOrders,
    lowStockProducts,
  };
}

export async function getOrders(options?: { limit?: number }) {
  const limitSql = options?.limit ? 'LIMIT ?' : '';
  const params = options?.limit ? [options.limit] : [];
  const rows = await queryRows<OrderRow>(
    `
      SELECT
        o.id,
        o.order_no,
        o.customer_id,
        c.customer_name,
        o.amount,
        o.status,
        o.deal_date,
        COUNT(oi.id) AS item_count
      FROM order_t o
      LEFT JOIN customer_t c ON c.id = o.customer_id
      LEFT JOIN order_item_t oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.deal_date DESC, o.id DESC
      ${limitSql}
    `,
    params
  );

  const itemsMap = await getOrderItemsMap(rows.map((row) => row.id));

  return rows.map((row) => ({
    id: row.id,
    orderNo: row.order_no,
    customerId: row.customer_id,
    customerName: row.customer_name ?? '未关联客户',
    amount: toNumber(row.amount),
    status: row.status,
    dealDate: toDateString(row.deal_date),
    itemCount: toNumber(row.item_count),
    items: itemsMap.get(row.id) ?? [],
  }));
}

export async function getInventory(options?: { onlyLowStock?: boolean; limit?: number }) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options?.onlyLowStock) {
    conditions.push("status = '库存不足'");
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitSql = options?.limit ? 'LIMIT ?' : '';
  if (options?.limit) {
    params.push(options.limit);
  }

  const rows = await queryRows<InventoryRow>(
    `
      SELECT
        id,
        product_code,
        product_name,
        category,
        unit,
        current_stock,
        safe_stock,
        unit_price,
        cost,
        status
      FROM inventory_t
      ${whereSql}
      ORDER BY (status = '库存不足') DESC, id DESC
      ${limitSql}
    `,
    params
  );

  return rows.map(mapInventoryRow);
}

export async function getFinanceRecords() {
  const rows = await queryRows<FinanceRow>(`
    SELECT
      f.id,
      f.finance_date,
      f.type,
      f.counterparty,
      f.customer_id,
      c.customer_name,
      f.order_id,
      o.order_no,
      f.amount,
      f.payment_method,
      f.status,
      f.remark
    FROM finance_t f
    LEFT JOIN customer_t c ON c.id = f.customer_id
    LEFT JOIN order_t o ON o.id = f.order_id
    ORDER BY f.finance_date DESC, f.id DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    financeDate: toDateString(row.finance_date),
    type: row.type,
    counterparty: row.counterparty,
    customerId: row.customer_id,
    customerName: row.customer_name,
    orderId: row.order_id,
    orderNo: row.order_no,
    amount: toNumber(row.amount),
    paymentMethod: row.payment_method,
    status: row.status,
    remark: row.remark ?? '',
  }));
}

export async function getCustomerOptions(): Promise<CustomerOption[]> {
  const rows = await queryRows<CustomerLookupRow>(
    'SELECT id, customer_name FROM customer_t ORDER BY customer_name ASC'
  );
  return rows.map((row) => ({ id: row.id, label: row.customer_name }));
}

export async function getInventoryOptions(): Promise<InventoryOption[]> {
  const rows = await queryRows<ProductLookupRow>(`
    SELECT id, product_name, product_code, current_stock, safe_stock, unit_price, unit
    FROM inventory_t
    ORDER BY product_name ASC
  `);
  return rows.map((row) => ({
    id: row.id,
    label: `${row.product_name} (${row.product_code})`,
    unit: row.unit ?? '件',
    price: toNumber(row.unit_price),
    stock: toNumber(row.current_stock),
  }));
}

export async function getOrderOptions(): Promise<OrderOption[]> {
  const rows = await queryRows<OrderRow>(`
    SELECT
      o.id,
      o.order_no,
      o.customer_id,
      c.customer_name,
      o.amount,
      o.status,
      o.deal_date,
      0 AS item_count
    FROM order_t o
    LEFT JOIN customer_t c ON c.id = o.customer_id
    ORDER BY o.deal_date DESC, o.id DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    label: row.order_no,
    customerId: row.customer_id,
    customerName: row.customer_name ?? '未关联客户',
    amount: toNumber(row.amount),
  }));
}

export async function createOrder(input: CreateOrderInput) {
  const payload = createOrderSchema.parse(input);

  const aggregatedItems = new Map<number, number>();
  for (const item of payload.items) {
    aggregatedItems.set(item.productId, (aggregatedItems.get(item.productId) ?? 0) + item.quantity);
  }

  const orderId = await withTransaction(async (connection) => {
    const customerRows = await connection.execute<CustomerLookupRow[]>(
      'SELECT id, customer_name FROM customer_t WHERE id = ? LIMIT 1',
      [payload.customerId]
    );
    const customer = customerRows[0][0];
    if (!customer) {
      throw new Error('客户不存在');
    }

    const productIds = [...aggregatedItems.keys()];
    const placeholders = productIds.map(() => '?').join(', ');
    const [productRows] = await connection.execute<ProductLookupRow[]>(
      `
        SELECT id, product_name, product_code, current_stock, safe_stock, unit_price, unit
        FROM inventory_t
        WHERE id IN (${placeholders})
      `,
      productIds
    );

    const productMap = new Map(productRows.map((row) => [row.id, row]));
    let totalAmount = 0;

    for (const [productId, quantity] of aggregatedItems.entries()) {
      const product = productMap.get(productId);
      if (!product) {
        throw new Error('存在无效商品，请重新选择');
      }

      const currentStock = toNumber(product.current_stock);
      if (currentStock < quantity) {
        throw new Error(`${product.product_name} 库存不足，当前仅剩 ${currentStock}${product.unit ?? '件'}`);
      }

      totalAmount += toNumber(product.unit_price) * quantity;
    }

    const [orderResult] = await connection.execute<ResultSetHeader>(
      `
        INSERT INTO order_t (customer_id, order_no, deal_date, amount, status)
        VALUES (?, ?, ?, ?, ?)
      `,
      [payload.customerId, makeOrderNo(), payload.dealDate, totalAmount, payload.status]
    );

    const nextOrderId = orderResult.insertId;

    for (const item of payload.items) {
      const product = productMap.get(item.productId)!;
      const unitPrice = toNumber(product.unit_price);
      const subtotal = unitPrice * item.quantity;

      await connection.execute(
        `
          INSERT INTO order_item_t (order_id, product_id, quantity, unit_price, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `,
        [nextOrderId, item.productId, item.quantity, unitPrice, subtotal]
      );

      await connection.execute(
        `
          UPDATE inventory_t
          SET current_stock = current_stock - ?
          WHERE id = ?
        `,
        [item.quantity, item.productId]
      );

      await connection.execute(
        `
          INSERT INTO stock_record_t (product_id, order_id, type, quantity, operator_name, remark)
          VALUES (?, ?, '出库', ?, '系统', ?)
        `,
        [item.productId, nextOrderId, item.quantity, `订单 ${nextOrderId} 自动出库`]
      );
    }
    return nextOrderId;
  });

  const orders = await getOrders();
  return orders.find((order) => order.id === orderId)!;
}

export async function createStockMovement(input: CreateStockMovementInput) {
  const payload = createStockMovementSchema.parse(input);

  const productId = await withTransaction(async (connection) => {
    const [rows] = await connection.execute<ProductLookupRow[]>(
      `
        SELECT id, product_name, product_code, current_stock, safe_stock, unit_price, unit
        FROM inventory_t
        WHERE id = ?
        LIMIT 1
      `,
      [payload.productId]
    );

    const product = rows[0];
    if (!product) {
      throw new Error('商品不存在');
    }

    const currentStock = toNumber(product.current_stock);
    if (payload.type === '出库' && currentStock < payload.quantity) {
      throw new Error(`${product.product_name} 库存不足，当前仅剩 ${currentStock}${product.unit ?? '件'}`);
    }

    const delta = payload.type === '入库' ? payload.quantity : -payload.quantity;
    await connection.execute(
      `
        UPDATE inventory_t
        SET current_stock = current_stock + ?, status = ?
        WHERE id = ?
      `,
      [delta, payload.status, payload.productId]
    );

    await connection.execute(
      `
        INSERT INTO stock_record_t (product_id, order_id, type, quantity, operator_name, remark)
        VALUES (?, NULL, ?, ?, ?, ?)
      `,
      [payload.productId, payload.type, payload.quantity, payload.operatorName, payload.remark || null]
    );
    return payload.productId;
  });

  const inventory = await getInventory();
  return inventory.find((item) => item.id === productId)!;
}

export async function createFinanceRecord(input: CreateFinanceRecordInput) {
  const payload = createFinanceRecordSchema.parse(input);

  const recordId = await withTransaction(async (connection) => {
    let customerName = '';
    let counterparty = payload.counterparty;

    if (payload.customerId) {
      const [customerRows] = await connection.execute<CustomerLookupRow[]>(
        'SELECT id, customer_name FROM customer_t WHERE id = ? LIMIT 1',
        [payload.customerId]
      );
      const customer = customerRows[0];
      if (!customer) {
        throw new Error('客户不存在');
      }
      customerName = customer.customer_name;
    }

    if (payload.orderId) {
      const [orderRows] = await connection.execute<OrderRow[]>(
        `
          SELECT
            o.id,
            o.order_no,
            o.customer_id,
            c.customer_name,
            o.amount,
            o.status,
            o.deal_date,
            0 AS item_count
          FROM order_t o
          LEFT JOIN customer_t c ON c.id = o.customer_id
          WHERE o.id = ?
          LIMIT 1
        `,
        [payload.orderId]
      );
      const order = orderRows[0];
      if (!order) {
        throw new Error('订单不存在');
      }

      if (!payload.customerId && order.customer_id) {
        payload.customerId = order.customer_id;
        customerName = order.customer_name ?? '';
      }
    }

    if (!counterparty) {
      counterparty = customerName || '未命名往来方';
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `
        INSERT INTO finance_t (
          customer_id,
          order_id,
          finance_date,
          type,
          counterparty,
          amount,
          payment_method,
          status,
          remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.customerId ?? null,
        payload.orderId ?? null,
        payload.financeDate,
        payload.type,
        counterparty,
        payload.amount,
        payload.paymentMethod,
        payload.status,
        payload.remark || null,
      ]
    );
    return result.insertId;
  });

  const records = await getFinanceRecords();
  return records.find((record) => record.id === recordId)!;
}
