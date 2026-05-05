import mysql, { RowDataPacket } from 'mysql2/promise';

export type CustomerLevel = 'VIP' | '普通' | '新客户';
export type OrderStatus = '已完成' | '已发货' | '待付款' | '已付款' | '已取消';

export interface DbCustomer {
  id: string;
  name: string;
  company: string;
  phone: string;
  level: CustomerLevel;
  totalOrders: number;
  totalAmount: number;
}

export interface DbOrder {
  id: string;
  orderNo: string;
  customerId: string | null;
  customer: string;
  amount: number;
  status: OrderStatus;
  date: string;
  items: number;
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? 'root',
  database: process.env.MYSQL_DATABASE ?? 'erp_db',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  namedPlaceholders: true,
});

const seedCustomers: DbCustomer[] = [
  { id: 'C001', name: '张三', company: '北京科技有限公司', phone: '13800138001', level: 'VIP', totalOrders: 2, totalAmount: 83000 },
  { id: 'C002', name: '李四', company: '上海贸易集团', phone: '13800138002', level: '普通', totalOrders: 2, totalAmount: 21500 },
  { id: 'C003', name: '王五', company: '广州制造业公司', phone: '13800138003', level: '新客户', totalOrders: 1, totalAmount: 40000 },
  { id: 'C004', name: '赵六', company: '深圳电子科技', phone: '13800138004', level: 'VIP', totalOrders: 1, totalAmount: 65000 },
  { id: 'C005', name: '孙七', company: '成都软件园', phone: '13800138005', level: '普通', totalOrders: 0, totalAmount: 0 },
];

const seedOrders: DbOrder[] = [
  { id: 'ORD001', orderNo: 'ORD20240115001', customerId: null, customer: '陈明', amount: 53000, status: '已完成', date: '2024-01-15', items: 2 },
  { id: 'ORD002', orderNo: 'ORD20240120002', customerId: null, customer: '赵敏', amount: 14000, status: '已发货', date: '2024-01-20', items: 1 },
  { id: 'ORD003', orderNo: 'ORD20240201003', customerId: null, customer: '陈明', amount: 30000, status: '待付款', date: '2024-02-01', items: 2 },
  { id: 'ORD004', orderNo: 'ORD20240205004', customerId: 'C003', customer: '王五', amount: 40000, status: '已付款', date: '2024-02-05', items: 1 },
  { id: 'ORD005', orderNo: 'ORD20240210005', customerId: 'C004', customer: '赵六', amount: 65000, status: '待付款', date: '2024-02-10', items: 2 },
  { id: 'ORD006', orderNo: 'ORD20240212006', customerId: null, customer: '赵敏', amount: 7500, status: '已取消', date: '2024-02-12', items: 1 },
];

interface CustomerRow extends RowDataPacket {
  id: string;
  name: string;
  company: string;
  phone: string;
  level: CustomerLevel;
  total_orders: number;
  total_amount: string;
}

interface OrderRow extends RowDataPacket {
  id: string;
  order_no: string;
  customer_id: string | null;
  customer_name: string;
  amount: string;
  status: OrderStatus;
  order_date: Date | string;
  items: number;
}

function mapCustomer(row: CustomerRow): DbCustomer {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    phone: row.phone,
    level: row.level,
    totalOrders: row.total_orders,
    totalAmount: Number(row.total_amount),
  };
}

function mapOrder(row: OrderRow): DbOrder {
  const date = row.order_date instanceof Date
    ? row.order_date.toISOString().slice(0, 10)
    : String(row.order_date).slice(0, 10);

  return {
    id: row.id,
    orderNo: row.order_no,
    customerId: row.customer_id,
    customer: row.customer_name,
    amount: Number(row.amount),
    status: row.status,
    date,
    items: row.items,
  };
}

export async function ensureDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(16) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      company VARCHAR(200) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      level ENUM('VIP', '普通', '新客户') NOT NULL DEFAULT '新客户',
      total_orders INT NOT NULL DEFAULT 0,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(16) PRIMARY KEY,
      order_no VARCHAR(32) NOT NULL UNIQUE,
      customer_id VARCHAR(16) NULL,
      customer_name VARCHAR(100) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      status ENUM('已完成', '已发货', '待付款', '已付款', '已取消') NOT NULL DEFAULT '待付款',
      order_date DATE NOT NULL,
      items INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_orders_customer_id (customer_id),
      CONSTRAINT fk_orders_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  const [[customerCount]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM customers');
  if (Number(customerCount.count) === 0) {
    await pool.query(
      `INSERT INTO customers (id, name, company, phone, level, total_orders, total_amount)
       VALUES ?`,
      [seedCustomers.map(customer => [
        customer.id,
        customer.name,
        customer.company,
        customer.phone,
        customer.level,
        customer.totalOrders,
        customer.totalAmount,
      ])]
    );
  }

  const [[orderCount]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM orders');
  if (Number(orderCount.count) === 0) {
    await pool.query(
      `INSERT INTO orders (id, order_no, customer_id, customer_name, amount, status, order_date, items)
       VALUES ?`,
      [seedOrders.map(order => [
        order.id,
        order.orderNo,
        order.customerId,
        order.customer,
        order.amount,
        order.status,
        order.date,
        order.items,
      ])]
    );
  }
}

export async function getCustomers(): Promise<DbCustomer[]> {
  await ensureDatabase();
  const [rows] = await pool.query<CustomerRow[]>(`
    SELECT id, name, company, phone, level, total_orders, total_amount
    FROM customers
    ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED)
  `);

  return rows.map(mapCustomer);
}

export async function createCustomer(input: {
  name: string;
  company: string;
  phone: string;
  level: CustomerLevel;
}): Promise<DbCustomer> {
  await ensureDatabase();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [[lastCustomer]] = await connection.query<RowDataPacket[]>(`
      SELECT id FROM customers
      ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) DESC
      LIMIT 1
      FOR UPDATE
    `);
    const nextNumber = (lastCustomer ? Number(String(lastCustomer.id).replace('C', '')) : 0) + 1;
    const id = `C${String(nextNumber).padStart(3, '0')}`;

    await connection.query(
      `INSERT INTO customers (id, name, company, phone, level, total_orders, total_amount)
       VALUES (?, ?, ?, ?, ?, 0, 0)`,
      [id, input.name, input.company, input.phone, input.level]
    );
    await connection.commit();

    return {
      id,
      name: input.name,
      company: input.company,
      phone: input.phone,
      level: input.level,
      totalOrders: 0,
      totalAmount: 0,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrders(): Promise<DbOrder[]> {
  await ensureDatabase();
  const [rows] = await pool.query<OrderRow[]>(`
    SELECT id, order_no, customer_id, customer_name, amount, status, order_date, items
    FROM orders
    ORDER BY CAST(SUBSTRING(id, 4) AS UNSIGNED) DESC
  `);

  return rows.map(mapOrder);
}

export async function createOrder(input: {
  customerId: string;
  amount: number;
  status: OrderStatus;
  date: string;
  items: number;
}): Promise<{ order: DbOrder; customer: DbCustomer }> {
  await ensureDatabase();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [[customerRow]] = await connection.query<CustomerRow[]>(
      `SELECT id, name, company, phone, level, total_orders, total_amount
       FROM customers
       WHERE id = ?
       FOR UPDATE`,
      [input.customerId]
    );

    if (!customerRow) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    const [[lastOrder]] = await connection.query<RowDataPacket[]>(`
      SELECT id FROM orders
      ORDER BY CAST(SUBSTRING(id, 4) AS UNSIGNED) DESC
      LIMIT 1
      FOR UPDATE
    `);
    const nextNumber = (lastOrder ? Number(String(lastOrder.id).replace('ORD', '')) : 0) + 1;
    const id = `ORD${String(nextNumber).padStart(3, '0')}`;
    const compactDate = input.date.replaceAll('-', '');
    const orderNo = `ORD${compactDate}${String(nextNumber).padStart(3, '0')}`;

    await connection.query(
      `INSERT INTO orders (id, order_no, customer_id, customer_name, amount, status, order_date, items)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orderNo, customerRow.id, customerRow.name, input.amount, input.status, input.date, input.items]
    );

    await connection.query(
      `UPDATE customers
       SET total_orders = total_orders + 1,
           total_amount = total_amount + ?
       WHERE id = ?`,
      [input.amount, customerRow.id]
    );

    await connection.commit();

    return {
      order: {
        id,
        orderNo,
        customerId: customerRow.id,
        customer: customerRow.name,
        amount: input.amount,
        status: input.status,
        date: input.date,
        items: input.items,
      },
      customer: {
        ...mapCustomer(customerRow),
        totalOrders: customerRow.total_orders + 1,
        totalAmount: Number(customerRow.total_amount) + input.amount,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
