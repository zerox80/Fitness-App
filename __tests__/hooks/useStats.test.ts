// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

const apiMocks = vi.hoisted(() => ({
  getStats: vi.fn(),
  getWeekly: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    stats: {
      get: apiMocks.getStats,
      weekly: apiMocks.getWeekly,
    },
  },
}));

import { useStats } from '@/hooks/useStats';

const stats = {
  total_workouts: 7,
  total_minutes: 320,
  current_streak: 3,
};

const weeklySummary = {
  week_start: '2026-05-04',
  total_steps: 42000,
  total_calories: 2100,
  total_active_minutes: 180,
  workout_count: 4,
};

describe('useStats', () => {
  afterEach(() => {
    cleanup();
    apiMocks.getStats.mockReset();
    apiMocks.getWeekly.mockReset();
  });

  it('loads stats and weekly summary from backend APIs', async () => {
    apiMocks.getStats.mockResolvedValue(stats);
    apiMocks.getWeekly.mockResolvedValue(weeklySummary);

    const { result } = renderHook(() => useStats());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats).toEqual(stats);
    expect(result.current.weeklySummary).toEqual(weeklySummary);
    expect(result.current.error).toBeNull();
  });

  it('refetch reloads backend stats', async () => {
    apiMocks.getStats.mockResolvedValue(stats);
    apiMocks.getWeekly.mockResolvedValue(weeklySummary);

    const { result } = renderHook(() => useStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(apiMocks.getStats).toHaveBeenCalledTimes(2);
    expect(apiMocks.getWeekly).toHaveBeenCalledTimes(2);
  });

  it('sets an error when either stats request fails', async () => {
    apiMocks.getStats.mockResolvedValue(stats);
    apiMocks.getWeekly.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Statistiken konnten nicht geladen werden.');
    expect(result.current.stats).toBeNull();
    expect(result.current.weeklySummary).toBeNull();
  });
});
