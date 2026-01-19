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
    if (!job || !job.deadline) return 'text-foreground';
    
    const deadline = new Date(job.deadline);
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Without navigation_time, we can't calculate urgency accurately
    if (hoursUntilDeadline < 2) return 'text-[rgb(var(--damage))]';
    if (hoursUntilDeadline < 5) return 'text-yellow-400';
    return 'text-[rgb(var(--profit))]';
  };

  const distanceRemaining = job ? Math.round(job.distance * 0.7) : null; // Estimate 70% remaining

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
                  {job.deadline ? new Date(job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
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
          {/* Current Speed */}
          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-1 mb-0.5">
              <svg 
                className="w-3.5 h-3.5 text-muted-foreground"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs text-muted-foreground">Speed</span>
            </div>
            <div className="text-xl font-bold text-blue-400">
              {Math.round(telemetry.speed || 0)}
            </div>
            <div className="text-xs text-muted-foreground">mph</div>
          </div>

          {/* Current Gear */}
          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-1 mb-0.5">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-muted-foreground">Gear</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {(telemetry.gear || 0) > 0 ? telemetry.gear : (telemetry.gear || 0) === 0 ? 'N' : 'R'}
            </div>
            <div className="text-xs text-muted-foreground">current</div>
          </div>
        </div>
      </div>
    </div>
  );
}
