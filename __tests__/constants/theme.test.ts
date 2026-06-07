// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

const platformState = vi.hoisted(() => ({
  select: vi.fn((mapping: { web?: unknown; default?: unknown; ios?: unknown }) => {
    if (platformState.OS === 'web') return mapping.web;
    if (platformState.OS === 'ios') return mapping.ios;
    return mapping.default;
  }),
  OS: 'web' as 'web' | 'ios' | 'android' | 'default',
}));

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return platformState.OS;
    },
    select: platformState.select,
  },
}));

import { Colors, Fonts } from '@/constants/theme';

describe('theme constants', () => {
  it('exposes light and dark palettes with text, background, tint, icon, and tabIcon entries', () => {
    expect(Colors.light.text).toBe('#11181C');
    expect(Colors.light.background).toBe('#fff');
    expect(Colors.light.tint).toBe('#0a7ea4');
    expect(Colors.light.icon).toBe('#687076');
    expect(Colors.light.tabIconDefault).toBe('#687076');
    expect(Colors.light.tabIconSelected).toBe('#0a7ea4');

    expect(Colors.dark.text).toBe('#ECEDEE');
    expect(Colors.dark.background).toBe('#151718');
    expect(Colors.dark.tint).toBe('#fff');
    expect(Colors.dark.icon).toBe('#9BA1A6');
    expect(Colors.dark.tabIconDefault).toBe('#9BA1A6');
    expect(Colors.dark.tabIconSelected).toBe('#fff');
  });

  it('resolves the web font stack via Platform.select when OS is "web"', () => {
    platformState.OS = 'web';

    expect(Fonts.sans).toContain('system-ui');
    expect(Fonts.serif).toContain('Georgia');
    expect(Fonts.mono).toContain('Menlo');
    expect(Fonts.rounded).toBeTruthy();
  });

  it('falls back to the default font families on non-web platforms', async () => {
    platformState.OS = 'android';

    vi.resetModules();
    vi.doMock('react-native', () => ({
      Platform: {
        get OS() {
          return platformState.OS;
        },
        select: platformState.select,
      },
    }));

    const mod = await import('@/constants/theme');
    expect(mod.Fonts.sans).toBe('normal');
    expect(mod.Fonts.serif).toBe('serif');
    expect(mod.Fonts.mono).toBe('monospace');

    platformState.OS = 'web';
  });
});
