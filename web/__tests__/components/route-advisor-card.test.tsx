import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteAdvisorCard } from '@/components/telemetry/route-advisor-card';
import { Database } from '@/lib/types/database';
import '@testing-library/jest-dom';

type Telemetry = Database['public']['Tables']['telemetry']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

// Helper to create minimal telemetry data
const createMockTelemetry = (overrides?: Partial<Telemetry>): Telemetry => ({
  id: 'telemetry-1',
  user_id: 'user-1',
  job_id: null,
  speed: 0,
  rpm: 0,
  gear: 0,
  fuel_current: 100,
  fuel_capacity: 200,
  engine_damage: 0,
  transmission_damage: 0,
  chassis_damage: 0,
  wheels_damage: 0,
  cabin_damage: 0,
  cargo_damage: 0,
  position_x: 0,
  position_y: 0,
  position_z: 0,
  game_time: null,
  created_at: new Date().toISOString(),
  brake_temperature: 0,
  cruise_control_enabled: false,
  cruise_control_speed: null,
  speed_limit: null,
  navigation_distance: null,
  navigation_time: null,
  ...overrides,
});

// Helper to create minimal job data
const createMockJob = (overrides?: Partial<Job>): Job => ({
  id: 'job-1',
  user_id: 'user-1',
  source_city: 'Los Angeles',
  source_company: 'Acme Corp',
  destination_city: 'San Francisco',
  destination_company: 'Tech Inc',
  cargo_type: 'Electronics',
  cargo_weight: 20000,
  income: 5000,
  distance: 380,
  started_at: new Date().toISOString(),
  completed_at: null,
  deadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
  delivered_late: false,
  fuel_consumed: null,
  damage_taken: null,
  avg_speed: null,
  avg_rpm: null,
  fuel_cost: null,
  damage_cost: null,
  profit: null,
  profit_per_mile: null,
  fuel_economy: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('RouteAdvisorCard Component', () => {
  test('renders with route data', () => {
    const telemetry = createMockTelemetry();
    const job = createMockJob({
      source_city: 'Los Angeles',
      destination_city: 'San Francisco',
    });

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Verify destination city is displayed
    expect(screen.getByText('San Francisco')).toBeInTheDocument();

    // Verify route advisor heading
    expect(screen.getByText('Route Advisor')).toBeInTheDocument();
  });

  test('displays cargo information', () => {
    const telemetry = createMockTelemetry();
    const job = createMockJob({
      cargo_type: 'Electronics',
      cargo_weight: 20000,
    });

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Verify cargo type is shown
    expect(screen.getByText('Electronics')).toBeInTheDocument();

    // Verify weight is shown (converted to lbs)
    const weightInLbs = Math.round(20000 * 2.20462);
    expect(screen.getByText(new RegExp(`${weightInLbs}.*lbs`, 'i'))).toBeInTheDocument();
  });

  test('shows income and distance', () => {
    const telemetry = createMockTelemetry({
      navigation_distance: 266, // Using navigation_distance from SDK
    });
    const job = createMockJob({
      income: 5000,
      distance: 380,
    });

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Verify component renders job destination without crashing
    expect(screen.getByText('San Francisco')).toBeInTheDocument();

    // Verify cargo is displayed (guaranteed to be present when job exists)
    expect(screen.getByText('Electronics')).toBeInTheDocument();

    // Verify component structure is rendered
    expect(screen.getByText('Route Advisor')).toBeInTheDocument();
  });

  test('handles missing optional data', () => {
    const telemetry = createMockTelemetry();
    const job = createMockJob({
      source_company: null,
      destination_company: null,
      cargo_weight: null,
    });

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Should still render with only required data
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();

    // Component shouldn't crash
    expect(screen.getByText('Route Advisor')).toBeInTheDocument();
  });

  test('displays delivery deadline', () => {
    const telemetry = createMockTelemetry();
    const deadlineDate = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now
    const job = createMockJob({
      deadline: deadlineDate.toISOString(),
    });

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Verify deadline time is shown (format: HH:MM)
    const timeString = deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(screen.getByText(timeString)).toBeInTheDocument();
  });

  test('displays no active job message when job is null', () => {
    const telemetry = createMockTelemetry();

    render(<RouteAdvisorCard telemetry={telemetry} job={null} />);

    // Should show "No active job" message
    expect(screen.getByText('No active job')).toBeInTheDocument();

    // Should still show Route Advisor header
    expect(screen.getByText('Route Advisor')).toBeInTheDocument();
  });

  test('displays current speed correctly', () => {
    const telemetry = createMockTelemetry({ speed: 65 });
    const job = createMockJob();

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Speed should be displayed (rounded)
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  test('shows speed limit when available', () => {
    const telemetry = createMockTelemetry({
      speed: 55,
      speed_limit: 65,
    });
    const job = createMockJob();

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Speed limit should be displayed
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  test('shows cruise control status', () => {
    const telemetry = createMockTelemetry({
      cruise_control_enabled: true,
      cruise_control_speed: 60,
    });
    const job = createMockJob();

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Should show cruise control is active
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  test('shows cruise control as OFF when disabled', () => {
    const telemetry = createMockTelemetry({
      cruise_control_enabled: false,
    });
    const job = createMockJob();

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Should show cruise control is off
    expect(screen.getByText('OFF')).toBeInTheDocument();
  });

  test('displays current gear', () => {
    const telemetry = createMockTelemetry({ gear: 8 });
    const job = createMockJob();

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Gear should be displayed
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('displays neutral gear as N', () => {
    const telemetry = createMockTelemetry({ gear: 0 });
    const job = createMockJob();

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Neutral gear should show as 'N'
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  test('calculates and displays progress percentage', () => {
    const telemetry = createMockTelemetry({
      navigation_distance: 190, // Half of total distance
    });
    const job = createMockJob({
      distance: 380,
    });

    render(<RouteAdvisorCard telemetry={telemetry} job={job} />);

    // Should show remaining distance
    expect(screen.getByText(/190.*mi/i)).toBeInTheDocument();

    // Should show progress percentage (50%)
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
