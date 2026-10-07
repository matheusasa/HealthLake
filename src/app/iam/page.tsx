import { IamContent } from "./IamContent";
import type { ApiResponse } from "@/lib/types";
import type { IamData } from "@/lib/iam-service";

async function fetchData(): Promise<ApiResponse<IamData>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/iam`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error", isDemoMode: true };
  }
}

export default async function IamPage() {
  const res = await fetchData();
  const data = res.data;

  if (!data) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-semibold">Erro ao carregar dados de IAM</p>
          <p className="text-sm mt-1">{res.error || "Dados indisponíveis"}</p>
        </div>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IAM & Acessos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de identidades, mapeamento de acessos e controle de permissões aos dados
          </p>
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
          <p className="text-sm font-medium opacity-80">Usuários Ativos</p>
          <p className="text-3xl font-bold mt-1">
            {summary.activeUsers}
            <span className="text-base font-normal opacity-60"> / {summary.totalUsers}</span>
          </p>
          <p className="text-xs mt-2 opacity-70">Do total de usuários cadastrados</p>
        </div>
        <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-5 shadow-sm text-emerald-900">
          <p className="text-sm font-medium opacity-80">Grupos de Acesso</p>
          <p className="text-3xl font-bold mt-1">{summary.totalGroups}</p>
          <p className="text-xs mt-2 opacity-70">Grupos configurados no IAM</p>
        </div>
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 shadow-sm text-amber-900">
          <p className="text-sm font-medium opacity-80">Chaves de Serviço</p>
          <p className="text-3xl font-bold mt-1">{summary.activeServiceKeys}</p>
          <p className="text-xs mt-2 opacity-70">Service keys ativas</p>
        </div>
        <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 p-5 shadow-sm text-rose-900">
          <p className="text-sm font-medium opacity-80">Sem MFA</p>
          <p className="text-3xl font-bold mt-1">{summary.usersWithoutMfa}</p>
          <p className="text-xs mt-2 opacity-70">Usuários sem autenticação multifator</p>
        </div>
      </div>

      {/* Main Content */}
      <IamContent data={data} />
    </div>
  );
}