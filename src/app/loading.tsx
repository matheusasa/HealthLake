export default function Loading() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-200 rounded" />
        </div>
        <div className="h-4 w-32 bg-slate-200 rounded" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border-l-4 border-slate-300 bg-slate-100 p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-9 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-200 rounded" />
            <div className="h-40 w-full bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}