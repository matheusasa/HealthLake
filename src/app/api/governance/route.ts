import { NextResponse } from 'next/server';
import { getGovernanceCatalog } from '@/lib/governance-service';
import type { ApiResponse } from '@/lib/types';
import type { GovernanceTable } from '@/lib/governance-service';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<GovernanceTable[]>>> {
  try {
    const data = await getGovernanceCatalog();
    return NextResponse.json({ data, error: null, isDemoMode: isDemoMode() });
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}