export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-4" role="status" aria-live="polite">
      <span
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"
      />
      <span className="text-lg font-semibold text-slate-700">{label}</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="care-card animate-pulse space-y-4" aria-hidden="true">
      <div className="h-6 w-1/3 rounded-full bg-slate-200" />
      <div className="h-12 w-2/3 rounded-2xl bg-slate-200" />
      <div className="h-6 w-1/2 rounded-full bg-slate-200" />
    </div>
  );
}
