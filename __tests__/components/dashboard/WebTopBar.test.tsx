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
  CalendarDays: () => null,
  User: () => null,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: {
    text: '#17212b',
    muted: '#6f7782',
    background: '#f4f6f5',
    border: '#e9eef1',
  },
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('./dashboard-web.styles', () => ({
  webStyles: {
    webTopBar: { flexDirection: 'row', padding: 16 },
    topActions: { flexDirection: 'row' },
    webAvatar: { width: 40, height: 40, borderRadius: 20 },
  },
}));

import { WebTopBar } from '@/components/dashboard/WebTopBar';

describe('WebTopBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the brand and the subtitle', () => {
    render(<WebTopBar />);
    expect(screen.getByText('FitPulse')).toBeTruthy();
    expect(screen.getByText('Training, Aktivität und Fortschritt')).toBeTruthy();
  });

  it('renders a German-formatted today string', () => {
    render(<WebTopBar />);
    // The exact text depends on the current date, so just ensure some text is rendered
    // and matches a German weekday/month pattern.
    const topBarText = document.body.textContent ?? '';
    expect(topBarText).toMatch(/Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag/);
    expect(topBarText).toMatch(/Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember/);
  });
});
