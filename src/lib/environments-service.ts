// Serviço de Multi-Ambientes do HealthLake

export interface Environment {
  name: string;
  accountId: string;
  region: string;
  freshnessScore: number; // 0-100
  qualityScore: number; // 0-100
  storageSizeBytes: number;
  jobSuccessRate: number; // 0-100
  monthlyCostUSD: number;
  lastSync: string; // ISO 8601
  status: 'healthy' | 'warning' | 'critical';
}

export interface ComparisonMetric {
  metric: string;
  dev: number;
  staging: number;
  prod: number;
  unit: string;
}

export interface EnvironmentsSummary {
  environments: Environment[];
  comparison: ComparisonMetric[];
}

export function getDemoEnvironments(): EnvironmentsSummary {
  const now = new Date();

  const environments: Environment[] = [
    {
      name: 'Desenvolvimento',
      accountId: '111111111111',
      region: 'us-east-1',
      freshnessScore: 72,
      qualityScore: 68,
      storageSizeBytes: 5368709120, // ~5 GB
      jobSuccessRate: 81.5,
      monthlyCostUSD: 342.18,
      lastSync: new Date(now.getTime() - 1800000).toISOString(), // 30 min atrás
      status: 'warning',
    },
    {
      name: 'Staging',
      accountId: '222222222222',
      region: 'us-east-1',
      freshnessScore: 88,
      qualityScore: 85,
      storageSizeBytes: 53687091200, // ~50 GB
      jobSuccessRate: 93.2,
      monthlyCostUSD: 1847.55,
      lastSync: new Date(now.getTime() - 900000).toISOString(), // 15 min atrás
      status: 'healthy',
    },
    {
      name: 'Produção',
      accountId: '333333333333',
      region: 'us-east-1',
      freshnessScore: 96,
      qualityScore: 97,
      storageSizeBytes: 536870912000, // ~500 GB
      jobSuccessRate: 99.1,
      monthlyCostUSD: 8934.72,
      lastSync: new Date(now.getTime() - 300000).toISOString(), // 5 min atrás
      status: 'healthy',
    },
  ];

  const comparison: ComparisonMetric[] = [
    {
      metric: 'Atualização de Dados',
      dev: 72,
      staging: 88,
      prod: 96,
      unit: '%',
    },
    {
      metric: 'Qualidade de Dados',
      dev: 68,
      staging: 85,
      prod: 97,
      unit: '%',
    },
    {
      metric: 'Armazenamento',
      dev: 5,
      staging: 50,
      prod: 500,
      unit: 'GB',
    },
    {
      metric: 'Taxa de Sucesso ETL',
      dev: 81.5,
      staging: 93.2,
      prod: 99.1,
      unit: '%',
    },
    {
      metric: 'Custo Mensal',
      dev: 342.18,
      staging: 1847.55,
      prod: 8934.72,
      unit: 'USD',
    },
  ];

  return { environments, comparison };
}