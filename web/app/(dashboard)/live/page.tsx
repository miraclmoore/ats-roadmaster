'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Gauge } from '@/components/ui/gauge';
import { Alerts } from '@/components/telemetry/alerts';
import { RouteAdvisorCard } from '@/components/telemetry/route-advisor-card';
import { DriverAssists } from '@/components/telemetry/driver-assists';
import { TrendCards } from '@/components/telemetry/trend-cards';
import { ProfileSelector, PRESET_PROFILES, DashboardProfile } from '@/components/telemetry/profile-selector';
import { ProfileCustomizer } from '@/components/telemetry/profile-customizer';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/types/database';

type Telemetry = Database['public']['Tables']['telemetry']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

interface TelemetryHistory {
  speed: number[];
  rpm: number[];
  fuelConsumption: number[];
}

export default function LiveTelemetryPage() {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<DashboardProfile>(PRESET_PROFILES[1]); // Default to Trucker
  const [customProfiles, setCustomProfiles] = useState<DashboardProfile[]>([]);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistory>({
    speed: [],
    rpm: [],
    fuelConsumption: [],
  });
  
  const supabase = createClient();

  // Load saved profile and custom profiles from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('dashboard-profile');
    const savedCustomProfiles = localStorage.getItem('custom-profiles');
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setCurrentProfile(profile);
    }
    
    if (savedCustomProfiles) {
      setCustomProfiles(JSON.parse(savedCustomProfiles));
    }
  }, []);

  // Track telemetry history for trends
  useEffect(() => {
    if (!telemetry) return;

    setTelemetryHistory(prev => {
      const maxHistory = 60; // Keep last 60 data points
      const fuelConsumption = telemetry.speed > 5 
        ? telemetry.speed / Math.max(0.1, telemetry.fuel_current * 0.1)
        : 0;

      return {
        speed: [...prev.speed, telemetry.speed].slice(-maxHistory),
        rpm: [...prev.rpm, telemetry.rpm].slice(-maxHistory),
        fuelConsumption: [...prev.fuelConsumption, fuelConsumption].slice(-maxHistory),
      };
    });
  }, [telemetry]);

  useEffect(() => {
    // Fetch latest telemetry with job data
    const fetchLatest = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('telemetry')
        .select('*, jobs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setTelemetry(data);
        // @ts-ignore - jobs relation
        setJob(data.jobs || null);
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
          async (payload) => {
            const newTelemetry = payload.new as Telemetry;
            setTelemetry(newTelemetry);
            setIsConnected(true);

            // Fetch job data if job_id exists
            if (newTelemetry.job_id) {
              const { data: jobData } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', newTelemetry.job_id)
                .single();
              
              if (jobData) {
                setJob(jobData);
              }
            } else {
              setJob(null);
            }
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

  const handleProfileChange = (profile: DashboardProfile) => {
    setCurrentProfile(profile);
    localStorage.setItem('dashboard-profile', JSON.stringify(profile));
  };

  const handleSaveCustomProfile = (profile: DashboardProfile) => {
    const updatedCustomProfiles = [...customProfiles, profile];
    setCustomProfiles(updatedCustomProfiles);
    localStorage.setItem('custom-profiles', JSON.stringify(updatedCustomProfiles));
    setCurrentProfile(profile);
    localStorage.setItem('dashboard-profile', JSON.stringify(profile));
  };

  const isCardVisible = (cardId: string) => {
    return currentProfile.visibleCards.includes(cardId);
  };


  if (!isConnected || !telemetry) {
    return (
      <div className="space-y-3">
        <PageHeader
          title="Live Telemetry"
          compact
          status={
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">Disconnected</span>
            </div>
          }
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
    <div className="space-y-3">
      <PageHeader
        title="Live Telemetry"
        compact
        status={
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-[rgb(var(--profit))] animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">Connected</span>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <ProfileSelector
              currentProfile={currentProfile}
              customProfiles={customProfiles}
              onProfileChange={handleProfileChange}
              onCustomize={() => setIsCustomizerOpen(true)}
            />
          </div>
        }
      />

      {/* Profile Customizer Modal */}
      <ProfileCustomizer
        isOpen={isCustomizerOpen}
        currentProfile={currentProfile}
        onClose={() => setIsCustomizerOpen(false)}
        onSave={handleSaveCustomProfile}
      />

      {/* Alerts */}
      <Alerts telemetry={telemetry} job={job} />

      {/* Responsive Grid Layout */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        
        {/* Speed Gauge */}
        {isCardVisible('instrument-cluster') && (
          <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
            <Gauge
              value={telemetry.speed}
              max={80}
              label="Speed"
              unit="mph"
              size="md"
              color="primary"
              variant={currentProfile.gaugeStyle}
              cruiseControlSpeed={telemetry.cruise_control_enabled ? telemetry.cruise_control_speed : undefined}
            />
          </div>
        )}

        {/* RPM Gauge */}
        {isCardVisible('instrument-cluster') && (
          <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
            <Gauge
              value={telemetry.rpm}
              max={3000}
              label="Engine RPM"
              unit="rpm"
              size="md"
              color={telemetry.rpm > 2400 ? 'damage' : 'income'}
              variant={currentProfile.gaugeStyle}
              zones={[
                { start: 2000, end: 2400, color: 'rgb(234, 179, 8)' },
                { start: 2400, end: 3000, color: 'rgb(239, 68, 68)' }
              ]}
            />
          </div>
        )}

        {/* Fuel Gauge */}
        {isCardVisible('instrument-cluster') && (
          <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
            <Gauge
              value={fuelPercentage}
              max={100}
              label="Fuel Level"
              unit="%"
              size="md"
              color={fuelPercentage < 20 ? 'damage' : 'fuel'}
              variant={currentProfile.gaugeStyle}
              zones={[
                { start: 0, end: 20, color: 'rgb(239, 68, 68)' }
              ]}
            />
          </div>
        )}

        {/* Route Advisor Card */}
        {isCardVisible('route-advisor') && (
          <div className="md:col-span-3 lg:col-span-1 xl:col-span-2 row-span-2">
            <RouteAdvisorCard telemetry={telemetry} job={job} />
          </div>
        )}

        {/* Driver Assists */}
        {isCardVisible('driver-assists') && (
          <div className="md:col-span-3 lg:col-span-2 xl:col-span-3">
            <DriverAssists telemetry={telemetry} />
          </div>
        )}

        {/* Combined Vehicle & Fuel Status */}
        {(isCardVisible('vehicle-condition') || isCardVisible('fuel-system')) && (
          <div className="md:col-span-3 lg:col-span-2 xl:col-span-3 bg-card border-2 border-border rounded-lg p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--damage))]" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {isCardVisible('vehicle-condition') && (
                <>
                  <div className="flex flex-col items-center">
                    <Gauge
                      value={Math.max(0, 100 - telemetry.engine_damage)}
                      max={100}
                      label="Engine"
                      unit="%"
                      size="sm"
                      color={telemetry.engine_damage > 10 ? 'damage' : 'profit'}
                      variant={currentProfile.gaugeStyle}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <Gauge
                      value={Math.max(0, 100 - telemetry.cargo_damage)}
                      max={100}
                      label="Cargo"
                      unit="%"
                      size="sm"
                      color={telemetry.cargo_damage > 5 ? 'damage' : 'profit'}
                      variant={currentProfile.gaugeStyle}
                    />
                  </div>
                </>
              )}
              {isCardVisible('fuel-system') && (
                <>
                  <div className="flex flex-col justify-center space-y-1 border-l border-border pl-3">
                    <div className="text-xs text-muted-foreground">Fuel</div>
                    <div className="text-lg font-bold text-foreground">{Math.round(telemetry.fuel_current)} gal</div>
                    <div className="text-xs text-muted-foreground">of {Math.round(telemetry.fuel_capacity)}</div>
                  </div>
                  <div className="flex flex-col justify-center space-y-1 border-l border-border pl-3">
                    <div className="text-xs text-muted-foreground">Range</div>
                    <div className={`text-lg font-bold ${
                      fuelPercentage < 20 ? 'text-[rgb(var(--damage))]' : 'text-[rgb(var(--fuel))]'
                    }`}>
                      {Math.round(telemetry.fuel_current * 6)} mi
                    </div>
                    <div className="text-xs text-muted-foreground">{Math.round(fuelPercentage)}%</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Performance Trends - shown only if visible in profile and we have history */}
        {isCardVisible('trends') && telemetryHistory.speed.length > 10 && (
          <div className="md:col-span-3 lg:col-span-4 xl:col-span-6">
            <TrendCards 
              history={telemetryHistory}
              currentSpeed={telemetry.speed}
              currentRpm={telemetry.rpm}
              currentFuel={telemetry.speed > 5 ? telemetry.speed / Math.max(0.1, telemetry.fuel_current * 0.1) : 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
