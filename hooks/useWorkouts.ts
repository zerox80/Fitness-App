import { useState, useCallback, useEffect } from 'react';
import { ExerciseSet, Workout, WorkoutExercise, WorkoutStatus, WorkoutType } from '@/types';
import { api, ApiWorkout, GeneratedExercise } from '@/lib/api';

interface UseWorkoutsOptions {
  status?: WorkoutStatus;
  limit?: number;
}

const WORKOUT_TYPES: WorkoutType[] = [
  'strength',
  'cardio',
  'hiit',
  'flexibility',
  'sport',
  'custom',
];

function statusToCompleted(status?: WorkoutStatus) {
  if (status === 'completed') {
    return true;
  }
  if (status === 'planned') {
    return false;
  }
  return undefined;
}

function categoryToType(category: string): WorkoutType {
  return WORKOUT_TYPES.includes(category as WorkoutType) ? (category as WorkoutType) : 'custom';
}

function mapApiExercise(
  workout: ApiWorkout,
  exercise: GeneratedExercise,
  index: number
): WorkoutExercise {
  const completed = Boolean(workout.completed_at);
  const parsedReps = Number.parseInt(exercise.reps, 10);
  const reps = Number.isNaN(parsedReps) ? undefined : parsedReps;

  const sets: ExerciseSet[] = Array.from({ length: Math.max(0, exercise.sets) }, (_, setIndex) => ({
    id: `${workout.id}-${index}-set-${setIndex + 1}`,
    setNumber: setIndex + 1,
    reps,
    isWarmup: false,
    isDropset: false,
    isFailure: false,
    completed,
  }));

  return {
    id: `${workout.id}-${index}`,
    exerciseId: '',
    exercise: {
      id: '',
      name: exercise.name,
      muscleGroups: [],
      equipment: [],
      difficulty: 'beginner',
      isCustom: false,
    },
    orderIndex: index,
    sets,
    restSeconds: exercise.rest_seconds,
  };
}

export function mapApiWorkout(workout: ApiWorkout): Workout {
  const status: WorkoutStatus = workout.completed_at ? 'completed' : 'planned';

  return {
    id: workout.id,
    userId: workout.user_id,
    title: workout.title,
    description: workout.description ?? undefined,
    type: categoryToType(workout.category),
    status,
    completedAt: workout.completed_at ?? undefined,
    durationSeconds: workout.duration_minutes * 60,
    exercises: (workout.exercises ?? []).map((exercise, index) =>
      mapApiExercise(workout, exercise, index)
    ),
    tags: [workout.category].filter(Boolean),
    createdAt: workout.created_at,
    updatedAt: workout.updated_at ?? workout.created_at,
  };
}

export function useWorkouts(options: UseWorkoutsOptions = {}) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const completed = statusToCompleted(options.status);
      const data = await api.workouts.listAll({ completed });
      const mapped = data.map(mapApiWorkout);
      setWorkouts(options.limit ? mapped.slice(0, options.limit) : mapped);
    } catch {
      setError('Workouts konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [options.status, options.limit]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const getWorkoutById = useCallback(
    (id: string) => workouts.find((w) => w.id === id) || null,
    [workouts]
  );

  return { workouts, loading, error, refetch: fetchWorkouts, getWorkoutById };
}
