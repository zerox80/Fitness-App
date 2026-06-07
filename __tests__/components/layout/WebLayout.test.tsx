// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const platformState = vi.hoisted(() => ({ OS: 'web' as 'web' | 'ios' | 'android' }));
const widthState = vi.hoisted(() => ({ value: 1400 }));
const routerMocks = vi.hoisted(() => ({ push: vi.fn() }));
const pathState = vi.hoisted(() => ({ pathname: '/(tabs)' }));

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, ...rest } = props;
    void style;
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
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => <>{children}</>,
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#f4f6f5',
  },
}));

vi.mock('@/constants/dashboard-constants', () => ({
  DESKTOP_BREAKPOINT: 900,
  palette: { text: '#17212b' },
}));

vi.mock('@/components/dashboard/dashboard-web.styles', () => ({
  webStyles: {
    webSafeArea: { backgroundColor: '#fff' },
    webShell: { flexDirection: 'row' },
    webMain: { flex: 1 },
    webContent: { padding: 16 },
  },
}));

vi.mock('@/components/dashboard/WebSidebar', () => ({
  WebSidebar: ({ collapsed }: any) => <div data-testid="sidebar" data-collapsed={!!collapsed} />,
}));

vi.mock('@/components/dashboard/WebTopBar', () => ({
  WebTopBar: ({ collapsed }: any) => <div data-testid="topbar" data-collapsed={!!collapsed} />,
}));

import { WebLayout } from '@/components/layout/WebLayout';

describe('WebLayout', () => {
  afterEach(() => {
    cleanup();
    platformState.OS = 'web';
    widthState.value = 1400;
  });

  it('renders bare children on non-web platforms', () => {
    platformState.OS = 'ios';
    widthState.value = 400;

    render(
      <WebLayout>
        <span data-testid="bare">Inhalt</span>
      </WebLayout>
    );

    expect(screen.getByTestId('bare')).toBeTruthy();
    expect(screen.queryByTestId('sidebar')).toBeNull();
  });

  it('renders the desktop shell with sidebar and topbar when wide enough', () => {
    platformState.OS = 'web';
    widthState.value = 1400;

    render(
      <WebLayout>
        <span data-testid="page">Inhalt</span>
      </WebLayout>
    );

    expect(screen.getByTestId('sidebar')).toBeTruthy();
    expect(screen.getByTestId('topbar')).toBeTruthy();
    expect(screen.getByTestId('page')).toBeTruthy();
  });

  it('collapses the sidebar and topbar on medium desktop widths (between 900 and 1200)', () => {
    platformState.OS = 'web';
    widthState.value = 1000;

    render(
      <WebLayout>
        <span data-testid="page">Inhalt</span>
      </WebLayout>
    );

    expect(screen.getByTestId('sidebar').getAttribute('data-collapsed')).toBe('true');
    expect(screen.getByTestId('topbar').getAttribute('data-collapsed')).toBe('true');
  });
});
