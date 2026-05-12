import { useState, useCallback, useEffect } from 'react';
import { Exercise, MuscleGroup, EquipmentType } from '@/types';
import { api, ApiExercise } from '@/lib/api';

interface UseExercisesOptions {
  muscleGroup?: MuscleGroup;
  equipment?: EquipmentType;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
}

export function mapApiExercise(exercise: ApiExercise): Exercise {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description ?? undefined,
    muscleGroups: exercise.muscle_groups,
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    instructions: exercise.instructions ?? undefined,
    imageUrl: exercise.image_url ?? undefined,
    videoUrl: exercise.video_url ?? undefined,
    isCustom: exercise.is_custom,
    userId: exercise.user_id ?? undefined,
  };
}

export function useExercises(options: UseExercisesOptions = {}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.exercises.listAll({
        muscle_group: options.muscleGroup,
        equipment: options.equipment,
        difficulty: options.difficulty,
        search: options.search,
      });
      setExercises(data.map(mapApiExercise));
    } catch {
      setError('Uebungen konnten nicht geladen werden.');
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
