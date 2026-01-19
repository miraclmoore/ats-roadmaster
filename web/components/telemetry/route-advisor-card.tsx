'use client';

import { Database } from '@/lib/types/database';

type Telemetry = Database['public']['Tables']['telemetry']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

interface RouteAdvisorCardProps {
  telemetry: Telemetry;
  job: Job | null;
}

export function RouteAdvisorCard({ telemetry, job }: RouteAdvisorCardProps) {
  const formatETA = (minutes: number | null) => {
    if (!minutes) return '--:--';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const getUrgencyColor = () => {
    if (!job || !telemetry.navigation_time) return 'text-foreground';
    
    const deadline = new Date(job.deadline);
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = telemetry.navigation_time / 60;
    
    if (hoursRemaining > hoursUntilDeadline) return 'text-[rgb(var(--damage))]';
    if (hoursRemaining > hoursUntilDeadline - 2) return 'text-yellow-400';
    return 'text-[rgb(var(--profit))]';
  };

  const distanceRemaining = telemetry.navigation_distance 
    ? Math.round(telemetry.navigation_distance * 0.000621371)
    : null;

  const progress = job && distanceRemaining
    ? Math.max(0, Math.min(100, ((job.distance - distanceRemaining) / job.distance) * 100))
    : 0;

  return (
    <div className="bg-card border-2 border-border rounded-lg p-3 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--income))]" />

      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Route Advisor
      </h3>

      <div className="space-y-2 flex-1">
        {/* Job Information */}
        {job ? (
          <>
            <div className="bg-slate-800/50 rounded-lg p-2 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Destination</div>
                  <div className="text-base font-bold text-foreground truncate">{job.destination_city}</div>
                  {job.destination_company && (
                    <div className="text-xs text-muted-foreground truncate">{job.destination_company}</div>
                  )}
                </div>
                <div className={`text-xl font-bold flex-shrink-0 ${getUrgencyColor()}`}>
                  {formatETA(telemetry.navigation_time)}
                </div>
              </div>
              
              <div className="pt-1">
                <div className="text-xs text-muted-foreground">Cargo</div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-sm font-medium text-foreground truncate">{job.cargo_type}</span>
                  {job.cargo_weight && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">({Math.round(job.cargo_weight * 2.20462)} lbs)</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {distanceRemaining && (
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                    <span>{distanceRemaining} mi</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-[rgb(var(--income))] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-800/50 rounded-lg p-3 text-center text-muted-foreground">
            <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs">No active job</p>
          </div>
        )}

        {/* Cruise Control & Speed Limit */}
        <div className="grid grid-cols-2 gap-2">
          {/* Cruise Control */}
          <div className={`rounded-lg p-2 border transition-colors ${
            telemetry.cruise_control_enabled 
              ? 'bg-blue-500/10 border-blue-500' 
              : 'bg-slate-800/50 border-slate-700'
          }`}>
            <div className="flex items-center gap-1 mb-0.5">
              <svg 
                className={`w-3.5 h-3.5 ${telemetry.cruise_control_enabled ? 'text-blue-400' : 'text-muted-foreground'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs text-muted-foreground">Cruise</span>
            </div>
            <div className={`text-xl font-bold ${
              telemetry.cruise_control_enabled ? 'text-blue-400' : 'text-muted-foreground'
            }`}>
              {telemetry.cruise_control_enabled 
                ? `${Math.round(telemetry.cruise_control_speed || 0)}`
                : 'OFF'
              }
            </div>
            {telemetry.cruise_control_enabled && (
              <div className="text-xs text-muted-foreground">mph</div>
            )}
          </div>

          {/* Speed Limit */}
          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-1 mb-0.5">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-muted-foreground">Limit</span>
            </div>
            <div className={`text-xl font-bold ${
              telemetry.speed_limit && telemetry.speed > telemetry.speed_limit + 5
                ? 'text-[rgb(var(--damage))]'
                : 'text-foreground'
            }`}>
              {telemetry.speed_limit ? Math.round(telemetry.speed_limit) : '--'}
            </div>
            {telemetry.speed_limit && (
              <div className="text-xs text-muted-foreground">mph</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
