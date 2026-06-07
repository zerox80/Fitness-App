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
  CalendarDays: ({ size, color }: any) => <span data-size={size} data-color={color} />,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: { greenDark: '#126F54' },
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
    dateRow: { flexDirection: 'row' },
    dateText: { fontSize: 13 },
    webDateText: { fontSize: 14 },
  },
}));

import { DateRow } from '@/components/dashboard/DateRow';

describe('DateRow', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the provided date label', () => {
    render(<DateRow dateLabel="Montag, 8. Juni" />);
    expect(screen.getByText('Montag, 8. Juni')).toBeTruthy();
  });

  it('renders the calendar icon with the desktop size when desktop is true', () => {
    render(<DateRow dateLabel="Heute" desktop />);
    const icon = document.querySelector('[data-size="15"]');
    expect(icon).toBeTruthy();
  });

  it('uses the default size when desktop is false', () => {
    render(<DateRow dateLabel="Heute" />);
    const icon = document.querySelector('[data-size="16"]');
    expect(icon).toBeTruthy();
  });
});
