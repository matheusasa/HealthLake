"use client";

import type { GlueJob } from "@/lib/types";

interface Props {
  jobs: GlueJob[];
}

export function GlueJobsPanel({ jobs }: Props) {
  if (jobs.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum job do Glue encontrado.</p>;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const lastRun = job.recentRuns[0];
        const hasRecentFailure = job.recentRuns.some(
          (r) =>
            r.status === "FAILED" &&
            r.startedAt &&
            Date.now() - new Date(r.startedAt).getTime() < 86400000
        );

        return (
          <div
            key={job.name}
            className={`rounded-lg border p-4 ${
              hasRecentFailure
                ? "border-red-200 bg-red-50/50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-slate-800">{job.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {job.type} • {job.state}
                </p>
              </div>
              {lastRun && <RunStatusBadge status={lastRun.status} />}
            </div>

            {lastRun && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>
                  Início:{" "}
                  {lastRun.startedAt
                    ? new Date(lastRun.startedAt).toLocaleString("pt-BR")
                    : "—"}
                </span>
                <span>
                  Duração:{" "}
                  {lastRun.durationSeconds != null
                    ? `${Math.round(lastRun.durationSeconds / 60)}min`
                    : "—"}
                </span>
              </div>
            )}

            {hasRecentFailure &&
              job.recentRuns
                .filter((r) => r.status === "FAILED" && r.errorMessage)
                .slice(0, 1)
                .map((r) => (
                  <div
                    key={r.id}
                    className="mt-2 rounded bg-red-100 px-3 py-2 text-xs text-red-800"
                  >
                    <span className="font-semibold">Erro:</span>{" "}
                    {r.errorMessage}
                  </div>
                ))}
          </div>
        );
      })}
    </div>
  );
}

function RunStatusBadge({
  status,
}: {
  status: GlueJob["recentRuns"][number]["status"];
}) {
  const styles: Record<string, string> = {
    SUCCEEDED: "bg-teal-100 text-teal-800",
    FAILED: "bg-red-100 text-red-800",
    RUNNING: "bg-blue-100 text-blue-800",
    STOPPED: "bg-slate-100 text-slate-700",
    WAITING: "bg-amber-100 text-amber-800",
  };

  const labels: Record<string, string> = {
    SUCCEEDED: "Sucesso",
    FAILED: "Falha",
    RUNNING: "Rodando",
    STOPPED: "Parado",
    WAITING: "Aguardando",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        styles[status] || styles.STOPPED
      }`}
    >
      {labels[status] || status}
    </span>
  );
}