// @vitest-environment jsdom
import { describe, it, vi } from 'vitest';

vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-worklets', () => ({}));
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  StyleSheet: { create: (s: unknown) => s },
  Text: 'Text',
  View: 'View',
  Pressable: 'Pressable',
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
import { render } from '@testing-library/react';

import TabLayout from '@/app/(tabs)/_layout';

describe('smoke', () => {
  it('renders', () => {
    render(<TabLayout />);
  });
});
