import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { createCustomer, getCustomers } from '@/lib/customer-store';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Failed to load customers:', error);
    return NextResponse.json({ message: '客户数据加载失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await createCustomer(body);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? '提交数据不合法' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === '该手机号已存在客户') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: '新增客户失败，请稍后重试' }, { status: 500 });
  }
}
