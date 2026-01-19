'use client';

import { Sparkline } from './sparkline';

interface TrendCardsProps {
  history: {
    speed: number[];
    rpm: number[];
    fuelConsumption: number[];
  };
  currentSpeed: number;
  currentRpm: number;
  currentFuel: number;
}

export function TrendCards({ history, currentSpeed, currentRpm, currentFuel }: TrendCardsProps) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0.5) {
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend < -0.5) {
      return (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  // Calculate trends
  const speedTrend = history.speed.length > 5 
    ? (history.speed[history.speed.length - 1] - history.speed[history.speed.length - 6]) / 5
    : 0;
  const rpmTrend = history.rpm.length > 5
    ? (history.rpm[history.rpm.length - 1] - history.rpm[history.rpm.length - 6]) / 5
    : 0;
  const fuelTrend = history.fuelConsumption.length > 5
    ? (history.fuelConsumption[history.fuelConsumption.length - 1] - history.fuelConsumption[history.fuelConsumption.length - 6]) / 5
    : 0;

  return (
    <div className="bg-card border-2 border-border rounded-lg p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--primary))]" />

      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        Performance Trends
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Speed Trend */}
        <div className="bg-slate-800/50 rounded-lg p-2 flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Speed</span>
              {getTrendIcon(speedTrend)}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">{Math.round(currentSpeed)}</span>
              <span className="text-xs text-muted-foreground">mph</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Sparkline 
              data={history.speed} 
              width={80} 
              height={24} 
              color="rgb(47, 128, 237)"
            />
          </div>
        </div>

        {/* RPM Trend */}
        <div className="bg-slate-800/50 rounded-lg p-2 flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">RPM</span>
              {getTrendIcon(rpmTrend)}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">{Math.round(currentRpm)}</span>
              <span className="text-xs text-muted-foreground">rpm</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Sparkline 
              data={history.rpm} 
              width={80} 
              height={24} 
              color="rgb(86, 204, 242)"
            />
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="bg-slate-800/50 rounded-lg p-2 flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Fuel Rate</span>
              {getTrendIcon(-fuelTrend)}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">{currentFuel.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">mpg</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Sparkline 
              data={history.fuelConsumption} 
              width={80} 
              height={24} 
              color="rgb(242, 153, 74)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
