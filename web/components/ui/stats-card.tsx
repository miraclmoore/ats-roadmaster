import { ReactNode } from 'react';

export interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'from-blue-500/10 to-blue-600/10 border-blue-500/20',
  success: 'from-green-500/10 to-green-600/10 border-green-500/20',
  warning: 'from-orange-500/10 to-orange-600/10 border-orange-500/20',
  danger: 'from-red-500/10 to-red-600/10 border-red-500/20',
};

const iconColorStyles = {
  default: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-orange-500',
  danger: 'text-red-500',
};

export function StatsCard({
  icon,
  label,
  value,
  trend,
  variant = 'default'
}: StatsCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border
        bg-gradient-to-br ${variantStyles[variant]}
        backdrop-blur-sm
        p-6
        transition-all duration-300
        hover:scale-105 hover:shadow-xl
        dark:border-opacity-50
      `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`w-full h-full ${iconColorStyles[variant]}`}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white/10 ${iconColorStyles[variant]}`}>
            {icon}
          </div>
          {trend && (
            <div
              className={`
                flex items-center gap-1 text-sm font-semibold
                ${trend.isPositive ? 'text-green-500' : 'text-red-500'}
              `}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
