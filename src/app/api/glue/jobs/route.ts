import { NextResponse } from 'next/server';
import { getJobsWithRecentRuns } from '@/lib/glue-service';
import type { ApiResponse, GlueJob } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<GlueJob[]>>> {
  try {
    const data = await getJobsWithRecentRuns();
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}