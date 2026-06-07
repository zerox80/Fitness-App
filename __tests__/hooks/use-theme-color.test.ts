// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const colorSchemeState = vi.hoisted(() => ({ value: 'light' as 'light' | 'dark' | null | undefined }));

vi.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => colorSchemeState.value,
}));

vi.mock('@/constants/theme', () => ({
  Colors: {
    light: { text: '#111', background: '#fff' },
    dark: { text: '#eee', background: '#000' },
  },
}));

import { useThemeColor } from '@/hooks/use-theme-color';

describe('useThemeColor', () => {
  afterEach(() => {
    colorSchemeState.value = 'light';
  });

  it('returns the light palette color when the scheme is light and no override is given', () => {
    colorSchemeState.value = 'light';

    const { result } = renderHook(() => useThemeColor({}, 'text'));

    expect(result.current).toBe('#111');
  });

  it('returns the dark palette color when the scheme is dark', () => {
    colorSchemeState.value = 'dark';

    const { result } = renderHook(() => useThemeColor({}, 'background'));

    expect(result.current).toBe('#000');
  });

  it('prefers the light prop override over the palette value', () => {
    colorSchemeState.value = 'light';

    const { result } = renderHook(() => useThemeColor({ light: '#abc123' }, 'text'));

    expect(result.current).toBe('#abc123');
  });

  it('prefers the dark prop override over the palette value', () => {
    colorSchemeState.value = 'dark';

    const { result } = renderHook(() => useThemeColor({ dark: '#0a0a0a' }, 'background'));

    expect(result.current).toBe('#0a0a0a');
  });

  it('treats an undefined color scheme as light and falls back to the light palette', () => {
    colorSchemeState.value = undefined;

    const { result } = renderHook(() => useThemeColor({}, 'text'));

    expect(result.current).toBe('#111');
  });
});
