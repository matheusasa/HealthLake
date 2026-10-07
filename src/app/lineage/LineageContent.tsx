"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { LineageGraph, LineageNode, LineageEdge } from "@/lib/lineage-service";

interface Props {
  data: LineageGraph;
}

// Layout constants for the SVG graph
const LAYER_X = { raw: 120, staging: 420, curated: 720 };
const NODE_RADIUS_TABLE = 28;
const NODE_RADIUS_JOB = 22;
const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 520;

const LAYER_COLORS: Record<string, string> = {
  raw: "#0d9488",     // teal-600
  staging: "#0891b2", // cyan-600
  curated: "#6366f1", // indigo-500
};

const JOB_COLOR = "#f59e0b"; // amber-500

function getNodeColor(node: LineageNode): string {
  if (node.type === "job") return JOB_COLOR;
  return LAYER_COLORS[node.layer] || "#64748b";
}

function computeLayout(nodes: LineageNode[], edges: LineageEdge[]) {
  const groups: Record<string, LineageNode[]> = {};
  for (const n of nodes) {
    const key = `${n.layer}_${n.type}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }

  const positions: Record<string, { x: number; y: number }> = {};

  // Place tables in columns by layer
  for (const layer of ["raw", "staging", "curated"] as const) {
    const tables = groups[`${layer}_table`] || [];
    const startY = 60;
    const spacing = Math.min(80, (CANVAS_HEIGHT - 120) / Math.max(tables.length, 1));
    tables.forEach((t, i) => {
      positions[t.id] = { x: LAYER_X[layer], y: startY + i * spacing };
    });
  }

  // Classify jobs by their actual edge connections to determine which column they belong to
  const rawToStagingJobs: LineageNode[] = [];
  const stagingToCuratedJobs: LineageNode[] = [];
  const otherJobs: LineageNode[] = [];

  const allJobs = nodes.filter((n) => n.type === "job");
  for (const job of allJobs) {
    const sourceEdges = edges.filter((e) => e.target === job.id);
    const targetEdges = edges.filter((e) => e.source === job.id);
    const sourceLayers = new Set(sourceEdges.map((e) => nodes.find((n) => n.id === e.source)?.layer));
    const targetLayers = new Set(targetEdges.map((e) => nodes.find((n) => n.id === e.target)?.layer));

    if (sourceLayers.has("raw") && targetLayers.has("staging")) {
      rawToStagingJobs.push(job);
    } else if (sourceLayers.has("staging") && targetLayers.has("curated")) {
      stagingToCuratedJobs.push(job);
    } else {
      otherJobs.push(job);
    }
  }

  // Place jobs vertically centered relative to their connected source/target tables
  const placeJobsByConnections = (
    jobList: LineageNode[],
    baseX: number,
    getConnectedYs: (job: LineageNode) => number[],
  ) => {
    if (jobList.length === 0) return;

    // Sort jobs by the average Y of their connected nodes to reduce edge crossings
    const sorted = [...jobList].sort((a, b) => {
      const aYs = getConnectedYs(a);
      const bYs = getConnectedYs(b);
      const aAvg = aYs.length > 0 ? aYs.reduce((s, y) => s + y, 0) / aYs.length : CANVAS_HEIGHT / 2;
      const bAvg = bYs.length > 0 ? bYs.reduce((s, y) => s + y, 0) / bYs.length : CANVAS_HEIGHT / 2;
      return aAvg - bAvg;
    });

    const minSpacing = NODE_RADIUS_JOB * 2 + 20; // diameter + padding
    const availableHeight = CANVAS_HEIGHT - 100;
    const spacing = Math.max(minSpacing, availableHeight / Math.max(sorted.length, 1));
    const startY = Math.max(50, (CANVAS_HEIGHT - spacing * (sorted.length - 1)) / 2);

    sorted.forEach((j, i) => {
      const connectedYs = getConnectedYs(j);
      let y: number;
      if (connectedYs.length > 0) {
        // Try to align with connected nodes, but clamp to avoid overlap
        const avgY = connectedYs.reduce((s, v) => s + v, 0) / connectedYs.length;
        y = Math.max(startY, Math.min(startY + (sorted.length - 1) * spacing, avgY));
      } else {
        y = startY + i * spacing;
      }
      positions[j.id] = { x: baseX, y };
    });

    // Resolve overlaps: push overlapping nodes apart
    const placed = sorted.map((j) => ({ id: j.id, y: positions[j.id].y }));
    placed.sort((a, b) => a.y - b.y);
    for (let i = 1; i < placed.length; i++) {
      if (placed[i].y - placed[i - 1].y < minSpacing) {
        placed[i].y = placed[i - 1].y + minSpacing;
      }
    }
    for (const p of placed) {
      positions[p.id] = { x: baseX, y: Math.min(p.y, CANVAS_HEIGHT - 40) };
    }
  };

  placeJobsByConnections(rawToStagingJobs, 270, (job) => {
    const ys: number[] = [];
    for (const e of edges) {
      if (e.source === job.id || e.target === job.id) {
        const otherId = e.source === job.id ? e.target : e.source;
        if (positions[otherId]) ys.push(positions[otherId].y);
      }
    }
    return ys;
  });

  placeJobsByConnections(stagingToCuratedJobs, 570, (job) => {
    const ys: number[] = [];
    for (const e of edges) {
      if (e.source === job.id || e.target === job.id) {
        const otherId = e.source === job.id ? e.target : e.source;
        if (positions[otherId]) ys.push(positions[otherId].y);
      }
    }
    return ys;
  });

  // Fallback for any unclassified jobs
  if (otherJobs.length > 0) {
    const startY = 80;
    const spacing = Math.min(90, (CANVAS_HEIGHT - 160) / otherJobs.length);
    otherJobs.forEach((j, i) => {
      positions[j.id] = { x: 270, y: startY + i * spacing };
    });
  }

  return positions;
}

export function LineageContent({ data }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const positions = useMemo(() => computeLayout(data.nodes, data.edges), [data.nodes, data.edges]);

  // Highlight connected edges when a node is selected
  const connectedEdges = useMemo(() => {
    if (!selectedNode) return new Set<number>();
    const set = new Set<number>();
    data.edges.forEach((e, i) => {
      if (e.source === selectedNode || e.target === selectedNode) set.add(i);
    });
    return set;
  }, [selectedNode, data.edges]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>([selectedNode]);
    data.edges.forEach((e) => {
      if (e.source === selectedNode) set.add(e.target);
      if (e.target === selectedNode) set.add(e.source);
    });
    return set;
  }, [selectedNode, data.edges]);

  const selectedInfo = useMemo(() => {
    if (!selectedNode) return null;
    return data.nodes.find((n) => n.id === selectedNode) || null;
  }, [selectedNode, data.nodes]);

  // Edge path: quadratic bezier curve
  function edgePath(edge: LineageEdge): string {
    const s = positions[edge.source];
    const t = positions[edge.target];
    if (!s || !t) return "";
    const midX = (s.x + t.x) / 2;
    return `M ${s.x} ${s.y} Q ${midX} ${s.y} ${midX} ${(s.y + t.y) / 2} Q ${midX} ${t.y} ${t.x} ${t.y}`;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-4 shadow-sm text-teal-900">
          <p className="text-xs font-medium opacity-80">Tabelas Raw</p>
          <p className="text-2xl font-bold mt-1">{data.stats.rawTables}</p>
        </div>
        <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-4 shadow-sm text-cyan-900">
          <p className="text-xs font-medium opacity-80">Tabelas Staging</p>
          <p className="text-2xl font-bold mt-1">{data.stats.stagingTables}</p>
        </div>
        <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4 shadow-sm text-indigo-900">
          <p className="text-xs font-medium opacity-80">Tabelas Curated</p>
          <p className="text-2xl font-bold mt-1">{data.stats.curatedTables}</p>
        </div>
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 shadow-sm text-amber-900">
          <p className="text-xs font-medium opacity-80">Jobs Ativos</p>
          <p className="text-2xl font-bold mt-1">{data.stats.activeJobs}</p>
        </div>
      </div>

      {/* Graph Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Grafo de Linhagem</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Fluxo de dados: Raw → Staging → Curated via Glue Jobs
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-600" /> Raw
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-600" /> Staging
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500" /> Curated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Job
            </span>
          </div>
        </div>
        <div className="p-2 sm:p-4 overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="w-full h-auto min-w-[600px]"
            style={{ maxHeight: "520px" }}
          >
            {/* Layer labels */}
            <text x={LAYER_X.raw} y={24} textAnchor="middle" className="text-xs font-semibold fill-slate-400 uppercase tracking-wider" fontSize={11}>Raw</text>
            <text x={270} y={24} textAnchor="middle" className="text-xs font-semibold fill-slate-400 uppercase tracking-wider" fontSize={11}>ETL</text>
            <text x={LAYER_X.staging} y={24} textAnchor="middle" className="text-xs font-semibold fill-slate-400 uppercase tracking-wider" fontSize={11}>Staging</text>
            <text x={570} y={24} textAnchor="middle" className="text-xs font-semibold fill-slate-400 uppercase tracking-wider" fontSize={11}>ETL</text>
            <text x={LAYER_X.curated} y={24} textAnchor="middle" className="text-xs font-semibold fill-slate-400 uppercase tracking-wider" fontSize={11}>Curated</text>

            {/* Edges */}
            {data.edges.map((edge, i) => {
              const isHighlighted = connectedEdges.has(i);
              const isDimmed = selectedNode !== null && !isHighlighted;
              const isHovered = hoveredEdge === i;
              return (
                <g key={`edge-${i}`}>
                  <path
                    d={edgePath(edge)}
                    fill="none"
                    stroke={isHovered ? "#0d9488" : isHighlighted ? "#0d9488" : "#cbd5e1"}
                    strokeWidth={isHovered ? 2.5 : isHighlighted ? 2 : 1.2}
                    strokeDasharray={isHighlighted ? "" : ""}
                    opacity={isDimmed ? 0.15 : 1}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredEdge(i)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                  {/* Arrowhead marker at end */}
                  {!isDimmed && (
                    <circle
                      cx={positions[edge.target]?.x}
                      cy={positions[edge.target]?.y}
                      r={3}
                      fill={isHighlighted ? "#0d9488" : "#cbd5e1"}
                      className="transition-colors duration-200"
                    />
                  )}
                  {/* Tooltip on hover */}
                  {isHovered && (() => {
                    const s = positions[edge.source];
                    const t = positions[edge.target];
                    if (!s || !t) return null;
                    const mx = (s.x + t.x) / 2;
                    const my = (s.y + t.y) / 2 - 12;
                    return (
                      <g>
                        <rect x={mx - 60} y={my - 14} width={120} height={20} rx={4} fill="#1e293b" opacity={0.9} />
                        <text x={mx} y={my} textAnchor="middle" fontSize={10} fill="white" fontFamily="sans-serif">
                          {edge.jobName}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Nodes */}
            {data.nodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const color = getNodeColor(node);
              const r = node.type === "job" ? NODE_RADIUS_JOB : NODE_RADIUS_TABLE;
              const isSelected = selectedNode === node.id;
              const isConnected = connectedNodes.has(node.id);
              const isDimmed = selectedNode !== null && !isConnected;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-opacity duration-200"
                  opacity={isDimmed ? 0.2 : 1}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                >
                  {/* Glow ring for selected */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r={r + 6} fill="none" stroke={color} strokeWidth={2} opacity={0.3}>
                      <animate attributeName="r" values={`${r + 4};${r + 8};${r + 4}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Node shape */}
                  {node.type === "job" ? (
                    <rect
                      x={pos.x - r}
                      y={pos.y - r}
                      width={r * 2}
                      height={r * 2}
                      rx={6}
                      fill={color}
                      stroke={isSelected ? "#fff" : "none"}
                      strokeWidth={2}
                      className="drop-shadow-sm"
                    />
                  ) : (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={color}
                      stroke={isSelected ? "#fff" : "none"}
                      strokeWidth={2}
                      className="drop-shadow-sm"
                    />
                  )}
                  {/* Icon inside node */}
                  {node.type === "table" && (
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fontSize={14} fill="white" fontFamily="sans-serif">
                      T
                    </text>
                  )}
                  {node.type === "job" && (
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="white" fontFamily="sans-serif">
                      J
                    </text>
                  )}
                  {/* Label below */}
                  <text
                    x={pos.x}
                    y={pos.y + r + 14}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#475569"
                    fontFamily="sans-serif"
                    fontWeight={isSelected ? 600 : 400}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* Detail Panel */}
      {selectedInfo && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Detalhes do Nó</h2>
              <p className="text-sm text-slate-500 mt-0.5">Informações sobre o elemento selecionado</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpar seleção
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Nome</p>
                <p className="text-sm font-semibold text-slate-800">{selectedInfo.label}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Tipo</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  selectedInfo.type === "job"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {selectedInfo.type === "job" ? "Glue Job" : "Tabela"}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Camada</p>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: LAYER_COLORS[selectedInfo.layer] }}
                >
                  {selectedInfo.layer.charAt(0).toUpperCase() + selectedInfo.layer.slice(1)}
                </span>
              </div>
            </div>

            {/* Connected edges */}
            <div className="mt-6">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Conexões</p>
              <div className="space-y-2">
                {data.edges
                  .filter((e) => e.source === selectedInfo.id || e.target === selectedInfo.id)
                  .map((e, i) => {
                    const direction = e.source === selectedInfo.id ? "Saída" : "Entrada";
                    const otherNodeId = e.source === selectedInfo.id ? e.target : e.source;
                    const otherNode = data.nodes.find((n) => n.id === otherNodeId);
                    return (
                      <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          direction === "Saída" ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {direction}
                        </span>
                        <span className="text-slate-600 font-mono text-xs">{otherNode?.label || otherNodeId}</span>
                        <span className="text-slate-400 text-xs ml-auto">{e.jobName}</span>
                      </div>
                    );
                  })}
                {data.edges.filter((e) => e.source === selectedInfo.id || e.target === selectedInfo.id).length === 0 && (
                  <p className="text-sm text-slate-400 italic">Nenhuma conexão encontrada.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full edge list table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Todas as Dependências</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Lista completa de {data.stats.totalEdges} conexões entre tabelas e jobs
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 sm:px-6 py-3 font-medium">Origem</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Job ETL</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Destino</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Direção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.edges.map((edge, i) => {
                const srcNode = data.nodes.find((n) => n.id === edge.source);
                const tgtNode = data.nodes.find((n) => n.id === edge.target);
                return (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-slate-700">{srcNode?.label || edge.source}</td>
                    <td className="px-6 py-3 text-xs text-amber-700 font-medium">{edge.jobName}</td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-700">{tgtNode?.label || edge.target}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: srcNode ? LAYER_COLORS[srcNode.layer] || "#64748b" : "#64748b" }}
                        />
                        →
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tgtNode ? LAYER_COLORS[tgtNode.layer] || "#64748b" : "#64748b" }}
                        />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}