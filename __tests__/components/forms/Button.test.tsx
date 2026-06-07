// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, ...rest } = props;
    void style;
    void activeOpacity;
    return rest;
  }

  return {
    ActivityIndicator: ({ color, size }: any) => (
      <span data-testid="activity" data-color={color} data-size={size} />
    ),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TouchableOpacity: ({ accessibilityLabel, children, disabled, onPress, ...props }: any) =>
      ReactActual.createElement(
        'button',
        {
          ...cleanProps(props),
          'aria-label': accessibilityLabel,
          disabled,
          onClick: onPress,
          type: 'button',
        },
        children
      ),
  };
});

vi.mock('@/constants/Colors', () => ({
  Colors: {
    primary: '#178864',
    card: '#fff',
    text: '#17212b',
    textMuted: '#6f7782',
    tertiary: '#d84d5a',
    borderSoft: '#e9eef1',
  },
}));

import { Button } from '@/components/forms/Button';

describe('Button', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the title as text', () => {
    render(<Button title="Speichern" onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeTruthy();
  });

  it('invokes onPress when clicked', () => {
    const onPress = vi.fn();
    render(<Button title="Klick" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button', { name: 'Klick' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables the button when loading is true and shows a spinner instead of the title', () => {
    const onPress = vi.fn();
    render(<Button title="Speichern" onPress={onPress} loading />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByTestId('activity')).toBeTruthy();
    expect(screen.queryByText('Speichern')).toBeNull();
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button title="Weiter" onPress={() => undefined} disabled />);
    expect((screen.getByRole('button', { name: 'Weiter' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
