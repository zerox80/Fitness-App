// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
}));

vi.mock('react-native-reanimated', () => {
  const ReactActual = require('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, ...rest } = props;
    void style;
    return rest;
  }

  return {
    __esModule: true,
    default: {
      ScrollView: ({ children, ...props }: any) =>
        ReactActual.createElement('div', cleanProps(props), children),
      View: ({ children, ...props }: any) =>
        ReactActual.createElement('div', cleanProps(props), children),
    },
    interpolate: (value: number, input: number[], output: number[]) => {
      if (value <= input[0]) return output[0];
      if (value >= input[input.length - 1]) return output[output.length - 1];
      return output[1];
    },
    useAnimatedRef: () => ({ current: null }),
    useAnimatedStyle: (cb: () => unknown) => cb(),
    useScrollOffset: () => ({ value: 0 }),
  };
});

vi.mock('@/components/themed-view', () => ({
  ThemedView: ({ children, ...props }: any) => (
    <div data-testid="themed" {...props}>{children}</div>
  ),
}));

vi.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

vi.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#fff',
}));

import ParallaxScrollView from '@/components/parallax-scroll-view';

describe('ParallaxScrollView', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children and a header image inside the animated scroll view', () => {
    render(
      <ParallaxScrollView
        headerImage={<div data-testid="header-img" />}
        headerBackgroundColor={{ dark: '#000', light: '#fff' }}
      >
        <span data-testid="body">Inhalt</span>
      </ParallaxScrollView>
    );

    expect(screen.getByTestId('header-img')).toBeTruthy();
    expect(screen.getByTestId('body')).toBeTruthy();
  });
});
