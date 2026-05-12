// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';

const apiMocks = vi.hoisted(() => ({
  listAll: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    workouts: {
      listAll: apiMocks.listAll,
    },
  },
}));

import { useWorkouts } from '@/hooks/useWorkouts';

function apiWorkout(overrides: Record<string, unknown> = {}) {
  return {
    id: 'wo-001',
    user_id: 'user-1',
    title: 'Push Day',
    description: 'Chest and shoulders',
    duration_minutes: 60,
    intensity: 'high',
    category: 'strength',
    exercises: [],
    completed_at: null,
    created_at: '2026-05-07T10:00:00Z',
    updated_at: '2026-05-07T10:00:00Z',
    ...overrides,
  };
}

describe('useWorkouts', () => {
  afterEach(() => {
    cleanup();
    apiMocks.listAll.mockReset();
  });

  it('fetches all workout pages through the API helper and maps planned workouts', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);

    const { result } = renderHook(() => useWorkouts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiMocks.listAll).toHaveBeenCalledWith({ completed: undefined });
    expect(result.current.workouts[0]).toMatchObject({
      id: 'wo-001',
      userId: 'user-1',
      title: 'Push Day',
      type: 'strength',
      status: 'planned',
      durationSeconds: 3600,
      tags: ['strength'],
    });
    expect(result.current.error).toBeNull();
  });

  it('derives completed status from completed_at', async () => {
    apiMocks.listAll.mockResolvedValue([
      apiWorkout({ completed_at: '2026-05-07T11:00:00Z' }),
    ]);

    const { result } = renderHook(() => useWorkouts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.workouts[0].status).toBe('completed');
    expect(result.current.workouts[0].completedAt).toBe('2026-05-07T11:00:00Z');
  });

  it('passes completed filters and applies local limit', async () => {
    apiMocks.listAll.mockResolvedValue([
      apiWorkout({ id: 'wo-001', completed_at: '2026-05-07T11:00:00Z' }),
      apiWorkout({ id: 'wo-002', completed_at: '2026-05-08T11:00:00Z' }),
    ]);

    const { result } = renderHook(() => useWorkouts({ status: 'completed', limit: 1 }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiMocks.listAll).toHaveBeenCalledWith({ completed: true });
    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0].id).toBe('wo-001');
  });

  it('getWorkoutById returns mapped workouts and null for missing IDs', async () => {
    apiMocks.listAll.mockResolvedValue([apiWorkout()]);

    const { result } = renderHook(() => useWorkouts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getWorkoutById('wo-001')?.title).toBe('Push Day');
    expect(result.current.getWorkoutById('missing')).toBeNull();
  });
});
