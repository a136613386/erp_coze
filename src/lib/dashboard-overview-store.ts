import 'server-only';

import type { RowDataPacket } from 'mysql2/promise';

import {
  createDashboardOverviewMetrics,
  type DashboardLowStockItem,
  type DashboardOverviewPayload,
  type DashboardRecentOrder,
} from '@/lib/dashboard-overview';
import { getDb } from '@/lib/db';

interface CountRow extends RowDataPacket {
  total: number;
}

interface AmountRow extends RowDataPacket {
  total: number | null;
}

interface RecentOrderRow extends RowDataPacket {
  id: number;
  order_no: string;
  customer_name: string | null;
  amount: number | string;
  status: DashboardRecentOrder['status'];
  deal_date: Date | string;
}

interface LowStockRow extends RowDataPacket {
  id: number;
  product_name: string;
  current_stock: number;
  safe_stock: number;
  unit: string;
  status: DashboardLowStockItem['status'];
}

export interface DashboardOverviewRepository {
  getOverview(): Promise<DashboardOverviewPayload>;
}

function formatOrderId(id: number) {
  return `ORD${String(id).padStart(3, '0')}`;
}

function formatProductId(id: number) {
  return `P${String(id).padStart(3, '0')}`;
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

export function createDashboardOverviewRepository(): DashboardOverviewRepository {
  return {
    async getOverview() {
      const db = getDb();
      const [
        [customerRows],
        [orderRows],
        [productRows],
        [monthlySalesRows],
        [pendingRows],
        [lowStockCountRows],
        [recentOrderRows],
        [lowStockRows],
      ] = await Promise.all([
        db.query<CountRow[]>('SELECT COUNT(*) AS total FROM customer_t'),
        db.query<CountRow[]>('SELECT COUNT(*) AS total FROM order_t'),
        db.query<CountRow[]>('SELECT COUNT(*) AS total FROM inventory_t'),
        db.query<AmountRow[]>(
          `
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM finance_t
            WHERE type = '收款'
              AND status = '已确认'
              AND DATE_FORMAT(finance_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
          `
        ),
        db.query<CountRow[]>("SELECT COUNT(*) AS total FROM order_t WHERE status = '待付款'"),
        db.query<CountRow[]>(
          `
            SELECT COUNT(*) AS total
            FROM inventory_t
            WHERE status = '库存不足' OR current_stock < safe_stock
          `
        ),
        db.query<RecentOrderRow[]>(
          `
            SELECT
              o.id,
              o.order_no,
              c.customer_name,
              o.amount,
              o.status,
              o.deal_date
            FROM order_t o
            LEFT JOIN customer_t c ON c.id = o.customer_id
            ORDER BY o.deal_date DESC, o.id DESC
            LIMIT 5
          `
        ),
        db.query<LowStockRow[]>(
          `
            SELECT
              id,
              product_name,
              current_stock,
              safe_stock,
              unit,
              status
            FROM inventory_t
            WHERE status = '库存不足' OR current_stock < safe_stock
            ORDER BY current_stock ASC, id ASC
            LIMIT 5
          `
        ),
      ]);

      const metrics = createDashboardOverviewMetrics({
        customerTotal: Number(customerRows[0]?.total ?? 0),
        orderTotal: Number(orderRows[0]?.total ?? 0),
        productTotal: Number(productRows[0]?.total ?? 0),
        monthlySales: Number(monthlySalesRows[0]?.total ?? 0),
      });

      const recentOrders: DashboardRecentOrder[] = recentOrderRows.map((row) => ({
        id: formatOrderId(row.id),
        orderNo: row.order_no,
        customer: row.customer_name ?? '-',
        amount: Number(row.amount),
        status: row.status,
        date: normalizeDate(row.deal_date),
      }));

      const lowStockItems: DashboardLowStockItem[] = lowStockRows.map((row) => ({
        id: formatProductId(row.id),
        name: row.product_name,
        stock: Number(row.current_stock),
        safeStock: Number(row.safe_stock),
        unit: row.unit,
        status: row.status === '库存不足' || Number(row.current_stock) < Number(row.safe_stock) ? '库存不足' : '正常',
      }));

      return {
        metrics,
        pendingPaymentCount: Number(pendingRows[0]?.total ?? 0),
        lowStockCount: Number(lowStockCountRows[0]?.total ?? 0),
        recentOrders,
        lowStockItems,
      };
    },
  };
}
