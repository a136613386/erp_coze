import { NextResponse } from 'next/server';

import { internalServerError } from '@/lib/api-error';
import { getOrderById } from '@/lib/order-store';

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ message: '订单不存在' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return internalServerError(error, '读取订单详情失败');
  }
}
