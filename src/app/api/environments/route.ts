import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';
import { getDemoEnvironments } from '@/lib/environments-service';
import type { EnvironmentsSummary } from '@/lib/environments-service';

export async function GET(): Promise<NextResponse<ApiResponse<EnvironmentsSummary>>> {
  try {
    if (isDemoMode()) {
      return NextResponse.json({ data: getDemoEnvironments(), error: null, isDemoMode: true });
    }

    // TODO: Implement real multi-account AWS integration
    // const stsClient = await getSTSClient();
    // ... assume role per account, aggregate metrics

    return NextResponse.json(
      { data: null, error: 'Integração real com múltiplas contas pendente', isDemoMode: false },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}