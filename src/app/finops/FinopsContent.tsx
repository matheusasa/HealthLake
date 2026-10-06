"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { CostSummary } from "./page";

interface Props {
  data: CostSummary;
}

const PIE_COLORS = ["#0d9488", "#0891b2", "#6366f1", "#8b5cf6", "#94a3b8"];

export function FinopsContent({ data }: Props) {
  const dailyData = data.dailyTrend.map((d) => ({
    date: new Date(d.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    custo: d.amount,
  }));

  const budgetUsage = data.budgetLimit
    ? Math.round((data.totalSpend / data.budgetLimit) * 100)
    : null;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-5 shadow-sm text-teal-900">
          <p className="text-sm font-medium opacity-80">Gasto Total (30d)</p>
          <p className="text-3xl font-bold mt-1">
            {formatCurrency(data.totalSpend, data.currency)}
          </p>
          <p className="text-xs mt-2 opacity-70">
            Período: {new Date(data.periodStart).toLocaleDateString("pt-BR")} -{" "}
            {new Date(data.periodEnd).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-5 shadow-sm text-cyan-900">
          <p className="text-sm font-medium opacity-80">Previsão Mensal</p>
          <p className="text-3xl font-bold mt-1">
            {formatCurrency(data.forecast, data.currency)}
          </p>
          <p className="text-xs mt-2 opacity-70">
            Tendência baseada nos últimos 30 dias
          </p>
        </div>

        <div
          className={`rounded-lg border-l-4 p-5 shadow-sm ${
            budgetUsage && budgetUsage > 90
              ? "border-red-500 bg-red-50 text-red-900"
              : budgetUsage && budgetUsage > 70
              ? "border-amber-500 bg-amber-50 text-amber-900"
              : "border-emerald-500 bg-emerald-50 text-emerald-900"
          }`}
        >
          <p className="text-sm font-medium opacity-80">Orçamento Utilizado</p>
          <p className="text-3xl font-bold mt-1">
            {budgetUsage !== null ? `${budgetUsage}%` : "—"}
          </p>
          <p className="text-xs mt-2 opacity-70">
            {data.budgetLimit
              ? `Limite: ${formatCurrency(data.budgetLimit, data.currency)}`
              : "Sem limite definido"}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Trend */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Tendência Diária de Custos
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Evolução dos gastos nos últimos 30 dias
            </p>
          </div>
          <div className="p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
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
                    formatter={(value) => [
                      formatCurrency(Number(value), "USD"),
                      "Custo",
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="custo"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCost)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Cost by Service Pie Chart */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Custos por Serviço
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Distribuição percentual dos gastos
            </p>
          </div>
          <div className="p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byService}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="service"
                  >
                    {data.byService.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      formatCurrency(Number(value), "USD"),
                      "Valor",
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* Service Breakdown Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Detalhamento por Serviço
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Ranking de serviços por custo no período
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-6 py-3 font-medium">Serviço</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
                <th className="px-6 py-3 font-medium text-right">
                  Participação
                </th>
                <th className="px-6 py-3 font-medium">Distribuição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.byService.map((s, i) => (
                <tr
                  key={s.service}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-slate-700">
                    {s.service}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600 font-mono">
                    {formatCurrency(s.amount, s.currency)}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    {s.percentage}%
                  </td>
                  <td className="px-6 py-3">
                    <div className="w-full max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.percentage}%`,
                          backgroundColor:
                            PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}