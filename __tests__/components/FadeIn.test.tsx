// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
  View: ({ children, style, ...props }: any) => (
    <div data-style={JSON.stringify(style ?? null)} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  createAnimatedComponent: (Component: any) => Component,
  useSharedValue: (initial: number) => ({ value: initial }),
  useAnimatedStyle: (cb: () => unknown) => cb(),
  useAnimatedProps: (cb: () => unknown) => cb(),
  withDelay: (_delay: number, value: unknown) => value,
  withTiming: (value: unknown) => value,
  Easing: {
    out: () => ({ cubic: () => ({}) }),
    cubic: () => ({}),
    bezier: () => ({}),
  },
}));

import { FadeIn } from '@/components/FadeIn';

describe('FadeIn (web platform)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a plain View on web, ignoring reanimated params', () => {
    render(
      <FadeIn delay={200} duration={500} translateY={40}>
        <span data-testid="child">Hallo</span>
      </FadeIn>
    );

    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('applies the user-provided style to the wrapper', () => {
    const { container } = render(
      <FadeIn style={{ marginTop: 12 }}>
        <span>content</span>
      </FadeIn>
    );

    const wrapper = container.querySelector('div');
    expect(wrapper?.getAttribute('data-style')).toBe(JSON.stringify({ marginTop: 12 }));
  });
});
