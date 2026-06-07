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
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TouchableOpacity: ({ children, onPress, ...props }: any) =>
      ReactActual.createElement(
        'button',
        { ...cleanProps(props), onClick: onPress, type: 'button' },
        children
      ),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('lucide-react-native', () => ({
  AlertTriangle: ({ size, color }: any) => <span data-size={size} data-color={color} />,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    text: '#17212b',
    textMuted: '#6f7782',
    tertiary: '#d84d5a',
    tertiaryGlow: '#f9e5e7',
  },
}));

import { ErrorBanner } from '@/components/feedback/ErrorBanner';

describe('ErrorBanner', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the error message', () => {
    render(<ErrorBanner message="Verbindung fehlgeschlagen." />);
    expect(screen.getByText('Verbindung fehlgeschlagen.')).toBeTruthy();
  });

  it('omits the retry button when onRetry is not provided', () => {
    render(<ErrorBanner message="Boom" />);
    expect(screen.queryByRole('button', { name: 'Erneut versuchen' })).toBeNull();
  });

  it('renders a retry button that calls onRetry when clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Boom" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Erneut versuchen' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
