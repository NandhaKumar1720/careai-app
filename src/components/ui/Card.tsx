import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'article' | 'div';
}) {
  return <Tag className={`care-card ${className}`}>{children}</Tag>;
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  id,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon ? <span aria-hidden="true" className="mt-1 text-slate-700">{icon}</span> : null}
        <div>
          <h2 id={id} className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {title}
          </h2>
          {description ? <p className="mt-1 text-lg text-slate-600">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
