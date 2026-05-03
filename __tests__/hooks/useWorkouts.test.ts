// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('useWorkouts', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all workouts with no filter', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useWorkouts } = await import('@/hooks/useWorkouts');

    const { result } = renderHook(() => useWorkouts());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.workouts.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('filters by status', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useWorkouts } = await import('@/hooks/useWorkouts');

    const { result } = renderHook(() => useWorkouts({ status: 'completed' }));

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.workouts.every((w) => w.status === 'completed')).toBe(true);
  });

  it('applies limit', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useWorkouts } = await import('@/hooks/useWorkouts');

    const { result } = renderHook(() => useWorkouts({ limit: 1 }));

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.workouts.length).toBe(1);
  });

  it('getWorkoutById returns correct workout', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useWorkouts } = await import('@/hooks/useWorkouts');

    const { result } = renderHook(() => useWorkouts());

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    const workout = result.current.getWorkoutById('wo-001');
    expect(workout).not.toBeNull();
    expect(workout!.id).toBe('wo-001');
  });

  it('getWorkoutById returns null for missing ID', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useWorkouts } = await import('@/hooks/useWorkouts');

    const { result } = renderHook(() => useWorkouts());

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    const workout = result.current.getWorkoutById('nonexistent');
    expect(workout).toBeNull();
  });
});
