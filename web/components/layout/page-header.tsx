'use client';

import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  status?: ReactNode;
}

export function PageHeader({ title, description, action, compact = false, status }: PageHeaderProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 mb-4 fade-in-up">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-wide uppercase text-white">
            {title}
          </h1>
          {status}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    );
  }

  return (
    <div className="premium-card border-b border-border mb-5 fade-in-up relative overflow-hidden">
      <div className="scanlines px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tech-heading mb-1">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground font-medium">
                {description}
              </p>
            )}
          </div>
          {action && <div className="relative z-10">{action}</div>}
        </div>
      </div>
    </div>
  );
}
