import { NextResponse } from 'next/server';
import { getAuditData } from '@/lib/audit-service';
import type { ApiResponse } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<Awaited<ReturnType<typeof getAuditData>>>>> {
  try {
    const data = await getAuditData();
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}