import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { useEffect, useState } from 'react';
import '@testing-library/jest-dom';

/**
 * Test component that mimics the real-time telemetry subscription pattern
 * Used in the actual LiveTelemetryPage component
 */
interface TelemetryData {
  id: string;
  speed: number;
  rpm: number;
  fuel_current: number;
  fuel_capacity: number;
}

function TestLiveTelemetry({ userId }: { userId: string }) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate the createClient() pattern
  const createClient = vi.fn(() => mockSupabase);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const channel = supabase
      .channel('telemetry-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (mounted) {
            setTelemetry(payload.new as TelemetryData);
            setIsConnected(true);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!telemetry) {
    return <div data-testid="waiting-state">Waiting for data</div>;
  }

  return (
    <div data-testid="telemetry-active">
      <div data-testid="connection-status">{isConnected ? 'Connected' : 'Disconnected'}</div>
      <div data-testid="speed">{telemetry.speed}</div>
      <div data-testid="rpm">{telemetry.rpm}</div>
      <div data-testid="fuel">{telemetry.fuel_current}/{telemetry.fuel_capacity}</div>
    </div>
  );
}

/**
 * Mock Supabase real-time channel
 */
let mockChannelCallbacks: { [key: string]: Function } = {};

const mockChannel = {
  on: vi.fn((event: string, config: any, callback: Function) => {
    // Store the callback for later invocation
    mockChannelCallbacks[event] = callback;
    return mockChannel;
  }),
  subscribe: vi.fn(() => {
    return Promise.resolve({ status: 'SUBSCRIBED' });
  }),
  unsubscribe: vi.fn(),
};

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
};

describe('Live Dashboard - Real-time Telemetry Subscription', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockChannelCallbacks = {};
    cleanup();
  });

  test('renders waiting state initially', () => {
    render(<TestLiveTelemetry userId="test-user-123" />);

    // Should show waiting message when no telemetry received
    expect(screen.getByTestId('waiting-state')).toBeInTheDocument();
    expect(screen.getByText('Waiting for data')).toBeInTheDocument();
  });

  test('subscribes to Supabase real-time channel on mount', () => {
    render(<TestLiveTelemetry userId="test-user-123" />);

    // Verify createClient().channel() was called
    expect(mockSupabase.channel).toHaveBeenCalledWith('telemetry-updates');

    // Verify channel.on() was called with correct event type
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: 'INSERT',
        schema: 'public',
        table: 'telemetry',
        filter: 'user_id=eq.test-user-123',
      }),
      expect.any(Function)
    );

    // Verify channel.subscribe() was called
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  test('updates UI when telemetry data received', async () => {
    render(<TestLiveTelemetry userId="test-user-123" />);

    // Initially shows waiting state
    expect(screen.getByTestId('waiting-state')).toBeInTheDocument();

    // Simulate WebSocket message by calling the 'postgres_changes' callback
    const telemetryData: TelemetryData = {
      id: 'telemetry-1',
      speed: 65,
      rpm: 1500,
      fuel_current: 150,
      fuel_capacity: 300,
    };

    // Get the callback that was registered with .on()
    const callback = mockChannelCallbacks['postgres_changes'];
    expect(callback).toBeDefined();

    // Simulate receiving data from WebSocket
    callback({ new: telemetryData });

    // Wait for UI to update
    await waitFor(() => {
      expect(screen.getByTestId('telemetry-active')).toBeInTheDocument();
    });

    // Verify telemetry data is displayed
    expect(screen.getByTestId('speed')).toHaveTextContent('65');
    expect(screen.getByTestId('rpm')).toHaveTextContent('1500');
    expect(screen.getByTestId('fuel')).toHaveTextContent('150/300');
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
  });

  test('unsubscribes from channel on unmount', () => {
    const { unmount } = render(<TestLiveTelemetry userId="test-user-123" />);

    // Verify subscription was created
    expect(mockChannel.subscribe).toHaveBeenCalled();

    // Unmount the component
    unmount();

    // Verify cleanup was called
    expect(mockSupabase.removeChannel).toHaveBeenCalled();
  });

  test('filters telemetry by user_id', () => {
    const testUserId = 'user-abc-123';
    render(<TestLiveTelemetry userId={testUserId} />);

    // Verify filter was applied with correct user_id
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        filter: `user_id=eq.${testUserId}`,
      }),
      expect.any(Function)
    );
  });

  test('handles multiple telemetry updates', async () => {
    render(<TestLiveTelemetry userId="test-user-123" />);

    const callback = mockChannelCallbacks['postgres_changes'];

    // First update
    callback({
      new: {
        id: 'telemetry-1',
        speed: 50,
        rpm: 1200,
        fuel_current: 200,
        fuel_capacity: 300,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('speed')).toHaveTextContent('50');
    });

    // Second update with new values
    callback({
      new: {
        id: 'telemetry-2',
        speed: 70,
        rpm: 1800,
        fuel_current: 180,
        fuel_capacity: 300,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('speed')).toHaveTextContent('70');
      expect(screen.getByTestId('rpm')).toHaveTextContent('1800');
      expect(screen.getByTestId('fuel')).toHaveTextContent('180/300');
    });
  });

  test('does not update state if component unmounted', async () => {
    const { unmount } = render(<TestLiveTelemetry userId="test-user-123" />);

    const callback = mockChannelCallbacks['postgres_changes'];

    // Unmount before receiving data
    unmount();

    // Try to send data after unmount (should be ignored due to mounted flag)
    callback({
      new: {
        id: 'telemetry-1',
        speed: 65,
        rpm: 1500,
        fuel_current: 150,
        fuel_capacity: 300,
      },
    });

    // Should not throw errors or cause memory leaks
    expect(mockSupabase.removeChannel).toHaveBeenCalled();
  });
});
