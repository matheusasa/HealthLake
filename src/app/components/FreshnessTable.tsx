"use client";

import type { DatasetFreshness } from "@/lib/types";

interface Props {
  datasets: DatasetFreshness[];
}

export function FreshnessTable({ datasets }: Props) {
  if (datasets.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum dataset encontrado.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="pb-3 font-medium">Dataset</th>
            <th className="pb-3 font-medium hidden sm:table-cell">Última Atualização</th>
            <th className="pb-3 font-medium">Atraso</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {datasets.map((d) => (
            <tr key={d.dataset} className="group hover:bg-slate-50 transition-colors">
              <td className="py-3 font-medium text-slate-700">{d.dataset}</td>
              <td className="py-3 text-slate-600 hidden sm:table-cell">
                {new Date(d.lastUpdated).toLocaleString("pt-BR")}
              </td>
              <td className="py-3 text-slate-600">{d.delayHours}h</td>
              <td className="py-3">
                <StatusBadge status={d.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: DatasetFreshness["status"] }) {
  const styles = {
    healthy: "bg-teal-100 text-teal-800",
    warning: "bg-amber-100 text-amber-800",
    critical: "bg-red-100 text-red-800",
  };

  const labels = {
    healthy: "No Prazo",
    warning: "Em Risco",
    critical: "Atrasado",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      <span className="sr-only">{labels[status]}</span>
      {labels[status]}
    </span>
  );
}