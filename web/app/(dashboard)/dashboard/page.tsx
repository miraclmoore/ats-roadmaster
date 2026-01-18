import { createClient } from '@/lib/supabase/server';
import { MetricCard } from '@/components/ui/metric-card';
import { Gauge } from '@/components/ui/gauge';
import { PageHeader } from '@/components/layout/page-header';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user's stats
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const totalJobs = jobs?.length || 0;
  const completedJobs = jobs?.filter((j) => j.completed_at).length || 0;
  const totalIncome = jobs?.reduce((sum, j) => sum + (j.income || 0), 0) || 0;
  const totalProfit = jobs?.reduce((sum, j) => sum + (j.profit || 0), 0) || 0;

  // Calculate performance metrics
  const avgFuelEconomy = jobs?.filter(j => j.fuel_economy).reduce((sum, j) => sum + (j.fuel_economy || 0), 0) / (jobs?.filter(j => j.fuel_economy).length || 1) || 0;
  const avgDamage = jobs?.filter(j => j.damage_taken).reduce((sum, j) => sum + (j.damage_taken || 0), 0) / (jobs?.filter(j => j.damage_taken).length || 1) || 0;
  const onTimePercentage = completedJobs > 0 ? ((jobs?.filter(j => j.completed_at && !j.delivered_late).length || 0) / completedJobs) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your trucking business overview."
      />

      {/* Stats Grid - Trucking Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="Total Jobs Completed"
          value={totalJobs}
          subtitle={`${completedJobs} delivered`}
          variant="default"
        />

        <MetricCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Total Income"
          value={`$${totalIncome.toLocaleString()}`}
          subtitle="Gross revenue"
          variant="income"
        />

        <MetricCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="Net Profit"
          value={`$${totalProfit.toLocaleString()}`}
          subtitle="After fuel & damage"
          variant="profit"
          trend={totalProfit > 0 ? { value: 12.5, isPositive: true } : undefined}
        />

        <MetricCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          label="Avg Profit Per Job"
          value={`$${completedJobs > 0 ? Math.round(totalProfit / completedJobs).toLocaleString() : 0}`}
          subtitle="Per delivery"
          variant="default"
        />
      </div>

      {/* Performance Gauges - Only show if we have job data */}
      {totalJobs > 0 && (
        <div className="bg-card rounded-lg border-2 border-border p-6 relative overflow-hidden">
          {/* Top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--profit))]" />

          <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">
            Performance Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Gauge
              value={avgFuelEconomy}
              max={10}
              label="Fuel Economy"
              unit="MPG"
              size="md"
              color="fuel"
            />

            <Gauge
              value={Math.max(0, 100 - avgDamage)}
              max={100}
              label="Vehicle Condition"
              unit="%"
              size="md"
              color="profit"
            />

            <Gauge
              value={onTimePercentage}
              max={100}
              label="On-Time Delivery"
              unit="%"
              size="md"
              color="income"
            />
          </div>
        </div>
      )}

      {/* Quick Start / Setup Instructions - Industrial Style */}
      {totalJobs === 0 && (
        <div className="bg-card border-2 border-primary rounded-lg p-6 relative overflow-hidden">
          {/* Top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <h2 className="text-xl font-bold text-foreground mb-2 uppercase tracking-wide">
            Get Started
          </h2>
          <p className="text-muted-foreground mb-4">
            Install the telemetry plugin to start tracking your ATS career.
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-bold">
                1
              </span>
              <p className="text-foreground pt-1">
                Download the RoadMaster Pro telemetry plugin
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div className="text-foreground pt-1 flex-1">
                <p className="mb-2">Copy your API key:</p>
                <code className="block p-3 bg-secondary border border-border rounded text-xs font-mono text-primary">
                  {preferences?.api_key || 'Loading...'}
                </code>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-bold">
                3
              </span>
              <p className="text-foreground pt-1">
                Install the plugin to your ATS directory and configure it with your API key
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-bold">
                4
              </span>
              <p className="text-foreground pt-1">
                Launch ATS and start driving - your data will appear here!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs - Dispatch Board Style */}
      {totalJobs > 0 && (
        <div className="bg-card rounded-lg border-2 border-border relative overflow-hidden">
          {/* Top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
              Recent Deliveries
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {jobs?.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-secondary border border-border rounded-lg hover:border-primary transition-all"
                >
                  <div className="flex-1">
                    <p className="font-bold text-foreground mb-1">
                      {job.source_city} → {job.destination_city}
                    </p>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {job.cargo_type} • {job.distance} mi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold metric-value text-[rgb(var(--income))]">
                      ${job.income.toLocaleString()}
                    </p>
                    {job.profit && (
                      <p className={`text-sm font-semibold ${job.profit > 0 ? 'text-[rgb(var(--profit))]' : 'text-[rgb(var(--damage))]'}`}>
                        {job.profit > 0 ? '+' : ''}${job.profit.toLocaleString()} profit
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
