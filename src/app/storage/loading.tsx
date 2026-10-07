export default function Loading() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>

      {/* Chart Area */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="h-80 w-full bg-slate-200 rounded-lg" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-20 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}