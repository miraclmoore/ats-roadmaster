import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Gauge } from '@/components/ui/gauge';
import '@testing-library/jest-dom';

describe('Gauge Component', () => {
  test('renders with basic props', () => {
    render(<Gauge value={50} max={100} label="Speed" />);

    // Verify component renders without crashing
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('displays correct value', () => {
    render(<Gauge value={75} max={100} label="Speed" unit="mph" />);

    // Verify value is displayed
    expect(screen.getByText('75')).toBeInTheDocument();

    // Verify unit is displayed
    expect(screen.getByText('mph')).toBeInTheDocument();

    // Verify label is displayed
    expect(screen.getByText('Speed')).toBeInTheDocument();
  });

  test('handles zero value', () => {
    render(<Gauge value={0} max={100} label="Fuel" unit="%" />);

    // Should render without errors
    expect(screen.getByText('Fuel')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  test('handles max value', () => {
    render(<Gauge value={100} max={100} label="RPM" />);

    // Should render at full capacity
    expect(screen.getByText('RPM')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('applies custom label', () => {
    const customLabel = 'Engine Speed';
    render(<Gauge value={50} max={100} label={customLabel} />);

    // Verify custom label is visible
    expect(screen.getByText(customLabel)).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('displays unit correctly', () => {
    render(<Gauge value={45} max={80} label="Speed" unit="km/h" />);

    // Verify unit is displayed
    expect(screen.getByText('km/h')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  test('renders different sizes', () => {
    const { rerender } = render(<Gauge value={50} max={100} label="Speed" size="sm" />);
    expect(screen.getByText('Speed')).toBeInTheDocument();

    rerender(<Gauge value={50} max={100} label="Speed" size="md" />);
    expect(screen.getByText('Speed')).toBeInTheDocument();

    rerender(<Gauge value={50} max={100} label="Speed" size="lg" />);
    expect(screen.getByText('Speed')).toBeInTheDocument();
  });

  test('applies different color variants', () => {
    const { rerender } = render(
      <Gauge value={50} max={100} label="Speed" color="profit" />
    );
    expect(screen.getByText('Speed')).toBeInTheDocument();

    rerender(<Gauge value={50} max={100} label="Speed" color="damage" />);
    expect(screen.getByText('Speed')).toBeInTheDocument();

    rerender(<Gauge value={50} max={100} label="Speed" color="fuel" />);
    expect(screen.getByText('Speed')).toBeInTheDocument();
  });

  test('handles cruise control speed indicator', () => {
    render(
      <Gauge
        value={60}
        max={80}
        label="Speed"
        unit="mph"
        cruiseControlSpeed={65}
      />
    );

    // Verify main gauge renders
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('mph')).toBeInTheDocument();
  });

  test('handles values exceeding max', () => {
    // Component should clamp to 100%
    render(<Gauge value={120} max={100} label="Overspeed" />);

    expect(screen.getByText('Overspeed')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument(); // Raw value displayed
  });

  test('renders without unit', () => {
    render(<Gauge value={1500} max={3000} label="RPM" />);

    // Verify label and value render
    expect(screen.getByText('RPM')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();

    // Unit should not be present
    expect(screen.queryByText('mph')).not.toBeInTheDocument();
  });
});
