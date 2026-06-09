// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = (await vi.importActual('react')) as any;

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
  Heart: ({ size, color, fill }: any) => (
    <span data-size={size} data-color={color} data-fill={fill} />
  ),
  Footprints: () => null,
  Flame: () => null,
  PersonStanding: () => null,
  Timer: () => null,
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
  palette: { red: '#D84D5A', redSoft: '#F9E5E7' },
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('@/components/dashboard/dashboard.styles', () => ({
  styles: {
    smallCard: { padding: 16 },
    smallCardHeader: { flexDirection: 'row' },
    cardTitle: { fontSize: 14, fontWeight: '800' },
    roundIcon: { borderRadius: 14, padding: 6 },
    heartValue: { fontSize: 22, fontWeight: '800' },
    heartUnit: { fontSize: 12 },
    cardMuted: { fontSize: 12 },
    timeLabels: { flexDirection: 'row' },
    timeLabel: { fontSize: 10 },
  },
}));

vi.mock('@/components/dashboard/dashboard-web.styles', () => ({
  webStyles: {
    webSmallCard: { minWidth: 280 },
    webHeartValue: { fontSize: 30 },
  },
}));

vi.mock('@/components/dashboard/HeartRateChart', () => ({
  HeartRateChart: ({ compact }: any) => (
    <div data-testid="heart-rate-chart" data-compact={!!compact} />
  ),
}));

import { HeartCard } from '@/components/dashboard/HeartCard';

describe('HeartCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the title, value, and "Keine Daten" placeholder', () => {
    render(<HeartCard />);
    expect(screen.getByText('Herzfrequenz')).toBeTruthy();
    expect(screen.getByText('Keine Daten')).toBeTruthy();
  });

  it('renders the time axis labels', () => {
    render(<HeartCard />);
    expect(screen.getByText('00:00')).toBeTruthy();
    expect(screen.getByText('12:00')).toBeTruthy();
    expect(screen.getByText('24:00')).toBeTruthy();
  });

  it('passes the compact flag to HeartRateChart when desktop is true', () => {
    render(<HeartCard desktop />);
    const chart = screen.getByTestId('heart-rate-chart');
    expect(chart.getAttribute('data-compact')).toBe('true');
  });

  it('does not pass compact to HeartRateChart on mobile', () => {
    render(<HeartCard />);
    const chart = screen.getByTestId('heart-rate-chart');
    expect(chart.getAttribute('data-compact')).toBe('false');
  });
});
