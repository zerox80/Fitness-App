// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';

describe('useLocalState', () => {
  it('returns initial state', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useLocalState } = await import('@/hooks/useLocalState');

    const { result } = renderHook(() => useLocalState(42));
    expect(result.current.state).toBe(42);
    expect(result.current.isDirty).toBe(false);
  });

  it('setState updates state and sets isDirty=true', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { useLocalState } = await import('@/hooks/useLocalState');

    const { result } = renderHook(() => useLocalState(0));

    act(() => {
      result.current.setState(5);
    });

    expect(result.current.state).toBe(5);
    expect(result.current.isDirty).toBe(true);
  });

  it('reset restores initial state and sets isDirty=false', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { useLocalState } = await import('@/hooks/useLocalState');

    const { result } = renderHook(() => useLocalState('initial'));

    act(() => {
      result.current.setState('changed');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe('initial');
    expect(result.current.isDirty).toBe(false);
  });

  it('supports functional updater setState(prev => ...)', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { useLocalState } = await import('@/hooks/useLocalState');

    const { result } = renderHook(() => useLocalState(10));

    act(() => {
      result.current.setState((prev) => prev + 5);
    });

    expect(result.current.state).toBe(15);
    expect(result.current.isDirty).toBe(true);
  });

  it('isDirty is false initially', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useLocalState } = await import('@/hooks/useLocalState');

    const { result } = renderHook(() => useLocalState({ x: 1 }));
    expect(result.current.isDirty).toBe(false);
  });

  it('works with complex objects', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { useLocalState } = await import('@/hooks/useLocalState');

    const initial = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalState(initial));

    act(() => {
      result.current.setState({ name: 'Updated', count: 5 });
    });

    expect(result.current.state).toEqual({ name: 'Updated', count: 5 });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual(initial);
    expect(result.current.isDirty).toBe(false);
  });
});
