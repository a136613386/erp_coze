import { NextResponse } from 'next/server';

import { internalServerError } from '@/lib/api-error';
import { getOrders } from '@/lib/order-store';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return internalServerError(error, '读取订单数据失败');
  }
}
