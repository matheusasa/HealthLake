"use client";

import type { DashboardOverview } from "@/lib/types";

interface Props {
  data: DashboardOverview;
}

export function DashboardOverview({ data }: Props) {
  const freshnessHealth = Math.round(
    (data.freshness.healthy / (data.freshness.total || 1)) * 100
  );
  const qualityHealth = Math.round(
    (data.quality.passing / (data.quality.totalRules || 1)) * 100
  );
  const glueHealth = Math.round(
    ((data.glueJobs.succeededLast24h) /
      ((data.glueJobs.succeededLast24h + data.glueJobs.failedLast24h) || 1)) *
      100
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KpiCard
        title="Atualização de Dados"
        value={`${freshnessHealth}%`}
        subtitle={`${data.freshness.critical} datasets atrasados`}
        status={freshnessHealth >= 90 ? "healthy" : freshnessHealth >= 70 ? "warning" : "critical"}
      />
      <KpiCard
        title="Qualidade de Dados"
        value={`${qualityHealth}%`}
        subtitle={`${data.quality.failing} regras falhando`}
        status={qualityHealth >= 90 ? "healthy" : qualityHealth >= 70 ? "warning" : "critical"}
      />
      <KpiCard
        title="Armazenamento Total"
        value={formatBytes(data.storage.totalSizeBytes)}
        subtitle={`${(data.storage.totalFiles / 1_000_000).toFixed(1)}M arquivos`}
        status="healthy"
      />
      <KpiCard
        title="Jobs ETL (24h)"
        value={`${glueHealth}%`}
        subtitle={`${data.glueJobs.failedLast24h} falhas / ${data.glueJobs.running} rodando`}
        status={glueHealth >= 90 ? "healthy" : glueHealth >= 70 ? "warning" : "critical"}
      />
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  status,
}: {
  title: string;
  value: string;
  subtitle: string;
  status: "healthy" | "warning" | "critical";
}) {
  const colors = {
    healthy: "border-teal-500 bg-teal-50 text-teal-900",
    warning: "border-amber-500 bg-amber-50 text-amber-900",
    critical: "border-red-500 bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-lg border-l-4 p-5 shadow-sm ${colors[status]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs mt-2 opacity-70">{subtitle}</p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}