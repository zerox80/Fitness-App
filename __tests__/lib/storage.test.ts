// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn().mockResolvedValue('native-token'),
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

describe('storage — web (Platform.OS === "web")', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getToken returns token from localStorage', async () => {
    localStorage.setItem('fitpulse_token', 'web-token');
    const { getToken } = await import('@/lib/storage');
    const token = await getToken();
    expect(token).toBe('web-token');
  });

  it('getToken returns null when no token stored', async () => {
    const { getToken } = await import('@/lib/storage');
    const token = await getToken();
    expect(token).toBeNull();
  });

  it('setToken stores to localStorage', async () => {
    const { setToken } = await import('@/lib/storage');
    await setToken('new-token');
    expect(localStorage.getItem('fitpulse_token')).toBe('new-token');
  });

  it('removeToken removes from localStorage', async () => {
    localStorage.setItem('fitpulse_token', 'to-remove');
    const { removeToken } = await import('@/lib/storage');
    await removeToken();
    expect(localStorage.getItem('fitpulse_token')).toBeNull();
  });
});
