// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 400 }));
const platformState = vi.hoisted(() => ({ OS: 'ios' as 'web' | 'ios' | 'android' }));

vi.mock('react-native', async () => {
  const ReactActual = (await vi.importActual('react')) as any;

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, animationType, behavior, presentationStyle, transparent, visible, showsVerticalScrollIndicator, ...rest } = props;
    void style;
    void activeOpacity;
    void animationType;
    void behavior;
    void presentationStyle;
    void transparent;
    void visible;
    void showsVerticalScrollIndicator;
    return rest;
  }

  return {
    Modal: ({ children }: any) => <div data-testid="modal">{children}</div>,
    Platform: {
      get OS() {
        return platformState.OS;
      },
    },
    ScrollView: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
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
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('lucide-react-native', () => ({
  X: () => null,
  Clock: () => null,
  Zap: () => null,
  Play: () => null,
  List: () => null,
  Heart: () => null,
  Activity: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Bike: () => null,
  Dumbbell: () => null,
  Home: () => null,
  User: () => null,
  Utensils: () => null,
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
  Trash2: () => null,
  Plus: () => null,
  ClipboardList: () => null,
  Eye: () => null,
  HeartPulse: () => null,
  Flame: () => null,
  Target: () => null,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    text: '#17212b',
    textMuted: '#6f7782',
    background: '#f4f6f5',
    card: '#fff',
    cardLight: '#eef2f0',
    primary: '#178864',
    primaryGlow: '#e5f3ee',
    borderSoft: '#e9eef1',
  },
}));

import { GeneratedWorkoutModal, type WorkoutModalData } from '@/components/modals/GeneratedWorkoutModal';

const baseWorkout: WorkoutModalData = {
  title: 'Push Day',
  description: 'Brust und Trizeps fokussiert.',
  exercises: [
    { name: 'Bankdrücken', sets: 3, reps: '8-10', rest_seconds: 90 },
    { name: 'Schulterdrücken', sets: 3, reps: '10', rest_seconds: 60 },
  ],
  total_duration: 45,
  intensity: 'Mittel',
};

describe('GeneratedWorkoutModal', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 400;
    platformState.OS = 'ios';
  });

  it('returns null when no workout is provided', () => {
    const { container } = render(
      <GeneratedWorkoutModal visible onClose={vi.fn()} workout={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the overline, title, and metadata', () => {
    render(
      <GeneratedWorkoutModal
        visible
        onClose={vi.fn()}
        workout={baseWorkout}
        overline="Trainingsvorschlag"
      />
    );

    expect(screen.getByText('Trainingsvorschlag')).toBeTruthy();
    expect(screen.getByText('Push Day')).toBeTruthy();
    expect(screen.getByText('45 min')).toBeTruthy();
    expect(screen.getByText('Mittel')).toBeTruthy();
  });

  it('renders the description when present', () => {
    render(<GeneratedWorkoutModal visible onClose={vi.fn()} workout={baseWorkout} />);
    expect(screen.getByText('Brust und Trizeps fokussiert.')).toBeTruthy();
  });

  it('omits the description when null', () => {
    render(
      <GeneratedWorkoutModal
        visible
        onClose={vi.fn()}
        workout={{ ...baseWorkout, description: null }}
      />
    );
    expect(screen.queryByText('Brust und Trizeps fokussiert.')).toBeNull();
  });

  it('renders each exercise with sets, reps, and rest_seconds', () => {
    render(<GeneratedWorkoutModal visible onClose={vi.fn()} workout={baseWorkout} />);

    expect(screen.getByText('Bankdrücken')).toBeTruthy();
    expect(screen.getByText('3 Saetze x 8-10')).toBeTruthy();
    expect(screen.getByText('90s Pause')).toBeTruthy();
    expect(screen.getByText('Schulterdrücken')).toBeTruthy();
  });

  it('renders an empty-state message when the workout has no exercises', () => {
    render(
      <GeneratedWorkoutModal
        visible
        onClose={vi.fn()}
        workout={{ ...baseWorkout, exercises: [] }}
      />
    );
    expect(screen.getByText('Keine Uebungen gespeichert.')).toBeTruthy();
  });

  it('invokes onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<GeneratedWorkoutModal visible onClose={onClose} workout={baseWorkout} />);

    const closeBtn = screen.getAllByRole('button').find((b) => b.textContent?.trim() === '');
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders the primary action button when onStart is provided and uses the default label', () => {
    const onStart = vi.fn();
    render(
      <GeneratedWorkoutModal
        visible
        onClose={vi.fn()}
        workout={baseWorkout}
        onStart={onStart}
      />
    );

    const btn = screen.getByRole('button', { name: 'Training speichern' });
    fireEvent.click(btn);
    expect(onStart).toHaveBeenCalled();
  });

  it('uses a custom primaryActionLabel when provided', () => {
    render(
      <GeneratedWorkoutModal
        visible
        onClose={vi.fn()}
        workout={baseWorkout}
        onStart={vi.fn()}
        primaryActionLabel="Training starten"
      />
    );

    expect(screen.getByRole('button', { name: 'Training starten' })).toBeTruthy();
  });

  it('hides the primary action button when onStart is not provided', () => {
    render(<GeneratedWorkoutModal visible onClose={vi.fn()} workout={baseWorkout} />);

    expect(screen.queryByRole('button', { name: 'Training speichern' })).toBeNull();
  });
});
