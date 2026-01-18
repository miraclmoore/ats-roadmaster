import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch Board"
        description="Complete job log - every mile, every dollar"
      />

      {!jobs || jobs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No Jobs Yet"
          description="Start driving in American Truck Simulator to see your job history here. Make sure the telemetry plugin is installed and configured."
        />
      ) : (
        <div className="bg-card rounded-lg border-2 border-border overflow-hidden relative">
          {/* Top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b-2 border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-secondary transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-foreground">
                          {job.source_city}
                        </div>
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <div className="text-sm font-bold text-foreground">
                          {job.destination_city}
                        </div>
                      </div>
                      {job.source_company && (
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                          {job.source_company} → {job.destination_company}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        {job.cargo_type}
                      </div>
                      {job.cargo_weight && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {job.cargo_weight.toLocaleString()} lbs
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold metric-value text-foreground">
                        {job.distance} <span className="text-xs text-muted-foreground">mi</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold metric-value text-[rgb(var(--income))]">
                        ${job.income.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.profit ? (
                        <div className={`text-lg font-bold metric-value ${job.profit > 0 ? 'text-[rgb(var(--profit))]' : 'text-[rgb(var(--damage))]'}`}>
                          {job.profit > 0 ? '+' : ''}${Math.round(job.profit).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {job.completed_at ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                          job.delivered_late
                            ? 'bg-[rgb(var(--fuel))] bg-opacity-20 text-[rgb(var(--fuel))] border border-[rgb(var(--fuel))]'
                            : 'bg-[rgb(var(--profit))] bg-opacity-20 text-[rgb(var(--profit))] border border-[rgb(var(--profit))]'
                        }`}>
                          {job.delivered_late ? 'Late' : 'On Time'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wide bg-primary bg-opacity-20 text-primary border border-primary">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground font-mono">
                        {job.completed_at
                          ? new Date(job.completed_at).toLocaleDateString()
                          : 'Ongoing'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
