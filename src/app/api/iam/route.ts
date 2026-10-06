import { NextResponse } from 'next/server';
import { getIamData } from '@/lib/iam-service';
import type { ApiResponse } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<Awaited<ReturnType<typeof getIamData>>>>> {
  try {
    const data = await getIamData();
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}