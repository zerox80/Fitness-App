// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-worklets', () => ({}));

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
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
  Tabs: Object.assign(({ children }: any) => children, { Screen: () => null }),
  router: { push: vi.fn() },
}));

vi.mock('../../components/haptic-tab', () => ({ HapticTab: () => null }));
vi.mock('../../components/layout/WebLayout', () => ({ WebLayout: ({ children }: any) => children }));

import React from 'react';
import { render } from '@testing-library/react';

import TabLayout from '@/app/(tabs)/_layout';

describe('smoke', () => {
  it('renders', () => {
    const { container } = render(<TabLayout />);
    expect(container).toBeTruthy();
  });
});
