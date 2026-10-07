import { NextResponse } from 'next/server';
import { getUserCostData } from '@/lib/user-cost-service';
import type { ApiResponse } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<Awaited<ReturnType<typeof getUserCostData>>>>> {
  try {
    const data = await getUserCostData();
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}