// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const platformState = vi.hoisted(() => ({ OS: 'web' as 'web' | 'ios' | 'android' }));
const widthState = vi.hoisted(() => ({ value: 1280 }));
const pathnameState = vi.hoisted(() => ({ value: '/(tabs)' }));
const drawerState = vi.hoisted(() => ({ open: false, onClose: vi.fn() }));

vi.mock('react-native', async () => {
  const ReactActual = (await vi.importActual('react')) as any;

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, accessibilityRole, accessibilityLabel, contentContainerStyle, showsVerticalScrollIndicator, ...rest } = props;
    void style;
    void activeOpacity;
    void accessibilityRole;
    void accessibilityLabel;
    void contentContainerStyle;
    void showsVerticalScrollIndicator;
    return rest;
  }

  return {
    Modal: ({ children, visible }: any) => (visible ? <div data-testid="drawer-modal">{children}</div> : null),
    Platform: {
      get OS() {
        return platformState.OS;
      },
    },
    Pressable: ({ onPress, children, ...props }: any) =>
      ReactActual.createElement('button', { ...cleanProps(props), onClick: onPress, type: 'button' }, children),
    ScrollView: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('expo-router', () => ({
  Slot: () => <div data-testid="slot" />,
  usePathname: () => pathnameState.value,
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('lucide-react-native', () => ({
  Menu: () => null,
  X: () => null,
  Home: () => null,
  Activity: () => null,
  Dumbbell: () => null,
  Utensils: () => null,
  Target: () => null,
  User: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Heart: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Bike: () => null,
  ChevronRight: () => null,
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
  Play: () => null,
  Eye: () => null,
  HeartPulse: () => null,
  Flame: () => null,
  Zap: () => null,
}));

vi.mock('@/components/dashboard/WebSidebar', () => ({
  WebSidebar: ({ collapsed }: any) => <div data-testid="sidebar" data-collapsed={!!collapsed} />,
}));

vi.mock('@/components/dashboard/WebTopBar', () => ({
  WebTopBar: ({ collapsed }: any) => <div data-testid="topbar" data-collapsed={!!collapsed} />,
}));

vi.mock('@/components/dashboard/dashboard-web.styles', () => ({
  webStyles: {
    webShell: { flexDirection: 'row' },
    webMain: { flex: 1 },
    webScrollContent: { padding: 24 },
    webContent: {},
  },
}));

vi.mock('@/constants/dashboard-constants', () => ({
  DESKTOP_BREAKPOINT: 900,
  palette: { text: '#17212b' },
  WEB_CONTENT_MAX_WIDTH: 1520,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
  sidebarItems: [],
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#f4f6f5',
    card: '#fff',
    cardLight: '#eef2f0',
    borderSoft: '#e9eef1',
  },
}));

import WebTabLayout from '@/app/(tabs)/_layout.web';

describe('WebTabLayout (desktop)', () => {
  afterEach(() => {
    cleanup();
    platformState.OS = 'web';
    widthState.value = 1280;
    pathnameState.value = '/(tabs)';
  });

  it('renders the sidebar, topbar, and slot content in the desktop shell', () => {
    platformState.OS = 'web';
    widthState.value = 1280;

    render(<WebTabLayout />);

    expect(screen.getByTestId('sidebar')).toBeTruthy();
    expect(screen.getByTestId('topbar')).toBeTruthy();
    expect(screen.getByTestId('slot')).toBeTruthy();
  });

  it('collapses the sidebar and topbar on medium-width desktops (between 900 and 1100)', () => {
    platformState.OS = 'web';
    widthState.value = 1000;

    render(<WebTabLayout />);

    expect(screen.getByTestId('sidebar').getAttribute('data-collapsed')).toBe('true');
    expect(screen.getByTestId('topbar').getAttribute('data-collapsed')).toBe('true');
  });
});

describe('WebTabLayout (mobile)', () => {
  afterEach(() => {
    cleanup();
    platformState.OS = 'ios';
    widthState.value = 400;
  });

  it('renders the mobile top bar and slot when not in desktop mode', () => {
    platformState.OS = 'ios';
    widthState.value = 400;

    render(<WebTabLayout />);

    expect(screen.getByTestId('slot')).toBeTruthy();
    expect(screen.getByText('FitPulse')).toBeTruthy();
  });
});
