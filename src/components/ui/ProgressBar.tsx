export function ProgressBar({
  value,
  label,
  tone = 'safe',
}: {
  value: number;
  label: string;
  tone?: 'safe' | 'warn' | 'alert';
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const fill =
    tone === 'alert' ? 'bg-red-600' : tone === 'warn' ? 'bg-amber-600' : 'bg-emerald-600';

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-5 w-full overflow-hidden rounded-full border-2 border-slate-300 bg-slate-100"
    >
      <div className={`h-full ${fill}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function adherenceTone(value: number): 'safe' | 'warn' | 'alert' {
  if (value >= 85) return 'safe';
  if (value >= 60) return 'warn';
  return 'alert';
}
