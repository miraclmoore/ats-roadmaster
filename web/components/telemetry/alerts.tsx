'use client';

import { Database } from '@/lib/types/database';

type Telemetry = Database['public']['Tables']['telemetry']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

interface AlertsProps {
  telemetry: Telemetry;
  job: Job | null;
}

interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  icon: React.ReactNode;
}

export function Alerts({ telemetry, job }: AlertsProps) {
  const alerts: Alert[] = [];

  // Critical alerts
  if ((telemetry.fuel_current || 0) / (telemetry.fuel_capacity || 1) < 0.15) {
    alerts.push({
      id: 'low-fuel',
      type: 'danger',
      message: 'Low Fuel',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    });
  }

  if ((telemetry.engine_damage || 0) > 10) {
    alerts.push({
      id: 'engine-damage',
      type: 'danger',
      message: 'Engine Damage',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    });
  }

  // Warning alerts
  if (telemetry.speed_limit && (telemetry.speed || 0) > telemetry.speed_limit + 5) {
    alerts.push({
      id: 'speeding',
      type: 'warning',
      message: 'Speeding',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    });
  }

  if (telemetry.air_pressure && telemetry.air_pressure < 90) {
    alerts.push({
      id: 'low-air',
      type: 'warning',
      message: 'Low Air Pressure',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    });
  }

  // Info alerts
  if (job && telemetry.navigation_time && job.deadline) {
    const hoursRemaining = telemetry.navigation_time / 60;
    const deadline = new Date(job.deadline);
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining > hoursUntilDeadline - 1) {
      alerts.push({
        id: 'late-delivery',
        type: 'warning',
        message: 'Late Delivery Risk',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      });
    }
  }

  if (alerts.length === 0) {
    return null;
  }

  const displayAlerts = alerts.slice(0, 3);
  const remainingCount = alerts.length - displayAlerts.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {displayAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
            ${alert.type === 'danger' 
              ? 'bg-red-500/10 border-red-500/50 text-red-400' 
              : alert.type === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
              : 'bg-blue-500/10 border-blue-500/50 text-blue-400'
            }
          `}
        >
          <div className="flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">{alert.icon}</div>
          <span className="whitespace-nowrap">{alert.message}</span>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/50 border border-slate-700 text-slate-400">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
