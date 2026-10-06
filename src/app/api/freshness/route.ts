import { NextResponse } from 'next/server';
import { getDatasetFreshness } from '@/lib/s3-service';
import type { ApiResponse, DatasetFreshness } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<DatasetFreshness[]>>> {
  try {
    const prefixes = ['raw/', 'staging/', 'curated/'];
    const data = await getDatasetFreshness(prefixes);
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}