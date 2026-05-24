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

const platformState = vi.hoisted(() => ({ OS: 'web' }));
vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return platformState.OS;
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  platformState.OS = 'web';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAuth() outside provider', () => {
  it('throws error when called outside AuthProvider', async () => {
    const { useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { act } = await import('@testing-library/react');

    const container = document.createElement('div');
    const root = createRoot(container);
    let caughtError: Error | null = null;

    class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      state = { hasError: false };
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      componentDidCatch(error: Error) {
        caughtError = error;
      }
      render() {
        return this.state.hasError ? null : this.props.children;
      }
    }

    function BadComponent() {
      useAuth();
      return null;
    }

    act(() => {
      root.render(
        React.createElement(ErrorBoundary, null,
          React.createElement(BadComponent)
        )
      );
    });

    expect(caughtError).not.toBeNull();
    expect(caughtError!.message).toContain('useAuth must be used within AuthProvider');
    root.unmount();
  });
});

describe('AuthProvider — loadUser behavior', () => {
  it('sets user when cookie session exists and /auth/me succeeds', async () => {
    vi.useFakeTimers();
    const mockUser = {
      id: '1',
      email: 'a@b.com',
      name: 'Test',
      created_at: '2024-02-03T00:00:00Z',
    };
    mockApiAuthMe.mockResolvedValue(mockUser);

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    vi.useRealTimers();
  });

  it('sets isLoading=false and user=null when no cookie session exists', async () => {
    vi.useFakeTimers();
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

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockApiAuthMe).toHaveBeenCalled();
    expect(mockGetToken).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('clears API token and sets user to null on unauthorized API error', async () => {
    vi.useFakeTimers();
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

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockRemoveToken).not.toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    vi.useRealTimers();
  });

  it('keeps cookie-session state untouched on temporary network errors', async () => {
    vi.useFakeTimers();
    mockApiAuthMe.mockRejectedValue(new Error('Network failed'));

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(mockRemoveToken).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('keeps cookie-session state untouched on server errors', async () => {
    vi.useFakeTimers();
    mockApiAuthMe.mockRejectedValue(new MockApiError('Server error', 500));

    const { AuthProvider, useAuth } = await import('@/lib/auth-context');
    const React = await import('react');
    const { act, renderHook } = await import('@testing-library/react');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockRemoveToken).not.toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    vi.useRealTimers();
  });
});

describe('login() flow', () => {
  it('calls API and sets user without storing token on web', async () => {
    vi.useFakeTimers();
    const loginResponse = {
      token: 'new-token',
      user: { id: '1', email: 'a@b.com', name: 'Test', created_at: '' },
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
      await result.current.login('a@b.com', 'pass');
    });

    expect(mockApiAuthLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass' });
    expect(mockSetTokenStorage).not.toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toEqual(loginResponse.user);
    vi.useRealTimers();
  });
});

describe('register() flow', () => {
  it('calls API and sets user without storing token on web', async () => {
    vi.useFakeTimers();
    const registerResponse = {
      token: 'reg-token',
      user: { id: '2', email: 'new@user.com', name: 'New', created_at: '' },
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
      await result.current.register('new@user.com', 'New', 'pass1234');
    });

    expect(mockApiAuthRegister).toHaveBeenCalled();
    expect(mockSetTokenStorage).not.toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toEqual(registerResponse.user);
    vi.useRealTimers();
  });
});

describe('logout() flow', () => {
  it('clears token and sets user to null', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue(null);
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
    expect(mockRemoveToken).not.toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
    vi.useRealTimers();
  });

  it('still clears API token even if logout request fails', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue(null);
    mockApiAuthLogout.mockRejectedValue(new Error('network error'));

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
    expect(mockRemoveToken).not.toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
    vi.useRealTimers();
  });
});

