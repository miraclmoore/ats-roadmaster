import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/ui/stats-card';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your trucking business overview."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="Total Jobs"
          value={totalJobs}
          variant="default"
        />

        <StatsCard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Total Income"
          value={`$${totalIncome.toLocaleString()}`}
          variant="success"
        />

        <StatsCard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="Net Profit"
          value={`$${totalProfit.toLocaleString()}`}
          variant="default"
        />

        <StatsCard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          label="Avg Profit/Job"
          value={`$${completedJobs > 0 ? Math.round(totalProfit / completedJobs).toLocaleString() : 0}`}
          variant="default"
        />
      </div>

      {/* Quick Start / Setup Instructions */}
      {totalJobs === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
            🎯 Get Started
          </h2>
          <p className="text-blue-700 dark:text-blue-400 mb-4">
            To start tracking your ATS jobs, you need to install the telemetry plugin.
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p className="text-blue-800 dark:text-blue-300">
                Download the RoadMaster Pro telemetry plugin
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div className="text-blue-800 dark:text-blue-300">
                <p>Copy your API key:</p>
                <code className="block mt-2 p-2 bg-white dark:bg-slate-800 rounded text-xs font-mono">
                  {preferences?.api_key || 'Loading...'}
                </code>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p className="text-blue-800 dark:text-blue-300">
                Install the plugin to your ATS directory and configure it with your API key
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <p className="text-blue-800 dark:text-blue-300">
                Launch ATS and start driving - your data will appear here!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      {totalJobs > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Jobs
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {jobs?.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {job.source_city} → {job.destination_city}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {job.cargo_type} • {job.distance} mi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      ${job.income}
                    </p>
                    {job.profit && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        ${job.profit} profit
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
