'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Job {
  id: string;
  source_city: string;
  destination_city: string;
  cargo_type: string;
  income: number;
  profit: number;
  distance: number;
  fuel_economy: number;
  completed_at: string;
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: true });

      if (data) {
        setJobs(data);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Performance insights and profitability analysis"
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Performance insights and profitability analysis"
        />
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          title="No Data to Analyze"
          description="Complete some jobs first to see analytics and insights about your trucking business."
        />
      </div>
    );
  }

  // Income over time data
  const incomeData = jobs.slice(-10).map((job) => ({
    date: new Date(job.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    income: job.income,
    profit: job.profit || 0,
  }));

  // Cargo type profitability
  const cargoStats = jobs.reduce((acc: any, job) => {
    if (!acc[job.cargo_type]) {
      acc[job.cargo_type] = { total: 0, count: 0 };
    }
    acc[job.cargo_type].total += job.profit || 0;
    acc[job.cargo_type].count += 1;
    return acc;
  }, {});

  const cargoData = Object.entries(cargoStats)
    .map(([cargo, stats]: [string, any]) => ({
      name: cargo,
      avgProfit: Math.round(stats.total / stats.count),
      jobs: stats.count,
    }))
    .sort((a, b) => b.avgProfit - a.avgProfit)
    .slice(0, 6);

  // Route profitability
  const routeStats = jobs.reduce((acc: any, job) => {
    const route = `${job.source_city}-${job.destination_city}`;
    if (!acc[route]) {
      acc[route] = { total: 0, count: 0, display: `${job.source_city} → ${job.destination_city}` };
    }
    acc[route].total += job.profit || 0;
    acc[route].count += 1;
    return acc;
  }, {});

  const routeData = Object.entries(routeStats)
    .map(([route, stats]: [string, any]) => ({
      route: stats.display,
      profit: Math.round(stats.total / stats.count),
      jobs: stats.count,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Performance insights and profitability analysis"
      />

      {/* Income vs Profit Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Income & Profit Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cargo Type Profitability */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Top Cargo Types by Profit
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cargoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
              />
              <Bar dataKey="avgProfit" fill="#3B82F6" name="Avg Profit ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Route Profitability */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Most Profitable Routes
          </h3>
          <div className="space-y-4">
            {routeData.map((route, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {route.route}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {route.jobs} jobs completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${route.profit.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">avg profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Total Jobs Completed
          </h4>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {jobs.length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Total Distance
          </h4>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {jobs.reduce((sum, job) => sum + job.distance, 0).toLocaleString()} mi
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Avg Fuel Economy
          </h4>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {jobs.some(j => j.fuel_economy)
              ? Math.round(
                  jobs.filter(j => j.fuel_economy).reduce((sum, job) => sum + (job.fuel_economy || 0), 0) /
                  jobs.filter(j => j.fuel_economy).length
                ).toFixed(1)
              : '—'} mpg
          </p>
        </div>
      </div>
    </div>
  );
}
