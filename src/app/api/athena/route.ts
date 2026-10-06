import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';
import { getAthenaAnalytics, type AthenaAnalytics } from '@/lib/athena-service';

export async function GET(): Promise<NextResponse<ApiResponse<AthenaAnalytics>>> {
  try {
    if (isDemoMode()) {
      const data = await getAthenaAnalytics();
      return NextResponse.json({ data, error: null, isDemoMode: true });
    }

    // Real AWS Athena integration would go here
    return NextResponse.json(
      { data: null, error: 'Integração real com Athena pendente de configuração', isDemoMode: false },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}