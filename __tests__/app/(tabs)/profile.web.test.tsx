// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 1280 }));
const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  logout: vi.fn(),
}));
const apiMocks = vi.hoisted(() => ({
  statsGet: vi.fn(),
}));

vi.mock('react-native', async () => {
  const ReactActual = (await vi.importActual('react')) as any;

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, ...rest } = props;
    void style;
    void activeOpacity;
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
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('lucide-react-native', () => ({
  Bell: () => null,
  Calendar: () => null,
  ChevronRight: () => null,
  LogOut: () => null,
  Shield: () => null,
  Trophy: () => null,
  TrendingUp: () => null,
  User: () => null,
  Heart: () => null,
  Activity: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Bike: () => null,
  Dumbbell: () => null,
  Home: () => null,
  Utensils: () => null,
  Target: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Mail: () => null,
  Lock: () => null,
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
  Flame: () => null,
  Zap: () => null,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#f4f6f5',
    text: '#17212b',
    textMuted: '#6f7782',
    card: '#fff',
    cardLight: '#eef2f0',
    primary: '#178864',
    secondary: '#1f9e9a',
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

vi.mock('@/lib/auth-context', () => ({
  useAuth: authMocks.useAuth,
}));

vi.mock('@/lib/api', () => ({
  api: {
    stats: { get: apiMocks.statsGet },
  },
}));

import ProfileScreenWeb from '@/app/(tabs)/profile.web';

describe('ProfileScreenWeb', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 1280;
    authMocks.useAuth.mockReset();
    authMocks.logout.mockReset();
    apiMocks.statsGet.mockReset();
  });

  it('renders nothing when the user is not authenticated', () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({ user: null, logout: authMocks.logout });

    const { container } = render(<ProfileScreenWeb />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the email, name, and a "Mitglied seit YYYY" line from created_at', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({
      user: {
        id: 'u-1',
        email: 'alex@example.com',
        name: 'Alex',
        created_at: '2024-03-15T10:00:00Z',
      },
      logout: authMocks.logout,
    });
    apiMocks.statsGet.mockResolvedValue({
      total_workouts: 2,
      total_minutes: 75,
      current_streak: 1,
    });

    render(<ProfileScreenWeb />);

    expect(await screen.findByText('alex@example.com')).toBeTruthy();
    expect(screen.getByText('Alex')).toBeTruthy();
    expect(screen.getByText('Mitglied seit 2024')).toBeTruthy();
  });

  it('falls back to "FitPulse Konto" when the created_at is invalid', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({
      user: {
        id: 'u-1',
        email: 'alex@example.com',
        name: 'Alex',
        created_at: 'not-a-date',
      },
      logout: authMocks.logout,
    });
    apiMocks.statsGet.mockResolvedValue({});

    render(<ProfileScreenWeb />);

    expect(await screen.findByText('FitPulse Konto')).toBeTruthy();
  });

  it('renders the three stat cards with the user stats values', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({
      user: { id: 'u-1', email: 'a@b.c', name: 'Alex', created_at: '2024-01-01T00:00:00Z' },
      logout: authMocks.logout,
    });
    apiMocks.statsGet.mockResolvedValue({
      total_workouts: 5,
      total_minutes: 200,
      current_streak: 3,
    });

    render(<ProfileScreenWeb />);

    expect(await screen.findByText('5')).toBeTruthy();
    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders the default settings entries (Benachrichtigungen, Datenschutz, Konto verwalten)', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({
      user: { id: 'u-1', email: 'a@b.c', name: 'Alex', created_at: '2024-01-01T00:00:00Z' },
      logout: authMocks.logout,
    });
    apiMocks.statsGet.mockResolvedValue({});

    render(<ProfileScreenWeb />);

    expect(await screen.findByText('Benachrichtigungen')).toBeTruthy();
    expect(screen.getByText('Datenschutz')).toBeTruthy();
    expect(screen.getByText('Konto verwalten')).toBeTruthy();
  });

  it('calls logout when the "Abmelden" button is clicked', async () => {
    widthState.value = 1280;
    authMocks.useAuth.mockReturnValue({
      user: { id: 'u-1', email: 'a@b.c', name: 'Alex', created_at: '2024-01-01T00:00:00Z' },
      logout: authMocks.logout,
    });
    apiMocks.statsGet.mockResolvedValue({});

    render(<ProfileScreenWeb />);

    const logoutBtn = await screen.findByRole('button', { name: 'Abmelden' });
    logoutBtn.click();
    expect(authMocks.logout).toHaveBeenCalled();
  });
});
