import { AuditContent } from "./AuditContent";
import type { ApiResponse } from "@/lib/types";
import type { AuditAnalytics } from "@/lib/audit-service";

async function fetchData(): Promise<ApiResponse<AuditAnalytics>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/audit`, { cache: "no-store" });
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

export default async function AuditPage() {
  const res = await fetchData();
  const data = res.data;

  const totalEvents = data?.summary.totalEvents24h ?? 0;
  const criticalEvents = data?.summary.criticalEvents24h ?? 0;
  const anomalies = data?.summary.anomaliesDetected ?? 0;
  const accessDenied = data?.summary.accessDeniedCount ?? 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Auditoria &amp; Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoramento de acessos, detecção de anomalias e rastreamento de atividades no datalake
          </p>
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
          <p className="text-sm font-medium text-red-800">Erro ao carregar auditoria: {res.error}</p>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">Eventos (24h)</p>
          <p className="text-3xl font-bold mt-1">{totalEvents}</p>
          <p className="text-xs mt-2 opacity-70">Total de eventos registrados</p>
        </div>
        <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 p-5 shadow-sm text-rose-900">
          <p className="text-sm font-medium opacity-80">Alertas Críticos</p>
          <p className="text-3xl font-bold mt-1">{criticalEvents}</p>
          <p className="text-xs mt-2 opacity-70">Requerem ação imediata</p>
        </div>
        <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-5 shadow-sm text-orange-900">
          <p className="text-sm font-medium opacity-80">Anomalias Detectadas</p>
          <p className="text-3xl font-bold mt-1">{anomalies}</p>
          <p className="text-xs mt-2 opacity-70">Comportamentos fora do padrão</p>
        </div>
        <div className="rounded-lg border-l-4 border-slate-500 bg-slate-50 p-5 shadow-sm text-slate-900">
          <p className="text-sm font-medium opacity-80">Acessos Negados</p>
          <p className="text-3xl font-bold mt-1">{accessDenied}</p>
          <p className="text-xs mt-2 opacity-70">Tentativas de acesso bloqueadas</p>
        </div>
      </div>

      {data && <AuditContent data={data} />}
    </div>
  );
}