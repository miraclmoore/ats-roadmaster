import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'profit' | 'income' | 'fuel' | 'damage';
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    border: 'border-border',
    valueColor: 'text-primary',
  },
  profit: {
    bg: 'bg-card',
    border: 'border-[rgb(var(--profit))]',
    valueColor: 'text-[rgb(var(--profit))]',
  },
  income: {
    bg: 'bg-card',
    border: 'border-[rgb(var(--income))]',
    valueColor: 'text-[rgb(var(--income))]',
  },
  fuel: {
    bg: 'bg-card',
    border: 'border-[rgb(var(--fuel))]',
    valueColor: 'text-[rgb(var(--fuel))]',
  },
  damage: {
    bg: 'bg-card',
    border: 'border-[rgb(var(--damage))]',
    valueColor: 'text-[rgb(var(--damage))]',
  },
};

export function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border-2 p-6 transition-all hover:scale-[1.02]',
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Top bar - like dashboard indicator lights */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', styles.valueColor.replace('text-', 'bg-'))} />

      <div className="flex flex-col gap-4">
        {/* Header with icon and trend */}
        <div className="flex items-center justify-between">
          {icon && (
            <div className={cn('p-2 rounded', styles.valueColor.replace('text-', 'bg-'), 'bg-opacity-10')}>
              <div className={cn(styles.valueColor, 'w-6 h-6')}>
                {icon}
              </div>
            </div>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded',
                trend.isPositive ? 'text-[rgb(var(--profit))] bg-[rgb(var(--profit))] bg-opacity-10' : 'text-[rgb(var(--damage))] bg-[rgb(var(--damage))] bg-opacity-10'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value - large and bold like dashboard displays */}
        <div>
          <div className={cn('text-4xl font-bold metric-value mb-1', styles.valueColor)}>
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>

        {/* Label - uppercase like dashboard labels */}
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold border-t border-border pt-3">
          {label}
        </div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
