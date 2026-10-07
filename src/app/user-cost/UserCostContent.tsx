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
  AreaChart,
  Area,
  Cell,
} from "recharts";
import type { UserCostAnalytics, UserCostEntry } from "@/lib/user-cost-service";

interface Props {
  data: UserCostAnalytics;
}

const GROUP_COLORS: Record<string, string> = {
  Analytics: "#0d9488",
  "Engenharia de Dados": "#0891b2",
  "Externo (Parceiro)": "#f97316",
  "Equipe Clínica": "#6366f1",
  Compliance: "#8b5cf6",
};

type SortKey = keyof UserCostEntry;
type SortDir = "asc" | "desc";

export function UserCostContent({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalCostUSD");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedUsers = useMemo(() => {
    const users = [...data.userCosts];
    users.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === "desc"
        ? bStr.localeCompare(aStr)
        : aStr.localeCompare(bStr);
    });
    return users;
  }, [data.userCosts, sortKey, sortDir]);

  const barData = useMemo(() => {
    return [...data.userCosts]
      .sort((a, b) => b.totalCostUSD - a.totalCostUSD)
      .map((u) => ({
        name: u.userName,
        custo: u.totalCostUSD,
        group: u.groupName,
        isAnomaly: u.isAnomaly,
      }));
  }, [data.userCosts]);

  const dailyAggregated = useMemo(() => {
    const byDate: Record<string, number> = {};
    for (const entry of data.dailyTrends) {
      byDate[entry.date] = (byDate[entry.date] || 0) + entry.cost;
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        custo: Math.round(cost * 100) / 100,
      }));
  }, [data.dailyTrends]);

  const anomalyUsers = data.userCosts.filter((u) => u.isAnomaly);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "desc" ? " ↓" : " ↑";
  }

  return (
    <div className="space-y-8">
      {/* Ranking de Custos por Usuário */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Ranking de Custos por Usuário
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Usuários ordenados por custo total — barras coloridas por grupo, anomalias destacadas
          </p>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
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
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Custo Total"]}
                  labelFormatter={(label) => `Usuário: ${String(label ?? "")}`}
                />
                <Bar dataKey="custo" radius={[0, 4, 4, 0]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GROUP_COLORS[entry.group] || "#94a3b8"}
                      stroke={entry.isAnomaly ? "#ef4444" : "none"}
                      strokeWidth={entry.isAnomaly ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 px-2">
            {Object.entries(GROUP_COLORS).map(([group, color]) => (
              <div key={group} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                {group}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-3 rounded-sm border-2 border-red-500" />
              Anomalia
            </div>
          </div>
        </div>
      </section>

      {/* Tendência Diária */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Tendência Diária
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Custo agregado diário nos últimos 30 dias
          </p>
        </div>
        <div className="p-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyAggregated} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDailyCost" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Custo Agregado"]}
                  labelFormatter={(label) => `Data: ${String(label ?? "")}`}
                />
                <Area
                  type="monotone"
                  dataKey="custo"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDailyCost)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Custo por Grupo */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Custo por Grupo
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Resumo de gastos por equipe com destaque para o maior consumidor
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.groupSummaries.map((group) => (
            <div
              key={group.groupId}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: GROUP_COLORS[group.groupName] || "#94a3b8" }}
                />
                <h3 className="font-semibold text-slate-800">{group.groupName}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Custo Total</span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatCurrency(group.totalCostUSD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Média/Usuário</span>
                  <span className="font-mono text-slate-600">
                    {formatCurrency(group.avgCostPerUser)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Membros</span>
                  <span className="text-slate-600">{group.memberCount}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-xs">Maior consumidor: </span>
                  <Link
                    href={`/audit?user=${group.topSpenderId}`}
                    className="text-teal-600 hover:text-teal-700 text-xs font-medium underline"
                  >
                    {group.topSpenderName}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabela Detalhada */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Tabela Detalhada
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Custos desagregados por serviço e usuário — clique nos cabeçalhos para ordenar
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th
                  className="px-6 py-3 font-medium cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("userName")}
                >
                  Usuário{sortIndicator("userName")}
                </th>
                <th
                  className="px-6 py-3 font-medium cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("groupName")}
                >
                  Grupo{sortIndicator("groupName")}
                </th>
                <th
                  className="px-6 py-3 font-medium text-right cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("athenaCostUSD")}
                >
                  Athena{sortIndicator("athenaCostUSD")}
                </th>
                <th
                  className="px-6 py-3 font-medium text-right cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("s3CostUSD")}
                >
                  S3{sortIndicator("s3CostUSD")}
                </th>
                <th
                  className="px-6 py-3 font-medium text-right cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("glueCostUSD")}
                >
                  Glue{sortIndicator("glueCostUSD")}
                </th>
                <th
                  className="px-6 py-3 font-medium text-right cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("totalCostUSD")}
                >
                  Total{sortIndicator("totalCostUSD")}
                </th>
                <th
                  className="px-6 py-3 font-medium text-right cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("queryCount")}
                >
                  Queries{sortIndicator("queryCount")}
                </th>
                <th
                  className="px-6 py-3 font-medium text-right cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => handleSort("costPerQuery")}
                >
                  Custo/Query{sortIndicator("costPerQuery")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.map((user) => (
                <tr
                  key={user.userId}
                  className={`group hover:bg-slate-50 transition-colors ${
                    user.isAnomaly ? "bg-red-50/50" : ""
                  }`}
                >
                  <td className="px-6 py-3">
                    <Link
                      href={`/audit?user=${user.userId}`}
                      className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      {user.userName}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: GROUP_COLORS[user.groupName] || "#94a3b8" }}
                      />
                      {user.groupName}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-600">
                    {formatCurrency(user.athenaCostUSD)}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-600">
                    {formatCurrency(user.s3CostUSD)}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-600">
                    {formatCurrency(user.glueCostUSD)}
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-medium text-slate-800">
                    {formatCurrency(user.totalCostUSD)}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    {user.queryCount.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-slate-600">
                    ${user.costPerQuery.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alertas de Anomalia */}
      {anomalyUsers.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Alertas de Anomalia
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Usuários com padrões de custo fora do esperado — requerem investigação
            </p>
          </div>
          <div className="p-6 space-y-4">
            {anomalyUsers.map((user) => (
              <div
                key={user.userId}
                className={`rounded-lg border-l-4 p-4 ${
                  user.groupName === "Externo (Parceiro)"
                    ? "border-orange-500 bg-orange-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {user.userName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                      {user.groupName}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium text-slate-700">
                    {formatCurrency(user.totalCostUSD)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {user.anomalyReason}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/audit?user=${user.userId}`}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Ver auditoria do usuário →
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}