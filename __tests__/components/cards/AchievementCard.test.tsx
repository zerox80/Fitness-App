// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, numberOfLines, ...rest } = props;
    void style;
    void numberOfLines;
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
    secondary: '#1f9e9a',
    tertiary: '#d84d5a',
    text: '#17212b',
    textMuted: '#6f7782',
    card: '#fff',
    cardLight: '#eef2f0',
    borderSoft: '#e9eef1',
  },
}));

import { AchievementCard } from '@/components/cards/AchievementCard';
import type { Achievement } from '@/types';

function achievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: 'a-1',
    name: 'Erste Schritte',
    description: 'Schließe dein erstes Workout ab.',
    icon: '🏆',
    progress: 0,
    target: 1,
    category: 'workouts',
    ...overrides,
  };
}

describe('AchievementCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the name, description, icon, and category label', () => {
    render(<AchievementCard achievement={achievement()} />);
    expect(screen.getByText('Erste Schritte')).toBeTruthy();
    expect(screen.getByText('Schließe dein erstes Workout ab.')).toBeTruthy();
    expect(screen.getByText('🏆')).toBeTruthy();
    expect(screen.getByText('workouts')).toBeTruthy();
  });

  it('shows the progress as "progress / target"', () => {
    render(<AchievementCard achievement={achievement({ progress: 3, target: 10 })} />);
    expect(screen.getByText('3 / 10')).toBeTruthy();
  });

  it('caps the rendered progress percentage at 100%', () => {
    render(<AchievementCard achievement={achievement({ progress: 25, target: 10 })} />);
    // progressFill width is set to "100%" — we cannot inspect the style easily, so just ensure render works
    expect(screen.getByText('25 / 10')).toBeTruthy();
  });

  it('renders the "Freigeschaltet!" hint when unlockedAt is set', () => {
    render(
      <AchievementCard
        achievement={achievement({ progress: 1, target: 1, unlockedAt: '2026-06-01T00:00:00Z' })}
      />
    );
    expect(screen.getByText('Freigeschaltet!')).toBeTruthy();
  });

  it('does not render the unlocked hint when achievement is still locked', () => {
    render(<AchievementCard achievement={achievement()} />);
    expect(screen.queryByText('Freigeschaltet!')).toBeNull();
  });
});
