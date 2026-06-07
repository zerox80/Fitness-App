// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, ...rest } = props;
    return rest;
  }

  return {
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#F4F6F5',
}));

import { ThemedView } from '@/components/themed-view';

describe('ThemedView', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its children inside a container element', () => {
    render(
      <ThemedView testID="themed">
        <span data-testid="child">Inhalt</span>
      </ThemedView>
    );

    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('forwards unknown props to the underlying element', () => {
    const { container } = render(<ThemedView aria-label="karte">Inhalt</ThemedView>);

    const wrapper = container.querySelector('[aria-label="karte"]');
    expect(wrapper).toBeTruthy();
  });
});
