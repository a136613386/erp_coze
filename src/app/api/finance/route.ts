import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { createFinanceRecord, getFinanceRecords } from '@/lib/erp-management';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const records = await getFinanceRecords();
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Failed to load finance records:', error);
    return NextResponse.json({ message: '财务数据加载失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const record = await createFinanceRecord(body);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? '财务数据不合法' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: '新增财务记录失败' }, { status: 500 });
  }
}
