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
  profit: 'rgb(39, 174, 96)', // Freight Green #27AE60
  income: 'rgb(86, 204, 242)',   // Info Cyan #56CCF2
  fuel: 'rgb(242, 153, 74)',    // Safety Orange #F2994A
  damage: 'rgb(235, 87, 87)',   // Brake Red #EB5757
  primary: 'rgb(47, 128, 237)',  // Highway Blue #2F80ED
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

  // Calculate arc sweep angle (0 to 180 degrees for semi-circle)
  const sweepAngle = (percentage / 100) * 180;

  // Center point
  const centerX = config.width / 2;
  const centerY = config.width / 2;

  // Radius for the arc path
  const radius = (config.width - config.stroke) / 2;

  // Calculate end point of the arc based on sweep angle
  const startAngle = 180; // Start from left (180 degrees)
  const endAngle = startAngle + sweepAngle;

  const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

  // Large arc flag: 1 if sweep angle > 180, else 0
  const largeArcFlag = sweepAngle > 180 ? 1 : 0;

  // Create the arc path
  const valueArcPath = sweepAngle > 0
    ? `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
    : '';

  // Determine needle rotation (0-180 degrees for half-circle gauge)
  const needleRotation = sweepAngle - 90;

  const gaugeColor = colorConfig[color];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Gauge SVG */}
      <div className="relative" style={{ width: config.width, height: config.width / 2 + 60 }}>
        <svg
          width={config.width}
          height={config.width / 2 + 20}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${config.stroke / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.stroke / 2} ${config.width / 2}`}
            fill="none"
            stroke="rgb(44, 50, 56)"
            strokeWidth={config.stroke}
            strokeLinecap="round"
          />

          {/* Value arc */}
          {valueArcPath && (
            <path
              d={valueArcPath}
              fill="none"
              stroke={gaugeColor}
              strokeWidth={config.stroke}
              strokeLinecap="round"
              style={{
                transition: 'all 0.5s ease',
              }}
            />
          )}

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
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2">
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
