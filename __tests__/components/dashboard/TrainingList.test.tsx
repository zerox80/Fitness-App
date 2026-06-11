// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 1200 }));
const platformState = vi.hoisted(() => ({ OS: 'web' as 'web' | 'ios' | 'android' }));
const listWorkoutsMock = vi.hoisted(() => vi.fn());

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, contentContainerStyle, showsVerticalScrollIndicator, ...rest } = props;
    void style;
    void activeOpacity;
    void contentContainerStyle;
    void showsVerticalScrollIndicator;
    return rest;
  }

  return {
    Platform: {
      get OS() {
        return platformState.OS;
      },
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
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('lucide-react-native', () => ({
  ChevronRight: ({ size, color }: any) => <span data-size={size} data-color={color} />,
  Activity: () => null,
  Dumbbell: () => null,
  Flame: () => null,
  HeartPulse: () => null,
  Timer: () => null,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: {
    softMuted: '#9aa2ac',
    green: '#178864',
    teal: '#1F9E9A',
    red: '#D2554B',
    muted: '#5C6670',
  },
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  ULTRA_WIDE_BREAKPOINT: 1800,
  STEP_GOAL: 10000,
  avatarUri: null,
  sidebarItems: [],
}));

vi.mock('@/lib/api', () => ({
  api: {
    workouts: {
      list: listWorkoutsMock,
    },
  },
}));

vi.mock('./dashboard.styles', () => ({
  styles: {
    trainingsHeader: { flexDirection: 'row' },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    showAll: { fontSize: 13 },
    trainingCard: { padding: 12 },
    trainingRow: { flexDirection: 'row' },
    trainingRowLast: { borderBottomWidth: 0 },
    compactTrainingRow: { paddingVertical: 6 },
    trainingIcon: { padding: 6 },
    compactTrainingIcon: { padding: 4 },
    trainingContent: { flex: 1 },
    trainingTitle: { fontSize: 14, fontWeight: '800' },
    compactTrainingTitle: { fontSize: 12 },
    trainingMeta: { fontSize: 12 },
    compactTrainingMeta: { fontSize: 10 },
    kcalBlock: { alignItems: 'flex-end' },
    kcalValue: { fontSize: 14, fontWeight: '800' },
    kcalUnit: { fontSize: 10 },
  },
}));

vi.mock('./dashboard-web.styles', () => ({
  webStyles: {
    webTrainingsHeader: { paddingBottom: 8 },
    webCardTitle: { fontSize: 18, fontWeight: '800' },
    webTrainingCard: { padding: 16 },
    webTrainingRow: { padding: 12 },
    webTrainingContent: { flex: 1 },
    webKcalBlock: { alignItems: 'flex-end' },
  },
}));

import { TrainingList } from '@/components/dashboard/TrainingList';

function apiWorkout(overrides: Record<string, unknown> = {}) {
  return {
    id: 'workout-1',
    user_id: 'user-1',
    title: 'Push Day',
    description: null,
    duration_minutes: 45,
    intensity: 'medium',
    category: 'strength',
    exercises: [],
    completed_at: null,
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    ...overrides,
  };
}

describe('TrainingList', () => {
  beforeEach(() => {
    listWorkoutsMock.mockResolvedValue([
      apiWorkout(),
      apiWorkout({ id: 'workout-2', title: 'Morgenlauf', category: 'cardio', intensity: 'high', duration_minutes: 30 }),
    ]);
  });

  afterEach(() => {
    cleanup();
    widthState.value = 1200;
    platformState.OS = 'web';
    listWorkoutsMock.mockReset();
  });

  function setWindowWidth(value: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value, writable: true });
  }

  it('renders a "Trainings" header and the "Alle anzeigen" link', async () => {
    setWindowWidth(1200);
    render(<TrainingList />);
    expect(screen.getByText('Trainings')).toBeTruthy();
    expect(screen.getByText('Alle anzeigen')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Push Day')).toBeTruthy());
  });

  it('renders workouts from the API with category, intensity and duration', async () => {
    setWindowWidth(1200);
    render(<TrainingList />);

    await waitFor(() => expect(screen.getByText('Push Day')).toBeTruthy());
    expect(screen.getByText('Kraft · Mittel')).toBeTruthy();
    expect(screen.getByText('45')).toBeTruthy();
    expect(screen.getByText('Morgenlauf')).toBeTruthy();
    expect(screen.getByText('Cardio · Intensiv')).toBeTruthy();
    expect(listWorkoutsMock).toHaveBeenCalledWith({ per_page: 4 });
  });

  it('shows an empty state when the user has no workouts', async () => {
    listWorkoutsMock.mockResolvedValue([]);
    setWindowWidth(1200);
    render(<TrainingList />);

    await waitFor(() =>
      expect(
        screen.getByText('Noch keine Trainings gespeichert. Starte mit einem Schnellstart.')
      ).toBeTruthy()
    );
  });

  it('shows the empty state when the request fails', async () => {
    listWorkoutsMock.mockRejectedValue(new Error('network down'));
    setWindowWidth(1200);
    render(<TrainingList />);

    await waitFor(() =>
      expect(
        screen.getByText('Noch keine Trainings gespeichert. Starte mit einem Schnellstart.')
      ).toBeTruthy()
    );
  });

  it('hides the chevron icon on narrow viewports (<= 430)', async () => {
    setWindowWidth(400);
    widthState.value = 400;
    render(<TrainingList />);
    await waitFor(() => expect(screen.getByText('Push Day')).toBeTruthy());
    expect(document.querySelector('[data-size="22"]')).toBeNull();
  });

  it('shows the chevron icon on wider viewports', async () => {
    setWindowWidth(800);
    widthState.value = 800;
    render(<TrainingList />);
    await waitFor(() => expect(screen.getByText('Push Day')).toBeTruthy());
    expect(document.querySelector('[data-size="22"]')).toBeTruthy();
  });
});
