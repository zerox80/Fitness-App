// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 1200 }));
const platformState = vi.hoisted(() => ({ OS: 'web' as 'web' | 'ios' | 'android' }));

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
  Flame: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Heart: () => null,
  Activity: () => null,
  Bike: () => null,
  Dumbbell: () => null,
  Home: () => null,
  User: () => null,
  Utensils: () => null,
  Target: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Zap: () => null,
  Trophy: () => null,
  TrendingUp: () => null,
  Shield: () => null,
  Bell: () => null,
  Mail: () => null,
  Lock: () => null,
  X: () => null,
  Check: () => null,
  Apple: () => null,
  ListChecks: () => null,
  Repeat: () => null,
  Trash2: () => null,
  Plus: () => null,
  ClipboardList: () => null,
  Play: () => null,
  Eye: () => null,
  HeartPulse: () => null,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: { softMuted: '#9aa2ac' },
  trainings: [
    { title: 'Laufen', meta: '30 Min · 5,2 km · Mittel', kcal: 320, icon: () => null, color: '#178864' },
    { title: 'Krafttraining', meta: '45 Min · Ganzkörper', kcal: 280, icon: () => null, color: '#1F9E9A' },
  ],
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  weeklyProgress: [],
  sidebarItems: [],
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

describe('TrainingList', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 1200;
    platformState.OS = 'web';
  });

  function setWindowWidth(value: number) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value, writable: true });
  }

  it('renders a "Trainings" header and the "Alle anzeigen" link', () => {
    setWindowWidth(1200);
    render(<TrainingList />);
    expect(screen.getByText('Trainings')).toBeTruthy();
    expect(screen.getByText('Alle anzeigen')).toBeTruthy();
  });

  it('renders each training title, meta, and kcal value', () => {
    setWindowWidth(1200);
    render(<TrainingList />);
    expect(screen.getByText('Laufen')).toBeTruthy();
    expect(screen.getByText('30 Min · 5,2 km · Mittel')).toBeTruthy();
    expect(screen.getByText('320')).toBeTruthy();
    expect(screen.getByText('Krafttraining')).toBeTruthy();
  });

  it('hides the chevron icon on narrow viewports (<= 430)', () => {
    setWindowWidth(400);
    widthState.value = 400;
    render(<TrainingList />);
    expect(document.querySelector('[data-size="22"]')).toBeNull();
  });

  it('shows the chevron icon on wider viewports', () => {
    setWindowWidth(800);
    widthState.value = 800;
    render(<TrainingList />);
    expect(document.querySelector('[data-size="22"]')).toBeTruthy();
  });
});
