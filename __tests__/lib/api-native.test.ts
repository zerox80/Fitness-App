import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

import { api, setToken } from '@/lib/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  setToken(null);
});

describe('api native auth', () => {
  it('sends bearer token on native requests', async () => {
    setToken('native-token');
    mockFetch.mockResolvedValue(mockJsonResponse({ id: '1' }));

    await api.auth.me();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer native-token');
    expect(options.credentials).toBeUndefined();
  });
});
