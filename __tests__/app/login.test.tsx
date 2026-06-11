// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}));

const widthState = vi.hoisted(() => ({ value: 1280 }));
const platformState = vi.hoisted(() => ({ OS: 'web' as 'web' | 'ios' | 'android' }));

vi.mock('react-native', async () => {
  const ReactActual = (await vi.importActual('react')) as any;

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, placeholderTextColor, keyboardType, autoCapitalize, secureTextEntry, behavior, ...rest } = props;
    void style;
    void activeOpacity;
    void placeholderTextColor;
    void keyboardType;
    void autoCapitalize;
    void secureTextEntry;
    void behavior;
    return rest;
  }

  return {
    ActivityIndicator: ({ color }: any) => <span data-testid="activity" data-color={color} />,
    KeyboardAvoidingView: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    Platform: {
      get OS() {
        return platformState.OS;
      },
    },
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TextInput: ({ onChangeText, placeholder, value, ...props }: any) =>
      ReactActual.createElement('input', {
        ...cleanProps(props),
        onChange: (event: any) => onChangeText?.(event.target.value),
        placeholder,
        value,
      }),
    TouchableOpacity: ({ accessibilityLabel, children, disabled, onPress, ...props }: any) =>
      ReactActual.createElement(
        'button',
        { ...cleanProps(props), 'aria-label': accessibilityLabel, disabled, onClick: onPress, type: 'button' },
        children
      ),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('lucide-react-native', () => ({
  X: () => null,
  Mail: () => null,
  Lock: () => null,
  User: () => null,
  Activity: () => null,
  Heart: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Bike: () => null,
  Dumbbell: () => null,
  Home: () => null,
  Utensils: () => null,
  Target: () => null,
  ChevronRight: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Zap: () => null,
  Trophy: () => null,
  TrendingUp: () => null,
  Shield: () => null,
  Bell: () => null,
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
}));

vi.mock('expo-router', () => ({
  useRouter: () => routerMocks,
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
    shadow: 'rgba(0,0,0,0.08)',
    borderSoft: '#e9eef1',
    tertiary: '#d84d5a',
  },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: authMocks.useAuth,
}));

vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import LoginScreen from '@/app/login';
import { ApiError } from '@/lib/api';

describe('LoginScreen', () => {
  afterEach(() => {
    cleanup();
    authMocks.useAuth.mockReset();
    authMocks.login.mockReset();
    authMocks.register.mockReset();
    routerMocks.back.mockReset();
    widthState.value = 1280;
    platformState.OS = 'web';
  });

  it('renders the brand name and login tagline', () => {
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    expect(screen.getByText('FitPulse')).toBeTruthy();
    expect(screen.getByText('Willkommen zurück')).toBeTruthy();
  });

  it('calls login with the entered email and password on submit', async () => {
    authMocks.login.mockResolvedValue(undefined);
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

    await waitFor(() => {
      expect(authMocks.login).toHaveBeenCalledWith('alex@example.com', 'secret');
    });
  });

  it('calls register with email, name, and password when in register mode', async () => {
    authMocks.register.mockResolvedValue(undefined);
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    fireEvent.click(screen.getByText('Registrieren'));
    expect(screen.getAllByText('Konto erstellen').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText('Alex Müller')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Alex Müller'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Konto erstellen' }));

    await waitFor(() => {
      expect(authMocks.register).toHaveBeenCalledWith('alex@example.com', 'Alex', 'secret');
    });
  });

  it('shows a friendly German message for 401 responses', async () => {
    authMocks.login.mockRejectedValue(new ApiError('Invalid credentials', 401));
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

    expect(await screen.findByText('E-Mail oder Passwort ist falsch.')).toBeTruthy();
  });

  it('shows a rate-limit message for 429 responses', async () => {
    authMocks.login.mockRejectedValue(new ApiError('Rate limited', 429));
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

    expect(
      await screen.findByText('Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.')
    ).toBeTruthy();
  });

  it('passes validation messages from 400 responses through', async () => {
    authMocks.register.mockRejectedValue(new ApiError('Email already in use', 400));
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    fireEvent.click(screen.getByText('Registrieren'));
    fireEvent.change(screen.getByPlaceholderText('Alex Müller'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Konto erstellen' }));

    expect(await screen.findByText('Email already in use')).toBeTruthy();
  });

  it('uses a generic fallback error when login throws a non-Error', async () => {
    authMocks.login.mockRejectedValue('boom');
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    fireEvent.change(screen.getByPlaceholderText('alex@example.com'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

    expect(
      await screen.findByText('Anmeldung fehlgeschlagen. Bitte versuche es später erneut.')
    ).toBeTruthy();
  });

  it('renders the close button when a user is already authenticated and calls router.back on click', () => {
    authMocks.useAuth.mockReturnValue({ user: { id: 'u-1' }, login: authMocks.login, register: authMocks.register });

    const { container } = render(<LoginScreen />);

    const closeBtn = container.querySelector('[aria-label="Schließen"]') as HTMLElement;
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn);
    expect(routerMocks.back).toHaveBeenCalled();
  });

  it('hides the close button when no user is authenticated', () => {
    authMocks.useAuth.mockReturnValue({ user: null, login: authMocks.login, register: authMocks.register });

    render(<LoginScreen />);

    expect(screen.queryByLabelText('Schließen')).toBeNull();
  });
});
