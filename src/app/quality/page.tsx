import { QualityMetrics } from "../components/QualityMetrics";
import type { ApiResponse, QualityMetric } from "@/lib/types";

async function fetchData(): Promise<ApiResponse<QualityMetric[]>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/quality`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error", isDemoMode: true };
  }
}

export default async function QualityPage() {
  const res = await fetchData();
  const data = res.data || [];

  const passing = data.filter((m) => m.status === "pass").length;
  const warning = data.filter((m) => m.status === "warn").length;
  const failing = data.filter((m) => m.status === "fail").length;
  const total = data.length;
  const healthPct = total > 0 ? Math.round((passing / total) * 100) : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Qualidade de Dados</h1>
          <p className="text-sm text-slate-500 mt-1">Regras de validação, anomalias e integridade dos datasets</p>
        </div>
        {res.isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Modo Demonstração
          </span>
        )}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">Saúde Geral</p>
          <p className="text-3xl font-bold mt-1">{healthPct}%</p>
          <p className="text-xs mt-2 opacity-70">Regras aprovadas no período</p>
        </div>
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">Aprovadas</p>
          <p className="text-3xl font-bold mt-1">{passing}</p>
          <p className="text-xs mt-2 opacity-70">Dentro do limite aceitável</p>
        </div>
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 shadow-sm text-amber-900">
          <p className="text-sm font-medium opacity-80">Alertas</p>
          <p className="text-3xl font-bold mt-1">{warning}</p>
          <p className="text-xs mt-2 opacity-70">Próximas do limite</p>
        </div>
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-5 shadow-sm text-red-900">
          <p className="text-sm font-medium opacity-80">Falhas</p>
          <p className="text-3xl font-bold mt-1">{failing}</p>
          <p className="text-xs mt-2 opacity-70">Ultrapassaram o threshold</p>
        </div>
      </div>

      {/* Full Metrics List */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Todas as Regras de Qualidade</h2>
          <p className="text-sm text-slate-500 mt-0.5">Detalhamento por dataset e regra de validação</p>
        </div>
        <div className="p-6">
          <QualityMetrics metrics={data} />
        </div>
      </section>
    </div>
  );
}