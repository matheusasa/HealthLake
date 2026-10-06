import { NextResponse } from 'next/server';
import { getLineageGraph } from '@/lib/lineage-service';
import type { ApiResponse } from '@/lib/types';
import type { LineageGraph } from '@/lib/lineage-service';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<LineageGraph>>> {
  try {
    const data = await getLineageGraph();
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}