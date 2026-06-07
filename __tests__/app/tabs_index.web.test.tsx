// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  activityToday: vi.fn(),
  statsWeekly: vi.fn(),
}));

const healthConnectMocks = vi.hoisted(() => ({
  readActivity: vi.fn(),
}));

const widthState = vi.hoisted(() => ({ value: 1280 }));

vi.mock('react-native', () => ({
  useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  View: 'View',
}));

vi.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const ReactInternal = require('react');
    ReactInternal.useEffect(() => {
      const cleanup = cb();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }, []);
  },
}));

vi.mock('@/lib/api', () => ({
  api: {
    activity: { today: apiMocks.activityToday, update: vi.fn() },
    stats: { weekly: apiMocks.statsWeekly },
  },
}));

vi.mock('@/lib/healthConnect', () => ({
  readTodayHealthConnectActivity: healthConnectMocks.readActivity,
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: authMocks.useAuth,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  DESKTOP_BREAKPOINT: 900,
  STEP_GOAL: 10000,
  WIDE_BREAKPOINT: 1200,
  WEB_CONTENT_MAX_WIDTH: 1520,
  avatarUri: null,
  palette: { green: '#178864' },
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('@/utils/activityMerge', () => ({
  mergeHealthActivity: (server: any, _health: any) => server,
}));

vi.mock('@/utils/date', () => ({
  formatLocalDateKey: () => '2026-06-07',
}));

vi.mock('@/components/dashboard/MobileHome', () => ({
  MobileHome: ({ data }: any) => (
    <div data-testid="mobile-home" data-name={data.name} data-steps={data.steps} />
  ),
}));

vi.mock('@/components/dashboard/WebDashboard', () => ({
  WebDashboard: ({ data }: any) => (
    <div data-testid="web-dashboard" data-name={data.name} data-steps={data.steps} />
  ),
}));

import HomeScreenWeb from '@/app/(tabs)/index.web';

describe('HomeScreenWeb', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 1280;
    authMocks.useAuth.mockReset();
    apiMocks.activityToday.mockReset();
    apiMocks.statsWeekly.mockReset();
    healthConnectMocks.readActivity.mockReset();
  });

  it('renders MobileHome on narrow viewports', async () => {
    widthState.value = 600;
    authMocks.useAuth.mockReturnValue({ user: { name: 'Alex' } });
    apiMocks.activityToday.mockResolvedValue({ steps: 1000, calories: 200, active_minutes: 10 });
    apiMocks.statsWeekly.mockResolvedValue({});
    healthConnectMocks.readActivity.mockResolvedValue(null);

    render(<HomeScreenWeb />);

    expect(await screen.findByTestId('mobile-home')).toBeTruthy();
    expect(screen.queryByTestId('web-dashboard')).toBeNull();
  });

  it('renders WebDashboard on desktop viewports', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({ user: { name: 'Alex' } });
    apiMocks.activityToday.mockResolvedValue({ steps: 4200, calories: 500, active_minutes: 20 });
    apiMocks.statsWeekly.mockResolvedValue({});
    healthConnectMocks.readActivity.mockResolvedValue(null);

    render(<HomeScreenWeb />);

    expect(await screen.findByTestId('web-dashboard')).toBeTruthy();
  });

  it('falls back to zero values when the API call fails', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({ user: { name: 'Alex' } });
    apiMocks.activityToday.mockRejectedValue(new Error('network'));
    apiMocks.statsWeekly.mockRejectedValue(new Error('network'));
    healthConnectMocks.readActivity.mockResolvedValue(null);

    render(<HomeScreenWeb />);

    const dash = await screen.findByTestId('web-dashboard');
    expect(dash.getAttribute('data-steps')).toBe('0');
  });

  it('passes the first name into the dashboard data', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({ user: { name: 'Samira Müller' } });
    apiMocks.activityToday.mockResolvedValue({ steps: 0, calories: 0, active_minutes: 0 });
    apiMocks.statsWeekly.mockResolvedValue({});
    healthConnectMocks.readActivity.mockResolvedValue(null);

    render(<HomeScreenWeb />);

    const dash = await screen.findByTestId('web-dashboard');
    expect(dash.getAttribute('data-name')).toBe('Samira');
  });

  it('passes an empty string when the user has no name', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({ user: null });
    apiMocks.activityToday.mockResolvedValue({ steps: 0, calories: 0, active_minutes: 0 });
    apiMocks.statsWeekly.mockResolvedValue({});
    healthConnectMocks.readActivity.mockResolvedValue(null);

    render(<HomeScreenWeb />);

    const dash = await screen.findByTestId('web-dashboard');
    expect(dash.getAttribute('data-name')).toBe('');
  });
});
