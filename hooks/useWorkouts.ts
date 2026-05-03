import { useState, useCallback, useEffect } from 'react';
import { Workout } from '@/types';
import { mockWorkouts } from '@/data/mockWorkouts';

interface UseWorkoutsOptions {
  status?: Workout['status'];
  limit?: number;
}

export function useWorkouts(options: UseWorkoutsOptions = {}) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 400));
      let data = [...mockWorkouts];
      if (options.status) {
        data = data.filter((w) => w.status === options.status);
      }
      if (options.limit) {
        data = data.slice(0, options.limit);
      }
      setWorkouts(data);
    } catch (e) {
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
