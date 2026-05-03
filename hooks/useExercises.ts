import { useState, useCallback, useEffect } from 'react';
import { Exercise, MuscleGroup, EquipmentType } from '@/types';
import { defaultExercises } from '@/data/mockExercises';

interface UseExercisesOptions {
  muscleGroup?: MuscleGroup;
  equipment?: EquipmentType;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
}

export function useExercises(options: UseExercisesOptions = {}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 300));
      let data = [...defaultExercises];
      if (options.muscleGroup) {
        data = data.filter((e) => e.muscleGroups.includes(options.muscleGroup!));
      }
      if (options.equipment) {
        data = data.filter((e) => e.equipment.includes(options.equipment!));
      }
      if (options.difficulty) {
        data = data.filter((e) => e.difficulty === options.difficulty);
      }
      if (options.search) {
        const q = options.search.toLowerCase();
        data = data.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.muscleGroups.some((m) => m.toLowerCase().includes(q))
        );
      }
      setExercises(data);
    } catch (e) {
      setError('Übungen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [options.muscleGroup, options.equipment, options.difficulty, options.search]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const getExerciseById = useCallback(
    (id: string) => exercises.find((e) => e.id === id) || null,
    [exercises]
  );

  return { exercises, loading, error, refetch: fetchExercises, getExerciseById };
}
