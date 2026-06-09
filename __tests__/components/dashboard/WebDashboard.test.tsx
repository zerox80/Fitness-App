// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 1280 }));

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
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children, delay, style }: any) => (
    <div data-testid="fade-in" data-delay={delay} data-style={JSON.stringify(style ?? null)}>
      {children}
    </div>
  ),
}));

vi.mock('@/constants/dashboard-constants', () => ({
  DESKTOP_BREAKPOINT: 900,
  WEB_CONTENT_MAX_WIDTH: 1520,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  palette: { green: '#178864' },
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('@/components/dashboard/dashboard-web.styles', () => ({
  webStyles: {
    webContent: { padding: 24 },
    webGreetingBlock: { marginBottom: 16 },
    webGreeting: { fontSize: 28, fontWeight: '800' },
    webSubtitle: { fontSize: 16 },
    webCardsRow: { flexDirection: 'row' },
    webOverviewFlex: { flex: 1 },
    webMetricCardFlex: { flex: 1 },
    webTrainingSection: { marginTop: 24 },
  },
}));

vi.mock('@/components/dashboard/OverviewCard', () => ({
  OverviewCard: ({ desktop, compact, data: d }: any) => (
    <div data-testid="overview" data-desktop={!!desktop} data-compact={!!compact} data-name={d.name} />
  ),
}));

vi.mock('@/components/dashboard/HeartCard', () => ({
  HeartCard: ({ desktop }: any) => <div data-testid="heart-card" data-desktop={!!desktop} />,
}));

vi.mock('@/components/dashboard/WeekCard', () => ({
  WeekCard: ({ desktop, compact, summary }: any) => (
    <div data-testid="week-card" data-desktop={!!desktop} data-compact={!!compact} data-workout={summary?.workout_count ?? 0} />
  ),
}));

vi.mock('@/components/dashboard/TrainingList', () => ({
  TrainingList: ({ desktop }: any) => <div data-testid="training-list" data-desktop={!!desktop} />,
}));

vi.mock('@/components/activity/CalorieChatCard', () => ({
  CalorieChatCard: () => <div data-testid="calorie-chat" />,
}));

import { WebDashboard } from '@/components/dashboard/WebDashboard';
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

describe('WebDashboard', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 1280;
  });

  it('renders the greeting and the subtitle', () => {
    render(<WebDashboard data={data({ name: 'Samira' })} />);
    expect(screen.getByText('Hallo, Samira')).toBeTruthy();
    expect(screen.getByText('Dein aktueller Tag im Überblick.')).toBeTruthy();
  });

  it('passes desktop=true to OverviewCard/HeartCard/WeekCard and desktop TrainingList on a wide viewport', () => {
    widthState.value = 1280;
    render(<WebDashboard data={data()} />);

    expect(screen.getByTestId('overview').getAttribute('data-desktop')).toBe('true');
    expect(screen.getByTestId('heart-card').getAttribute('data-desktop')).toBe('true');
    expect(screen.getByTestId('week-card').getAttribute('data-desktop')).toBe('true');
    expect(screen.getByTestId('training-list').getAttribute('data-desktop')).toBe('true');
  });

  it('falls back to mobile mode (compact, mobile) when width < DESKTOP_BREAKPOINT', () => {
    widthState.value = 600;
    render(<WebDashboard data={data()} />);

    expect(screen.getByTestId('overview').getAttribute('data-desktop')).toBe('false');
    expect(screen.getByTestId('overview').getAttribute('data-compact')).toBe('true');
    expect(screen.getByTestId('heart-card').getAttribute('data-desktop')).toBe('false');
    expect(screen.getByTestId('week-card').getAttribute('data-compact')).toBe('true');
  });

  it('omits the user name when none is provided', () => {
    render(<WebDashboard data={data({ name: '' })} />);
    expect(screen.getByText('Hallo')).toBeTruthy();
  });
});
