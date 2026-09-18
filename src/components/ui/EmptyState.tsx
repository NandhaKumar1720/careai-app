import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <span aria-hidden="true" className="text-slate-500">
        {icon}
      </span>
      <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
      <p className="max-w-prose text-lg text-slate-600">{description}</p>
      {action}
    </div>
  );
}
