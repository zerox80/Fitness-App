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
  Activity: () => null,
  Flame: () => null,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: { green: '#178864', red: '#D84D5A' },
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('./dashboard.styles', () => ({
  styles: {
    smallCard: { padding: 16 },
    weekHeader: { flexDirection: 'row' },
    cardTitle: { fontSize: 14, fontWeight: '800' },
    weekSelectorText: { fontSize: 12 },
    weekValue: { fontSize: 28, fontWeight: '800' },
    weekUnit: { fontSize: 12 },
    cardMuted: { fontSize: 12 },
    weekBars: { flexDirection: 'row' },
    weekBarItem: { alignItems: 'center' },
    weekDay: { fontSize: 12 },
  },
}));

vi.mock('./dashboard-web.styles', () => ({
  webStyles: {
    webSmallCard: { minWidth: 280 },
    webWeekValue: { fontSize: 32 },
  },
}));

import { WeekCard } from '@/components/dashboard/WeekCard';
import type { WeeklyActivitySummary } from '@/lib/api';

function summary(overrides: Partial<WeeklyActivitySummary> = {}): WeeklyActivitySummary {
  return {
    week_start: '2026-06-02',
    total_steps: 0,
    workout_count: 4,
    total_active_minutes: 120,
    total_calories: 2400,
    ...overrides,
  };
}

describe('WeekCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the "Wochenfortschritt" title and workout count', () => {
    render(<WeekCard summary={summary()} />);
    expect(screen.getByText('Wochenfortschritt')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('Workouts')).toBeTruthy();
  });

  it('renders the active minutes and calories from the summary', () => {
    render(<WeekCard summary={summary()} />);
    expect(screen.getByText('120 Min.')).toBeTruthy();
    expect(screen.getByText('2400 kcal')).toBeTruthy();
  });

  it('renders zero values when no summary is provided', () => {
    render(<WeekCard />);
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('Keine Wochenwerte')).toBeTruthy();
  });

  it('renders the week_start label when summary is provided', () => {
    render(<WeekCard summary={summary({ week_start: '2026-06-02' })} />);
    expect(screen.getByText('2026-06-02')).toBeTruthy();
  });
});
