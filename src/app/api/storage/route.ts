import { NextResponse } from 'next/server';
import { getStorageBreakdown } from '@/lib/s3-service';
import type { ApiResponse, StorageSummary } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<StorageSummary>>> {
  try {
    const data = await getStorageBreakdown();
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}