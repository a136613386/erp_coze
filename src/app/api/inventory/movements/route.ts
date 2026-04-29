import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { createStockMovement } from '@/lib/erp-management';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inventory = await createStockMovement(body);
    return NextResponse.json({ inventory }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? '库存操作数据不合法' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: '库存操作失败' }, { status: 500 });
  }
}
