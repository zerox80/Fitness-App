// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

vi.mock('react-native', () => ({
  View: ({ children, style, ...props }: any) => {
    const { style: _style, ...rest } = props;
    void _style;
    void style;
    return <div {...rest}>{children}</div>;
  },
}));

vi.mock('react-native-svg', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => (
    <svg data-testid="svg-root" {...props}>
      {children}
    </svg>
  ),
  Circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
}));

vi.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: (Component: any) => Component },
  createAnimatedComponent: (Component: any) => Component,
  useSharedValue: (initial: number) => ({ value: initial }),
  useAnimatedProps: (cb: () => unknown) => cb(),
  withTiming: (value: unknown) => value,
  Easing: { bezier: () => ({}) },
}));

import { ProgressRing } from '@/components/ProgressRing';

describe('ProgressRing', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the SVG with dimensions derived from radius and strokeWidth', () => {
    const { getByTestId } = render(<ProgressRing progress={0.5} color="#178864" />);

    const svg = getByTestId('svg-root');
    const halfCircle = 60 + 12; // default radius 60 + default strokeWidth 12
    expect(svg.getAttribute('width')).toBe(String(halfCircle * 2));
    expect(svg.getAttribute('height')).toBe(String(halfCircle * 2));
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${halfCircle * 2} ${halfCircle * 2}`);
  });

  it('honors custom radius and strokeWidth', () => {
    const { getByTestId } = render(
      <ProgressRing radius={40} strokeWidth={8} progress={0.25} color="#abc" />
    );

    const svg = getByTestId('svg-root');
    const halfCircle = 40 + 8;
    expect(svg.getAttribute('width')).toBe(String(halfCircle * 2));
    expect(svg.getAttribute('height')).toBe(String(halfCircle * 2));
  });
});
