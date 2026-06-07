// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const rnColorSchemeState = vi.hoisted(() => ({ value: 'light' as string | null | undefined }));

vi.mock('react-native', () => ({
  useColorScheme: () => rnColorSchemeState.value,
}));

import { useColorScheme } from '@/hooks/use-color-scheme.web';

describe('useColorScheme (web)', () => {
  beforeEach(() => {
    rnColorSchemeState.value = 'light';
  });

  afterEach(() => {
    rnColorSchemeState.value = 'light';
  });

  it('returns "light" before hydration to support static rendering', () => {
    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
  });

  it('returns the underlying RN color scheme after the hydration effect runs', async () => {
    rnColorSchemeState.value = 'dark';

    const { result } = renderHook(() => useColorScheme());

    await waitFor(() => expect(result.current).toBe('dark'));
  });

  it('mirrors the RN value (including null) after hydration', async () => {
    rnColorSchemeState.value = null;

    const { result } = renderHook(() => useColorScheme());

    await waitFor(() => expect(result.current).toBeNull());
  });
});
