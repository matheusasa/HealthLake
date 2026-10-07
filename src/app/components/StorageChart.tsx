"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StorageSummary } from "@/lib/types";

interface Props {
  summary: StorageSummary | null;
}

export function StorageChart({ summary }: Props) {
  if (!summary || summary.trend.length === 0) {
    return <p className="text-sm text-slate-500">Dados de tendência de armazenamento indisponíveis.</p>;
  }

  const data = summary.trend.map((t) => ({
    date: new Date(t.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    sizeTB: Number((t.sizeBytes / 1_099_511_627_776).toFixed(2)),
  }));

  return (
    <div className="w-full h-[250px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={(v: number) => `${v} TB`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} TB`, "Tamanho"]}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="sizeTB"
            stroke="#0d9488"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSize)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Total atual: {(summary.totalSizeBytes / 1_099_511_627_776).toFixed(2)} TB</span>
        <span>{summary.totalFiles.toLocaleString("pt-BR")} arquivos</span>
      </div>
    </div>
  );
}