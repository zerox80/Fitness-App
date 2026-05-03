// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('useStats', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns stats and weeklyGoal after loading', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useStats } = await import('@/hooks/useStats');

    const { result } = renderHook(() => useStats());

    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats).not.toBeNull();
    expect(result.current.weeklyGoal).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('calculates totalWorkouts from completed workouts', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useStats } = await import('@/hooks/useStats');

    const { result } = renderHook(() => useStats());

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.stats!.totalWorkouts).toBeGreaterThan(0);
  });

  it('has valid weekly goal structure', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useStats } = await import('@/hooks/useStats');

    const { result } = renderHook(() => useStats());

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const goal = result.current.weeklyGoal!;
    expect(goal.workoutGoal).toBeGreaterThan(0);
    expect(goal.durationGoalMinutes).toBeGreaterThan(0);
    expect(goal.completedWorkouts).toBeGreaterThanOrEqual(0);
    expect(goal.completedDurationMinutes).toBeGreaterThanOrEqual(0);
  });

  it('refetch reloads stats', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useStats } = await import('@/hooks/useStats');

    const { result } = renderHook(() => useStats());

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats).not.toBeNull();
  });
});
