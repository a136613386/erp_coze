import 'server-only';

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import {
  createCustomerSchema,
  type CreateCustomerInput,
  type CustomerListItem,
} from '@/lib/customer-management';
import { executeStatement, queryRows } from '@/lib/mysql';

type CustomerRow = RowDataPacket & {
  id: number;
  customer_name: string;
  company_name: string;
  phone: string;
  level: 'vip' | '普通' | '新客户';
  total_orders: number | string;
  total_amount: number | string | null;
  create_time: Date | string;
  update_time: Date | string;
};

function mapCustomerLevel(level: CustomerRow['level']): CustomerListItem['level'] {
  return level === 'vip' ? 'VIP' : level;
}

function normalizeCustomerLevel(level: CreateCustomerInput['level']) {
  return level === 'VIP' ? 'vip' : level;
}

function toIso(value: Date | string) {
  return new Date(value).toISOString();
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCustomerRow(row: CustomerRow): CustomerListItem {
  return {
    id: `C${String(row.id).padStart(3, '0')}`,
    name: row.customer_name,
    company: row.company_name,
    phone: row.phone,
    level: mapCustomerLevel(row.level),
    totalOrders: toNumber(row.total_orders),
    totalAmount: toNumber(row.total_amount),
    createdAt: toIso(row.create_time),
    updatedAt: toIso(row.update_time),
  };
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  const rows = await queryRows<CustomerRow>(`
    SELECT
      c.id,
      c.customer_name,
      c.company_name,
      c.phone,
      c.level,
      c.create_time,
      c.update_time,
      COUNT(o.id) AS total_orders,
      COALESCE(SUM(o.amount), 0) AS total_amount
    FROM customer_t c
    LEFT JOIN order_t o ON o.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.create_time DESC, c.id DESC
  `);

  return rows.map(mapCustomerRow);
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerListItem> {
  const payload = createCustomerSchema.parse(input);

  const duplicatedPhone = await queryRows<RowDataPacket>(
    'SELECT id FROM customer_t WHERE phone = ? LIMIT 1',
    [payload.phone]
  );

  if (duplicatedPhone.length > 0) {
    throw new Error('该手机号已存在客户');
  }

  const result = await executeStatement<ResultSetHeader>(
    `
      INSERT INTO customer_t (customer_name, company_name, phone, level)
      VALUES (?, ?, ?, ?)
    `,
    [payload.name, payload.company, payload.phone, normalizeCustomerLevel(payload.level)]
  );

  const rows = await queryRows<CustomerRow>(
    `
      SELECT
        c.id,
        c.customer_name,
        c.company_name,
        c.phone,
        c.level,
        c.create_time,
        c.update_time,
        0 AS total_orders,
        0 AS total_amount
      FROM customer_t c
      WHERE c.id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return mapCustomerRow(rows[0]);
}
