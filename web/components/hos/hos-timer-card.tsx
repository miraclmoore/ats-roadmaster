'use client';

export interface HOSTimerData {
  regulationName: string;
  totalMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
  status: 'safe' | 'warning' | 'critical';
  description: string;
}

export interface HOSTimerCardProps {
  data: HOSTimerData;
  className?: string;
}

export function HOSTimerCard({ data, className = '' }: HOSTimerCardProps) {
  // Format time as "10h 56m"
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate percentage used
  const percentageUsed = (data.usedMinutes / data.totalMinutes) * 100;

  // Determine status color
  const getStatusColor = () => {
    switch (data.status) {
      case 'safe':
        return 'text-[rgb(var(--profit))]';
      case 'warning':
        return 'text-[rgb(var(--fuel))]';
      case 'critical':
        return 'text-[rgb(var(--damage))]';
      default:
        return 'text-foreground';
    }
  };

  // Progress bar color
  const getProgressBarColor = () => {
    switch (data.status) {
      case 'safe':
        return 'bg-[rgb(var(--profit))]';
      case 'warning':
        return 'bg-[rgb(var(--fuel))]';
      case 'critical':
        return 'bg-[rgb(var(--damage))]';
      default:
        return 'bg-primary';
    }
  };

  const statusColor = getStatusColor();
  const progressBarColor = getProgressBarColor();

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {/* Regulation name */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {data.regulationName}
        </p>
        <div
          className={`w-3 h-3 rounded-full ${
            data.status === 'safe'
              ? 'bg-[rgb(var(--profit))]'
              : data.status === 'warning'
              ? 'bg-[rgb(var(--fuel))]'
              : 'bg-[rgb(var(--damage))]'
          }`}
          title={data.status}
        />
      </div>

      {/* Large countdown timer */}
      <div className="mb-4">
        <p className={`text-5xl font-bold tabular-nums ${statusColor}`}>
          {formatTime(data.remainingMinutes)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={`absolute inset-y-0 left-0 ${progressBarColor} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, percentageUsed)}%` }}
        />
      </div>

      {/* Used time */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Used: <span className="font-semibold tabular-nums">{formatTime(data.usedMinutes)}</span>
        </span>
        <span className="text-muted-foreground">
          <span className="font-semibold tabular-nums">{percentageUsed.toFixed(0)}%</span> consumed
        </span>
      </div>
    </div>
  );
}

export interface HOSTimerGroupProps {
  currentGameTime: Date;
  lastRestTime?: Date;
  shiftStartTime?: Date;
  drivingMinutesToday?: number;
  className?: string;
}

export function HOSTimerGroup({
  currentGameTime,
  lastRestTime,
  shiftStartTime,
  drivingMinutesToday = 0,
  className = '',
}: HOSTimerGroupProps) {
  // Calculate time since last rest (8-hour break requirement)
  const minutesSinceRest = lastRestTime
    ? Math.floor((currentGameTime.getTime() - lastRestTime.getTime()) / (1000 * 60))
    : 0;

  // Calculate time since shift start (14-hour shift limit)
  const minutesSinceShiftStart = shiftStartTime
    ? Math.floor((currentGameTime.getTime() - shiftStartTime.getTime()) / (1000 * 60))
    : 0;

  // 8-Hour Break Timer
  const eightHourBreak: HOSTimerData = {
    regulationName: '8 Hour Break',
    totalMinutes: 8 * 60, // 480 minutes
    usedMinutes: minutesSinceRest,
    remainingMinutes: Math.max(0, 8 * 60 - minutesSinceRest),
    status:
      minutesSinceRest >= 8 * 60
        ? 'critical'
        : minutesSinceRest >= 7 * 60
        ? 'warning'
        : 'safe',
    description: 'Time since last 8-hour rest',
  };

  // 11-Hour Drive Timer
  const elevenHourDrive: HOSTimerData = {
    regulationName: '11 Hour Drive',
    totalMinutes: 11 * 60, // 660 minutes
    usedMinutes: drivingMinutesToday,
    remainingMinutes: Math.max(0, 11 * 60 - drivingMinutesToday),
    status:
      drivingMinutesToday >= 11 * 60
        ? 'critical'
        : drivingMinutesToday >= 10 * 60
        ? 'warning'
        : 'safe',
    description: 'Cumulative driving time today',
  };

  // 14-Hour Shift Timer
  const fourteenHourShift: HOSTimerData = {
    regulationName: '14 Hour Shift',
    totalMinutes: 14 * 60, // 840 minutes
    usedMinutes: minutesSinceShiftStart,
    remainingMinutes: Math.max(0, 14 * 60 - minutesSinceShiftStart),
    status:
      minutesSinceShiftStart >= 14 * 60
        ? 'critical'
        : minutesSinceShiftStart >= 13 * 60
        ? 'warning'
        : 'safe',
    description: 'Time since shift started',
  };

  // 70-Hour Cycle (simplified - would need 7 days of data)
  const seventyHourCycle: HOSTimerData = {
    regulationName: '70 Hour Cycle',
    totalMinutes: 70 * 60, // 4200 minutes
    usedMinutes: 0, // Placeholder - needs implementation
    remainingMinutes: 70 * 60,
    status: 'safe',
    description: 'Rolling 7-day total (coming soon)',
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <HOSTimerCard data={eightHourBreak} />
      <HOSTimerCard data={elevenHourDrive} />
      <HOSTimerCard data={fourteenHourShift} />
      <HOSTimerCard data={seventyHourCycle} />
    </div>
  );
}
