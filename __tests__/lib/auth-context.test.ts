// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetToken = vi.fn();
const mockSetTokenStorage = vi.fn();
const mockRemoveToken = vi.fn();
const mockSetApiToken = vi.fn();
const mockApiAuthLogin = vi.fn();
const mockApiAuthRegister = vi.fn();
const mockApiAuthMe = vi.fn();

vi.mock('@/lib/storage', () => ({
  getToken: mockGetToken,
  setToken: mockSetTokenStorage,
  removeToken: mockRemoveToken,
}));

vi.mock('@/lib/api', () => ({
  setToken: mockSetApiToken,
  api: {
    auth: {
      login: mockApiAuthLogin,
      register: mockApiAuthRegister,
      me: mockApiAuthMe,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
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
  it('sets user when token exists and /auth/me succeeds', async () => {
    vi.useFakeTimers();
    const mockUser = { id: '1', email: 'a@b.com', name: 'Test' };
    mockGetToken.mockResolvedValue('valid-token');
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
    expect(mockSetApiToken).toHaveBeenCalledWith('valid-token');
    vi.useRealTimers();
  });

  it('sets isLoading=false and user=null when no token', async () => {
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

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockApiAuthMe).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('clears token and sets user to null on API error', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue('bad-token');
    mockApiAuthMe.mockRejectedValue(new Error('Unauthorized'));

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
    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    vi.useRealTimers();
  });
});

describe('login() flow', () => {
  it('calls API, stores token, sets user', async () => {
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
    expect(mockSetTokenStorage).toHaveBeenCalledWith('new-token');
    expect(mockSetApiToken).toHaveBeenCalledWith('new-token');
    expect(result.current.user).toEqual(loginResponse.user);
    vi.useRealTimers();
  });
});

describe('register() flow', () => {
  it('calls API, stores token, sets user', async () => {
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
    expect(mockSetTokenStorage).toHaveBeenCalledWith('reg-token');
    expect(mockSetApiToken).toHaveBeenCalledWith('reg-token');
    expect(result.current.user).toEqual(registerResponse.user);
    vi.useRealTimers();
  });
});

describe('logout() flow', () => {
  it('clears token and sets user to null', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue(null);
    mockRemoveToken.mockResolvedValue(undefined);

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

    expect(mockRemoveToken).toHaveBeenCalled();
    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
    vi.useRealTimers();
  });

  it('still clears API token even if removeToken throws', async () => {
    vi.useFakeTimers();
    mockGetToken.mockResolvedValue(null);
    mockRemoveToken.mockImplementation(() => Promise.reject(new Error('storage error')));

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
      try {
        await result.current.logout();
      } catch {
        // removeToken rejects, but logout still clears state via finally
      }
    });

    expect(mockSetApiToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
    vi.useRealTimers();
  });
});
