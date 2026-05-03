// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('useDebounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', async () => {
    vi.useFakeTimers();
    const React = await import('react');
    const { renderHook, act } = await import('@testing-library/react');
    const { useDebounce } = await import('@/hooks/useDebounce');

    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('updates to debounced value after delay', async () => {
    vi.useFakeTimers();
    const React = await import('react');
    const { renderHook, act } = await import('@testing-library/react');
    const { useDebounce } = await import('@/hooks/useDebounce');

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('cancels pending update on value change', async () => {
    vi.useFakeTimers();
    const React = await import('react');
    const { renderHook, act } = await import('@testing-library/react');
    const { useDebounce } = await import('@/hooks/useDebounce');

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('third');
  });

  it('works with different delay values', async () => {
    vi.useFakeTimers();
    const React = await import('react');
    const { renderHook, act } = await import('@testing-library/react');
    const { useDebounce } = await import('@/hooks/useDebounce');

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 100 } }
    );

    rerender({ value: 'b', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('b');
  });

  it('works with non-string types (number)', async () => {
    vi.useFakeTimers();
    const React = await import('react');
    const { renderHook, act } = await import('@testing-library/react');
    const { useDebounce } = await import('@/hooks/useDebounce');

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 42 } }
    );

    rerender({ value: 100 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('works with objects', async () => {
    vi.useFakeTimers();
    const React = await import('react');
    const { renderHook, act } = await import('@testing-library/react');
    const { useDebounce } = await import('@/hooks/useDebounce');

    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: obj1 } }
    );

    rerender({ value: obj2 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(obj2);
  });
});
