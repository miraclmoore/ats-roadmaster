'use client';

import { cn } from '@/lib/utils';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'profit' | 'income' | 'fuel' | 'damage' | 'primary';
  className?: string;
}

const sizeConfig = {
  sm: { width: 120, stroke: 8, fontSize: '1.5rem', labelSize: '0.75rem' },
  md: { width: 160, stroke: 10, fontSize: '2rem', labelSize: '0.875rem' },
  lg: { width: 200, stroke: 12, fontSize: '2.5rem', labelSize: '1rem' },
};

const colorConfig = {
  profit: 'rgb(16, 185, 129)', // Green
  income: 'rgb(6, 182, 212)',   // Cyan
  fuel: 'rgb(245, 158, 11)',    // Amber
  damage: 'rgb(239, 68, 68)',   // Red
  primary: 'rgb(59, 130, 246)',  // Blue
};

export function Gauge({
  value,
  max,
  label,
  unit = '',
  size = 'md',
  color = 'primary',
  className,
}: GaugeProps) {
  const config = sizeConfig[size];
  const percentage = Math.min((value / max) * 100, 100);

  // SVG circle calculations
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine needle rotation (0-180 degrees for half-circle gauge)
  const needleRotation = (percentage / 100) * 180 - 90;

  const gaugeColor = colorConfig[color];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Gauge SVG */}
      <div className="relative" style={{ width: config.width, height: config.width / 2 + 20 }}>
        <svg
          width={config.width}
          height={config.width / 2 + 20}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${config.stroke / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.stroke / 2} ${config.width / 2}`}
            fill="none"
            stroke="rgb(61, 68, 77)"
            strokeWidth={config.stroke}
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d={`M ${config.stroke / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.stroke / 2} ${config.width / 2}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease',
              transformOrigin: 'center',
              transform: 'rotate(-180deg) scaleX(-1)',
            }}
          />

          {/* Center dot */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={config.stroke / 2}
            fill={gaugeColor}
          />

          {/* Needle */}
          <line
            x1={config.width / 2}
            y1={config.width / 2}
            x2={config.width / 2}
            y2={config.stroke + 10}
            stroke={gaugeColor}
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              transformOrigin: `${config.width / 2}px ${config.width / 2}px`,
              transform: `rotate(${needleRotation}deg)`,
              transition: 'transform 0.5s ease',
            }}
          />
        </svg>

        {/* Value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '40%' }}>
          <div className="flex items-baseline gap-1">
            <span
              className="font-bold metric-value"
              style={{ fontSize: config.fontSize, color: gaugeColor }}
            >
              {Math.round(value)}
            </span>
            {unit && (
              <span
                className="text-muted-foreground font-medium"
                style={{ fontSize: config.labelSize }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        className="text-center text-muted-foreground uppercase tracking-wide font-semibold"
        style={{ fontSize: config.labelSize }}
      >
        {label}
      </div>
    </div>
  );
}
