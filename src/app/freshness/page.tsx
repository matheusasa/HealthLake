import { FreshnessTable } from "../components/FreshnessTable";
import type { ApiResponse, DatasetFreshness } from "@/lib/types";

async function fetchData(): Promise<ApiResponse<DatasetFreshness[]>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/freshness`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error", isDemoMode: true };
  }
}

export default async function FreshnessPage() {
  const res = await fetchData();
  const data = res.data || [];

  const healthy = data.filter((d) => d.status === "healthy").length;
  const warning = data.filter((d) => d.status === "warning").length;
  const critical = data.filter((d) => d.status === "critical").length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Atualização de Dados</h1>
          <p className="text-sm text-slate-500 mt-1">Monitoramento de freshness dos datasets vs SLA</p>
        </div>
        {res.isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Modo Demonstração
          </span>
        )}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">No Prazo</p>
          <p className="text-3xl font-bold mt-1">{healthy}</p>
          <p className="text-xs mt-2 opacity-70">Datasets atualizados dentro do SLA</p>
        </div>
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 shadow-sm text-amber-900">
          <p className="text-sm font-medium opacity-80">Em Risco</p>
          <p className="text-3xl font-bold mt-1">{warning}</p>
          <p className="text-xs mt-2 opacity-70">Próximos de atingir o limite do SLA</p>
        </div>
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-5 shadow-sm text-red-900">
          <p className="text-sm font-medium opacity-80">Atrasados</p>
          <p className="text-3xl font-bold mt-1">{critical}</p>
          <p className="text-xs mt-2 opacity-70">Ultrapassaram o SLA definido</p>
        </div>
      </div>

      {/* Full Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Todos os Datasets</h2>
          <p className="text-sm text-slate-500 mt-0.5">Lista completa com status de atualização</p>
        </div>
        <div className="p-6">
          <FreshnessTable datasets={data} />
        </div>
      </section>
    </div>
  );
}