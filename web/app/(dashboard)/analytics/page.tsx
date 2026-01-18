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
          description="Business intelligence - profit trends and route analysis"
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary" />
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Business intelligence - profit trends and route analysis"
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
        description="Business intelligence - profit trends and route analysis"
      />

      {/* Income vs Profit Chart */}
      <div className="bg-card rounded-lg border-2 border-border p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--profit))]" />

        <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">
          Income & Profit Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(61, 68, 77)" opacity={0.3} />
            <XAxis dataKey="date" stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(37, 42, 49)',
                border: '1px solid rgb(61, 68, 77)',
                borderRadius: '8px',
                color: 'rgb(240, 244, 248)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            <Line type="monotone" dataKey="income" stroke="rgb(6, 182, 212)" strokeWidth={3} name="Income" />
            <Line type="monotone" dataKey="profit" stroke="rgb(16, 185, 129)" strokeWidth={3} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cargo Type Profitability */}
        <div className="bg-card rounded-lg border-2 border-border p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">
            Top Cargo Types by Profit
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cargoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(61, 68, 77)" opacity={0.3} />
              <XAxis dataKey="name" stroke="rgb(148, 163, 184)" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
              <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(37, 42, 49)',
                  border: '1px solid rgb(61, 68, 77)',
                  borderRadius: '8px',
                  color: 'rgb(240, 244, 248)',
                }}
              />
              <Bar dataKey="avgProfit" fill="rgb(59, 130, 246)" name="Avg Profit ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Route Profitability */}
        <div className="bg-card rounded-lg border-2 border-border p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--profit))]" />

          <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wide">
            Most Profitable Routes
          </h3>
          <div className="space-y-3">
            {routeData.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary border border-border rounded hover:border-primary transition-all">
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {route.route}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {route.jobs} deliveries completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold metric-value text-[rgb(var(--profit))]">
                    ${route.profit.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">avg profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border-2 border-primary rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Total Jobs Completed
          </h4>
          <p className="text-4xl font-bold metric-value text-primary">
            {jobs.length}
          </p>
        </div>

        <div className="bg-card border-2 border-[rgb(var(--profit))] rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--profit))]" />
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Total Distance
          </h4>
          <p className="text-4xl font-bold metric-value text-[rgb(var(--profit))]">
            {jobs.reduce((sum, job) => sum + job.distance, 0).toLocaleString()}
            <span className="text-lg text-muted-foreground ml-2">mi</span>
          </p>
        </div>

        <div className="bg-card border-2 border-[rgb(var(--fuel))] rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[rgb(var(--fuel))]" />
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Avg Fuel Economy
          </h4>
          <p className="text-4xl font-bold metric-value text-[rgb(var(--fuel))]">
            {jobs.some(j => j.fuel_economy)
              ? Math.round(
                  jobs.filter(j => j.fuel_economy).reduce((sum, job) => sum + (job.fuel_economy || 0), 0) /
                  jobs.filter(j => j.fuel_economy).length
                ).toFixed(1)
              : '—'}
            <span className="text-lg text-muted-foreground ml-2">mpg</span>
          </p>
        </div>
      </div>
    </div>
  );
}
