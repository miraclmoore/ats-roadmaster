'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Gauge } from '@/components/ui/gauge';
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
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('telemetry-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'telemetry',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setTelemetry(payload.new as TelemetryData);
            setIsConnected(true);
          }
        )
        .subscribe();

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel> | undefined;
    setupRealtime().then(ch => { channel = ch; });

    // Fallback polling every 1 second for real-time feel
    const pollInterval = setInterval(fetchLatest, 1000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(pollInterval);
    };
  }, []);


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
        description="Real-time truck dashboard - like riding shotgun"
      />

      {/* Connection Status - CB Radio Style */}
      <div className="bg-card border-2 border-[rgb(var(--profit))] rounded-lg p-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-[rgb(var(--profit))] animate-pulse shadow-lg shadow-[rgb(var(--profit))]" />
        <span className="text-foreground font-semibold uppercase tracking-wide">
          Connected to Truck
        </span>
        <div className="ml-auto text-sm text-muted-foreground font-mono">
          Live Data Stream Active
        </div>
      </div>

      {/* Primary Gauges - Like Real Truck Dashboard */}
      <div className="bg-card rounded-lg border-2 border-border p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

        <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">
          Instrument Cluster
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Gauge
            value={telemetry.speed}
            max={80}
            label="Speed"
            unit="mph"
            size="lg"
            color="primary"
          />

          <Gauge
            value={telemetry.rpm}
            max={3000}
            label="Engine RPM"
            unit="rpm"
            size="lg"
            color={telemetry.rpm > 2400 ? 'damage' : 'income'}
          />

          <Gauge
            value={fuelPercentage}
            max={100}
            label="Fuel Level"
            unit="%"
            size="lg"
            color={fuelPercentage < 20 ? 'damage' : 'fuel'}
          />
        </div>
      </div>

      {/* Damage Gauges */}
      <div className="bg-card rounded-lg border-2 border-border p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--damage))]" />

        <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">
          Vehicle Condition
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Gauge
            value={Math.max(0, 100 - telemetry.engine_damage * 100)}
            max={100}
            label="Engine Health"
            unit="%"
            size="md"
            color={telemetry.engine_damage > 0.1 ? 'damage' : 'profit'}
          />

          <Gauge
            value={Math.max(0, 100 - telemetry.cargo_damage * 100)}
            max={100}
            label="Cargo Integrity"
            unit="%"
            size="md"
            color={telemetry.cargo_damage > 0.05 ? 'damage' : 'profit'}
          />
        </div>
      </div>

      {/* Status Readouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Truck Status */}
        <div className="bg-card border-2 border-border rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">
            Drive Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Current Gear</span>
              <span className="text-2xl font-bold metric-value text-primary">
                {telemetry.gear > 0 ? telemetry.gear : telemetry.gear === 0 ? 'N' : 'R'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Engine Damage</span>
              <span className={`text-lg font-bold metric-value ${
                telemetry.engine_damage > 0.1 ? 'text-[rgb(var(--damage))]' : 'text-[rgb(var(--profit))]'
              }`}>
                {Math.round(telemetry.engine_damage * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Cargo Damage</span>
              <span className={`text-lg font-bold metric-value ${
                telemetry.cargo_damage > 0.05 ? 'text-[rgb(var(--damage))]' : 'text-[rgb(var(--profit))]'
              }`}>
                {Math.round(telemetry.cargo_damage * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Fuel Status */}
        <div className="bg-card border-2 border-border rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--fuel))]" />

          <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wide">
            Fuel System
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Current</span>
              <span className="text-lg font-bold metric-value text-foreground">
                {Math.round(telemetry.fuel_current)} gal
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Capacity</span>
              <span className="text-lg font-bold metric-value text-foreground">
                {Math.round(telemetry.fuel_capacity)} gal
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Est. Range</span>
              <span className={`text-lg font-bold metric-value ${
                fuelPercentage < 20 ? 'text-[rgb(var(--damage))]' : 'text-[rgb(var(--fuel))]'
              }`}>
                {Math.round(telemetry.fuel_current * 6)} mi
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
