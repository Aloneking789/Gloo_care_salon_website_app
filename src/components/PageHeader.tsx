import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  actions,
  layout = 'default',
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  layout?: 'default' | 'side-by-side' | 'full-width-actions';
}) {
  if (layout === 'side-by-side') {
    return (
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">{title}</h1>
          {description && (
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0 flex gap-2">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className={`flex gap-2 ${layout === 'full-width-actions' ? 'w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-initial' : ''}`}>
          {actions}
        </div>
      )}
    </div>
  );
}
