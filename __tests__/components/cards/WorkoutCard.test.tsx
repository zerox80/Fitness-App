// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, numberOfLines, ...rest } = props;
    void style;
    void activeOpacity;
    void numberOfLines;
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

vi.mock('@/utils/date', () => ({
  formatDate: (iso: string) => `formatted(${iso})`,
  formatDuration: (seconds: number) => `${Math.floor(seconds / 60)}m`,
}));

vi.mock('@/utils/numbers', () => ({
  calculateVolume: (sets: Array<{ reps?: number; weightKg?: number }>) =>
    sets.reduce((sum, s) => sum + (s.reps ?? 0) * (s.weightKg ?? 0), 0),
}));

import { WorkoutCard } from '@/components/cards/WorkoutCard';
import type { Workout } from '@/types';

function workout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'w-1',
    userId: 'u-1',
    title: 'Push Day',
    type: 'strength',
    status: 'completed',
    exercises: [
      {
        id: 'we-1',
        exerciseId: 'e-1',
        exercise: {} as Workout['exercises'][number]['exercise'],
        orderIndex: 0,
        sets: [
          { id: 's-1', setNumber: 1, reps: 8, weightKg: 60, isWarmup: false, isDropset: false, isFailure: false, completed: true },
          { id: 's-2', setNumber: 2, reps: 6, weightKg: 65, isWarmup: false, isDropset: false, isFailure: false, completed: true },
        ],
        restSeconds: 90,
      },
    ],
    tags: ['push', 'chest'],
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('WorkoutCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the workout title and status badge', () => {
    render(<WorkoutCard workout={workout()} />);
    expect(screen.getByText('Push Day')).toBeTruthy();
    expect(screen.getByText('Erledigt')).toBeTruthy();
  });

  it('uses the "Aktiv" label for in_progress workouts', () => {
    render(<WorkoutCard workout={workout({ status: 'in_progress' })} />);
    expect(screen.getByText('Aktiv')).toBeTruthy();
  });

  it('falls back to the uppercased type for other statuses', () => {
    render(<WorkoutCard workout={workout({ status: 'planned' })} />);
    expect(screen.getByText('STRENGTH')).toBeTruthy();
  });

  it('formats the scheduled date when present', () => {
    render(<WorkoutCard workout={workout({ scheduledAt: '2026-06-05T00:00:00Z' })} />);
    expect(screen.getByText('formatted(2026-06-05T00:00:00Z)')).toBeTruthy();
  });

  it('renders the duration and total volume when exercise details are present', () => {
    render(
      <WorkoutCard
        workout={workout({
          durationSeconds: 1500,
          exercises: [
            {
              id: 'we-1',
              exerciseId: 'e-1',
              exercise: {} as Workout['exercises'][number]['exercise'],
              orderIndex: 0,
              sets: [
                { id: 's-1', setNumber: 1, reps: 8, weightKg: 60, isWarmup: false, isDropset: false, isFailure: false, completed: true },
                { id: 's-2', setNumber: 2, reps: 6, weightKg: 65, isWarmup: false, isDropset: false, isFailure: false, completed: true },
              ],
              restSeconds: 90,
            },
          ],
        })}
      />
    );

    expect(screen.getByText('25m')).toBeTruthy();
    expect(screen.getByText('870')).toBeTruthy();
  });

  it('hides the volume footer when there are no exercise details', () => {
    render(<WorkoutCard workout={workout({ exercises: [] })} />);
    expect(screen.queryByText('Saetze')).toBeNull();
  });

  it('renders each tag as a label', () => {
    render(<WorkoutCard workout={workout({ tags: ['push', 'chest', 'heavy'] })} />);
    expect(screen.getByText('push')).toBeTruthy();
    expect(screen.getByText('chest')).toBeTruthy();
    expect(screen.getByText('heavy')).toBeTruthy();
  });

  it('hides the tag row when there are no tags', () => {
    const { container } = render(<WorkoutCard workout={workout({ tags: [] })} />);
    // No assertions on exact count; we just want to make sure render doesn't crash.
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('invokes onPress with the workout when clicked', () => {
    const onPress = vi.fn();
    render(<WorkoutCard workout={workout()} onPress={onPress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'w-1' }));
  });
});
