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

vi.mock('lucide-react-native', () => ({
  Dumbbell: () => <span data-testid="dumbbell-icon" />,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    text: '#17212b',
    textMuted: '#6f7782',
    cardLight: '#eef2f0',
    borderSoft: '#e9eef1',
  },
}));

import { EmptyState } from '@/components/feedback/EmptyState';

describe('EmptyState', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the title and subtitle', () => {
    render(<EmptyState title="Keine Daten" subtitle="Lege dein erstes Workout an." />);
    expect(screen.getByText('Keine Daten')).toBeTruthy();
    expect(screen.getByText('Lege dein erstes Workout an.')).toBeTruthy();
  });

  it('renders the icon string when provided', () => {
    render(<EmptyState icon="🏃" title="Los gehts" />);
    expect(screen.getByText('🏃')).toBeTruthy();
  });

  it('renders the Dumbbell fallback when an empty string is passed as icon', () => {
    render(<EmptyState icon="" title="Ohne Icon" />);
    expect(screen.getByTestId('dumbbell-icon')).toBeTruthy();
  });

  it('omits the subtitle when none is given', () => {
    render(<EmptyState title="Nur Titel" />);
    expect(screen.queryByText('Lege dein erstes Workout an.')).toBeNull();
  });
});
