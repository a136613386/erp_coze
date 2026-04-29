import { NextResponse } from 'next/server';

import { getInventory } from '@/lib/erp-management';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const inventory = await getInventory();
    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Failed to load inventory:', error);
    return NextResponse.json({ message: '库存数据加载失败' }, { status: 500 });
  }
}
