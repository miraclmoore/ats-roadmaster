'use client';

import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { SafetyScoreBadge } from '@/components/telemetry/safety-score-badge';
import { Button } from '@/components/ui/button';

export interface TripReportData {
  // Job details
  source_city: string;
  destination_city: string;
  cargo_type: string;
  cargo_weight?: number;

  // Financial
  income: number;
  fuel_cost: number;
  damage_cost: number;
  profit: number;

  // Performance
  distance: number;
  fuel_consumed: number;
  fuel_economy: number;
  avg_speed: number;
  damage_taken: number;
  safety_score: number | null;

  // Timing
  started_at: string;
  completed_at: string;
  delivered_late: boolean;
}

export interface TripReportModalProps {
  open: boolean;
  onClose: () => void;
  data: TripReportData;
}

export function TripReportModal({ open, onClose, data }: TripReportModalProps) {
  // Calculate duration
  const duration = (() => {
    const start = new Date(data.started_at);
    const end = new Date(data.completed_at);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  })();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format distance
  const formatDistance = (miles: number) => {
    return `${miles.toLocaleString()} mi`;
  };

  // Determine profit color
  const profitColor = data.profit >= 0 ? 'text-[rgb(var(--profit))]' : 'text-[rgb(var(--damage))]';

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <DialogHeader>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trip Report</h2>
          <p className="text-sm text-muted-foreground mt-1">Delivery summary</p>
        </div>
      </DialogHeader>

      <DialogContent className="space-y-6">
        {/* Route Info */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Route</p>
              <p className="text-lg font-bold text-foreground">
                {data.source_city} → {data.destination_city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cargo</p>
              <p className="text-lg font-semibold text-foreground">{data.cargo_type}</p>
              {data.cargo_weight && (
                <p className="text-xs text-muted-foreground">{data.cargo_weight.toLocaleString()} lbs</p>
              )}
            </div>
          </div>
        </div>

        {/* Two-column metrics (snakedbr pattern) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <MetricCard
              label="Distance"
              value={formatDistance(data.distance)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
            />
            <MetricCard
              label="Revenue"
              value={formatCurrency(data.income)}
              valueColor="text-[rgb(var(--income))]"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <MetricCard
              label="Duration"
              value={duration}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <MetricCard
              label="Expenses"
              value={formatCurrency(data.fuel_cost + data.damage_cost)}
              valueColor="text-[rgb(var(--damage))]"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              subtitle={`Fuel: ${formatCurrency(data.fuel_cost)} • Damage: ${formatCurrency(data.damage_cost)}`}
            />
          </div>
        </div>

        {/* Bottom row - Profit and Safety Score (snakedbr pattern) */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Net Profit</p>
            <p className={`text-4xl font-bold tabular-nums ${profitColor}`}>
              {formatCurrency(data.profit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.profit >= 0 ? '+' : ''}{((data.profit / data.income) * 100).toFixed(1)}% margin
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Safety Score</p>
            <SafetyScoreBadge score={data.safety_score} size="lg" />
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Fuel Economy</p>
            <p className="text-foreground font-semibold tabular-nums">{data.fuel_economy.toFixed(1)} MPG</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Speed</p>
            <p className="text-foreground font-semibold tabular-nums">{data.avg_speed.toFixed(0)} mph</p>
          </div>
          <div>
            <p className="text-muted-foreground">Damage</p>
            <p className={`font-semibold tabular-nums ${data.damage_taken > 5 ? 'text-[rgb(var(--damage))]' : 'text-[rgb(var(--profit))]'}`}>
              {data.damage_taken.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Late delivery warning */}
        {data.delivered_late && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-destructive">Late Delivery</p>
              <p className="text-xs text-destructive/80">This delivery was completed after the deadline.</p>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueColor?: string;
  subtitle?: string;
}

function MetricCard({ label, value, icon, valueColor = 'text-foreground', subtitle }: MetricCardProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-muted-foreground">{icon}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
