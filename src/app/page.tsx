import { DashboardOverview } from "./components/DashboardOverview";
import { FreshnessTable } from "./components/FreshnessTable";
import { QualityMetrics } from "./components/QualityMetrics";
import { StorageChart } from "./components/StorageChart";
import { GlueJobsPanel } from "./components/GlueJobsPanel";
import { SectionHeader } from "./components/SectionHeader";
import { LiveTimestamp } from "./components/LiveTimestamp";
import type {
  ApiResponse,
  DatasetFreshness,
  QualityMetric,
  StorageSummary,
  GlueJob,
  DashboardOverview as DashboardOverviewType,
} from "@/lib/types";

async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      isDemoMode: true,
    };
  }
}

export default async function Home() {
  const [freshnessRes, qualityRes, storageRes, glueRes] = await Promise.all([
    fetchData<DatasetFreshness[]>("freshness"),
    fetchData<QualityMetric[]>("quality"),
    fetchData<StorageSummary>("storage"),
    fetchData<GlueJob[]>("glue/jobs"),
  ]);

  const freshnessData = freshnessRes.data || [];
  const qualityData = qualityRes.data || [];
  const storageData = storageRes.data;
  const glueData = glueRes.data || [];

  const overview: DashboardOverviewType = {
    freshness: {
      total: freshnessData.length,
      healthy: freshnessData.filter((d) => d.status === "healthy").length,
      warning: freshnessData.filter((d) => d.status === "warning").length,
      critical: freshnessData.filter((d) => d.status === "critical").length,
    },
    quality: {
      totalRules: qualityData.length,
      passing: qualityData.filter((q) => q.status === "pass").length,
      failing: qualityData.filter((q) => q.status === "fail").length,
    },
    storage: {
      totalSizeBytes: storageData?.totalSizeBytes ?? 0,
      totalFiles: storageData?.totalFiles ?? 0,
    },
    glueJobs: {
      total: glueData.length,
      running: glueData.filter((j) =>
        j.recentRuns.some((r) => r.status === "RUNNING")
      ).length,
      failedLast24h: glueData.filter((j) =>
        j.recentRuns.some(
          (r) =>
            r.status === "FAILED" &&
            r.startedAt &&
            Date.now() - new Date(r.startedAt).getTime() < 86400000
        )
      ).length,
      succeededLast24h: glueData.filter((j) =>
        j.recentRuns.some(
          (r) =>
            r.status === "SUCCEEDED" &&
            r.startedAt &&
            Date.now() - new Date(r.startedAt).getTime() < 86400000
        )
      ).length,
    },
  };

  const isDemoMode =
    freshnessRes.isDemoMode ||
    qualityRes.isDemoMode ||
    storageRes.isDemoMode ||
    glueRes.isDemoMode;

  const errors = [
    freshnessRes.error,
    qualityRes.error,
    storageRes.error,
    glueRes.error,
  ].filter(Boolean);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header da Página */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-sm text-slate-500 mt-1">
            Resumo executivo da saúde do datalake
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDemoMode && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Modo Demonstração
            </span>
          )}
          <LiveTimestamp />
        </div>
      </div>

      {/* Banner de Erros */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Alguns módulos falharam ao carregar:
          </p>
          <ul className="mt-2 list-disc list-inside text-sm text-red-700">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Cards */}
      <DashboardOverview data={overview} />

      {/* Grid de Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Coluna Esquerda */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader title="Atualização de Dados" subtitle="Status de atualização dos datasets vs SLA" href="/freshness" />
            <div className="p-6">
              <FreshnessTable datasets={freshnessData} />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader title="Qualidade de Dados" subtitle="Regras de validação e verificações de anomalia" href="/quality" />
            <div className="p-6">
              <QualityMetrics metrics={qualityData} />
            </div>
          </section>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader title="Crescimento do Armazenamento" subtitle="Tendência de tamanho do lake nos últimos 30 dias" href="/storage" linkLabel="Ver detalhes →" />
            <div className="p-6">
              <StorageChart summary={storageData} />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader title="Jobs ETL (Glue)" subtitle="Status dos jobs e falhas recentes" href="/jobs" />
            <div className="p-6">
              <GlueJobsPanel jobs={glueData} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}