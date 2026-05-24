// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetToken = vi.fn();
const mockSetTokenStorage = vi.fn();
const mockRemoveToken = vi.fn();
const mockSetApiToken = vi.fn();
const mockApiAuthLogin = vi.fn();
const mockApiAuthRegister = vi.fn();
const mockApiAuthMe = vi.fn();
const mockApiAuthLogout = vi.fn();
const MockApiError = vi.hoisted(
  () =>
    class ApiError extends Error {
      status: number;

      constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
      }
    }
);

vi.mock('@/lib/storage', () => ({
  getToken: mockGetToken,
  setToken: mockSetTokenStorage,
  removeToken: mockRemoveToken,
}));

vi.mock('@/lib/api', () => ({
  ApiError: MockApiError,
  setToken: mockSetApiToken,
  api: {
    auth: {
      login: mockApiAuthLogin,
      register: mockApiAuthRegister,
      me: mockApiAuthMe,
      logout: mockApiAuthLogout,
    },
  },
}));

const platformState = vi.hoisted(() => ({ OS: 'ios' }));
vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return platformState.OS;
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  platformState.OS = 'ios';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AuthProvider — native flow', () => {
  it('sets user when stored token exists and /auth/me succeeds on native', async () => {
    vi.useFakeTimers();
    const mockUser = {
      id: '1',
      email: 'native@b.com',
      name: 'Native Test',
      created_at: '',
    };
    mockGetToken.mockResolvedValue('stored-native-token');
    mockApiAuthMe.mockResolvedValue(mockUser);

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockGetToken).toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith('stored-native-token');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    vi.useRealTimers();
  });

  it('keeps user as null and does not fetch me when no stored token exists on native', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue(null);

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockGetToken).toHaveBeenCalled();
    expect(mockApiAuthMe).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    vi.useRealTimers();
  });

  it('clears stored token and resets api token on unauthorized error on native', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue('invalid-native-token');
    mockApiAuthMe.mockRejectedValue(new MockApiError('Unauthorized', 401));

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
    vi.useRealTimers();
  });

  it('login() saves token in secure storage on native', async () => {
    vi.useFakeTimers();
    const loginResponse = {
      token: 'native-session-token',
      user: { id: '3', email: 'native-login@b.com', name: 'Native Login', created_at: '' },
    };
    mockGetToken.mockResolvedValue(null);
    mockApiAuthLogin.mockResolvedValue(loginResponse);

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      await result.current.login('native-login@b.com', 'pass');
    });

    expect(mockApiAuthLogin).toHaveBeenCalledWith({ email: 'native-login@b.com', password: 'pass' });
    expect(mockSetTokenStorage).toHaveBeenCalledWith('native-session-token');
    expect(mockSetApiToken).toHaveBeenCalledWith('native-session-token');
    expect(result.current.user).toEqual(loginResponse.user);
    vi.useRealTimers();
  });

  it('register() saves token in secure storage on native', async () => {
    vi.useFakeTimers();
    const registerResponse = {
      token: 'native-register-token',
      user: { id: '4', email: 'native-reg@b.com', name: 'Native Reg', created_at: '' },
    };
    mockGetToken.mockResolvedValue(null);
    mockApiAuthRegister.mockResolvedValue(registerResponse);

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      await result.current.register('native-reg@b.com', 'Native Reg', 'pass1234');
    });

    expect(mockApiAuthRegister).toHaveBeenCalled();
    expect(mockSetTokenStorage).toHaveBeenCalledWith('native-register-token');
    expect(mockSetApiToken).toHaveBeenCalledWith('native-register-token');
    expect(result.current.user).toEqual(registerResponse.user);
    vi.useRealTimers();
  });

  it('logout() clears token on native', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue('active-token');
    mockRemoveToken.mockResolvedValue(undefined);
    mockApiAuthLogout.mockResolvedValue({ logged_out: true });

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockApiAuthLogout).toHaveBeenCalled();
    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
    vi.useRealTimers();
  });
});
