// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, ...rest } = props;
    void style;
    return rest;
  }

  return {
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('lucide-react-native', () => ({
  Flame: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Heart: () => null,
  Activity: () => null,
  Bike: () => null,
  Dumbbell: () => null,
  Home: () => null,
  User: () => null,
  Utensils: () => null,
  Target: () => null,
  ChevronRight: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Zap: () => null,
  Trophy: () => null,
  TrendingUp: () => null,
  Shield: () => null,
  Bell: () => null,
  Mail: () => null,
  Lock: () => null,
  X: () => null,
  Check: () => null,
  Apple: () => null,
  ListChecks: () => null,
  Repeat: () => null,
  Trash2: () => null,
  Plus: () => null,
  ClipboardList: () => null,
  Play: () => null,
  Eye: () => null,
  HeartPulse: () => null,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: { teal: '#1F9E9A', greenSoft: '#e5f3ee', tealSoft: '#e1f2f1' },
  STEP_GOAL: 10000,
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('./dashboard.styles', () => ({
  styles: {
    overviewCard: { padding: 16 },
    compactOverviewCard: { padding: 8 },
    overviewBody: { flexDirection: 'row' },
    compactOverviewBody: { gap: 6 },
    stepRingArea: { alignItems: 'center' },
    compactStepRingArea: { alignItems: 'center' },
    stepRingContent: { position: 'absolute' },
    stepsValue: { fontSize: 22, fontWeight: '800' },
    compactStepsValue: { fontSize: 18 },
    stepsGoal: { fontSize: 12 },
    compactStepsGoal: { fontSize: 10 },
    stepsPercent: { fontSize: 12 },
    metricsColumn: { gap: 6 },
    compactMetricsColumn: { gap: 4 },
  },
}));

vi.mock('./dashboard-web.styles', () => ({
  webStyles: {
    webOverviewCard: { maxWidth: 520 },
    webCardHeader: { flexDirection: 'row' },
    webCardTitle: { fontSize: 18, fontWeight: '800' },
    webOverviewBody: { flexDirection: 'row' },
    webStepRingArea: { minWidth: 220 },
    webStepsValue: { fontSize: 28 },
    webStepsGoal: { fontSize: 14 },
    webMetricsColumn: { gap: 10 },
  },
}));

vi.mock('./StepProgressRing', () => ({
  StepProgressRing: ({ progress, size }: any) => (
    <div data-testid="step-ring" data-progress={progress} data-size={size} />
  ),
}));

vi.mock('./MetricRow', () => ({
  MetricRow: ({ label, value, unit }: any) => (
    <div data-testid="metric" data-label={label}>{`${value} ${unit}`}</div>
  ),
}));

vi.mock('./DateRow', () => ({
  DateRow: ({ dateLabel, desktop }: any) => (
    <span data-testid="date-row" data-desktop={!!desktop}>{dateLabel}</span>
  ),
}));

import { OverviewCard } from '@/components/dashboard/OverviewCard';
import type { DashboardData } from '@/constants/dashboard-constants';

function data(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    activeMinutes: 32,
    calories: 420,
    dateLabel: 'Heute, 8. Juni',
    distance: '4,2',
    name: 'Alex',
    refreshing: false,
    stepProgress: 0.42,
    steps: 4200,
    weeklySummary: null,
    onRefresh: () => undefined,
    onActivityUpdated: () => undefined,
    ...overrides,
  };
}

describe('OverviewCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('formats steps using de-DE locale and renders the percent', () => {
    render(<OverviewCard data={data()} />);

    expect(screen.getByText('4.200')).toBeTruthy();
    expect(screen.getByText('/ 10.000 Schritte')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('renders the StepProgressRing with the current progress and default size', () => {
    render(<OverviewCard data={data()} />);

    const ring = screen.getByTestId('step-ring');
    expect(ring.getAttribute('data-progress')).toBe('0.42');
    expect(ring.getAttribute('data-size')).toBe('180');
  });

  it('uses the larger desktop ring size when desktop is true', () => {
    render(<OverviewCard data={data()} desktop />);

    const ring = screen.getByTestId('step-ring');
    expect(ring.getAttribute('data-size')).toBe('236');
  });

  it('renders the metric rows with German labels', () => {
    render(<OverviewCard data={data()} />);

    const metrics = screen.getAllByTestId('metric');
    expect(metrics.length).toBe(3);
    expect(metrics[0]?.getAttribute('data-label')).toBe('Kalorien');
    expect(metrics[1]?.getAttribute('data-label')).toBe('Aktive Minuten');
    expect(metrics[2]?.getAttribute('data-label')).toBe('Strecke');
  });

  it('shows the desktop card header (title + DateRow) when desktop is true', () => {
    render(<OverviewCard data={data()} desktop />);

    expect(screen.getByText('Tagesübersicht')).toBeTruthy();
    const dateRow = screen.getByTestId('date-row');
    expect(dateRow.getAttribute('data-desktop')).toBe('true');
    expect(dateRow.textContent).toBe('Heute, 8. Juni');
  });

  it('does not show the desktop card header when desktop is false', () => {
    render(<OverviewCard data={data()} />);

    expect(screen.queryByText('Tagesübersicht')).toBeNull();
  });
});
