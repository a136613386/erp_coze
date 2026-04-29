import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { createOrder, getOrders } from '@/lib/erp-management';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to load orders:', error);
    return NextResponse.json({ message: '订单数据加载失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await createOrder(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? '订单数据不合法' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: '创建订单失败' }, { status: 500 });
  }
}
