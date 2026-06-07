// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, renderHook, screen } from '@testing-library/react';

const platformState = vi.hoisted(() => ({ OS: 'web' as 'web' | 'ios' | 'android' }));
const widthState = vi.hoisted(() => ({ value: 1200 }));

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

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#f4f6f5',
    text: '#17212b',
    textMuted: '#6f7782',
  },
  Layout: {
    compactPhone: 380,
    phone: 430,
    tablet: 900,
    desktop: 900,
    desktopExpanded: 1200,
    contentMax: 1520,
    pageMax: 1040,
  },
}));

import { AppPage, PageHeading, useResponsive } from '@/components/layout/AppPage';

describe('useResponsive', () => {
  afterEach(() => {
    cleanup();
    platformState.OS = 'web';
    widthState.value = 1200;
  });

  it('flags the layout as desktop on web when width >= 900', () => {
    platformState.OS = 'web';
    widthState.value = 1280;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isWideDesktop).toBe(true);
    expect(result.current.isCompactPhone).toBe(false);
  });

  it('flags the layout as compact phone when width < 380', () => {
    platformState.OS = 'ios';
    widthState.value = 360;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isCompactPhone).toBe(true);
    expect(result.current.isPhone).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('flags the layout as tablet when width is between 430 and 900', () => {
    platformState.OS = 'ios';
    widthState.value = 600;

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isPhone).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });
});

describe('AppPage', () => {
  afterEach(() => {
    cleanup();
    platformState.OS = 'web';
    widthState.value = 1200;
  });

  it('renders children in a non-scrolling layout when scroll={false}', () => {
    render(
      <AppPage padded={false} scroll={false}>
        <span data-testid="child">Inhalt</span>
      </AppPage>
    );

    expect(screen.getByTestId('child')).toBeTruthy();
  });
});

describe('PageHeading', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title, subtitle, and action', () => {
    render(
      <PageHeading title="Profil" subtitle="Deine Daten" action={<button>Speichern</button>} />
    );

    expect(screen.getByText('Profil')).toBeTruthy();
    expect(screen.getByText('Deine Daten')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeTruthy();
  });

  it('omits the subtitle when not provided', () => {
    render(<PageHeading title="Nur Titel" />);
    expect(screen.getByText('Nur Titel')).toBeTruthy();
  });
});
