import {
  getAllCustomers,
  getAllFinanceRecords,
  getAllOrders,
  getAllProducts,
  getLowStockProducts,
  getMonthlyPaid,
  getMonthlyReceived,
  getMonthlySales,
  getOrdersByCustomerId,
  getPendingPaymentOrders,
  getTopCustomerBySales,
  searchCustomers,
  searchOrders,
  searchProducts
} from './mockData';
import { BusinessIntent, Order, Product } from './types';

// 业务查询服务
export class BusinessQueryService {
  
  // 解析用户意图并执行查询
  async executeQuery(intent: BusinessIntent, params: {
    name?: string;
    orderNo?: string;
    productName?: string;
    timeRange?: { start: string; end: string };
    customParams?: Record<string, string>;
  }): Promise<string> {
    switch (intent) {
      case 'query_customer':
        return this.queryCustomer(params.name);
      case 'query_order':
        return this.queryOrder(params.name, params.orderNo);
      case 'query_inventory':
        return this.queryInventory(params.productName);
      case 'query_finance':
        return this.queryFinance();
      case 'generate_report':
        return this.generateReport();
      case 'anomaly_alert':
        return this.checkAnomalies();
      default:
        return '';
    }
  }

  // 查询客户
  private queryCustomer(name?: string): string {
    let customers;
    if (name) {
      customers = searchCustomers(name);
    } else {
      customers = getAllCustomers();
    }

    if (customers.length === 0) {
      return name ? `没有找到名称包含"${name}"的客户` : '当前没有客户数据';
    }

    if (customers.length === 1) {
      const c = customers[0];
      return `客户信息：
- 客户名称：${c.name}
- 公司：${c.company}
- 电话：${c.phone}
- 邮箱：${c.email}
- 地址：${c.address}
- 客户等级：${c.level}
- 跟进记录：${c.followRecords.length > 0 ? c.followRecords.map(r => `【${r.date}】${r.type}：${r.content}`).join('\n  ') : '暂无跟进记录'}
- 创建时间：${c.createdAt}`;
    }

    return `客户列表（共${customers.length}个）：
${customers.map(c => `- ${c.name}（${c.company}）- ${c.level} - 电话：${c.phone}`).join('\n')}`;
  }

  // 查询订单
  private queryOrder(customerName?: string, orderNo?: string): string {
    let orders: Order[];
    if (orderNo) {
      orders = searchOrders(orderNo);
    } else if (customerName) {
      const customers = searchCustomers(customerName);
      if (customers.length === 1) {
        orders = getOrdersByCustomerId(customers[0].id);
      } else if (customers.length > 1) {
        // 多个客户匹配，返回所有相关订单
        orders = customers.flatMap(c => getOrdersByCustomerId(c.id));
      } else {
        orders = [];
      }
    } else {
      orders = getAllOrders();
    }

    if (orders.length === 0) {
      return orderNo 
        ? `没有找到订单号为"${orderNo}"的订单`
        : customerName 
          ? `没有找到客户"${customerName}"的订单`
          : '当前没有订单数据';
    }

    if (orders.length === 1) {
      const o = orders[0];
      return `订单信息：
- 订单号：${o.orderNo}
- 客户名称：${o.customerName}
- 订单金额：${o.totalAmount.toLocaleString()}元
- 订单状态：${o.status}
- 创建时间：${o.createTime}
- 收货地址：${o.shippingAddress}
- 订单明细：
${o.items.map((item: { productName: string; quantity: number; price: number; subtotal: number }) => `  - ${item.productName} x ${item.quantity}，单价${item.price}元，小计${item.subtotal.toLocaleString()}元`).join('\n')}
${o.deliveryTime ? `- 发货时间：${o.deliveryTime}` : ''}`;
    }

    return `订单列表（共${orders.length}个）：
${orders.map((o: Order) => `- ${o.orderNo} | ${o.customerName} | ${o.totalAmount.toLocaleString()}元 | ${o.status} | ${o.createTime.slice(0, 10)}`).join('\n')}`;
  }

  // 查询库存
  private queryInventory(productName?: string): string {
    let products: Product[];
    if (productName) {
      products = searchProducts(productName);
    } else {
      products = getAllProducts();
    }

    if (products.length === 0) {
      return productName ? `没有找到名称包含"${productName}"的产品` : '当前没有产品数据';
    }

    // 检查是否有库存不足的产品
    const lowStock = products.filter(p => p.stock < p.safeStock);
    let result = '';

    if (lowStock.length > 0 && !productName) {
      result += `【库存预警】以下${lowStock.length}种产品库存不足：
${lowStock.map(p => `  - ${p.name}：当前库存${p.stock}${p.unit}，安全库存${p.safeStock}${p.unit}`).join('\n')}\n\n`;
    }

    if (products.length === 1) {
      const p = products[0];
      const status = p.stock < p.safeStock ? '⚠️ 库存不足' : '✓ 库存正常';
      return result + `产品信息：
- 产品名称：${p.name}
- 产品编码：${p.code}
- 产品分类：${p.category}
- 单位：${p.unit}
- 当前库存：${p.stock}
- 安全库存：${p.safeStock}
- 销售单价：${p.price}元
- 成本单价：${p.cost}元
- 库存状态：${status}`;
    }

    return result + `产品列表（共${products.length}种）：
${products.map(p => {
  const status = p.stock < p.safeStock ? ' ⚠️不足' : '';
  return `- ${p.name} | 库存：${p.stock}${p.unit}${status} | 单价：${p.price}元`;
}).join('\n')}`;
  }

  // 查询财务
  private queryFinance(): string {
    const records = getAllFinanceRecords();
    const monthlyReceived = getMonthlyReceived();
    const monthlyPaid = getMonthlyPaid();
    const monthlySales = getMonthlySales();
    const topCustomer = getTopCustomerBySales();
    const pendingOrders = getPendingPaymentOrders();

    let result = `本月财务概览：
- 本月销售额：${monthlySales.toLocaleString()}元
- 本月收款：${monthlyReceived.toLocaleString()}元
- 本月付款：${monthlyPaid.toLocaleString()}元
- 本月利润：${(monthlyReceived - monthlyPaid).toLocaleString()}元`;

    if (topCustomer) {
      result += `\n- 累计销售冠军：${topCustomer.name}（${topCustomer.amount.toLocaleString()}元）`;
    }

    if (pendingOrders.length > 0) {
      result += `\n\n【待收款提醒】有${pendingOrders.length}笔订单待收款：
${pendingOrders.map(o => `  - ${o.orderNo} | ${o.customerName} | ${o.totalAmount.toLocaleString()}元`).join('\n')}`;
    }

    result += `\n\n财务记录列表（共${records.length}条）：
${records.slice(0, 5).map(r => {
  const prefix = r.type === '收款' ? '💰' : '💸';
  return `${prefix} ${r.time.slice(0, 10)} | ${r.type} | ${r.amount.toLocaleString()}元 | ${r.customerName || r.supplierName || ''} | ${r.paymentMethod} | ${r.status}`;
}).join('\n')}`;

    return result;
  }

  // 生成报表
  private generateReport(): string {
    const customers = getAllCustomers();
    const orders = getAllOrders();
    const products = getAllProducts();
    const lowStock = getLowStockProducts();
    const pendingPayments = getPendingPaymentOrders();
    const monthlyReceived = getMonthlyReceived();
    const monthlyPaid = getMonthlyPaid();
    const topCustomer = getTopCustomerBySales();

    // 订单状态统计
    const orderStats = {
      '待付款': orders.filter(o => o.status === '待付款').length,
      '已付款': orders.filter(o => o.status === '已付款').length,
      '已发货': orders.filter(o => o.status === '已发货').length,
      '已完成': orders.filter(o => o.status === '已完成').length,
      '已取消': orders.filter(o => o.status === '已取消').length,
    };

    // 客户等级统计
    const customerStats = {
      'VIP': customers.filter(c => c.level === 'VIP').length,
      '普通': customers.filter(c => c.level === '普通').length,
      '新客户': customers.filter(c => c.level === '新客户').length,
    };

    return `━━━━━━━━━━━━━━━━━━━━
📊 ERP系统经营报表
━━━━━━━━━━━━━━━━━━━━

【客户统计】
- 客户总数：${customers.length}
  - VIP客户：${customerStats.VIP}
  - 普通客户：${customerStats.普通}
  - 新客户：${customerStats.新客户}

【订单统计】
- 订单总数：${orders.length}
- 待付款：${orderStats['待付款']}
- 已付款：${orderStats['已付款']}
- 已发货：${orderStats['已发货']}
- 已完成：${orderStats['已完成']}
- 已取消：${orderStats['已取消']}

【库存统计】
- 产品种类：${products.length}
- 库存不足产品：${lowStock.length}
${lowStock.length > 0 ? lowStock.slice(0, 3).map(p => `  - ${p.name}（${p.stock}/${p.safeStock}）`).join('\n') : ''}

【本月财务】
- 收款总额：${monthlyReceived.toLocaleString()}元
- 付款总额：${monthlyPaid.toLocaleString()}元
- 净利润：${(monthlyReceived - monthlyPaid).toLocaleString()}元

【销售冠军】
${topCustomer ? `🏆 ${topCustomer.name} - ${topCustomer.amount.toLocaleString()}元` : '暂无数据'}

【待处理事项】
${pendingPayments.length > 0 ? `• ${pendingPayments.length}笔订单待收款` : '• 暂无待处理事项'}
${lowStock.length > 0 ? `• ${lowStock.length}种产品库存不足` : ''}

━━━━━━━━━━━━━━━━━━━━`;
  }

  // 检查异常
  private checkAnomalies(): string {
    const anomalies: string[] = [];
    
    // 库存不足
    const lowStock = getLowStockProducts();
    if (lowStock.length > 0) {
      anomalies.push(`⚠️ 【库存不足】${lowStock.length}种产品库存低于安全线：
${lowStock.map(p => `  - ${p.name}：${p.stock}${p.unit}（安全库存：${p.safeStock}${p.unit}）`).join('\n')}`);
    }

    // 待付款订单
    const pendingPayments = getPendingPaymentOrders();
    if (pendingPayments.length > 0) {
      anomalies.push(`💵 【待收款提醒】${pendingPayments.length}笔订单待收款：
${pendingPayments.map(o => `  - ${o.orderNo} | ${o.customerName} | ${o.totalAmount.toLocaleString()}元`).join('\n')}`);
    }

    // 销售异常
    const monthlySales = getMonthlySales();
    if (monthlySales === 0) {
      anomalies.push('📉 【销售预警】本月暂无销售额');
    }

    if (anomalies.length === 0) {
      return '✅ 系统运行正常，暂无异常情况';
    }

    return '【系统异常提醒】\n\n' + anomalies.join('\n\n');
  }
}

export const queryService = new BusinessQueryService();
