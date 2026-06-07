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
    ActivityIndicator: ({ size, color }: any) => (
      <span data-testid="spinner" data-size={size} data-color={color} />
    ),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('@/constants/Colors', () => ({
  Colors: {
    primary: '#178864',
    textMuted: '#6f7782',
  },
}));

import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';

describe('LoadingSpinner', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders an ActivityIndicator', () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders the optional message', () => {
    render(<LoadingSpinner message="Bitte warten" />);
    expect(screen.getByText('Bitte warten')).toBeTruthy();
  });

  it('omits the message text when not provided', () => {
    render(<LoadingSpinner />);
    expect(screen.queryByText('Bitte warten')).toBeNull();
  });
});
