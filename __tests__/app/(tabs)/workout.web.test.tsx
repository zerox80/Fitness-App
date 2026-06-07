// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 1280 }));
const apiMocks = vi.hoisted(() => ({
  listAll: vi.fn(),
  get: vi.fn(),
  generate: vi.fn(),
  delete: vi.fn(),
  deleteAll: vi.fn(),
  create: vi.fn(),
}));

vi.mock('react-native', async () => {
  const ReactActual = (await vi.importActual('react')) as any;

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, accessibilityRole, accessibilityLabel, ...rest } = props;
    void style;
    void activeOpacity;
    void accessibilityRole;
    void accessibilityLabel;
    return rest;
  }

  return {
    ActivityIndicator: ({ color }: any) => <span data-testid="activity" data-color={color} />,
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TouchableOpacity: ({ accessibilityLabel, children, onPress, ...props }: any) =>
      ReactActual.createElement(
        'button',
        { ...cleanProps(props), 'aria-label': accessibilityLabel, onClick: onPress, type: 'button' },
        children
      ),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('lucide-react-native', () => ({
  Clock: () => null,
  Dumbbell: () => null,
  Eye: () => null,
  Play: () => null,
  Trash2: () => null,
  Flame: () => null,
  HeartPulse: () => null,
  Timer: () => null,
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

vi.mock('@/constants/dashboard-constants', () => ({
  DESKTOP_BREAKPOINT: 900,
  WEB_CONTENT_MAX_WIDTH: 1520,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  palette: { text: '#17212b' },
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

import WorkoutScreenWeb from '@/app/(tabs)/workout.web';

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

describe('WorkoutScreenWeb', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 1280;
    apiMocks.listAll.mockReset();
    apiMocks.get.mockReset();
    apiMocks.generate.mockReset();
    apiMocks.delete.mockReset();
    apiMocks.deleteAll.mockReset();
    apiMocks.create.mockReset();
  });

  it('renders the web header and subtitle', async () => {
    apiMocks.listAll.mockResolvedValue([]);

    render(<WorkoutScreenWeb />);

    expect(await screen.findByText('Trainings')).toBeTruthy();
    expect(screen.getByText('Plane und starte passende Einheiten.')).toBeTruthy();
  });

  it('renders an empty-state when there are no workouts', async () => {
    apiMocks.listAll.mockResolvedValue([]);

    render(<WorkoutScreenWeb />);

    expect(await screen.findByText('Noch keine Trainings')).toBeTruthy();
  });

  it('renders the "Alle löschen" button when workouts exist', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);

    render(<WorkoutScreenWeb />);

    expect(await screen.findByRole('button', { name: 'Alle Trainings löschen' })).toBeTruthy();
  });

  it('hides the "Alle löschen" button when there are no workouts', async () => {
    apiMocks.listAll.mockResolvedValue([]);

    render(<WorkoutScreenWeb />);

    await screen.findByText('Noch keine Trainings');
    expect(screen.queryByRole('button', { name: 'Alle Trainings löschen' })).toBeNull();
  });

  it('deletes a single workout when its delete button is clicked', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);
    apiMocks.delete.mockResolvedValue({ deleted: true });

    render(<WorkoutScreenWeb />);

    const deleteBtn = await screen.findByRole('button', { name: /Push Day löschen/ });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(apiMocks.delete).toHaveBeenCalledWith('w-1');
    });
  });

  it('opens the detail modal when a card is clicked', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);
    apiMocks.get.mockResolvedValue(apiWorkout({ title: 'Detail' }));

    render(<WorkoutScreenWeb />);

    const card = await screen.findByRole('button', { name: /Push Day ansehen/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(apiMocks.get).toHaveBeenCalledWith('w-1');
    });

    const modal = await screen.findByTestId('generated-modal');
    expect(modal.getAttribute('data-workout')).toBe('Detail');
  });
});
