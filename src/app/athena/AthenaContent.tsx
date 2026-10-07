"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AthenaAnalytics } from "@/lib/athena-service";

interface Props {
  data: AthenaAnalytics;
}

const PRIORITY_STYLES = {
  high: "border-red-500 bg-red-50 text-red-900",
  medium: "border-amber-500 bg-amber-50 text-amber-900",
  low: "border-blue-500 bg-blue-50 text-blue-900",
};

const PRIORITY_LABELS = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export function AthenaContent({ data }: Props) {
  const dailyChartData = data.dailyVolume.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    consultas: d.queryCount,
    custo: d.totalCost,
  }));

  const tableChartData = data.tableAccess
    .slice(0, 6)
    .map((t) => ({
      tabela: t.tableName.split(".").pop() || t.tableName,
      acessos: t.accessCount,
    }));

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">Consultas (30d)</p>
          <p className="text-3xl font-bold mt-1">
            {data.summary.totalQueries30d.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs mt-2 opacity-70">Total de queries executadas</p>
        </div>

        <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-5 shadow-sm text-cyan-900">
          <p className="text-sm font-medium opacity-80">Custo Total (30d)</p>
          <p className="text-3xl font-bold mt-1">
            {formatCurrency(data.summary.totalCost30d)}
          </p>
          <p className="text-xs mt-2 opacity-70">Gasto acumulado no período</p>
        </div>

        <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-5 shadow-sm text-indigo-900">
          <p className="text-sm font-medium opacity-80">Custo Médio / Query</p>
          <p className="text-3xl font-bold mt-1">
            {formatCurrency(data.summary.avgQueryCost)}
          </p>
          <p className="text-xs mt-2 opacity-70">Média por consulta executada</p>
        </div>

        <div className="rounded-lg border-l-4 border-violet-500 bg-violet-50 p-5 shadow-sm text-violet-900">
          <p className="text-sm font-medium opacity-80">Dados Escaneados</p>
          <p className="text-3xl font-bold mt-1">
            {formatBytes(data.summary.totalBytesScanned30d)}
          </p>
          <p className="text-xs mt-2 opacity-70">Volume total processado</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Daily Query Volume */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Volume Diário de Consultas
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Quantidade de queries e custo nos últimos 30 dias
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[250px] sm:h-[300px] lg:h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyChartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => {
                      const num = typeof value === "number" ? value : 0;
                      return [
                        name === "custo" ? formatCurrency(num) : num.toLocaleString("pt-BR"),
                        name === "custo" ? "Custo" : "Consultas",
                      ];
                    }}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="consultas"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorQueries)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Most Accessed Tables Bar Chart */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Tabelas Mais Acessadas
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Top 6 tabelas por número de consultas
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[250px] sm:h-[300px] lg:h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tableChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="tabela"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => {
                      const num = typeof value === "number" ? value : 0;
                      return [num.toLocaleString("pt-BR"), "Acessos"];
                    }}
                  />
                  <Bar dataKey="acessos" fill="#0891b2" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* Top Expensive Queries Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Top 10 Queries Mais Custosas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Ranking das consultas com maior custo no período
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 sm:px-6 py-3 font-medium">#</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Query ID</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Tabela</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">Bytes Escaneados</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">Duração</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...data.topQueries]
                .sort((a, b) => b.costUSD - a.costUSD)
                .map((q, i) => (
                  <tr key={q.queryId} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 text-slate-500 font-mono">{i + 1}</td>
                    <td className="px-4 sm:px-6 py-3 font-mono text-xs text-slate-600 truncate max-w-[150px] sm:max-w-none">
                      {q.queryId}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 truncate max-w-[150px] sm:max-w-none">
                        {q.database}.{q.table}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right text-slate-600 font-mono">
                      {formatBytes(q.bytesScanned)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right text-slate-600 font-mono">
                      {(q.executionTimeMs / 1000).toFixed(1)}s
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right font-mono font-medium text-teal-700">
                      {formatCurrency(q.costUSD)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Optimization Recommendations */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Recomendações de Otimização
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Sugestões para reduzir custos e melhorar performance das consultas
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recommendations.map((rec, i) => (
            <div
              key={i}
              className={`rounded-lg border-l-4 p-4 ${PRIORITY_STYLES[rec.priority]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  {rec.type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50">
                  Prioridade {PRIORITY_LABELS[rec.priority]}
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-2">{rec.title}</h3>
              <p className="text-xs opacity-80 leading-relaxed mb-3">
                {rec.description}
              </p>
              <p className="text-xs font-bold">
                Economia estimada: {rec.estimatedSavings}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 2 ? 1 : 0)} ${units[i]}`;
}