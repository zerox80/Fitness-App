// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('useExercises', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all exercises with no filter', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.exercises.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('filters by muscleGroup', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises({ muscleGroup: 'chest' }));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(
      result.current.exercises.every((e) => e.muscleGroups.includes('chest'))
    ).toBe(true);
  });

  it('filters by equipment', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises({ equipment: 'barbell' }));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(
      result.current.exercises.every((e) => e.equipment.includes('barbell'))
    ).toBe(true);
  });

  it('filters by difficulty', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises({ difficulty: 'beginner' }));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(
      result.current.exercises.every((e) => e.difficulty === 'beginner')
    ).toBe(true);
  });

  it('filters by search query (name)', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises({ search: 'Bankdrücken' }));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.exercises.length).toBeGreaterThan(0);
    expect(
      result.current.exercises.some((e) => e.name.toLowerCase().includes('bankdrücken'))
    ).toBe(true);
  });

  it('filters by search query (muscleGroup)', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises({ search: 'chest' }));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(
      result.current.exercises.some((e) =>
        e.muscleGroups.some((m) => m.toLowerCase().includes('chest'))
      )
    ).toBe(true);
  });

  it('combines multiple filters', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() =>
      useExercises({ muscleGroup: 'chest', equipment: 'barbell' })
    );

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(
      result.current.exercises.every(
        (e) => e.muscleGroups.includes('chest') && e.equipment.includes('barbell')
      )
    ).toBe(true);
  });

  it('getExerciseById returns correct exercise', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const exercise = result.current.getExerciseById('ex-001');
    expect(exercise).not.toBeNull();
    expect(exercise!.name).toBe('Bankdrücken');
  });

  it('getExerciseById returns null for missing ID', async () => {
    vi.useFakeTimers();
    const { renderHook, act } = await import('@testing-library/react');
    const { useExercises } = await import('@/hooks/useExercises');

    const { result } = renderHook(() => useExercises());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.getExerciseById('nonexistent')).toBeNull();
  });
});
