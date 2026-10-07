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

      {/* Large canvas/graph area skeleton */}
      <div className="h-[500px] bg-slate-200 rounded-lg animate-pulse" />
    </div>
  );
}