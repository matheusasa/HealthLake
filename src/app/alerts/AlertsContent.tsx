"use client";

import { useState } from "react";
import type { Alert, NotificationChannel, AlertSeverity } from "@/lib/alerts-service";

interface Props {
  alerts: Alert[];
  channels: NotificationChannel[];
}

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical: {
    label: "Crítico",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  warning: {
    label: "Alerta",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  info: {
    label: "Info",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
};

const SOURCE_ICONS: Record<string, string> = {
  "Atualização de Dados": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  "Qualidade de Dados": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "Armazenamento": "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  "Jobs ETL": "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  "FinOps & Custos": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

type FilterSeverity = "all" | AlertSeverity;

export function AlertsContent({ alerts, channels }: Props) {
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>("all");
  const [filterAcknowledged, setFilterAcknowledged] = useState<"all" | "acknowledged" | "unacknowledged">("all");
  const [channelStates, setChannelStates] = useState<Record<string, boolean>>(
    Object.fromEntries(channels.map((c) => [c.id, c.enabled]))
  );

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
    if (filterAcknowledged === "acknowledged" && !a.acknowledged) return false;
    if (filterAcknowledged === "unacknowledged" && a.acknowledged) return false;
    return true;
  });

  const toggleChannel = (id: string) => {
    setChannelStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTimestamp = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (iso: string): string => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / 3600000);
    if (hours < 1) return "há menos de 1h";
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `há ${days}d`;
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Filtros</h2>
          <p className="text-sm text-slate-500 mt-0.5">Refine os alertas por severidade e status de reconhecimento</p>
        </div>
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Severidade</label>
            <div className="flex flex-wrap gap-1">
              {(["all", "critical", "warning", "info"] as FilterSeverity[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  aria-pressed={filterSeverity === s}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filterSeverity === s
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "all" ? "Todos" : SEVERITY_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
            <div className="flex flex-wrap gap-1">
              {([
                { key: "all", label: "Todos" },
                { key: "unacknowledged", label: "Pendentes" },
                { key: "acknowledged", label: "Reconhecidos" },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFilterAcknowledged(opt.key)}
                  aria-pressed={filterAcknowledged === opt.key}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filterAcknowledged === opt.key
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:ml-auto text-xs text-slate-400">
            Exibindo {filtered.length} de {alerts.length} alertas
          </div>
        </div>
      </section>

      {/* Timeline Alert List */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Linha do Tempo de Alertas</h2>
          <p className="text-sm text-slate-500 mt-0.5">Eventos ordenados cronologicamente com detalhes completos</p>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm font-medium">Nenhum alerta encontrado</p>
              <p className="text-xs mt-1">Ajuste os filtros para ver mais resultados</p>
            </div>
          ) : (
            filtered.map((alert) => {
              const sevCfg = SEVERITY_CONFIG[alert.severity];
              const iconPath = SOURCE_ICONS[alert.source] || "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
              return (
                <div
                  key={alert.id}
                  className={`relative px-6 py-5 transition-colors hover:bg-slate-50 ${
                    !alert.acknowledged ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  {/* Left severity stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${sevCfg.dot}`} />

                  <div className="flex items-start gap-4">
                    {/* Source icon */}
                    <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg ${sevCfg.bg} flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${sevCfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${sevCfg.bg} ${sevCfg.text} ${sevCfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sevCfg.dot}`} />
                          {sevCfg.label}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{alert.id}</span>
                        {!alert.acknowledged && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                            Pendente
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-semibold ${!alert.acknowledged ? "text-slate-900" : "text-slate-600"}`}>
                        {alert.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTimestamp(alert.timestamp)} ({timeAgo(alert.timestamp)})
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {alert.source}
                        </span>
                        <span className="flex items-center gap-1 uppercase">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          {alert.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Notification Channels Configuration */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Canais de Notificação</h2>
          <p className="text-sm text-slate-500 mt-0.5">Configure os canais de entrega dos alertas (interface demonstrativa)</p>
        </div>
        <div className="p-6 space-y-4">
          {channels.map((ch) => {
            const isActive = channelStates[ch.id] ?? ch.enabled;
            const typeLabels: Record<string, string> = { sns: "AWS SNS", slack: "Slack", teams: "Microsoft Teams" };
            const typeColors: Record<string, string> = {
              sns: "bg-orange-50 text-orange-700 border-orange-200",
              slack: "bg-purple-50 text-purple-700 border-purple-200",
              teams: "bg-indigo-50 text-indigo-700 border-indigo-200",
            };
            return (
              <div
                key={ch.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${typeColors[ch.type]}`}>
                    {typeLabels[ch.type]}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${isActive ? "text-slate-800" : "text-slate-500"}`}>{ch.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{ch.target}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel(ch.id)}
                  role="switch"
                  aria-checked={isActive}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isActive ? "bg-teal-500" : "bg-slate-300"
                  }`}
                  aria-label={`Alternar canal ${ch.name}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
          <div className="pt-2 text-xs text-slate-400 italic">
            As configurações de canal são apenas demonstrativas nesta versão. Em produção, integra com AWS SNS, Slack Webhooks e Microsoft Teams Connectors.
          </div>
        </div>
      </section>
    </div>
  );
}