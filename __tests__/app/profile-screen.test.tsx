// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  getStats: vi.fn(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: authMocks.useAuth,
}));

vi.mock('@/lib/api', () => ({
  api: {
    stats: {
      get: apiMocks.getStats,
    },
  },
}));

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('react-native-safe-area-context', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      ReactActual.createElement('div', null, children),
  };
});

vi.mock('lucide-react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  const Icon = () => ReactActual.createElement('span', { 'aria-hidden': true });

  return {
    Bell: Icon,
    Calendar: Icon,
    ChevronRight: Icon,
    LogOut: Icon,
    Shield: Icon,
    Trophy: Icon,
    TrendingUp: Icon,
    User: Icon,
  };
});

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const {
      activeOpacity,
      contentContainerStyle,
      showsVerticalScrollIndicator,
      style,
      ...rest
    } = props;
    return rest;
  }

  return {
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
    useWindowDimensions: () => ({ height: 800, width: 390 }),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ProfileScreen from '@/app/(tabs)/profile';

describe('ProfileScreen', () => {
  afterEach(() => {
    cleanup();
    authMocks.useAuth.mockReset();
    apiMocks.getStats.mockReset();
  });

  it('renders the membership year from the authenticated user created_at value', async () => {
    authMocks.useAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'alex@example.com',
        name: 'Alex',
        created_at: '2024-03-15T10:00:00Z',
      },
      logout: vi.fn(),
    });
    apiMocks.getStats.mockResolvedValue({
      total_workouts: 2,
      total_minutes: 75,
      current_streak: 1,
    });

    render(<ProfileScreen />);

    expect(await screen.findByText('Mitglied seit 2024')).toBeTruthy();
  });
});
