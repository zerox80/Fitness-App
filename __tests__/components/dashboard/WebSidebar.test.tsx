// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));
const pathnameState = vi.hoisted(() => ({ value: '/' }));
const alertMock = vi.hoisted(() => vi.fn());

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

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
  };
});

vi.mock('lucide-react-native', () => ({
  Settings: () => null,
  Home: () => null,
  Activity: () => null,
  Dumbbell: () => null,
  Utensils: () => null,
  Target: () => null,
  User: () => null,
}));

vi.mock('@/constants/dashboard-constants', () => ({
  palette: {
    greenDark: '#126F54',
    muted: '#6f7782',
  },
  sidebarItems: [
    { label: 'Übersicht', icon: () => null },
    { label: 'Aktivität', icon: () => null },
    { label: 'Trainings', icon: () => null },
    { label: 'Ernährung', icon: () => null },
    { label: 'Ziele', icon: () => null },
    { label: 'Profil', icon: () => null },
  ],
  WEB_CONTENT_MAX_WIDTH: 1520,
  DESKTOP_BREAKPOINT: 900,
  WIDE_BREAKPOINT: 1200,
  STEP_GOAL: 10000,
  avatarUri: null,
  trainings: [],
  weeklyProgress: [],
}));

vi.mock('./dashboard-web.styles', () => ({
  webStyles: {
    webSidebar: { width: 240, padding: 16 },
    sidebarNav: { flex: 1 },
    sidebarItem: { flexDirection: 'row', padding: 8 },
    sidebarItemActive: { backgroundColor: 'rgba(0,0,0,0.05)' },
    sidebarText: { fontSize: 14 },
    sidebarTextActive: { color: '#126F54' },
    sidebarSettings: { flexDirection: 'row', padding: 8 },
    logoRow: { flexDirection: 'row' },
    logoMark: { width: 24, height: 24 },
    logoTop: { width: 20, height: 4 },
    logoMiddle: { width: 20, height: 4 },
    logoBottom: { width: 20, height: 4 },
    logoText: { fontSize: 18, fontWeight: '800' },
  },
}));

vi.mock('expo-router', () => ({
  router: routerMocks,
  usePathname: () => pathnameState.value,
}));

vi.stubGlobal('alert', alertMock);

import { WebSidebar } from '@/components/dashboard/WebSidebar';

describe('WebSidebar', () => {
  beforeEach(() => {
    routerMocks.push.mockReset();
    alertMock.mockReset();
    pathnameState.value = '/';
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the brand name when not collapsed', () => {
    render(<WebSidebar collapsed={false} />);
    expect(screen.getByText('FitPulse')).toBeTruthy();
  });

  it('hides the brand name when collapsed', () => {
    render(<WebSidebar collapsed />);
    expect(screen.queryByText('FitPulse')).toBeNull();
  });

  it('renders one button per sidebar item', () => {
    render(<WebSidebar />);
    expect(screen.getByText('Übersicht')).toBeTruthy();
    expect(screen.getByText('Aktivität')).toBeTruthy();
    expect(screen.getByText('Trainings')).toBeTruthy();
    expect(screen.getByText('Ernährung')).toBeTruthy();
    expect(screen.getByText('Ziele')).toBeTruthy();
    expect(screen.getByText('Profil')).toBeTruthy();
  });

  it('routes to "/(tabs)" when the Übersicht item is clicked', () => {
    render(<WebSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Übersicht/ }));
    expect(routerMocks.push).toHaveBeenCalledWith('/(tabs)');
  });

  it('routes to "/(tabs)/tasks" when the Aktivität item is clicked', () => {
    render(<WebSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Aktivität/ }));
    expect(routerMocks.push).toHaveBeenCalledWith('/(tabs)/tasks');
  });

  it('routes to "/(tabs)/workout" when the Trainings item is clicked', () => {
    render(<WebSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Trainings/ }));
    expect(routerMocks.push).toHaveBeenCalledWith('/(tabs)/workout');
  });

  it('routes to "/(tabs)/profile" when the Profil item is clicked', () => {
    render(<WebSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Profil/ }));
    expect(routerMocks.push).toHaveBeenCalledWith('/(tabs)/profile');
  });

  it('shows an alert for not-yet-implemented items (Ernährung)', () => {
    render(<WebSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Ernährung/ }));
    expect(alertMock).toHaveBeenCalledWith('Kommt bald!');
  });

  it('shows an alert for not-yet-implemented items (Ziele)', () => {
    render(<WebSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Ziele/ }));
    expect(alertMock).toHaveBeenCalledWith('Kommt bald!');
  });

  it('shows the "Einstellungen kommen bald!" alert when the settings button is clicked', () => {
    render(<WebSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /Einstellungen/ }));
    expect(alertMock).toHaveBeenCalledWith('Einstellungen kommen bald!');
  });
});
