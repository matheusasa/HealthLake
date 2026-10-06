import { LineageContent } from "./LineageContent";
import type { ApiResponse } from "@/lib/types";
import type { LineageGraph } from "@/lib/lineage-service";

async function fetchLineage(): Promise<ApiResponse<LineageGraph>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/lineage`, { cache: "no-store" });
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

export default async function LineagePage() {
  const lineageRes = await fetchLineage();
  const lineageData = lineageRes.data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Linhagem de Dados</h1>
          <p className="text-sm text-slate-500 mt-1">
            Rastreamento visual do fluxo de dados entre camadas do datalake
          </p>
        </div>
        {lineageRes.isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Modo Demonstração
          </span>
        )}
      </div>

      {/* Error Banner */}
      {lineageRes.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Erro ao carregar linhagem de dados: {lineageRes.error}
          </p>
        </div>
      )}

      {/* Content */}
      {lineageData ? (
        <LineageContent data={lineageData} />
      ) : (
        <div className="text-center py-20 text-slate-400">
          Dados de linhagem indisponíveis no momento.
        </div>
      )}
    </div>
  );
}