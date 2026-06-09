// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, contentContainerStyle, showsVerticalScrollIndicator, refreshControl, ...rest } = props;
    void style;
    void contentContainerStyle;
    void showsVerticalScrollIndicator;
    void refreshControl;
    return rest;
  }

  return {
    Platform: { OS: 'web' },
    Image: (props: any) => <img alt="" {...props} />,
    RefreshControl: (props: any) => <div data-testid="refresh-control" data-refreshing={!!props.refreshing} />,
    ScrollView: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    useWindowDimensions: () => ({ width: 400, height: 800 }),
  };
});

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => <>{children}</>,
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children, delay, style }: any) => (
    <div data-testid="fade-in" data-delay={delay} data-style={JSON.stringify(style ?? null)}>
      {children}
    </div>
  ),
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: { green: '#178864' },
  avatarUri: null,
  WIDE_BREAKPOINT: 1200,
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  STEP_GOAL: 10000,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('@/components/dashboard/dashboard.styles', () => ({
  styles: {
    container: { flex: 1 },
    scrollContent: { padding: 16 },
    webMobileFrame: { maxWidth: 420 },
    header: { flexDirection: 'row' },
    headerCopy: { flex: 1 },
    greeting: { fontSize: 24, fontWeight: '800' },
    subtitle: { fontSize: 14 },
    avatar: { width: 40, height: 40 },
    sectionHeader: { flexDirection: 'row' },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    mobileSection: { paddingVertical: 12 },
    smallCardsRow: { flexDirection: 'row' },
    smallCardFlex: { minWidth: 0 },
  },
}));

vi.mock('@/components/dashboard/OverviewCard', () => ({
  OverviewCard: ({ compact, data: d }: any) => (
    <div data-testid="overview" data-compact={!!compact} data-name={d.name} />
  ),
}));

vi.mock('@/components/dashboard/HeartCard', () => ({
  HeartCard: () => <div data-testid="heart-card" />,
}));

vi.mock('@/components/dashboard/WeekCard', () => ({
  WeekCard: ({ compact, summary }: any) => (
    <div data-testid="week-card" data-compact={!!compact} data-workout={summary?.workout_count ?? 0} />
  ),
}));

vi.mock('@/components/dashboard/TrainingList', () => ({
  TrainingList: () => <div data-testid="training-list" />,
}));

vi.mock('@/components/dashboard/DateRow', () => ({
  DateRow: ({ dateLabel }: any) => <span data-testid="date-row">{dateLabel}</span>,
}));

vi.mock('@/components/activity/CalorieChatCard', () => ({
  CalorieChatCard: ({ onActivityUpdated }: any) => (
    <div data-testid="calorie-chat" data-has-cb={typeof onActivityUpdated === 'function'} />
  ),
}));

import { MobileHome } from '@/components/dashboard/MobileHome';
import type { DashboardData } from '@/constants/dashboard-constants';

function data(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    activeMinutes: 0,
    calories: 0,
    dateLabel: 'Heute',
    distance: '0,0',
    name: 'Alex',
    refreshing: false,
    stepProgress: 0,
    steps: 0,
    weeklySummary: null,
    onRefresh: async () => undefined,
    onActivityUpdated: () => undefined,
    ...overrides,
  };
}

describe('MobileHome', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the greeting and the user name', () => {
    render(<MobileHome data={data({ name: 'Alex' })} />);
    expect(screen.getByText('Hallo, Alex')).toBeTruthy();
  });

  it('renders "Hallo" without a name when no name is provided', () => {
    render(<MobileHome data={data({ name: '' })} />);
    expect(screen.getByText('Hallo')).toBeTruthy();
    expect(screen.queryByText('Hallo, ')).toBeNull();
  });

  it('passes the overview data into OverviewCard', () => {
    render(<MobileHome data={data({ name: 'Samira', steps: 1234 })} />);
    const overview = screen.getByTestId('overview');
    expect(overview.getAttribute('data-name')).toBe('Samira');
  });

  it('passes the weekly summary into WeekCard', () => {
    const weeklySummary = {
      week_start: '2026-06-02',
      total_steps: 0,
      workout_count: 3,
      total_active_minutes: 60,
      total_calories: 1200,
    };

    render(<MobileHome data={data({ weeklySummary })} />);
    const week = screen.getByTestId('week-card');
    expect(week.getAttribute('data-workout')).toBe('3');
  });
});
