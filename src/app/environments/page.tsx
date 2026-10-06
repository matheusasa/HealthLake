import { EnvironmentsContent } from "./EnvironmentsContent";
import type { ApiResponse } from "@/lib/types";
import type { EnvironmentsSummary } from "@/lib/environments-service";

async function fetchEnvironments(): Promise<ApiResponse<EnvironmentsSummary>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/environments`, { cache: "no-store" });
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

export default async function EnvironmentsPage() {
  const envRes = await fetchEnvironments();
  const envData = envRes.data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Multi-Ambientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Comparação de saúde entre ambientes do datalake
          </p>
        </div>
        {envRes.isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Modo Demonstração
          </span>
        )}
      </div>

      {/* Error Banner */}
      {envRes.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Erro ao carregar dados dos ambientes: {envRes.error}
          </p>
        </div>
      )}

      {/* Content */}
      {envData ? (
        <EnvironmentsContent data={envData} />
      ) : (
        <div className="text-center py-20 text-slate-400">
          Dados dos ambientes indisponíveis no momento.
        </div>
      )}
    </div>
  );
}