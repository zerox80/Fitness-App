import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetItemAsync = vi.fn();
const mockSetItemAsync = vi.fn();
const mockDeleteItemAsync = vi.fn();

vi.mock('expo-secure-store', () => ({
  getItemAsync: mockGetItemAsync,
  setItemAsync: mockSetItemAsync,
  deleteItemAsync: mockDeleteItemAsync,
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('storage - native', () => {
  it('getToken reads from SecureStore', async () => {
    mockGetItemAsync.mockResolvedValue('native-token');
    const { getToken } = await import('@/lib/storage');

    await expect(getToken()).resolves.toBe('native-token');
    expect(mockGetItemAsync).toHaveBeenCalledWith('fitpulse_token');
  });

  it('setToken writes to SecureStore', async () => {
    mockSetItemAsync.mockResolvedValue(undefined);
    const { setToken } = await import('@/lib/storage');

    await setToken('native-token');
    expect(mockSetItemAsync).toHaveBeenCalledWith('fitpulse_token', 'native-token');
  });

  it('removeToken deletes from SecureStore', async () => {
    mockDeleteItemAsync.mockResolvedValue(undefined);
    const { removeToken } = await import('@/lib/storage');

    await removeToken();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('fitpulse_token');
  });
});
