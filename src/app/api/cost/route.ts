import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/types';
import { isDemoMode } from '@/lib/aws-client';

interface CostByService {
  service: string;
  amount: number;
  currency: string;
  percentage: number;
}

interface DailyCost {
  date: string;
  amount: number;
  currency: string;
}

interface CostSummary {
  totalSpend: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dailyTrend: DailyCost[];
  byService: CostByService[];
  forecast: number;
  budgetLimit: number | null;
}

export async function GET(): Promise<NextResponse<ApiResponse<CostSummary>>> {
  try {
    if (isDemoMode()) {
      return NextResponse.json({ data: getDemoCosts(), error: null, isDemoMode: true });
    }

    // TODO: Implement real AWS Cost Explorer integration
    // const client = await getCostExplorerClient();
    // ... query GetCostAndUsage

    return NextResponse.json(
      { data: null, error: 'Integração real com Cost Explorer pendente', isDemoMode: false },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json(
      { data: null, error: err instanceof Error ? err.message : 'Unknown error', isDemoMode: isDemoMode() },
      { status: 500 }
    );
  }
}

function getDemoCosts(): CostSummary {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0];
    const base = 450 + Math.random() * 100;
    const spike = i > 25 ? 80 : 0;
    return {
      date,
      amount: Math.round((base + spike) * 100) / 100,
      currency: 'USD',
    };
  });

  const total = days.reduce((sum, d) => sum + d.amount, 0);

  const services: CostByService[] = [
    { service: 'Amazon S3', amount: Math.round(total * 0.42 * 100) / 100, currency: 'USD', percentage: 42 },
    { service: 'AWS Glue', amount: Math.round(total * 0.28 * 100) / 100, currency: 'USD', percentage: 28 },
    { service: 'Amazon Athena', amount: Math.round(total * 0.15 * 100) / 100, currency: 'USD', percentage: 15 },
    { service: 'Amazon CloudWatch', amount: Math.round(total * 0.08 * 100) / 100, currency: 'USD', percentage: 8 },
    { service: 'Outros', amount: Math.round(total * 0.07 * 100) / 100, currency: 'USD', percentage: 7 },
  ];

  return {
    totalSpend: Math.round(total * 100) / 100,
    currency: 'USD',
    periodStart: days[0].date,
    periodEnd: days[days.length - 1].date,
    dailyTrend: days,
    byService: services,
    forecast: Math.round(total * 1.12 * 100) / 100,
    budgetLimit: 18000,
  };
}