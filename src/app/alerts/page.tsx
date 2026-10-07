import { AlertsContent } from "./AlertsContent";
import type { ApiResponse } from "@/lib/types";
import type { Alert, NotificationChannel } from "@/lib/alerts-service";

interface AlertsResponse {
  alerts: Alert[];
  channels: NotificationChannel[];
}

async function fetchData(): Promise<ApiResponse<AlertsResponse>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/alerts`, { cache: "no-store" });
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

export default async function AlertsPage() {
  const res = await fetchData();
  const data = res.data;
  const alerts = data?.alerts || [];
  const channels = data?.channels || [];

  const critical = alerts.filter((a) => a.severity === "critical").length;
  const warning = alerts.filter((a) => a.severity === "warning").length;
  const info = alerts.filter((a) => a.severity === "info").length;
  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Alertas e Notificações
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoramento de SLA, qualidade, custos e falhas do datalake
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
          <p className="text-sm font-medium text-red-800">Erro ao carregar alertas: {res.error}</p>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-5 shadow-sm text-red-900">
          <p className="text-sm font-medium opacity-80">Críticos</p>
          <p className="text-3xl font-bold mt-1">{critical}</p>
          <p className="text-xs mt-2 opacity-70">Requerem ação imediata</p>
        </div>
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 shadow-sm text-amber-900">
          <p className="text-sm font-medium opacity-80">Alertas</p>
          <p className="text-3xl font-bold mt-1">{warning}</p>
          <p className="text-xs mt-2 opacity-70">Atenção recomendada</p>
        </div>
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">Informativos</p>
          <p className="text-3xl font-bold mt-1">{info}</p>
          <p className="text-xs mt-2 opacity-70">Eventos e atualizações</p>
        </div>
        <div className="rounded-lg border-l-4 border-slate-500 bg-slate-50 p-5 shadow-sm text-slate-900">
          <p className="text-sm font-medium opacity-80">Não Reconhecidos</p>
          <p className="text-3xl font-bold mt-1">{unacknowledged}</p>
          <p className="text-xs mt-2 opacity-70">Pendentes de análise</p>
        </div>
      </div>

      <AlertsContent alerts={alerts} channels={channels} />
    </div>
  );
}