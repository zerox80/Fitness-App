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

vi.mock('@/constants/Colors', () => ({
  Colors: {
    primary: '#178864',
    tertiary: '#d84d5a',
    text: '#17212b',
    textMuted: '#6f7782',
    card: '#fff',
    cardLight: '#eef2f0',
    borderSoft: '#e9eef1',
  },
}));

import { StatCard } from '@/components/cards/StatCard';

describe('StatCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the title, value, and subtitle', () => {
    render(<StatCard title="Schritte" value={4200} subtitle="heute" />);
    expect(screen.getByText('Schritte')).toBeTruthy();
    expect(screen.getByText('4200')).toBeTruthy();
    expect(screen.getByText('heute')).toBeTruthy();
  });

  it('renders the up trend arrow', () => {
    render(<StatCard title="Trend" value={10} trend="up" />);
    expect(screen.getByText('↑')).toBeTruthy();
  });

  it('renders the down trend arrow', () => {
    render(<StatCard title="Trend" value={10} trend="down" />);
    expect(screen.getByText('↓')).toBeTruthy();
  });

  it('renders the stable trend arrow', () => {
    render(<StatCard title="Trend" value={10} trend="stable" />);
    expect(screen.getByText('→')).toBeTruthy();
  });

  it('omits the trend arrow when no trend is provided', () => {
    render(<StatCard title="Ohne Trend" value={5} />);
    expect(screen.queryByText('↑')).toBeNull();
    expect(screen.queryByText('↓')).toBeNull();
    expect(screen.queryByText('→')).toBeNull();
  });

  it('omits the subtitle when none is provided', () => {
    render(<StatCard title="Titel" value={1} />);
    expect(screen.queryByText('heute')).toBeNull();
  });
});
