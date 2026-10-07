export default function Loading() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>

      {/* Table Rows */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 p-4 flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-24 bg-slate-200 rounded" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-b border-slate-100 p-4 flex gap-4">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-4 w-24 bg-slate-200 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}