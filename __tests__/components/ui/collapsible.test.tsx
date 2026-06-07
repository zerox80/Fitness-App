// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const colorSchemeState = vi.hoisted(() => ({ value: 'light' as 'light' | 'dark' | null }));

vi.mock('react-native', () => {
  const ReactActual = require('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, ...rest } = props;
    void style;
    return rest;
  }

  return {
    Platform: { OS: 'web' },
    StyleSheet: { create: (styles: unknown) => styles },
    TouchableOpacity: ({ onPress, children, ...props }: any) =>
      ReactActual.createElement('button', { ...cleanProps(props), onClick: onPress, type: 'button' }, children),
  };
});

vi.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, type, ...rest }: any) => (
    <span data-type={type} {...rest}>{children}</span>
  ),
}));

vi.mock('@/components/themed-view', () => ({
  ThemedView: ({ children, style, ...rest }: any) => (
    <div data-style={JSON.stringify(style ?? null)} {...rest}>{children}</div>
  ),
}));

vi.mock('@/components/ui/icon-symbol', () => ({
  IconSymbol: ({ name, size, color, weight, style }: any) => (
    <span
      data-name={name}
      data-size={size}
      data-color={color}
      data-weight={weight}
      data-style={JSON.stringify(style ?? null)}
    />
  ),
}));

vi.mock('@/constants/theme', () => ({
  Colors: {
    light: { icon: '#687076' },
    dark: { icon: '#9BA1A6' },
  },
}));

vi.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => colorSchemeState.value,
}));

import { Collapsible } from '@/components/ui/collapsible';

describe('Collapsible', () => {
  afterEach(() => {
    cleanup();
  });

  it('hides the children initially and uses the light icon color', () => {
    colorSchemeState.value = 'light';

    render(
      <Collapsible title="Mehr anzeigen">
        <span data-testid="hidden">Inhalt</span>
      </Collapsible>
    );

    expect(screen.queryByTestId('hidden')).toBeNull();
    const nameEl = document.querySelector('[data-name="chevron.right"]');
    expect(nameEl?.getAttribute('data-color')).toBe('#687076');
  });

  it('uses the dark icon color when the scheme is "dark"', () => {
    colorSchemeState.value = 'dark';

    render(<Collapsible title="Mehr">Inhalt</Collapsible>);

    const nameEl = document.querySelector('[data-name="chevron.right"]');
    expect(nameEl?.getAttribute('data-color')).toBe('#9BA1A6');
  });
});
