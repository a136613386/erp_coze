import { NextResponse } from 'next/server';

import { getDashboardData } from '@/lib/erp-management';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const dashboard = await getDashboardData();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Failed to load dashboard overview:', error);
    return NextResponse.json(
      { message: '经营概览数据加载失败，请检查数据库连接配置' },
      { status: 500 }
    );
  }
}
