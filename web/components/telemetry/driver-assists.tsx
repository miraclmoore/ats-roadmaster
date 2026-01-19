'use client';

import { Database } from '@/lib/types/database';

type Telemetry = Database['public']['Tables']['telemetry']['Row'];

interface DriverAssistsProps {
  telemetry: Telemetry;
}

export function DriverAssists({ telemetry }: DriverAssistsProps) {
  const isMoving = telemetry.speed > 1;
  const lowAirPressure = telemetry.air_pressure && telemetry.air_pressure < 90;

  return (
    <div className="bg-card border-2 border-border rounded-lg p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--fuel))]" />

      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Driver Assists
      </h3>

      <div className="flex flex-wrap gap-2">
        
        {/* Cruise Control */}
        <div className={`flex-1 min-w-[70px] rounded-lg p-2 text-center transition-all ${
          telemetry.cruise_control_enabled
            ? 'bg-blue-500/20 border border-blue-500'
            : 'bg-slate-800/50 border border-slate-700'
        }`}>
          <svg 
            className={`w-4 h-4 mx-auto mb-0.5 ${
              telemetry.cruise_control_enabled ? 'text-blue-400' : 'text-slate-600'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className="text-xs text-muted-foreground">CC</div>
          <div className={`text-sm font-bold ${
            telemetry.cruise_control_enabled ? 'text-blue-400' : 'text-slate-600'
          }`}>
            {telemetry.cruise_control_enabled 
              ? Math.round(telemetry.cruise_control_speed || 0)
              : 'OFF'
            }
          </div>
        </div>

        {/* Parking Brake */}
        <div className={`flex-1 min-w-[70px] rounded-lg p-2 text-center transition-all ${
          telemetry.parking_brake
            ? isMoving 
              ? 'bg-red-500/20 border border-red-500 animate-pulse'
              : 'bg-yellow-500/20 border border-yellow-500'
            : 'bg-slate-800/50 border border-slate-700'
        }`}>
          <svg 
            className={`w-4 h-4 mx-auto mb-0.5 ${
              telemetry.parking_brake
                ? isMoving ? 'text-red-400' : 'text-yellow-400'
                : 'text-slate-600'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-xs text-muted-foreground">PB</div>
          <div className={`text-sm font-bold ${
            telemetry.parking_brake
              ? isMoving ? 'text-red-400' : 'text-yellow-400'
              : 'text-slate-600'
          }`}>
            {telemetry.parking_brake ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Motor Brake */}
        <div className={`flex-1 min-w-[70px] rounded-lg p-2 text-center transition-all ${
          telemetry.motor_brake
            ? 'bg-blue-500/20 border border-blue-500'
            : 'bg-slate-800/50 border border-slate-700'
        }`}>
          <svg 
            className={`w-4 h-4 mx-auto mb-0.5 ${
              telemetry.motor_brake ? 'text-blue-400' : 'text-slate-600'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="text-xs text-muted-foreground">MB</div>
          <div className={`text-sm font-bold ${
            telemetry.motor_brake ? 'text-blue-400' : 'text-slate-600'
          }`}>
            {telemetry.motor_brake ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Retarder */}
        <div className={`flex-1 min-w-[70px] rounded-lg p-2 text-center transition-all ${
          (telemetry.retarder_level || 0) > 0
            ? 'bg-purple-500/20 border border-purple-500'
            : 'bg-slate-800/50 border border-slate-700'
        }`}>
          <svg 
            className={`w-4 h-4 mx-auto mb-0.5 ${
              (telemetry.retarder_level || 0) > 0 ? 'text-purple-400' : 'text-slate-600'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <div className="text-xs text-muted-foreground">RT</div>
          <div className={`text-sm font-bold ${
            (telemetry.retarder_level || 0) > 0 ? 'text-purple-400' : 'text-slate-600'
          }`}>
            {(telemetry.retarder_level || 0) > 0 ? telemetry.retarder_level : 'OFF'}
          </div>
        </div>

        {/* Air Pressure */}
        <div className={`flex-1 min-w-[70px] rounded-lg p-2 text-center transition-all ${
          lowAirPressure
            ? 'bg-red-500/20 border border-red-500'
            : 'bg-slate-800/50 border border-slate-700'
        }`}>
          <svg 
            className={`w-4 h-4 mx-auto mb-0.5 ${
              lowAirPressure ? 'text-red-400' : 'text-slate-600'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          <div className="text-xs text-muted-foreground">Air</div>
          <div className={`text-sm font-bold ${
            lowAirPressure ? 'text-red-400' : 'text-foreground'
          }`}>
            {telemetry.air_pressure ? Math.round(telemetry.air_pressure) : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}
