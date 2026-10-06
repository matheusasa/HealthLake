import { DashboardOverview } from "./components/DashboardOverview";
import { FreshnessTable } from "./components/FreshnessTable";
import { QualityMetrics } from "./components/QualityMetrics";
import { StorageChart } from "./components/StorageChart";
import { GlueJobsPanel } from "./components/GlueJobsPanel";
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header da Página */}
      <div className="flex items-center justify-between">
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
          <span className="text-xs text-slate-400">
            Atualizado: {new Date().toLocaleTimeString("pt-BR")}
          </span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Atualização de Dados
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Status de atualização dos datasets vs SLA
                </p>
              </div>
              <a href="/freshness" className="text-xs font-medium text-teal-600 hover:text-teal-700">Ver todos →</a>
            </div>
            <div className="p-6">
              <FreshnessTable datasets={freshnessData} />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Qualidade de Dados
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Regras de validação e verificações de anomalia
                </p>
              </div>
              <a href="/quality" className="text-xs font-medium text-teal-600 hover:text-teal-700">Ver todos →</a>
            </div>
            <div className="p-6">
              <QualityMetrics metrics={qualityData} />
            </div>
          </section>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-8">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Crescimento do Armazenamento
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Tendência de tamanho do lake nos últimos 30 dias
                </p>
              </div>
              <a href="/storage" className="text-xs font-medium text-teal-600 hover:text-teal-700">Ver detalhes →</a>
            </div>
            <div className="p-6">
              <StorageChart summary={storageData} />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Jobs ETL (Glue)
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Status dos jobs e falhas recentes
                </p>
              </div>
              <a href="/jobs" className="text-xs font-medium text-teal-600 hover:text-teal-700">Ver todos →</a>
            </div>
            <div className="p-6">
              <GlueJobsPanel jobs={glueData} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}