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
    totalOrders: 0,
    totalAmount: 0,
    createdAt: normalizeTime(row.create_time),
    updatedAt: normalizeTime(row.update_time),
  };
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  const db = getDb();
  const [rows] = await db.query<CustomerRow[]>(
    `
      SELECT id, customer_name, company_name, phone, level, create_time, update_time
      FROM customer_t
      ORDER BY create_time DESC, id DESC
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
      SELECT id, customer_name, company_name, phone, level, create_time, update_time
      FROM customer_t
      WHERE id = ?
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
