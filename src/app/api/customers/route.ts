import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { internalServerError } from '@/lib/api-error';
import { createCustomer, getCustomers } from '@/lib/customer-store';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    return internalServerError(error, '读取客户数据失败');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await createCustomer(body);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message ?? '提交数据不合法' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === '该手机号已存在客户') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    ) {
      return NextResponse.json({ message: '该手机号已存在客户' }, { status: 409 });
    }

    return internalServerError(error, '新增客户失败，请稍后重试');
  }
}
