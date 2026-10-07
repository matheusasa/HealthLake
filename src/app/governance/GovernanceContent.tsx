"use client";

import { useState, useMemo } from "react";
import type { GovernanceTable } from "@/lib/governance-service";

const LAYER_COLORS: Record<string, string> = {
  raw: "bg-blue-100 text-blue-800 border-blue-200",
  staging: "bg-purple-100 text-purple-800 border-purple-200",
  curated: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  pública: "bg-green-100 text-green-800 border-green-200",
  interna: "bg-sky-100 text-sky-800 border-sky-200",
  confidencial: "bg-orange-100 text-orange-800 border-orange-200",
  restrita: "bg-red-100 text-red-800 border-red-200",
};

const LGPD_COLORS: Record<string, string> = {
  conforme: "bg-emerald-100 text-emerald-800 border-emerald-200",
  em_analise: "bg-amber-100 text-amber-800 border-amber-200",
  nao_conforme: "bg-red-100 text-red-800 border-red-200",
};

const LGPD_LABELS: Record<string, string> = {
  conforme: "Conforme",
  em_analise: "Em Análise",
  nao_conforme: "Não Conforme",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GovernanceContent({ tables }: { tables: GovernanceTable[] }) {
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<GovernanceTable | null>(null);

  const filtered = useMemo(() => {
    return tables.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.database.toLowerCase().includes(search.toLowerCase()) ||
        t.owner.toLowerCase().includes(search.toLowerCase());
      const matchesLayer = layerFilter === "all" || t.layer === layerFilter;
      return matchesSearch && matchesLayer;
    });
  }, [tables, search, layerFilter]);

  const owners = useMemo(() => {
    const map = new Map<string, number>();
    tables.forEach((t) => map.set(t.owner, (map.get(t.owner) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [tables]);

  return (
    <div className="space-y-6">
      {/* Data Owner Cards */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Responsáveis pelos Dados</h2>
          <p className="text-sm text-slate-500 mt-0.5">Distribuição de tabelas por equipe responsável</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {owners.map(([owner, count]) => (
              <div
                key={owner}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-teal-300 transition-colors"
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Equipe</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{owner}</p>
                <p className="text-2xl font-bold text-teal-600 mt-2">{count}</p>
                <p className="text-xs text-slate-400 mt-0.5">tabelas sob responsabilidade</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Catálogo de Tabelas</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} de {tables.length} tabelas exibidas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Buscar tabela, banco ou responsável..."
              aria-label="Buscar políticas"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full sm:w-64"
            />
            <select
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white w-full sm:w-auto"
            >
              <option value="all">Todas as Camadas</option>
              <option value="raw">Raw</option>
              <option value="staging">Staging</option>
              <option value="curated">Curated</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Nenhuma tabela encontrada para os filtros aplicados.
            </div>
          ) : (
            filtered.map((table) => (
              <div
                key={`${table.database}.${table.name}`}
                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setSelectedTable(selectedTable?.name === table.name ? null : table)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{table.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${LAYER_COLORS[table.layer]}`}>
                        {table.layer}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${CLASSIFICATION_COLORS[table.classification]}`}>
                        {table.classification}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${LGPD_COLORS[table.lgpdStatus]}`}>
                        LGPD: {LGPD_LABELS[table.lgpdStatus]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {table.database} &middot; {table.columns.length} colunas &middot; Responsável: {table.owner}
                    </p>
                    {table.piiFields.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-medium text-rose-600">PII:</span>
                        {table.piiFields.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-medium border border-rose-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 font-medium">Última atualização</p>
                    <p className="text-xs text-slate-600 mt-0.5">{formatDate(table.lastUpdated)}</p>
                  </div>
                </div>

                {/* Expanded Column Detail */}
                {selectedTable?.name === table.name && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Colunas da Tabela</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="pb-2 pr-4 font-semibold text-slate-600">Nome</th>
                            <th className="pb-2 pr-4 font-semibold text-slate-600">Tipo</th>
                            <th className="pb-2 pr-4 font-semibold text-slate-600">Descrição</th>
                            <th className="pb-2 font-semibold text-slate-600">Sensível</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {table.columns.map((col) => (
                            <tr key={col.name}>
                              <td className="py-1.5 pr-4 font-mono text-slate-800">{col.name}</td>
                              <td className="py-1.5 pr-4 text-slate-500">{col.type}</td>
                              <td className="py-1.5 pr-4 text-slate-600">{col.description}</td>
                              <td className="py-1.5">
                                {col.isSensitive ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-medium border border-rose-200">
                                    Sim
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Não</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}