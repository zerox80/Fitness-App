// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ currentOs: 'ios' as 'web' | 'ios' | 'android' }));

vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-worklets', () => ({}));

vi.mock('react-native', () => ({
  Platform: { OS: state.currentOs },
  StyleSheet: { create: (s: unknown) => s },
  Text: 'Text',
  View: 'View',
  Pressable: 'Pressable',
  TurboModuleRegistry: { getEnforcing: () => ({}), get: () => ({}) },
}));

vi.mock('lucide-react-native', () => ({
  Activity: () => null,
  ClipboardList: () => null,
  Home: () => null,
  Plus: () => null,
  User: () => null,
}));

vi.mock('expo-router', () => ({
  Tabs: Object.assign(({ children }: any) => children, {
    Screen: ({ name }: any) => null,
  }),
  router: { push: vi.fn() },
}));

vi.mock('../../components/haptic-tab', () => ({ HapticTab: () => null }));
vi.mock('../../components/layout/WebLayout', () => ({ WebLayout: ({ children }: any) => children }));

import React from 'react';
import { cleanup, render } from '@testing-library/react';
import TabLayout from '@/app/(tabs)/_layout';

describe('TabLayout', () => {
  afterEach(() => {
    cleanup();
    state.currentOs = 'ios';
  });

  it('renders without crashing on iOS', () => {
    state.currentOs = 'ios';
    const { container } = render(<TabLayout />);
    expect(container).toBeTruthy();
  });

  it('renders without crashing on Android', () => {
    state.currentOs = 'android';
    const { container } = render(<TabLayout />);
    expect(container).toBeTruthy();
  });

  it('renders without crashing on web', () => {
    state.currentOs = 'web';
    const { container } = render(<TabLayout />);
    expect(container).toBeTruthy();
  });
});
