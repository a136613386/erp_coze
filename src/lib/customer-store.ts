import 'server-only';

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import {
  createCustomerSchema,
  type CreateCustomerInput,
  type CustomerLevel,
  type CustomerListItem,
} from '@/lib/customer-management';
import { getDb } from '@/lib/db';

type CustomerRow = RowDataPacket & {
  id: number;
  customer_name: string;
  company_name: string;
  phone: string;
  level: string;
  total_orders: number | null;
  total_amount: number | string | null;
  create_time: Date | string;
  update_time: Date | string;
};

const levelToDbMap: Record<CustomerLevel, string> = {
  VIP: 'vip',
  普通: '普通',
  新客户: '新客户',
};

const levelFromDbMap: Record<string, CustomerLevel> = {
  VIP: 'VIP',
  vip: 'VIP',
  普通: '普通',
  新客户: '新客户',
};

function formatCustomerId(id: number) {
  return `C${String(id).padStart(3, '0')}`;
}

function normalizeTime(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapRowToCustomer(row: CustomerRow): CustomerListItem {
  return {
    id: formatCustomerId(row.id),
    name: row.customer_name,
    company: row.company_name,
    phone: row.phone,
    level: levelFromDbMap[row.level] ?? '新客户',
    totalOrders: Number(row.total_orders ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    createdAt: normalizeTime(row.create_time),
    updatedAt: normalizeTime(row.update_time),
  };
}

const customerSelectSql = `
  SELECT
    c.id,
    c.customer_name,
    c.company_name,
    c.phone,
    c.level,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.amount), 0) AS total_amount,
    c.create_time,
    c.update_time
  FROM customer_t c
  LEFT JOIN order_t o ON o.customer_id = c.id
`;

export async function getCustomers(): Promise<CustomerListItem[]> {
  const db = getDb();
  const [rows] = await db.query<CustomerRow[]>(
    `
      ${customerSelectSql}
      GROUP BY c.id, c.customer_name, c.company_name, c.phone, c.level, c.create_time, c.update_time
      ORDER BY c.create_time DESC, c.id DESC
    `
  );

  return rows.map(mapRowToCustomer);
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerListItem> {
  const payload = createCustomerSchema.parse(input);
  const db = getDb();

  const [duplicatedRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM customer_t WHERE phone = ? LIMIT 1',
    [payload.phone]
  );

  if (duplicatedRows.length > 0) {
    throw new Error('该手机号已存在客户');
  }

  const [result] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO customer_t (customer_name, company_name, phone, level)
      VALUES (?, ?, ?, ?)
    `,
    [payload.name, payload.company, payload.phone, levelToDbMap[payload.level]]
  );

  const [rows] = await db.query<CustomerRow[]>(
    `
      ${customerSelectSql}
      WHERE c.id = ?
      GROUP BY c.id, c.customer_name, c.company_name, c.phone, c.level, c.create_time, c.update_time
      LIMIT 1
    `,
    [result.insertId]
  );

  const inserted = rows[0];
  if (!inserted) {
    throw new Error('新增客户后读取数据失败');
  }

  return mapRowToCustomer(inserted);
}
