import { NextRequest } from 'next/server';
import { createCustomer, CustomerLevel, getCustomers } from '@/lib/database';

export const runtime = 'nodejs';

const customerLevels: CustomerLevel[] = ['VIP', '普通', '新客户'];

export async function GET() {
  try {
    const customers = await getCustomers();
    return Response.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    return Response.json({ error: '获取客户列表失败，请检查数据库连接' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const company = typeof body.company === 'string' ? body.company.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const level = body.level as CustomerLevel;

    if (!name || !company || !phone) {
      return Response.json({ error: '请填写客户名称、公司和电话' }, { status: 400 });
    }

    if (!/^1\d{10}$/.test(phone)) {
      return Response.json({ error: '请输入 11 位手机号' }, { status: 400 });
    }

    if (!customerLevels.includes(level)) {
      return Response.json({ error: '请选择有效的客户等级' }, { status: 400 });
    }

    const customer = await createCustomer({ name, company, phone, level });
    return Response.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return Response.json({ error: '添加客户失败，请检查数据库连接' }, { status: 500 });
  }
}
