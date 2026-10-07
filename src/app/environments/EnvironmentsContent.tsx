"use client";

import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { EnvironmentsSummary, Environment } from "@/lib/environments-service";

interface Props {
  data: EnvironmentsSummary;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} TB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} GB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} MB`;
  return `${bytes} B`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function statusColor(status: Environment["status"]): string {
  switch (status) {
    case "healthy":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "warning":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
  }
}

function statusLabel(status: Environment["status"]): string {
  switch (status) {
    case "healthy":
      return "Saudável";
    case "warning":
      return "Atenção";
    case "critical":
      return "Crítico";
  }
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-amber-600";
  return "text-red-600";
}

export function EnvironmentsContent({ data }: Props) {
  const [selectedEnv, setSelectedEnv] = useState<string>("all");

  const radarData = data.comparison
    .filter((m) => m.unit === "%")
    .map((m) => ({
      metric: m.metric,
      Dev: m.dev,
      Staging: m.staging,
      Prod: m.prod,
    }));

  const envColors: Record<string, string> = {
    Desenvolvimento: "border-blue-200 bg-blue-50/50",
    Staging: "border-violet-200 bg-violet-50/50",
    Produção: "border-emerald-200 bg-emerald-50/50",
  };

  const envAccent: Record<string, string> = {
    Desenvolvimento: "bg-blue-500",
    Staging: "bg-violet-500",
    Produção: "bg-emerald-500",
  };

  return (
    <div className="space-y-8">
      {/* Environment Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label htmlFor="env-select" className="text-sm font-medium text-slate-700">
          Filtrar por ambiente:
        </label>
        <select
          id="env-select"
          value={selectedEnv}
          onChange={(e) => setSelectedEnv(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 w-full sm:w-auto"
        >
          <option value="all">Todos os Ambientes</option>
          {data.environments.map((env) => (
            <option key={env.accountId} value={env.name}>
              {env.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400 italic">
          (Filtro global para outros módulos — em breve)
        </span>
      </div>

      {/* Environment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {data.environments
          .filter((env) => selectedEnv === "all" || env.name === selectedEnv)
          .map((env) => (
            <div
              key={env.accountId}
              className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${envColors[env.name] || "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${envAccent[env.name] || "bg-slate-400"}`} />
                  <h3 className="text-base font-bold text-slate-900">{env.name}</h3>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor(env.status)}`}
                >
                  {statusLabel(env.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Conta AWS</span>
                  <span className="text-xs font-mono text-slate-700">{env.accountId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Região</span>
                  <span className="text-xs font-medium text-slate-700">{env.region}</span>
                </div>

                <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Atualização</span>
                    <span className={`text-sm font-bold ${scoreColor(env.freshnessScore)}`}>
                      {env.freshnessScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Qualidade</span>
                    <span className={`text-sm font-bold ${scoreColor(env.qualityScore)}`}>
                      {env.qualityScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Armazenamento</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formatBytes(env.storageSizeBytes)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Sucesso ETL</span>
                    <span className={`text-sm font-bold ${scoreColor(env.jobSuccessRate)}`}>
                      {env.jobSuccessRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Custo Mensal</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formatCurrency(env.monthlyCostUSD)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-2 mt-2">
                  <p className="text-[10px] text-slate-400">
                    Última sincronização: {formatDate(env.lastSync)}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Radar Chart Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Comparativo de Saúde</h2>
        <p className="text-xs text-slate-500 mb-6">
          Visão radial das métricas percentuais entre ambientes
        </p>
        <div className="h-[280px] sm:h-[340px] lg:h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Dev"
                dataKey="Dev"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name="Staging"
                dataKey="Staging"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name="Prod"
                dataKey="Prod"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}%`, undefined]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Diff View Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Diferenças entre Ambientes</h2>
        <p className="text-xs text-slate-500 mb-4">
          Comparação lado a lado com destaque para divergências significativas
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Métrica
                </th>
                <th className="text-right py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Dev
                </th>
                <th className="text-right py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider text-violet-600">
                  Staging
                </th>
                <th className="text-right py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Prod
                </th>
                <th className="text-right py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Maior Diferença
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.comparison.map((row) => {
                const values = [row.dev, row.staging, row.prod];
                const maxDiff = Math.max(...values) - Math.min(...values);
                const isSignificant =
                  row.unit === "%" ? maxDiff > 15 : maxDiff > Math.min(...values) * 0.5;

                return (
                  <tr
                    key={row.metric}
                    className={isSignificant ? "bg-amber-50/40" : ""}
                  >
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {row.metric}
                      {isSignificant && (
                        <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-400" title="Diferença significativa" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {row.unit === "USD"
                        ? formatCurrency(row.dev)
                        : `${row.dev}${row.unit === "%" ? "%" : ` ${row.unit}`}`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {row.unit === "USD"
                        ? formatCurrency(row.staging)
                        : `${row.staging}${row.unit === "%" ? "%" : ` ${row.unit}`}`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {row.unit === "USD"
                        ? formatCurrency(row.prod)
                        : `${row.prod}${row.unit === "%" ? "%" : ` ${row.unit}`}`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          isSignificant
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {row.unit === "USD"
                          ? formatCurrency(maxDiff)
                          : `${maxDiff.toFixed(1)}${row.unit === "%" ? "%" : ` ${row.unit}`}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          Linhas destacadas indicam diferença superior a 15% (percentuais) ou 50% (valores absolutos)
        </div>
      </div>
    </div>
  );
}