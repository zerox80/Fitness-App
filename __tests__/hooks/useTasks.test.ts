// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  today: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  toggle: vi.fn(),
  incrementSet: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    tasks: apiMocks,
  },
}));

vi.mock('@/utils/date', () => ({
  formatLocalDateKey: () => '2026-06-06',
}));

import { useTasks } from '@/hooks/useTasks';
import type { ApiTaskWithCompletion } from '@/lib/api';

function apiTask(overrides: Partial<ApiTaskWithCompletion> = {}): ApiTaskWithCompletion {
  return {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Mobility',
    description: null,
    recurrence: 'daily',
    custom_days: [],
    category: 'habit',
    is_active: true,
    target_sets: 3,
    completed_today: false,
    completed_sets_today: 1,
    created_at: '2026-06-06T08:00:00Z',
    updated_at: '2026-06-06T08:00:00Z',
    ...overrides,
  };
}

describe('useTasks', () => {
  afterEach(() => {
    cleanup();
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
  });

  it('loads today tasks and exposes the API state', async () => {
    apiMocks.today.mockResolvedValue([apiTask()]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiMocks.today).toHaveBeenCalledWith({ date: '2026-06-06' });
    expect(result.current.tasks).toEqual([apiTask()]);
    expect(result.current.error).toBeNull();
  });

  it('sets an error when the initial fetch fails', async () => {
    apiMocks.today.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBe('Tasks konnten nicht geladen werden.');
  });

  it('refreshes after create, update, and delete mutations', async () => {
    apiMocks.today.mockResolvedValue([apiTask()]);
    apiMocks.create.mockResolvedValue(apiTask({ id: 'task-new' }));
    apiMocks.update.mockResolvedValue(apiTask({ title: 'Updated' }));
    apiMocks.delete.mockResolvedValue({ deleted: true });

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTask({
        title: 'New',
        recurrence: 'daily',
        category: 'habit',
      });
      await result.current.updateTask('task-1', { title: 'Updated' });
      await result.current.deleteTask('task-1');
    });

    expect(apiMocks.create).toHaveBeenCalledWith({
      title: 'New',
      recurrence: 'daily',
      category: 'habit',
    });
    expect(apiMocks.update).toHaveBeenCalledWith('task-1', { title: 'Updated' });
    expect(apiMocks.delete).toHaveBeenCalledWith('task-1');
    expect(apiMocks.today).toHaveBeenCalledTimes(4);
  });

  it('updates a toggled task locally and leaves other tasks unchanged', async () => {
    apiMocks.today.mockResolvedValue([
      apiTask({ id: 'task-1', target_sets: 3, completed_sets_today: 1 }),
      apiTask({ id: 'task-2', target_sets: 2, completed_sets_today: 1 }),
    ]);
    apiMocks.toggle.mockResolvedValue({ completed: true });

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let completed = false;
    await act(async () => {
      completed = await result.current.toggleTask('task-1');
    });

    expect(completed).toBe(true);
    expect(apiMocks.toggle).toHaveBeenCalledWith('task-1', { date: '2026-06-06' });
    expect(result.current.tasks[0]).toMatchObject({
      id: 'task-1',
      completed_sets_today: 3,
      completed_today: true,
    });
    expect(result.current.tasks[1]).toMatchObject({
      id: 'task-2',
      completed_sets_today: 1,
      completed_today: false,
    });
  });

  it('clears progress when a completed task is toggled off', async () => {
    apiMocks.today.mockResolvedValue([
      apiTask({ target_sets: 3, completed_sets_today: 3, completed_today: true }),
    ]);
    apiMocks.toggle.mockResolvedValue({ completed: false });

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleTask('task-1');
    });

    expect(result.current.tasks[0]).toMatchObject({
      completed_sets_today: 0,
      completed_today: false,
    });
  });

  it('increments set progress locally and derives completion from the target', async () => {
    apiMocks.today.mockResolvedValue([
      apiTask({ target_sets: 3, completed_sets_today: 2, completed_today: false }),
    ]);
    apiMocks.incrementSet.mockResolvedValue({ completed_sets: 3 });

    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let completedSets = 0;
    await act(async () => {
      completedSets = await result.current.incrementSet('task-1');
    });

    expect(completedSets).toBe(3);
    expect(apiMocks.incrementSet).toHaveBeenCalledWith('task-1', { date: '2026-06-06' });
    expect(result.current.tasks[0]).toMatchObject({
      completed_sets_today: 3,
      completed_today: true,
    });
  });
});
