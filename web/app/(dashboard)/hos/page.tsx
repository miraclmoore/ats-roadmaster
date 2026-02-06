'use client';

import { PageHeader } from '@/components/layout/page-header';
import { HOSTimerGroup } from '@/components/hos/hos-timer-card';
import { useState, useEffect } from 'react';

export default function HOSPage() {
  // Mock data - in production this would come from telemetry
  const [currentGameTime] = useState(new Date());
  const [lastRestTime] = useState(new Date(Date.now() - 6.5 * 60 * 60 * 1000)); // 6.5 hours ago
  const [shiftStartTime] = useState(new Date(Date.now() - 8 * 60 * 60 * 1000)); // 8 hours ago
  const [drivingMinutes] = useState(6.5 * 60); // 6.5 hours of driving

  // Calculate compliance status
  const isCompliant = drivingMinutes < 11 * 60 && (Date.now() - lastRestTime.getTime()) < 8 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <PageHeader
        title="HOS Tracker"
        description="Hours of Service compliance monitoring"
        compact
        status={
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isCompliant ? 'bg-[rgb(var(--profit))]' : 'bg-[rgb(var(--damage))]'} animate-pulse`} />
            <span className="text-muted-foreground">{isCompliant ? 'Compliant' : 'Warning'}</span>
          </div>
        }
      />

      {/* HOS Timer Cards (snakedbr pattern) */}
      <HOSTimerGroup
        currentGameTime={currentGameTime}
        lastRestTime={lastRestTime}
        shiftStartTime={shiftStartTime}
        drivingMinutesToday={drivingMinutes}
      />

      {/* Today's Activity Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Today's Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
            <div className="text-3xl font-bold text-[rgb(var(--income))] tabular-nums">{(drivingMinutes / 60).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground mt-1">Drive Time</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
            <div className="text-3xl font-bold text-[rgb(var(--fuel))] tabular-nums">{((Date.now() - shiftStartTime.getTime()) / (1000 * 60 * 60)).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground mt-1">On Duty</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
            <div className="text-3xl font-bold text-[rgb(var(--profit))] tabular-nums">0.5</div>
            <div className="text-sm text-muted-foreground mt-1">Off Duty</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
            <div className="text-3xl font-bold text-muted-foreground tabular-nums">0.0</div>
            <div className="text-sm text-muted-foreground mt-1">Sleeper Berth</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-foreground mb-1">About HOS Tracking</h4>
            <p className="text-sm text-muted-foreground">
              This tracker monitors your compliance with Federal Motor Carrier Safety Administration (FMCSA) Hours of Service regulations.
              The system automatically tracks your driving time, on-duty time, and rest periods based on game telemetry data.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">11-Hour Limit:</strong> Maximum driving time after 10 consecutive hours off duty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">14-Hour Limit:</strong> Total shift time (on-duty + driving) before 10-hour break required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">70-Hour Limit:</strong> Maximum on-duty time in 8 consecutive days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong className="text-foreground">8-Hour Break:</strong> Consecutive off-duty or sleeper berth time required for reset</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholder for Phase 5 - Activity Log */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity Log</h3>
        <div className="text-center py-12 text-muted-foreground">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium mb-1">Activity Logs Coming in Phase 5</p>
          <p className="text-sm">Detailed driving and rest period timeline will appear here</p>
        </div>
      </div>

      {/* Phase 3 Note */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm text-foreground font-medium">Phase 3: Read-Only Monitoring</p>
          <p className="text-xs text-muted-foreground mt-1">
            Currently displaying HOS timers in read-only mode. Phase 5 will add automatic activity detection,
            compliance alerts, DVIR checklist, and detailed activity logs.
          </p>
        </div>
      </div>
    </div>
  );
}
