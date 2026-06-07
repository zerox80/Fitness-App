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

vi.mock('react-native-svg', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => (
    <svg data-testid="svg" {...props}>
      {children}
    </svg>
  ),
  Path: (props: any) => <path {...props} />,
  Circle: (props: any) => <circle {...props} />,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: { red: '#D84D5A' },
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
    chartWrap: { position: 'relative' },
    webChartWrap: { maxWidth: 300 },
    heartBadge: { position: 'absolute' },
    heartBadgeText: { fontSize: 12 },
    chartAxis: { position: 'absolute' },
    chartAxisText: { fontSize: 10 },
  },
}));

import { HeartRateChart } from '@/components/dashboard/HeartRateChart';

describe('HeartRateChart', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders an SVG with the configured viewBox', () => {
    render(<HeartRateChart />);
    const svg = screen.getByTestId('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 220 105');
  });

  it('renders the heart rate badge with the "128" label', () => {
    render(<HeartRateChart />);
    expect(screen.getByText('128')).toBeTruthy();
  });

  it('renders the y-axis labels', () => {
    render(<HeartRateChart />);
    expect(screen.getByText('160')).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
    expect(screen.getByText('80')).toBeTruthy();
    expect(screen.getByText('40')).toBeTruthy();
  });
});
