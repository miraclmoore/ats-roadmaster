'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TelemetryData {
  speed: number;
  rpm: number;
  gear: number;
  fuel_current: number;
  fuel_capacity: number;
  engine_damage: number;
  cargo_damage: number;
}

export default function LiveTelemetryPage() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Fetch latest telemetry
    const fetchLatest = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('telemetry')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setTelemetry(data);
        setIsConnected(true);
      }
    };

    fetchLatest();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('telemetry-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
        },
        (payload) => {
          setTelemetry(payload.new as TelemetryData);
          setIsConnected(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const GaugeCard = ({ label, value, max, unit, color }: any) => {
    const percentage = (value / max) * 100;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
          {label}
        </h3>
        <div className="relative pt-1">
          <div className="flex items-center justify-center mb-4">
            <span className={`text-4xl font-bold ${color}`}>
              {Math.round(value)}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-400 ml-2">
              {unit}
            </span>
          </div>
          <div className="overflow-hidden h-4 text-xs flex rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              style={{ width: `${Math.min(percentage, 100)}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-orange-500' : 'bg-blue-500'
              } transition-all duration-300`}
            />
          </div>
        </div>
      </div>
    );
  };

  if (!isConnected || !telemetry) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Live Telemetry"
          description="Real-time truck status and performance metrics"
        />
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          title="Waiting for Telemetry"
          description="Start driving in American Truck Simulator to see live data. Make sure your telemetry plugin is running and configured."
        />
      </div>
    );
  }

  const fuelPercentage = (telemetry.fuel_current / telemetry.fuel_capacity) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Telemetry"
        description="Real-time truck status and performance metrics"
      />

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-slate-600 dark:text-slate-400">Connected to game</span>
      </div>

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GaugeCard
          label="Speed"
          value={telemetry.speed}
          max={80}
          unit="mph"
          color="text-blue-600 dark:text-blue-400"
        />

        <GaugeCard
          label="RPM"
          value={telemetry.rpm}
          max={3000}
          unit="rpm"
          color="text-purple-600 dark:text-purple-400"
        />

        <GaugeCard
          label="Fuel"
          value={fuelPercentage}
          max={100}
          unit="%"
          color={fuelPercentage < 20 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Truck Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Truck Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Gear</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {telemetry.gear > 0 ? telemetry.gear : telemetry.gear === 0 ? 'N' : 'R'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Engine Damage</span>
              <span className={`text-sm font-medium ${
                telemetry.engine_damage > 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {Math.round(telemetry.engine_damage * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Cargo Damage</span>
              <span className={`text-sm font-medium ${
                telemetry.cargo_damage > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {Math.round(telemetry.cargo_damage * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Fuel Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Fuel Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Current</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {Math.round(telemetry.fuel_current)} gal
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Capacity</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {Math.round(telemetry.fuel_capacity)} gal
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Range (est.)</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {Math.round(telemetry.fuel_current * 6)} mi
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
