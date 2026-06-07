// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const routerMocks = vi.hoisted(() => ({
  segments: ['(tabs)'] as string[],
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (mapping: { web?: unknown; default?: unknown }) => mapping.web ?? mapping.default,
  },
  TurboModuleRegistry: { getEnforcing: () => ({}), get: () => ({}) },
  ActivityIndicator: ({ size, color }: any) => (
    <span data-testid="activity" data-size={size} data-color={color} />
  ),
  View: ({ children, style, ...rest }: any) => (
    <div data-style={JSON.stringify(style ?? null)} {...rest}>{children}</div>
  ),
}));

vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-worklets', () => ({}));

vi.mock('expo-router/react-navigation', () => ({
  DefaultTheme: {
    colors: {
      background: '#fff',
      card: '#fff',
      text: '#000',
      border: '#ccc',
      primary: '#178864',
    },
  },
  ThemeProvider: ({ children }: any) => <>{children}</>,
}));

const stackMock = vi.hoisted(() => {
  const Stack = ({ children }: { children: React.ReactNode }) => <div data-testid="stack">{children}</div>;
  (Stack as any).Screen = ({ name }: { name: string }) => <div data-testid={`stack-screen-${name}`} />;
  return Stack;
});

vi.mock('expo-router', () => ({
  Stack: stackMock,
  useRouter: () => routerMocks,
  useSegments: () => routerMocks.segments,
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#f4f6f5',
    primary: '#178864',
    card: '#fff',
    text: '#17212b',
    border: '#e9eef1',
  },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: authMocks.useAuth,
  AuthProvider: authMocks.AuthProvider,
}));

import RootLayout from '@/app/_layout';

function renderRoot() {
  return render(<RootLayout />);
}

describe('RootLayout', () => {
  afterEach(() => {
    cleanup();
    routerMocks.segments = ['(tabs)'];
    routerMocks.replace.mockReset();
    authMocks.useAuth.mockReset();
  });

  it('shows a loading spinner while auth state is resolving', () => {
    authMocks.useAuth.mockReturnValue({ user: null, isLoading: true });
    routerMocks.segments = ['(tabs)'];

    renderRoot();

    expect(screen.getByTestId('activity')).toBeTruthy();
  });

  it('redirects to /login when no user is signed in and we are not on the login page', async () => {
    authMocks.useAuth.mockReturnValue({ user: null, isLoading: false });
    routerMocks.segments = ['(tabs)'];

    renderRoot();

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('does NOT redirect to /login when the user is on the login page without a user', async () => {
    authMocks.useAuth.mockReturnValue({ user: null, isLoading: false });
    routerMocks.segments = ['login'];

    renderRoot();

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(routerMocks.replace).not.toHaveBeenCalled();
  });

  it('redirects to /(tabs) when the user is signed in and on the login page', async () => {
    authMocks.useAuth.mockReturnValue({ user: { id: 'u-1' }, isLoading: false });
    routerMocks.segments = ['login'];

    renderRoot();

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('does not redirect when the user is signed in and already on the home tabs', async () => {
    authMocks.useAuth.mockReturnValue({ user: { id: 'u-1' }, isLoading: false });
    routerMocks.segments = ['(tabs)'];

    renderRoot();

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(routerMocks.replace).not.toHaveBeenCalled();
  });
});
