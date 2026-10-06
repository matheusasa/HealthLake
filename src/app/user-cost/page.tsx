import { UserCostContent } from "./UserCostContent";
import type { ApiResponse } from "@/lib/types";
import type { UserCostAnalytics } from "@/lib/user-cost-service";

async function fetchUserCosts(): Promise<ApiResponse<UserCostAnalytics>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/user-cost`, { cache: "no-store" });
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function UserCostPage() {
  const costRes = await fetchUserCosts();
  const costData = costRes.data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Custos por Usuário</h1>
          <p className="text-sm text-slate-500 mt-1">
            Atribuição de custos por usuário e grupo — identificação de anomalias e padrões de consumo
          </p>
        </div>
        {costRes.isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Modo Demonstração
          </span>
        )}
      </div>

      {/* Error Banner */}
      {costRes.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Erro ao carregar dados de custos por usuário: {costRes.error}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      {costData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
            <p className="text-sm font-medium opacity-80">Custo Total (30d)</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(costData.summary.totalCost30d)}
            </p>
            <p className="text-xs mt-2 opacity-70">
              Soma de todos os serviços AWS
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-5 shadow-sm text-cyan-900">
            <p className="text-sm font-medium opacity-80">Consultas (30d)</p>
            <p className="text-3xl font-bold mt-1">
              {costData.summary.totalQueries30d.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs mt-2 opacity-70">
              Total de queries Athena executadas
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-5 shadow-sm text-indigo-900">
            <p className="text-sm font-medium opacity-80">Custo Médio/Usuário</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(costData.summary.avgCostPerUser)}
            </p>
            <p className="text-xs mt-2 opacity-70">
              Média across {costData.userCosts.length} usuários ativos
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-5 shadow-sm text-orange-900">
            <p className="text-sm font-medium opacity-80">Acima do Limite</p>
            <p className="text-3xl font-bold mt-1">
              {costData.summary.usersAboveThreshold}
            </p>
            <p className="text-xs mt-2 opacity-70">
              Usuários com anomalia de custo detectada
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {costData ? (
        <UserCostContent data={costData} />
      ) : (
        <div className="text-center py-20 text-slate-400">
          Dados de custos por usuário indisponíveis no momento.
        </div>
      )}
    </div>
  );
}