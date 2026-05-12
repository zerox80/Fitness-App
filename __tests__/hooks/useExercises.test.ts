// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';

const apiMocks = vi.hoisted(() => ({
  listAll: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    exercises: {
      listAll: apiMocks.listAll,
    },
  },
}));

import { useExercises } from '@/hooks/useExercises';

const apiExercise = {
  id: 'ex-001',
  name: 'Bankdruecken',
  description: 'Brustuebung',
  muscle_groups: ['chest', 'triceps'],
  equipment: ['barbell', 'bench'],
  difficulty: 'intermediate',
  instructions: ['Lie down', 'Press'],
  image_url: 'https://example.com/bench.png',
  video_url: null,
  is_custom: false,
  user_id: null,
  created_at: '2026-05-07T00:00:00Z',
  updated_at: '2026-05-07T00:00:00Z',
};

describe('useExercises', () => {
  afterEach(() => {
    cleanup();
    apiMocks.listAll.mockReset();
  });

  it('fetches exercises from the backend and maps snake_case fields', async () => {
    apiMocks.listAll.mockResolvedValue([apiExercise]);

    const { result } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiMocks.listAll).toHaveBeenCalledWith({
      muscle_group: undefined,
      equipment: undefined,
      difficulty: undefined,
      search: undefined,
    });
    expect(result.current.exercises[0]).toMatchObject({
      id: 'ex-001',
      name: 'Bankdruecken',
      description: 'Brustuebung',
      muscleGroups: ['chest', 'triceps'],
      equipment: ['barbell', 'bench'],
      difficulty: 'intermediate',
      instructions: ['Lie down', 'Press'],
      imageUrl: 'https://example.com/bench.png',
      isCustom: false,
    });
    expect(result.current.error).toBeNull();
  });

  it('passes filters to the exercise API', async () => {
    apiMocks.listAll.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useExercises({ muscleGroup: 'chest', equipment: 'barbell', difficulty: 'beginner', search: 'press' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiMocks.listAll).toHaveBeenCalledWith({
      muscle_group: 'chest',
      equipment: 'barbell',
      difficulty: 'beginner',
      search: 'press',
    });
  });

  it('getExerciseById returns mapped exercises and null for missing IDs', async () => {
    apiMocks.listAll.mockResolvedValue([apiExercise]);

    const { result } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getExerciseById('ex-001')?.name).toBe('Bankdruecken');
    expect(result.current.getExerciseById('missing')).toBeNull();
  });

  it('sets an error when the API request fails', async () => {
    apiMocks.listAll.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.exercises).toEqual([]);
    expect(result.current.error).toBe('Uebungen konnten nicht geladen werden.');
  });
});
