"use client";

import type { QualityMetric } from "@/lib/types";

interface Props {
  metrics: QualityMetric[];
}

export function QualityMetrics({ metrics }: Props) {
  if (metrics.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma verificação de qualidade configurada.</p>;
  }

  return (
    <div className="space-y-4">
      {metrics.map((m) => (
        <div
          key={m.rule}
          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4"
        >
          <div>
            <p className="font-medium text-slate-800">{m.rule}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.dataset}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm font-mono text-slate-700">
                {m.value.toFixed(1)}%
              </span>
              <StatusDot status={m.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Limite: {m.threshold.toFixed(1)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusDot({ status }: { status: QualityMetric["status"] }) {
  const colors = {
    pass: "bg-teal-500",
    warn: "bg-amber-500",
    fail: "bg-red-500",
  };

  const labels = {
    pass: "Aprovado",
    warn: "Alerta",
    fail: "Falha",
  };

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`}
      title={labels[status]}
    />
  );
}