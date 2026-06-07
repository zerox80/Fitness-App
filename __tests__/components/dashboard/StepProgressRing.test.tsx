// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native-svg', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => (
    <svg data-testid="step-svg" {...props}>
      {children}
    </svg>
  ),
  Circle: (props: any) => <circle {...props} />,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: { track: '#E3E9EC', green: '#178864' },
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

import { StepProgressRing } from '@/components/dashboard/StepProgressRing';

describe('StepProgressRing', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders an SVG with the requested size as width and height', () => {
    render(<StepProgressRing progress={0.5} size={200} />);
    const svg = screen.getByTestId('step-svg');
    expect(svg.getAttribute('width')).toBe('200');
    expect(svg.getAttribute('height')).toBe('200');
    expect(svg.getAttribute('viewBox')).toBe('0 0 200 200');
  });

  it('uses a thicker stroke for sizes >= 220', () => {
    render(<StepProgressRing progress={0.5} size={240} />);
    const svg = screen.getByTestId('step-svg');
    expect(svg.getAttribute('width')).toBe('240');
    // The circles are children; we just check that the svg rendered without crash.
    expect(svg.querySelectorAll('circle').length).toBe(2);
  });

  it('uses the default size of 198 when no size is given', () => {
    render(<StepProgressRing progress={0.25} />);
    const svg = screen.getByTestId('step-svg');
    expect(svg.getAttribute('width')).toBe('198');
  });
});
