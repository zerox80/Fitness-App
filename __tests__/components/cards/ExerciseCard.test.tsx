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
    Platform: {
      OS: 'web',
      select: (mapping: { web?: unknown; default?: unknown }) => mapping.web ?? mapping.default,
    },
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

import { ExerciseCard } from '@/components/cards/ExerciseCard';
import type { Exercise } from '@/types';

function exercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name: 'Bankdrücken',
    description: 'Klassische Brustübung mit der Langhantel.',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['barbell'],
    difficulty: 'beginner',
    isCustom: false,
    ...overrides,
  };
}

describe('ExerciseCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the name and description', () => {
    render(<ExerciseCard exercise={exercise()} />);
    expect(screen.getByText('Bankdrücken')).toBeTruthy();
    expect(screen.getByText('Klassische Brustübung mit der Langhantel.')).toBeTruthy();
  });

  it('translates the difficulty into German', () => {
    render(<ExerciseCard exercise={exercise({ difficulty: 'beginner' })} />);
    expect(screen.getByText('Anfänger')).toBeTruthy();
  });

  it('translates the intermediate difficulty', () => {
    render(<ExerciseCard exercise={exercise({ difficulty: 'intermediate' })} />);
    expect(screen.getByText('Mittel')).toBeTruthy();
  });

  it('translates the advanced difficulty', () => {
    render(<ExerciseCard exercise={exercise({ difficulty: 'advanced' })} />);
    expect(screen.getByText('Fortgeschritten')).toBeTruthy();
  });

  it('translates muscle groups to German', () => {
    render(<ExerciseCard exercise={exercise({ muscleGroups: ['chest', 'biceps'] })} />);
    expect(screen.getByText('Brust')).toBeTruthy();
    expect(screen.getByText('Bizeps')).toBeTruthy();
  });

  it('translates equipment names', () => {
    render(<ExerciseCard exercise={exercise({ equipment: ['barbell', 'dumbbell'] })} />);
    expect(screen.getByText('Langhantel, Kurzhantel')).toBeTruthy();
  });

  it('calls onPress with the exercise when the card is clicked', () => {
    const onPress = vi.fn();
    render(<ExerciseCard exercise={exercise()} onPress={onPress} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'ex-1' }));
  });

  it('omits the description when the exercise has none', () => {
    render(<ExerciseCard exercise={exercise({ description: undefined })} />);
    expect(screen.queryByText('Klassische Brustübung mit der Langhantel.')).toBeNull();
  });

  it('keeps the original muscle key when no translation is known', () => {
    render(<ExerciseCard exercise={exercise({ muscleGroups: ['unknown_muscle'] as never })} />);
    expect(screen.getByText('unknown_muscle')).toBeTruthy();
  });
});
