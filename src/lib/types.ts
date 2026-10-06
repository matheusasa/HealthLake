// Tipos compartilhados do HealthLake Dashboard

export interface DatasetFreshness {
  dataset: string;
  lastUpdated: string; // ISO 8601
  slaHours: number;
  status: 'healthy' | 'warning' | 'critical';
  delayHours: number;
}

export interface QualityMetric {
  rule: string;
  dataset: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warn' | 'fail';
  checkedAt: string; // ISO 8601
}

export interface StorageBreakdown {
  layer: string; // raw, staging, curated
  sizeBytes: number;
  fileCount: number;
  formats: Record<string, number>; // parquet: bytes, csv: bytes, etc.
}

export interface StorageSummary {
  totalSizeBytes: number;
  totalFiles: number;
  layers: StorageBreakdown[];
  trend: { date: string; sizeBytes: number }[];
}

export interface GlueJobRun {
  id: string;
  status: 'SUCCEEDED' | 'FAILED' | 'RUNNING' | 'STOPPED' | 'WAITING';
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
  errorMessage: string | null;
  logUrl: string | null;
}

export interface GlueJob {
  name: string;
  type: string;
  state: string;
  lastModified: string;
  recentRuns: GlueJobRun[];
}

export interface DashboardOverview {
  freshness: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  quality: {
    totalRules: number;
    passing: number;
    failing: number;
  };
  storage: {
    totalSizeBytes: number;
    totalFiles: number;
  };
  glueJobs: {
    total: number;
    running: number;
    failedLast24h: number;
    succeededLast24h: number;
  };
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isDemoMode: boolean;
}