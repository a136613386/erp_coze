import { NextResponse } from 'next/server';

import { internalServerError } from '@/lib/api-error';
import { createDashboardOverviewRepository } from '@/lib/dashboard-overview-store';

export async function GET() {
  try {
    const repository = createDashboardOverviewRepository();
    const overview = await repository.getOverview();
    return NextResponse.json(overview);
  } catch (error) {
    return internalServerError(error, '读取经营概览数据失败');
  }
}
