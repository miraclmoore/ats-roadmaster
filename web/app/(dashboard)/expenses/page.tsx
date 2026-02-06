'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Transaction {
  id: string;
  timestamp: string;
  description: string;
  type: 'fuel' | 'damage' | 'income';
  amount: number;
  jobId: string;
  route?: string;
}

interface ExpenseSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  fineCount: number;
}

type FilterType = 'all' | 'fuel' | 'damage' | 'income';

export default function ExpensesPage() {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (jobs && jobs.length > 0) {
        // Build transaction list (each job creates 2-3 transactions: income, fuel, damage)
        const txList: Transaction[] = [];

        jobs.forEach(job => {
          const route = `${job.source_city} → ${job.destination_city}`;
          const timestamp = job.completed_at;

          // Income transaction
          txList.push({
            id: `${job.id}-income`,
            timestamp,
            description: `${job.cargo_type} delivery`,
            type: 'income',
            amount: job.income || 0,
            jobId: job.id,
            route,
          });

          // Fuel expense
          if (job.fuel_cost && job.fuel_cost > 0) {
            txList.push({
              id: `${job.id}-fuel`,
              timestamp,
              description: `Fuel (${(job.fuel_consumed || 0).toFixed(1)} gal)`,
              type: 'fuel',
              amount: job.fuel_cost,
              jobId: job.id,
              route,
            });
          }

          // Damage expense
          if (job.damage_cost && job.damage_cost > 0) {
            txList.push({
              id: `${job.id}-damage`,
              timestamp,
              description: `Repairs (${(job.damage_taken || 0).toFixed(1)}% damage)`,
              type: 'damage',
              amount: job.damage_cost,
              jobId: job.id,
              route,
            });
          }
        });

        // Sort by timestamp (most recent first)
        txList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setTransactions(txList);
        setFilteredTransactions(txList);

        // Calculate summary
        const totalRevenue = jobs.reduce((sum, job) => sum + (job.income || 0), 0);
        const totalFuel = jobs.reduce((sum, job) => sum + (job.fuel_cost || 0), 0);
        const totalDamage = jobs.reduce((sum, job) => sum + (job.damage_cost || 0), 0);
        const totalExpenses = totalFuel + totalDamage;

        setSummary({
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          fineCount: 0, // TODO: Implement fines tracking in Phase 5
        });
      }

      setLoading(false);
    };

    fetchExpenses();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(tx => new Date(tx.timestamp) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(tx => new Date(tx.timestamp) <= toDate);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType, dateFrom, dateTo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Economy" description="Track revenue, expenses, and profitability" compact />
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!summary || transactions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Economy" description="Track revenue, expenses, and profitability" compact />
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No Transaction Data"
          description="Complete some jobs to see your revenue and expenses."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Economy" description="Track revenue, expenses, and profitability" compact />

      {/* Summary Cards (snakedbr pattern) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Profit */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-muted-foreground font-medium">Net Profit</p>
          </div>
          <p className={`text-4xl font-bold tabular-nums ${summary.netProfit >= 0 ? 'text-[rgb(var(--profit))]' : 'text-[rgb(var(--damage))]'}`}>
            {formatCurrency(summary.netProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {summary.netProfit >= 0 ? 'Profitable' : 'Operating at loss'}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
          </div>
          <p className="text-4xl font-bold text-[rgb(var(--income))] tabular-nums">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            All job income
          </p>
        </div>

        {/* Fines (placeholder) */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-muted-foreground font-medium">Fine Count</p>
          </div>
          <p className="text-4xl font-bold text-foreground tabular-nums">
            {summary.fineCount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Traffic violations
          </p>
        </div>
      </div>

      {/* Filters Section (snakedbr pattern) */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            options={[
              { value: 'all', label: 'All Transactions' },
              { value: 'income', label: 'Income' },
              { value: 'fuel', label: 'Fuel' },
              { value: 'damage', label: 'Damage' },
            ]}
          />
          <Input
            label="From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {(filterType !== 'all' || dateFrom || dateTo) && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Transaction List (snakedbr pattern) */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No transactions match your filters
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const dateTime = formatDateTime(tx.timestamp);
                  const isIncome = tx.type === 'income';
                  const valueColor = isIncome
                    ? 'text-[rgb(var(--profit))]'
                    : 'text-[rgb(var(--damage))]';

                  return (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{dateTime.date}</div>
                        <div className="text-xs text-muted-foreground">{dateTime.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{tx.description}</div>
                        {tx.route && (
                          <div className="text-xs text-muted-foreground">{tx.route}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-bold tabular-nums ${valueColor}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
