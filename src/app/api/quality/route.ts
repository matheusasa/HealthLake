import { NextResponse } from 'next/server';
import type { ApiResponse, QualityMetric } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

export async function GET(): Promise<NextResponse<ApiResponse<QualityMetric[]>>> {
  try {
    if (isDemoMode()) {
      return NextResponse.json({ data: getDemoQualityMetrics(), error: null, isDemoMode: true });
    }

    // TODO: Implement real AWS Glue Data Quality / Deequ integration
    return NextResponse.json(
      { data: null, error: 'Integração real com qualidade de dados pendente', isDemoMode: false },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}

function getDemoQualityMetrics(): QualityMetric[] {
  const now = new Date().toISOString();
  return [
    { rule: 'null_check', dataset: 'curated.orders', value: 88.5, threshold: 95, status: 'fail', checkedAt: now },
    { rule: 'unique_key', dataset: 'curated.customers', value: 94.2, threshold: 98, status: 'warn', checkedAt: now },
    { rule: 'range_check', dataset: 'staging.transactions', value: 72.8, threshold: 90, status: 'fail', checkedAt: now },
    { rule: 'schema_drift', dataset: 'raw.clickstream', value: 65.3, threshold: 85, status: 'fail', checkedAt: now },
    { rule: 'freshness_sla', dataset: 'curated.inventory', value: 97.1, threshold: 95, status: 'pass', checkedAt: now },
    { rule: 'completeness', dataset: 'staging.suppliers', value: 91.8, threshold: 90, status: 'pass', checkedAt: now },
    { rule: 'referential_integrity', dataset: 'curated.claims', value: 82.4, threshold: 95, status: 'fail', checkedAt: now },
    { rule: 'format_cpf', dataset: 'curated.patients', value: 89.1, threshold: 95, status: 'warn', checkedAt: now },
  ];
}