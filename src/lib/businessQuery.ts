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
  searchProducts,
} from './mockData';
import { type BusinessIntent, type Order, type Product } from './types';

export class BusinessQueryService {
  async executeQuery(
    intent: BusinessIntent,
    params: {
      name?: string;
      orderNo?: string;
      productName?: string;
      timeRange?: { start: string; end: string };
      customParams?: Record<string, string>;
    }
  ): Promise<string> {
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

  private queryCustomer(name?: string): string {
    const customers = name ? searchCustomers(name) : getAllCustomers();

    if (customers.length === 0) {
      return name ? `没有找到名称包含“${name}”的客户` : '当前没有客户数据';
    }

    if (customers.length === 1) {
      const customer = customers[0];
      const followRecords =
        customer.followRecords.length > 0
          ? customer.followRecords
              .map((record, index) => `${index + 1}. ${record.date}｜${record.type}｜${record.content}`)
              .join('\n')
          : '暂无跟进记录';

      return `查询到客户信息如下：

1. 客户名称：${customer.name}
公司名称：${customer.company}
联系电话：${customer.phone}
邮箱：${customer.email}
地址：${customer.address}
客户等级：${customer.level}
创建时间：${customer.createdAt}
跟进记录：
${followRecords}`;
    }

    return `查询到客户信息如下：

${customers
  .map(
    (customer, index) =>
      `${index + 1}. 客户名称：${customer.name}，公司名称：${customer.company}，联系电话：${customer.phone}，客户等级：${customer.level}`
  )
  .join('\n\n')}`;
  }

  private queryOrder(customerName?: string, orderNo?: string): string {
    let orders: Order[];

    if (orderNo) {
      orders = searchOrders(orderNo);
    } else if (customerName) {
      const customers = searchCustomers(customerName);
      if (customers.length === 1) {
        orders = getOrdersByCustomerId(customers[0].id);
      } else if (customers.length > 1) {
        orders = customers.flatMap((customer) => getOrdersByCustomerId(customer.id));
      } else {
        orders = [];
      }
    } else {
      orders = getAllOrders();
    }

    if (orders.length === 0) {
      return orderNo
        ? `没有找到订单号为“${orderNo}”的订单`
        : customerName
          ? `没有找到客户“${customerName}”的订单`
          : '当前没有订单数据';
    }

    if (orders.length === 1) {
      const order = orders[0];
      const itemLines = order.items
        .map(
          (item, index) =>
            `${index + 1}. 商品：${item.productName}，数量：${item.quantity}，单价：${item.price}，小计：${item.subtotal.toLocaleString()}`
        )
        .join('\n');

      return `查询到订单信息如下：

1. 订单号：${order.orderNo}
交易日期：${order.createTime.slice(0, 10)}
客户名称：${order.customerName}
金额：${order.totalAmount.toLocaleString()}
状态：${order.status}
收货地址：${order.shippingAddress}
订单明细：
${itemLines}${order.deliveryTime ? `\n发货时间：${order.deliveryTime}` : ''}`;
    }

    return `查询到订单信息如下：

${orders
  .map(
    (order, index) =>
      `${index + 1}. 订单号：${order.orderNo}，交易日期：${order.createTime.slice(0, 10)}，金额：${order.totalAmount.toLocaleString()}，状态：${order.status}`
  )
  .join('\n\n')}`;
  }

  private queryInventory(productName?: string): string {
    const products: Product[] = productName ? searchProducts(productName) : getAllProducts();

    if (products.length === 0) {
      return productName ? `没有找到名称包含“${productName}”的商品` : '当前没有商品数据';
    }

    const lowStockProducts = products.filter((product) => product.stock < product.safeStock);

    if (products.length === 1) {
      const product = products[0];
      return `查询到商品信息如下：

1. 商品名称：${product.name}
商品编码：${product.code}
分类：${product.category}
单位：${product.unit}
当前库存：${product.stock}
安全库存：${product.safeStock}
销售单价：${product.price}
成本单价：${product.cost}
库存状态：${product.stock < product.safeStock ? '库存不足' : '库存正常'}`;
    }

    if (lowStockProducts.length > 0 && !productName) {
      return `查询到库存不足的商品如下：

${lowStockProducts
  .map(
    (product, index) =>
      `${index + 1}. 商品名称：${product.name}
商品编码：${product.code}
分类：${product.category}
单位：${product.unit}
当前库存：${product.stock}
安全库存：${product.safeStock}`
  )
  .join('\n\n')}`;
    }

    return `查询到商品信息如下：

${products
  .map(
    (product, index) =>
      `${index + 1}. 商品名称：${product.name}
商品编码：${product.code}
分类：${product.category}
单位：${product.unit}
当前库存：${product.stock}
安全库存：${product.safeStock}`
  )
  .join('\n\n')}`;
  }

  private queryFinance(): string {
    const records = getAllFinanceRecords();
    const monthlyReceived = getMonthlyReceived();
    const monthlyPaid = getMonthlyPaid();
    const monthlySales = getMonthlySales();
    const topCustomer = getTopCustomerBySales();
    const pendingOrders = getPendingPaymentOrders();

    let result = `查询到财务概览如下：

本月销售额：${monthlySales.toLocaleString()}
本月收款：${monthlyReceived.toLocaleString()}
本月付款：${monthlyPaid.toLocaleString()}
本月利润：${(monthlyReceived - monthlyPaid).toLocaleString()}`;

    if (topCustomer) {
      result += `\n销售冠军：${topCustomer.name}，累计金额：${topCustomer.amount.toLocaleString()}`;
    }

    if (pendingOrders.length > 0) {
      result += `\n\n待收款订单：
${pendingOrders
  .map(
    (order, index) =>
      `${index + 1}. 订单号：${order.orderNo}，客户：${order.customerName}，金额：${order.totalAmount.toLocaleString()}`
  )
  .join('\n')}`;
    }

    result += `\n\n最近财务记录：
${records
  .slice(0, 5)
  .map(
    (record, index) =>
      `${index + 1}. 日期：${record.time.slice(0, 10)}，类型：${record.type}，金额：${record.amount.toLocaleString()}，对象：${record.customerName || record.supplierName || ''}，方式：${record.paymentMethod}，状态：${record.status}`
  )
  .join('\n')}`;

    return result;
  }

  private generateReport(): string {
    const customers = getAllCustomers();
    const orders = getAllOrders();
    const products = getAllProducts();
    const lowStock = getLowStockProducts();
    const pendingPayments = getPendingPaymentOrders();
    const monthlyReceived = getMonthlyReceived();
    const monthlyPaid = getMonthlyPaid();
    const topCustomer = getTopCustomerBySales();

    const orderStats = {
      待付款: orders.filter((order) => order.status === '待付款').length,
      已付款: orders.filter((order) => order.status === '已付款').length,
      已发货: orders.filter((order) => order.status === '已发货').length,
      已完成: orders.filter((order) => order.status === '已完成').length,
      已取消: orders.filter((order) => order.status === '已取消').length,
    };

    const customerStats = {
      VIP: customers.filter((customer) => customer.level === 'VIP').length,
      普通: customers.filter((customer) => customer.level === '普通').length,
      新客户: customers.filter((customer) => customer.level === '新客户').length,
    };

    return `ERP 系统经营报表

客户统计：
客户总数：${customers.length}
VIP 客户：${customerStats.VIP}
普通客户：${customerStats.普通}
新客户：${customerStats.新客户}

订单统计：
订单总数：${orders.length}
待付款：${orderStats.待付款}
已付款：${orderStats.已付款}
已发货：${orderStats.已发货}
已完成：${orderStats.已完成}
已取消：${orderStats.已取消}

库存统计：
商品种类：${products.length}
库存不足商品：${lowStock.length}

本月财务：
收款总额：${monthlyReceived.toLocaleString()}
付款总额：${monthlyPaid.toLocaleString()}
净利润：${(monthlyReceived - monthlyPaid).toLocaleString()}

销售冠军：
${topCustomer ? `${topCustomer.name} - ${topCustomer.amount.toLocaleString()}` : '暂无数据'}

待处理事项：
${pendingPayments.length > 0 ? `${pendingPayments.length} 笔订单待收款` : '暂无待处理事项'}
${lowStock.length > 0 ? `\n${lowStock.length} 种商品库存不足` : ''}`;
  }

  private checkAnomalies(): string {
    const anomalies: string[] = [];
    const lowStock = getLowStockProducts();
    const pendingPayments = getPendingPaymentOrders();
    const monthlySales = getMonthlySales();

    if (lowStock.length > 0) {
      anomalies.push(`库存不足：
${lowStock
  .map(
    (product, index) =>
      `${index + 1}. ${product.name}，当前库存：${product.stock}${product.unit}，安全库存：${product.safeStock}${product.unit}`
  )
  .join('\n')}`);
    }

    if (pendingPayments.length > 0) {
      anomalies.push(`待收款订单：
${pendingPayments
  .map(
    (order, index) =>
      `${index + 1}. 订单号：${order.orderNo}，客户：${order.customerName}，金额：${order.totalAmount.toLocaleString()}`
  )
  .join('\n')}`);
    }

    if (monthlySales === 0) {
      anomalies.push('本月暂时没有销售额');
    }

    if (anomalies.length === 0) {
      return '系统运行正常，暂时没有发现异常。';
    }

    return `系统异常提醒：

${anomalies.join('\n\n')}`;
  }
}

export const queryService = new BusinessQueryService();
