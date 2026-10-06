import { GovernanceContent } from "./GovernanceContent";
import type { ApiResponse } from "@/lib/types";
import type { GovernanceTable } from "@/lib/governance-service";

async function fetchData(): Promise<ApiResponse<GovernanceTable[]>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/governance`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error", isDemoMode: true };
  }
}

export default async function GovernancePage() {
  const res = await fetchData();
  const data = res.data || [];

  const totalTables = data.length;
  const conforme = data.filter((t) => t.lgpdStatus === "conforme").length;
  const emAnalise = data.filter((t) => t.lgpdStatus === "em_analise").length;
  const naoConforme = data.filter((t) => t.lgpdStatus === "nao_conforme").length;
  const totalPiiFields = data.reduce((acc, t) => acc + t.piiFields.length, 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Governança de Dados</h1>
          <p className="text-sm text-slate-500 mt-1">Catálogo de dados, classificação de sensibilidade e conformidade LGPD</p>
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
          <p className="text-sm font-medium opacity-80">Tabelas Catalogadas</p>
          <p className="text-3xl font-bold mt-1">{totalTables}</p>
          <p className="text-xs mt-2 opacity-70">Total no catálogo Glue</p>
        </div>
        <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-5 shadow-sm text-emerald-900">
          <p className="text-sm font-medium opacity-80">LGPD Conforme</p>
          <p className="text-3xl font-bold mt-1">{conforme}</p>
          <p className="text-xs mt-2 opacity-70">Tabelas em conformidade</p>
        </div>
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 shadow-sm text-amber-900">
          <p className="text-sm font-medium opacity-80">Em Análise / Não Conforme</p>
          <p className="text-3xl font-bold mt-1">{emAnalise + naoConforme}</p>
          <p className="text-xs mt-2 opacity-70">Requerem atenção do DPO</p>
        </div>
        <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 p-5 shadow-sm text-rose-900">
          <p className="text-sm font-medium opacity-80">Campos PII/Sensíveis</p>
          <p className="text-3xl font-bold mt-1">{totalPiiFields}</p>
          <p className="text-xs mt-2 opacity-70">Campos classificados como sensíveis</p>
        </div>
      </div>

      {/* Main Content */}
      <GovernanceContent tables={data} />
    </div>
  );
}