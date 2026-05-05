import { NextRequest } from 'next/server';
import { createOrder, getOrders, OrderStatus } from '@/lib/database';

export const runtime = 'nodejs';

const orderStatuses: OrderStatus[] = ['已完成', '已发货', '待付款', '已付款', '已取消'];

export async function GET() {
  try {
    const orders = await getOrders();
    return Response.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return Response.json({ error: '获取订单列表失败，请检查数据库连接' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = typeof body.customerId === 'string' ? body.customerId.trim() : '';
    const amount = Number(body.amount);
    const status = body.status as OrderStatus;
    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const items = Number(body.items);

    if (!customerId) {
      return Response.json({ error: '请选择客户' }, { status: 400 });
    }

    if (!date) {
      return Response.json({ error: '请选择订单日期' }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: '请输入大于 0 的订单金额' }, { status: 400 });
    }

    if (!Number.isInteger(items) || items <= 0) {
      return Response.json({ error: '请输入大于 0 的商品项数' }, { status: 400 });
    }

    if (!orderStatuses.includes(status)) {
      return Response.json({ error: '请选择有效的订单状态' }, { status: 400 });
    }

    const result = await createOrder({ customerId, amount, status, date, items });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'CUSTOMER_NOT_FOUND') {
      return Response.json({ error: '客户不存在，请刷新后重试' }, { status: 404 });
    }

    console.error('Create order error:', error);
    return Response.json({ error: '创建订单失败，请检查数据库连接' }, { status: 500 });
  }
}
