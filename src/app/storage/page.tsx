import { StorageChart } from "../components/StorageChart";
import type { ApiResponse, StorageSummary } from "@/lib/types";

async function fetchData(): Promise<ApiResponse<StorageSummary>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/storage`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error", isDemoMode: true };
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export default async function StoragePage() {
  const res = await fetchData();
  const data = res.data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Armazenamento</h1>
          <p className="text-sm text-slate-500 mt-1">Análise de crescimento e distribuição do datalake</p>
        </div>
        {res.isDemoMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Modo Demonstração
          </span>
        )}
      </div>

      {/* KPI Summary */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
            <p className="text-sm font-medium opacity-80">Tamanho Total</p>
            <p className="text-3xl font-bold mt-1">{formatBytes(data.totalSizeBytes)}</p>
            <p className="text-xs mt-2 opacity-70">Dados armazenados no lake</p>
          </div>
          <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-5 shadow-sm text-cyan-900">
            <p className="text-sm font-medium opacity-80">Total de Arquivos</p>
            <p className="text-3xl font-bold mt-1">{data.totalFiles.toLocaleString("pt-BR")}</p>
            <p className="text-xs mt-2 opacity-70">Objetos catalogados</p>
          </div>
          <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-5 shadow-sm text-indigo-900">
            <p className="text-sm font-medium opacity-80">Camadas</p>
            <p className="text-3xl font-bold mt-1">{data.layers.length}</p>
            <p className="text-xs mt-2 opacity-70">Raw, Staging, Curated</p>
          </div>
        </div>
      )}

      {/* Growth Chart */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Tendência de Crescimento</h2>
          <p className="text-sm text-slate-500 mt-0.5">Evolução do tamanho nos últimos 30 dias</p>
        </div>
        <div className="p-6">
          <StorageChart summary={data} />
        </div>
      </section>

      {/* Layer Breakdown */}
      {data && data.layers.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Distribuição por Camada</h2>
            <p className="text-sm text-slate-500 mt-0.5">Detalhamento de tamanho e arquivos por camada</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-3 font-medium">Camada</th>
                  <th className="px-6 py-3 font-medium text-right">Tamanho</th>
                  <th className="px-6 py-3 font-medium text-right">Arquivos</th>
                  <th className="px-6 py-3 font-medium">Principais Formatos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.layers.map((layer) => (
                  <tr key={layer.layer} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700 capitalize">{layer.layer}</td>
                    <td className="px-6 py-3 text-right text-slate-600 font-mono">{formatBytes(layer.sizeBytes)}</td>
                    <td className="px-6 py-3 text-right text-slate-600">{layer.fileCount.toLocaleString("pt-BR")}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {Object.entries(layer.formats)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 2)
                        .map(([fmt]) => fmt.toUpperCase())
                        .join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}