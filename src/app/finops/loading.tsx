export default function Loading() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* KPI cards skeleton - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Chart area skeleton */}
      <div className="h-[300px] bg-slate-200 rounded-lg animate-pulse" />
    </div>
  );
}