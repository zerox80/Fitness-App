// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 800 }));
const apiMocks = vi.hoisted(() => ({
  listAll: vi.fn(),
  get: vi.fn(),
  generate: vi.fn(),
  delete: vi.fn(),
  deleteAll: vi.fn(),
  create: vi.fn(),
}));

vi.mock('react-native', () => {
  const ReactInternal = require('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, accessibilityRole, accessibilityLabel, contentContainerStyle, showsHorizontalScrollIndicator, showsVerticalScrollIndicator, ...rest } = props;
    void style;
    void activeOpacity;
    void accessibilityRole;
    void accessibilityLabel;
    void contentContainerStyle;
    void showsHorizontalScrollIndicator;
    void showsVerticalScrollIndicator;
    return rest;
  }

  return {
    ActivityIndicator: ({ color }: any) =>
      ReactInternal.createElement('span', { 'data-testid': 'activity', 'data-color': color }),
    ScrollView: ({ children, ...rest }: any) =>
      ReactInternal.createElement('div', cleanProps(rest), children),
    StyleSheet: { create: (s: unknown) => s },
    Text: ({ children, ...rest }: any) => ReactInternal.createElement('span', cleanProps(rest), children),
    TouchableOpacity: ({ accessibilityLabel, children, onPress, ...rest }: any) =>
      ReactInternal.createElement(
        'button',
        { 'aria-label': accessibilityLabel, onClick: onPress, type: 'button', ...cleanProps(rest) },
        children
      ),
    View: ({ children, ...rest }: any) => ReactInternal.createElement('div', cleanProps(rest), children),
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

vi.mock('lucide-react-native', () => ({
  Clock: () => null,
  Dumbbell: () => null,
  Eye: () => null,
  Flame: () => null,
  HeartPulse: () => null,
  Play: () => null,
  Timer: () => null,
  Trash2: () => null,
  Zap: () => null,
  Heart: () => null,
  Activity: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Bike: () => null,
  Home: () => null,
  User: () => null,
  Utensils: () => null,
  Target: () => null,
  ChevronRight: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Trophy: () => null,
  TrendingUp: () => null,
  Shield: () => null,
  Bell: () => null,
  Mail: () => null,
  Lock: () => null,
  Check: () => null,
  Apple: () => null,
  ListChecks: () => null,
  Repeat: () => null,
  Plus: () => null,
  ClipboardList: () => null,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#f4f6f5',
    text: '#17212b',
    textMuted: '#6f7782',
    card: '#fff',
    cardLight: '#eef2f0',
    primary: '#178864',
    primaryGlow: '#e5f3ee',
    tertiary: '#d84d5a',
    tertiaryGlow: '#f9e5e7',
    borderSoft: '#e9eef1',
  },
}));

vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/components/modals/QuickStartModal', () => ({
  QuickStartModal: ({ visible, onGenerate }: any) =>
    visible ? (
      <div data-testid="quick-start">
        <button onClick={() => onGenerate(30, 'Full Body', 'Medium')} type="button">
          generate
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/modals/GeneratedWorkoutModal', () => ({
  GeneratedWorkoutModal: ({ visible, workout, onStart, onClose }: any) =>
    visible ? (
      <div data-testid="generated-modal" data-workout={workout?.title ?? ''}>
        <button onClick={onClose} type="button">close</button>
        {onStart ? <button onClick={onStart} type="button">start</button> : null}
      </div>
    ) : null,
}));

vi.mock('@/lib/api', () => ({
  api: {
    workouts: {
      listAll: apiMocks.listAll,
      get: apiMocks.get,
      generate: apiMocks.generate,
      delete: apiMocks.delete,
      deleteAll: apiMocks.deleteAll,
      create: apiMocks.create,
    },
  },
}));

vi.mock('@/utils/workoutCategory', () => ({
  categoryFromGeneratedWorkoutFocus: () => 'strength',
}));

import WorkoutScreen from '@/app/(tabs)/workout';

function apiWorkout(overrides: any = {}) {
  return {
    id: 'w-1',
    title: 'Push Day',
    description: null,
    category: 'strength',
    intensity: 'medium',
    duration_minutes: 30,
    exercises: [],
    ...overrides,
  };
}

describe('WorkoutScreen (mobile)', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 800;
    apiMocks.listAll.mockReset();
    apiMocks.get.mockReset();
    apiMocks.generate.mockReset();
    apiMocks.delete.mockReset();
    apiMocks.deleteAll.mockReset();
    apiMocks.create.mockReset();
  });

  it('renders the header title and subtitle', async () => {
    apiMocks.listAll.mockResolvedValue([]);

    render(<WorkoutScreen />);

    expect(await screen.findByText('Trainings')).toBeTruthy();
    expect(screen.getByText('Plane und starte passende Einheiten.')).toBeTruthy();
  });

  it('renders an empty-state when there are no workouts', async () => {
    apiMocks.listAll.mockResolvedValue([]);

    render(<WorkoutScreen />);

    expect(await screen.findByText('Noch keine Trainings')).toBeTruthy();
  });

  it('renders each workout in the list', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout({ id: 'w-1', title: 'Push Day' })]);

    render(<WorkoutScreen />);

    expect(await screen.findByText('Push Day')).toBeTruthy();
  });

  it('fetches both the filtered and full list when a category other than "Alle" is active', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);

    render(<WorkoutScreen />);

    await screen.findByText('Push Day');

    fireEvent.click(screen.getByRole('button', { name: /Kraft/ }));

    await waitFor(() => {
      expect(apiMocks.listAll).toHaveBeenCalledWith({ category: 'strength' });
    });
    expect(apiMocks.listAll).toHaveBeenCalledWith();
  });

  it('opens the generated-workout modal after a successful generate', async () => {
    apiMocks.listAll.mockResolvedValue([]);
    apiMocks.generate.mockResolvedValue({ title: 'AI Workout', description: null, total_duration: 30, intensity: 'Medium', exercises: [] });

    render(<WorkoutScreen />);

    fireEvent.click(screen.getByRole('button', { name: /Schnellstart/ }));
    fireEvent.click(screen.getByRole('button', { name: 'generate' }));

    expect(await screen.findByTestId('generated-modal')).toBeTruthy();
    expect(screen.getByTestId('generated-modal').getAttribute('data-workout')).toBe('AI Workout');
  });

  it('invokes the workout deletion endpoint when a card delete is clicked', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);
    apiMocks.delete.mockResolvedValue({ deleted: true });

    render(<WorkoutScreen />);

    const deleteBtn = await screen.findByRole('button', { name: /Push Day löschen/ });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(apiMocks.delete).toHaveBeenCalledWith('w-1');
    });
  });

  it('opens the detail modal for a workout when its card is clicked', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);
    apiMocks.get.mockResolvedValue(apiWorkout({ title: 'Detail' }));

    render(<WorkoutScreen />);

    const card = await screen.findByRole('button', { name: /Push Day ansehen/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(apiMocks.get).toHaveBeenCalledWith('w-1');
    });

    const modal = await screen.findByTestId('generated-modal');
    expect(modal.getAttribute('data-workout')).toBe('Detail');
  });
});
