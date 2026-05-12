// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { ApiTaskWithCompletion } from '@/lib/api';

vi.mock('@/constants/Colors', () => ({
  Colors: {
    border: '#dde4e8',
    borderSoft: '#e9eef1',
    card: '#fff',
    cardLight: '#eef2f0',
    primary: '#178864',
    secondary: '#1f9e9a',
    tertiary: '#d84d5a',
    text: '#17212b',
    textMuted: '#6f7782',
  },
}));

vi.mock('lucide-react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  const Icon = () => ReactActual.createElement('span', { 'aria-hidden': true });

  return {
    Apple: Icon,
    Check: Icon,
    Dumbbell: Icon,
    ListChecks: Icon,
    Repeat: Icon,
    Trash2: Icon,
  };
});

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const {
      accessibilityRole,
      activeOpacity,
      borderColor,
      numberOfLines,
      style,
      ...rest
    } = props;
    return rest;
  }

  return {
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
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

import { TaskCard } from '@/components/cards/TaskCard';

const baseTask: ApiTaskWithCompletion = {
  category: 'habit',
  completed_sets_today: 0,
  completed_today: false,
  created_at: '2026-05-07T00:00:00Z',
  custom_days: [],
  description: null,
  id: 'task-1',
  is_active: true,
  recurrence: 'daily',
  target_sets: 1,
  title: 'Stretching',
  updated_at: '2026-05-07T00:00:00Z',
  user_id: 'user-1',
};

describe('TaskCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('awaits toggle callbacks and blocks duplicate taps while pending', async () => {
    let resolveToggle!: () => void;
    const onToggle = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveToggle = resolve;
        })
    );

    render(
      <TaskCard
        task={baseTask}
        onToggle={onToggle}
        onIncrementSet={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const updateButton = screen.getByRole('button', { name: 'Aufgabe aktualisieren' });
    fireEvent.click(updateButton);
    fireEvent.click(updateButton);

    expect(onToggle).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect((updateButton as HTMLButtonElement).disabled).toBe(true);
    });

    resolveToggle();

    await waitFor(() => {
      expect((updateButton as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('awaits increment callbacks and blocks duplicate set taps while pending', () => {
    const onIncrementSet = vi.fn(() => new Promise<void>(() => undefined));

    render(
      <TaskCard
        task={{ ...baseTask, completed_sets_today: 1, target_sets: 3 }}
        onToggle={vi.fn()}
        onIncrementSet={onIncrementSet}
        onDelete={vi.fn()}
      />
    );

    const incrementButton = screen.getByRole('button', { name: 'Satz abschließen' });
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);

    expect(onIncrementSet).toHaveBeenCalledTimes(1);
    expect((incrementButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('toggles a completed multi-set task instead of incrementing past the target', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    const onIncrementSet = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCard
        task={{ ...baseTask, completed_sets_today: 3, completed_today: true, target_sets: 3 }}
        onToggle={onToggle}
        onIncrementSet={onIncrementSet}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe aktualisieren' }));

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith('task-1');
    });
    expect(onIncrementSet).not.toHaveBeenCalled();
  });

  it('shows an inline error when delete rejects', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('Network failed'));

    render(
      <TaskCard
        task={baseTask}
        onToggle={vi.fn()}
        onIncrementSet={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe löschen' }));

    expect(await screen.findByText('Aufgabe konnte nicht gelöscht werden.')).toBeTruthy();
    expect(onDelete).toHaveBeenCalledWith('task-1');
  });
});
