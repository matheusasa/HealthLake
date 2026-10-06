"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type {
  AuditAnalytics,
  AuditEvent,
  AuditSeverity,
  AuditSource,
} from "@/lib/audit-service";

const SEVERITY_COLORS: Record<AuditSeverity, string> = {
  info: "bg-teal-100 text-teal-800",
  warning: "bg-amber-100 text-amber-800",
  critical: "bg-rose-100 text-rose-800",
};

const ACTION_LABELS: Record<string, string> = {
  query: "Consulta",
  access_denied: "Acesso Negado",
  data_export: "Exportação",
  schema_change: "Alteração de Schema",
  permission_change: "Mudança de Permissão",
  login_failure: "Falha de Login",
  role_assumed: "Role Assumida",
};

const SOURCE_OPTIONS: { value: AuditSource | ""; label: string }[] = [
  { value: "", label: "Todas as fontes" },
  { value: "athena", label: "Athena" },
  { value: "glue", label: "Glue" },
  { value: "s3", label: "S3" },
  { value: "iam", label: "IAM" },
  { value: "lakeformation", label: "Lake Formation" },
];

const SEVERITY_OPTIONS: { value: AuditSeverity | ""; label: string }[] = [
  { value: "", label: "Todas as severidades" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditContent({ data }: { data: AuditAnalytics }) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "">("");
  const [sourceFilter, setSourceFilter] = useState<AuditSource | "">("");

  const filteredEvents = useMemo(() => {
    return data.events.filter((e: AuditEvent) => {
      if (severityFilter && e.severity !== severityFilter) return false;
      if (sourceFilter && e.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          e.userName,
          e.resource,
          e.details,
          e.action,
          e.userId,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data.events, search, severityFilter, sourceFilter]);

  const chartData = useMemo(() => {
    return data.userSummaries.map((u) => ({
      name: u.userName,
      total: u.totalEvents,
      critical: u.criticalCount,
      ratio: u.totalEvents > 0 ? u.criticalCount / u.totalEvents : 0,
    }));
  }, [data.userSummaries]);

  const anomalyUsers = useMemo(
    () => data.userSummaries.filter((u) => u.anomalyCount > 0),
    [data.userSummaries]
  );

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por usuário, recurso ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <select
          value={severityFilter}
          onChange={(e) =>
            setSeverityFilter(e.target.value as AuditSeverity | "")
          }
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        >
          {SEVERITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value as AuditSource | "")
          }
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        >
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline de Eventos */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Timeline de Eventos
        </h2>
        <div className="space-y-3">
          {filteredEvents.length === 0 && (
            <p className="text-sm text-slate-500 italic">
              Nenhum evento encontrado para os filtros selecionados.
            </p>
          )}
          {filteredEvents.map((event: AuditEvent) => (
            <div
              key={event.id}
              className={`rounded-lg border p-4 shadow-sm ${
                event.isAnomaly
                  ? "border-l-4 border-l-rose-500 border-slate-200 bg-rose-50/30"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-slate-500 font-mono">
                  {formatTimestamp(event.timestamp)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  {event.userName}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[event.severity]}`}
                >
                  {ACTION_LABELS[event.action] || event.action}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {event.resource}
                </span>
              </div>
              <p className="text-sm text-slate-700">{event.details}</p>
              {event.isAnomaly && event.anomalyReason && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-100 text-rose-800 text-xs font-medium">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Anomalia: {event.anomalyReason}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Heatmap de Atividade por Usuário */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Atividade por Usuário
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value,
                  name === "total" ? "Total de Eventos" : "Eventos Críticos",
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.ratio > 0.5
                        ? "#f43f5e"
                        : entry.ratio > 0
                          ? "#f97316"
                          : "#14b8a6"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-4 justify-center text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-teal-500" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-orange-500" /> Com críticos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-rose-500" /> Maioria crítica
            </span>
          </div>
        </div>
      </section>

      {/* Usuários com Anomalias */}
      {anomalyUsers.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Usuários com Anomalias
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalyUsers.map((user) => (
              <div
                key={user.userId}
                className="rounded-lg border border-rose-200 bg-rose-50/50 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">
                    {user.userName}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {user.userId}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {user.totalEvents}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      Eventos
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-rose-600">
                      {user.criticalCount}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      Críticos
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {user.anomalyCount}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      Anomalias
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/iam?user=${user.userId}`}
                    className="flex-1 text-center rounded-md bg-white border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Ver IAM
                  </Link>
                  <Link
                    href={`/user-cost?user=${user.userId}`}
                    className="flex-1 text-center rounded-md bg-white border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Ver Custos
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}