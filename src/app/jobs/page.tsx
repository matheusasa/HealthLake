import { GlueJobsPanel } from "../components/GlueJobsPanel";
import type { ApiResponse, GlueJob } from "@/lib/types";

async function fetchData(): Promise<ApiResponse<GlueJob[]>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/glue/jobs`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error", isDemoMode: true };
  }
}

export default async function JobsPage() {
  const res = await fetchData();
  const data = res.data || [];

  const running = data.filter((j) => j.recentRuns.some((r) => r.status === "RUNNING")).length;
  const failed24h = data.filter((j) =>
    j.recentRuns.some(
      (r) => r.status === "FAILED" && r.startedAt && Date.now() - new Date(r.startedAt).getTime() < 86400000
    )
  ).length;
  const succeeded24h = data.filter((j) =>
    j.recentRuns.some(
      (r) => r.status === "SUCCEEDED" && r.startedAt && Date.now() - new Date(r.startedAt).getTime() < 86400000
    )
  ).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs ETL (Glue)</h1>
          <p className="text-sm text-slate-500 mt-1">Monitoramento de execução, falhas e performance dos jobs</p>
        </div>
        {res.isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Modo Demonstração
          </span>
        )}
      </div>

      {res.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">Erro ao carregar jobs: {res.error}</p>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border-l-4 border-slate-500 bg-slate-50 p-5 shadow-sm text-slate-900">
          <p className="text-sm font-medium opacity-80">Total de Jobs</p>
          <p className="text-3xl font-bold mt-1">{data.length}</p>
          <p className="text-xs mt-2 opacity-70">Configurados no catálogo</p>
        </div>
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-5 shadow-sm text-blue-900">
          <p className="text-sm font-medium opacity-80">Rodando Agora</p>
          <p className="text-3xl font-bold mt-1">{running}</p>
          <p className="text-xs mt-2 opacity-70">Execuções ativas neste momento</p>
        </div>
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">Sucessos (24h)</p>
          <p className="text-3xl font-bold mt-1">{succeeded24h}</p>
          <p className="text-xs mt-2 opacity-70">Jobs concluídos com sucesso</p>
        </div>
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-5 shadow-sm text-red-900">
          <p className="text-sm font-medium opacity-80">Falhas (24h)</p>
          <p className="text-3xl font-bold mt-1">{failed24h}</p>
          <p className="text-xs mt-2 opacity-70">Requerem atenção imediata</p>
        </div>
      </div>

      {/* Full Jobs List */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Todos os Jobs</h2>
          <p className="text-sm text-slate-500 mt-0.5">Histórico recente e status detalhado por job</p>
        </div>
        <div className="p-6">
          <GlueJobsPanel jobs={data} />
        </div>
      </section>
    </div>
  );
}