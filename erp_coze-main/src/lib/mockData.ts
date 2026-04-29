import { Customer, Order, Product, FinanceRecord, Supplier, StockRecord } from './types';

// 模拟客户数据
export const mockCustomers: Customer[] = [
  {
    id: 'C001',
    name: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    company: '北京科技有限公司',
    address: '北京市朝阳区建国路88号',
    level: 'VIP',
    followRecords: [
      { date: '2024-01-15', content: '电话沟通，确认需求', type: '电话' },
      { date: '2024-01-20', content: '上门拜访，演示产品', type: '拜访' },
    ],
    createdAt: '2024-01-10',
  },
  {
    id: 'C002',
    name: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    company: '上海贸易集团',
    address: '上海市浦东新区世纪大道100号',
    level: '普通',
    followRecords: [
      { date: '2024-02-01', content: '邮件发送产品资料', type: '邮件' },
    ],
    createdAt: '2024-01-25',
  },
  {
    id: 'C003',
    name: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    company: '广州制造业公司',
    address: '广州市天河区珠江新城',
    level: '新客户',
    followRecords: [
      { date: '2024-02-10', content: '展会初次接触', type: '其他' },
    ],
    createdAt: '2024-02-05',
  },
  {
    id: 'C004',
    name: '赵六',
    phone: '13800138004',
    email: 'zhaoliu@example.com',
    company: '深圳电子科技',
    address: '深圳市南山区科技园',
    level: 'VIP',
    followRecords: [
      { date: '2024-01-05', content: '产品培训会议', type: '拜访' },
      { date: '2024-01-12', content: '电话回访', type: '电话' },
    ],
    createdAt: '2023-12-20',
  },
  {
    id: 'C005',
    name: '孙七',
    phone: '13800138005',
    email: 'sunqi@example.com',
    company: '成都软件园',
    address: '成都市高新区天府大道',
    level: '普通',
    followRecords: [],
    createdAt: '2024-02-15',
  },
];

// 模拟订单数据
export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    orderNo: 'ORD20240115001',
    customerId: 'C001',
    customerName: '张三',
    items: [
      { productId: 'P001', productName: '笔记本电脑', quantity: 10, price: 5000, subtotal: 50000 },
      { productId: 'P002', productName: '无线鼠标', quantity: 20, price: 150, subtotal: 3000 },
    ],
    totalAmount: 53000,
    status: '已完成',
    createTime: '2024-01-15 09:30:00',
    deliveryTime: '2024-01-18 14:00:00',
    shippingAddress: '北京市朝阳区建国路88号',
  },
  {
    id: 'ORD002',
    orderNo: 'ORD20240120002',
    customerId: 'C002',
    customerName: '李四',
    items: [
      { productId: 'P003', productName: '激光打印机', quantity: 5, price: 2800, subtotal: 14000 },
    ],
    totalAmount: 14000,
    status: '已发货',
    createTime: '2024-01-20 10:15:00',
    deliveryTime: '2024-01-22 09:00:00',
    shippingAddress: '上海市浦东新区世纪大道100号',
  },
  {
    id: 'ORD003',
    orderNo: 'ORD20240201003',
    customerId: 'C001',
    customerName: '张三',
    items: [
      { productId: 'P004', productName: '显示器', quantity: 15, price: 1800, subtotal: 27000 },
      { productId: 'P005', productName: '键盘', quantity: 15, price: 200, subtotal: 3000 },
    ],
    totalAmount: 30000,
    status: '待付款',
    createTime: '2024-02-01 14:20:00',
    shippingAddress: '北京市朝阳区建国路88号',
  },
  {
    id: 'ORD004',
    orderNo: 'ORD20240205004',
    customerId: 'C003',
    customerName: '王五',
    items: [
      { productId: 'P001', productName: '笔记本电脑', quantity: 8, price: 5000, subtotal: 40000 },
    ],
    totalAmount: 40000,
    status: '已付款',
    createTime: '2024-02-05 11:00:00',
    shippingAddress: '广州市天河区珠江新城',
  },
  {
    id: 'ORD005',
    orderNo: 'ORD20240210005',
    customerId: 'C004',
    customerName: '赵六',
    items: [
      { productId: 'P006', productName: '服务器', quantity: 2, price: 25000, subtotal: 50000 },
      { productId: 'P007', productName: '网络交换机', quantity: 5, price: 3000, subtotal: 15000 },
    ],
    totalAmount: 65000,
    status: '待付款',
    createTime: '2024-02-10 16:30:00',
    shippingAddress: '深圳市南山区科技园',
  },
  {
    id: 'ORD006',
    orderNo: 'ORD20240212006',
    customerId: 'C002',
    customerName: '李四',
    items: [
      { productId: 'P002', productName: '无线鼠标', quantity: 50, price: 150, subtotal: 7500 },
    ],
    totalAmount: 7500,
    status: '已取消',
    createTime: '2024-02-12 09:15:00',
    shippingAddress: '上海市浦东新区世纪大道100号',
  },
];

// 模拟产品库存数据
export const mockProducts: Product[] = [
  { id: 'P001', code: 'IT001', name: '笔记本电脑', category: '电脑设备', unit: '台', stock: 25, safeStock: 10, price: 5000, cost: 4200 },
  { id: 'P002', code: 'IT002', name: '无线鼠标', category: '电脑配件', unit: '个', stock: 80, safeStock: 30, price: 150, cost: 80 },
  { id: 'P003', code: 'IT003', name: '激光打印机', category: '办公设备', unit: '台', stock: 12, safeStock: 5, price: 2800, cost: 2200 },
  { id: 'P004', code: 'IT004', name: '显示器', category: '电脑设备', unit: '台', stock: 8, safeStock: 10, price: 1800, cost: 1400 },
  { id: 'P005', code: 'IT005', name: '键盘', category: '电脑配件', unit: '个', stock: 45, safeStock: 20, price: 200, cost: 100 },
  { id: 'P006', code: 'IT006', name: '服务器', category: '网络设备', unit: '台', stock: 5, safeStock: 2, price: 25000, cost: 20000 },
  { id: 'P007', code: 'IT007', name: '网络交换机', category: '网络设备', unit: '台', stock: 15, safeStock: 5, price: 3000, cost: 2200 },
  { id: 'P008', code: 'IT008', name: '固态硬盘', category: '电脑配件', unit: '个', stock: 3, safeStock: 15, price: 800, cost: 550 },
  { id: 'P009', code: 'IT009', name: '投影仪', category: '办公设备', unit: '台', stock: 6, safeStock: 3, price: 4500, cost: 3500 },
  { id: 'P010', code: 'IT010', name: ' UPS电源', category: '电源设备', unit: '台', stock: 10, safeStock: 4, price: 2200, cost: 1600 },
];

// 模拟库存记录
export const mockStockRecords: StockRecord[] = [
  { id: 'SR001', productId: 'P001', productName: '笔记本电脑', type: '入库', quantity: 30, operator: '管理员', time: '2024-01-05 10:00:00', remark: '采购入库' },
  { id: 'SR002', productId: 'P001', productName: '笔记本电脑', type: '出库', quantity: 5, operator: '管理员', time: '2024-01-10 14:30:00', remark: '订单出库' },
  { id: 'SR003', productId: 'P008', productName: '固态硬盘', type: '入库', quantity: 20, operator: '管理员', time: '2024-01-08 09:15:00', remark: '采购入库' },
  { id: 'SR004', productId: 'P008', productName: '固态硬盘', type: '出库', quantity: 2, operator: '管理员', time: '2024-01-12 11:20:00', remark: '订单出库' },
];

// 模拟供应商数据
export const mockSuppliers: Supplier[] = [
  { id: 'S001', name: '联想科技', phone: '400-800-0001', contact: '张经理', address: '北京市海淀区' },
  { id: 'S002', name: '戴尔中国', phone: '400-800-0002', contact: '李经理', address: '上海市浦东新区' },
  { id: 'S003', name: '惠普中国', phone: '400-800-0003', contact: '王经理', address: '广州市天河区' },
];

// 模拟财务记录
export const mockFinanceRecords: FinanceRecord[] = [
  { id: 'F001', type: '收款', amount: 53000, customerId: 'C001', customerName: '张三', orderId: 'ORD001', orderNo: 'ORD20240115001', paymentMethod: '银行转账', status: '已确认', time: '2024-01-17 16:30:00', remark: '订单收款' },
  { id: 'F002', type: '收款', amount: 40000, customerId: 'C003', customerName: '王五', orderId: 'ORD004', orderNo: 'ORD20240205004', paymentMethod: '银行转账', status: '已确认', time: '2024-02-06 10:00:00', remark: '订单收款' },
  { id: 'F003', type: '付款', amount: 126000, supplierId: 'S001', supplierName: '联想科技', paymentMethod: '银行转账', status: '已确认', time: '2024-01-05 15:00:00', remark: '采购付款' },
  { id: 'F004', type: '付款', amount: 11000, supplierId: 'S002', supplierName: '戴尔中国', paymentMethod: '银行转账', status: '已确认', time: '2024-01-08 11:00:00', remark: '采购付款' },
  { id: 'F005', type: '收款', amount: 14000, customerId: 'C002', customerName: '李四', orderId: 'ORD002', orderNo: 'ORD20240120002', paymentMethod: '微信', status: '已确认', time: '2024-01-21 09:30:00', remark: '订单收款' },
];

// 获取所有客户
export function getAllCustomers(): Customer[] {
  return mockCustomers;
}

// 根据ID获取客户
export function getCustomerById(id: string): Customer | undefined {
  return mockCustomers.find(c => c.id === id);
}

// 根据名称搜索客户
export function searchCustomers(name: string): Customer[] {
  return mockCustomers.filter(c => 
    c.name.includes(name) || c.company.includes(name) || c.phone.includes(name)
  );
}

// 获取所有订单
export function getAllOrders(): Order[] {
  return mockOrders;
}

// 根据客户ID获取订单
export function getOrdersByCustomerId(customerId: string): Order[] {
  return mockOrders.filter(o => o.customerId === customerId);
}

// 根据订单号搜索订单
export function searchOrders(orderNo: string): Order[] {
  return mockOrders.filter(o => 
    o.orderNo.includes(orderNo) || o.customerName.includes(orderNo)
  );
}

// 获取所有产品
export function getAllProducts(): Product[] {
  return mockProducts;
}

// 获取库存不足的产品
export function getLowStockProducts(): Product[] {
  return mockProducts.filter(p => p.stock < p.safeStock);
}

// 根据产品名称搜索产品
export function searchProducts(name: string): Product[] {
  return mockProducts.filter(p => 
    p.name.includes(name) || p.code.includes(name) || p.category.includes(name)
  );
}

// 获取所有财务记录
export function getAllFinanceRecords(): FinanceRecord[] {
  return mockFinanceRecords;
}

// 获取指定时间范围的财务记录
export function getFinanceRecordsByDateRange(startDate: string, endDate: string): FinanceRecord[] {
  return mockFinanceRecords.filter(f => f.time >= startDate && f.time <= endDate);
}

// 获取本月销售额
export function getMonthlySales(): number {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return mockFinanceRecords
    .filter(f => f.type === '收款' && f.time.startsWith(currentMonth))
    .reduce((sum, f) => sum + f.amount, 0);
}

// 获取本月收款总额
export function getMonthlyReceived(): number {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return mockFinanceRecords
    .filter(f => f.type === '收款' && f.status === '已确认' && f.time.startsWith(currentMonth))
    .reduce((sum, f) => sum + f.amount, 0);
}

// 获取本月付款总额
export function getMonthlyPaid(): number {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return mockFinanceRecords
    .filter(f => f.type === '付款' && f.status === '已确认' && f.time.startsWith(currentMonth))
    .reduce((sum, f) => sum + f.amount, 0);
}

// 获取销售额最高的客户
export function getTopCustomerBySales(): { name: string; amount: number } | null {
  const customerSales = new Map<string, number>();
  
  mockFinanceRecords
    .filter(f => f.type === '收款' && f.customerId)
    .forEach(f => {
      const current = customerSales.get(f.customerId!) || 0;
      customerSales.set(f.customerId!, current + f.amount);
    });

  if (customerSales.size === 0) return null;

  let topCustomerId = '';
  let maxAmount = 0;
  customerSales.forEach((amount, customerId) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCustomerId = customerId;
    }
  });

  const customer = getCustomerById(topCustomerId);
  return customer ? { name: customer.name, amount: maxAmount } : null;
}

// 获取待付款订单
export function getPendingPaymentOrders(): Order[] {
  return mockOrders.filter(o => o.status === '待付款');
}

// 获取所有供应商
export function getAllSuppliers(): Supplier[] {
  return mockSuppliers;
}

// 获取库存记录
export function getStockRecords(): StockRecord[] {
  return mockStockRecords;
}
