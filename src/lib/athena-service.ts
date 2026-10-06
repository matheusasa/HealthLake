import { isDemoMode } from './aws-client';
import type { QualityMetric } from './types';

// --- Quality Checks (used by /api/quality) ---

export async function runQualityChecks(): Promise<QualityMetric[]> {
  if (isDemoMode()) return getDemoQualityMetrics();
  throw new Error('Integração real com Athena pendente de configuração');
}

function getDemoQualityMetrics(): QualityMetric[] {
  const now = new Date().toISOString();
  return [
    { rule: 'null_check_prescriptions', dataset: 'curated/prescriptions', value: 0.88, threshold: 0.95, status: 'fail', checkedAt: now },
    { rule: 'dedup_check_encounters', dataset: 'curated/encounters', value: 0.94, threshold: 0.98, status: 'warn', checkedAt: now },
    { rule: 'schema_consistency_lab_results', dataset: 'curated/lab_results', value: 0.72, threshold: 0.90, status: 'fail', checkedAt: now },
    { rule: 'freshness_patients', dataset: 'raw/patients', value: 0.65, threshold: 0.85, status: 'fail', checkedAt: now },
    { rule: 'completeness_orders', dataset: 'curated/orders', value: 0.97, threshold: 0.95, status: 'pass', checkedAt: now },
    { rule: 'range_check_vitals', dataset: 'curated/vitals', value: 0.91, threshold: 0.90, status: 'pass', checkedAt: now },
    { rule: 'format_check_cpf', dataset: 'curated/patients', value: 0.89, threshold: 0.95, status: 'warn', checkedAt: now },
    { rule: 'referential_integrity_claims', dataset: 'curated/claims', value: 0.96, threshold: 0.95, status: 'pass', checkedAt: now },
  ];
}

// --- Types ---

export interface QueryInfo {
  queryId: string;
  queryString: string;
  database: string;
  table: string;
  bytesScanned: number;
  costUSD: number;
  executionTimeMs: number;
  timestamp: string; // ISO 8601
}

export interface TableAccess {
  tableName: string;
  accessCount: number;
  totalBytesScanned: number;
  avgCostPerQuery: number;
}

export interface DailyVolume {
  date: string; // ISO 8601 (YYYY-MM-DD)
  queryCount: number;
  totalCost: number;
  totalBytesScanned: number;
}

export interface Recommendation {
  type: 'partitioning' | 'compression' | 'format' | 'caching' | 'query-optimization';
  title: string;
  description: string;
  estimatedSavings: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AthenaAnalytics {
  topQueries: QueryInfo[];
  tableAccess: TableAccess[];
  dailyVolume: DailyVolume[];
  recommendations: Recommendation[];
  summary: {
    totalQueries30d: number;
    totalCost30d: number;
    avgQueryCost: number;
    totalBytesScanned30d: number;
  };
}

// --- Service ---

export async function getAthenaAnalytics(): Promise<AthenaAnalytics> {
  if (isDemoMode()) return getDemoAnalytics();

  // Real AWS Athena integration would go here
  // Using GetQueryExecution, ListQueryExecutions, etc.
  throw new Error('Integração real com Athena pendente de configuração');
}

// --- Demo Data ---

function getDemoAnalytics(): AthenaAnalytics {
  const now = Date.now();

  const topQueries: QueryInfo[] = [
    {
      queryId: 'q-a1b2c3d4-0001',
      queryString: 'SELECT customer_id, SUM(order_total) FROM curated.orders WHERE order_date >= \'2026-09-01\' GROUP BY customer_id ORDER BY SUM(order_total) DESC LIMIT 100',
      database: 'datalake_curated',
      table: 'orders',
      bytesScanned: 15_800_000_000,
      costUSD: 79.00,
      executionTimeMs: 45200,
      timestamp: new Date(now - 3600000 * 2).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0002',
      queryString: 'SELECT p.category, COUNT(*) as sales_count, SUM(oi.quantity * oi.unit_price) as revenue FROM curated.order_items oi JOIN curated.products p ON oi.product_id = p.id GROUP BY p.category',
      database: 'datalake_curated',
      table: 'order_items',
      bytesScanned: 12_400_000_000,
      costUSD: 62.00,
      executionTimeMs: 38500,
      timestamp: new Date(now - 3600000 * 5).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0003',
      queryString: 'SELECT DATE(event_time) as day, event_type, COUNT(*) FROM raw.clickstream WHERE event_time >= \'2026-09-01\' GROUP BY DATE(event_time), event_type',
      database: 'datalake_raw',
      table: 'clickstream',
      bytesScanned: 28_600_000_000,
      costUSD: 143.00,
      executionTimeMs: 92000,
      timestamp: new Date(now - 3600000 * 8).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0004',
      queryString: 'SELECT c.region, AVG(o.delivery_days) as avg_delivery FROM curated.orders o JOIN curated.customers c ON o.customer_id = c.id GROUP BY c.region HAVING AVG(o.delivery_days) > 5',
      database: 'datalake_curated',
      table: 'customers',
      bytesScanned: 4_200_000_000,
      costUSD: 21.00,
      executionTimeMs: 12800,
      timestamp: new Date(now - 3600000 * 12).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0005',
      queryString: 'SELECT product_id, warehouse_id, SUM(quantity) as stock FROM staging.inventory_snapshots WHERE snapshot_date = CURRENT_DATE GROUP BY product_id, warehouse_id',
      database: 'datalake_staging',
      table: 'inventory_snapshots',
      bytesScanned: 8_900_000_000,
      costUSD: 44.50,
      executionTimeMs: 28300,
      timestamp: new Date(now - 3600000 * 15).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0006',
      queryString: 'SELECT user_id, session_id, COUNT(*) as page_views FROM raw.web_sessions WHERE session_start >= \'2026-09-15\' GROUP BY user_id, session_id ORDER BY page_views DESC',
      database: 'datalake_raw',
      table: 'web_sessions',
      bytesScanned: 18_200_000_000,
      costUSD: 91.00,
      executionTimeMs: 67000,
      timestamp: new Date(now - 3600000 * 18).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0007',
      queryString: 'SELECT supplier_id, COUNT(DISTINCT po.id) as orders, SUM(po.total_amount) as spend FROM curated.purchase_orders po GROUP BY supplier_id ORDER BY spend DESC LIMIT 20',
      database: 'datalake_curated',
      table: 'purchase_orders',
      bytesScanned: 3_100_000_000,
      costUSD: 15.50,
      executionTimeMs: 9200,
      timestamp: new Date(now - 3600000 * 22).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0008',
      queryString: 'SELECT DATE_TRUNC(\'week\', created_at) as week, status, COUNT(*) FROM curated.support_tickets GROUP BY DATE_TRUNC(\'week\', created_at), status',
      database: 'datalake_curated',
      table: 'support_tickets',
      bytesScanned: 2_800_000_000,
      costUSD: 14.00,
      executionTimeMs: 8100,
      timestamp: new Date(now - 3600000 * 26).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0009',
      queryString: 'SELECT t.transaction_id, t.amount, m.merchant_name FROM curated.transactions t JOIN staging.merchants m ON t.merchant_id = m.id WHERE t.amount > 1000 AND t.created_at >= \'2026-09-20\'',
      database: 'datalake_curated',
      table: 'transactions',
      bytesScanned: 6_500_000_000,
      costUSD: 32.50,
      executionTimeMs: 19400,
      timestamp: new Date(now - 3600000 * 30).toISOString(),
    },
    {
      queryId: 'q-a1b2c3d4-0010',
      queryString: 'SELECT campaign_id, channel, SUM(impressions) as imp, SUM(clicks) as clk, ROUND(SUM(clicks)::DECIMAL / NULLIF(SUM(impressions), 0) * 100, 2) as ctr FROM curated.marketing_events GROUP BY campaign_id, channel',
      database: 'datalake_curated',
      table: 'marketing_events',
      bytesScanned: 5_300_000_000,
      costUSD: 26.50,
      executionTimeMs: 15600,
      timestamp: new Date(now - 3600000 * 34).toISOString(),
    },
  ];

  const tableAccess: TableAccess[] = [
    { tableName: 'curated.orders', accessCount: 342, totalBytesScanned: 48_200_000_000, avgCostPerQuery: 7.02 },
    { tableName: 'raw.clickstream', accessCount: 287, totalBytesScanned: 124_600_000_000, avgCostPerQuery: 21.71 },
    { tableName: 'curated.customers', accessCount: 256, totalBytesScanned: 12_800_000_000, avgCostPerQuery: 2.50 },
    { tableName: 'curated.order_items', accessCount: 198, totalBytesScanned: 35_400_000_000, avgCostPerQuery: 8.94 },
    { tableName: 'staging.inventory_snapshots', accessCount: 165, totalBytesScanned: 22_100_000_000, avgCostPerQuery: 6.70 },
    { tableName: 'raw.web_sessions', accessCount: 143, totalBytesScanned: 38_200_000_000, avgCostPerQuery: 13.36 },
    { tableName: 'curated.products', accessCount: 134, totalBytesScanned: 4_600_000_000, avgCostPerQuery: 1.72 },
    { tableName: 'curated.transactions', accessCount: 112, totalBytesScanned: 18_500_000_000, avgCostPerQuery: 8.26 },
  ];

  const dailyVolume: DailyVolume[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now - (29 - i) * 86400000).toISOString().split('T')[0];
    const baseQueries = 80 + Math.floor(Math.random() * 40);
    const weekendDip = (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) ? 0.6 : 1;
    const queryCount = Math.round(baseQueries * weekendDip);
    const avgCost = 4.5 + Math.random() * 3;
    const totalCost = Math.round(queryCount * avgCost * 100) / 100;
    const avgBytes = 800_000_000 + Math.random() * 400_000_000;
    const totalBytesScanned = Math.round(queryCount * avgBytes);
    return { date, queryCount, totalCost, totalBytesScanned };
  });

  const recommendations: Recommendation[] = [
    {
      type: 'partitioning',
      title: 'Particionar tabela clickstream por data',
      description: 'A tabela raw.clickstream é a mais custosa e não possui particionamento. Adicionar partição por event_date reduziria os bytes escaneados em ~85% para consultas com filtro temporal.',
      estimatedSavings: '~$18/dia',
      priority: 'high',
    },
    {
      type: 'compression',
      title: 'Converter inventory_snapshots para Parquet + Snappy',
      description: 'A tabela staging.inventory_snapshots está em formato CSV sem compressão. Converter para Parquet com compressão Snappy reduziria o tamanho em ~70% e melhoraria a performance de leitura.',
      estimatedSavings: '~$4.70/dia',
      priority: 'high',
    },
    {
      type: 'format',
      title: 'Migrar web_sessions de JSON para ORC',
      description: 'Consultas em raw.web_sessions fazem scan completo devido ao formato JSON aninhado. Migrar para ORC com colunas selecionadas permitiria predicate pushdown e redução de I/O.',
      estimatedSavings: '~$9.40/dia',
      priority: 'medium',
    },
    {
      type: 'caching',
      title: 'Habilitar cache de resultados para relatórios diários',
      description: 'As 5 queries mais frequentes são executadas múltiplas vezes por dia com os mesmos parâmetros. Habilitar o S3 result cache do Athena eliminaria execuções redundantes.',
      estimatedSavings: '~$12/dia',
      priority: 'medium',
    },
    {
      type: 'query-optimization',
      title: 'Adicionar filtros de partição em consultas de orders',
      description: 'Várias consultas em curated.orders não filtram por order_date, causando full table scan. Reescrever com WHERE order_date >= ... aproveitaria partições existentes.',
      estimatedSavings: '~$6.50/dia',
      priority: 'low',
    },
  ];

  const totalQueries = dailyVolume.reduce((sum, d) => sum + d.queryCount, 0);
  const totalCost = dailyVolume.reduce((sum, d) => sum + d.totalCost, 0);
  const totalBytes = dailyVolume.reduce((sum, d) => sum + d.totalBytesScanned, 0);

  return {
    topQueries,
    tableAccess,
    dailyVolume,
    recommendations,
    summary: {
      totalQueries30d: totalQueries,
      totalCost30d: Math.round(totalCost * 100) / 100,
      avgQueryCost: Math.round((totalCost / totalQueries) * 100) / 100,
      totalBytesScanned30d: totalBytes,
    },
  };
}