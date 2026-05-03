import { useState, useCallback, useEffect } from 'react';
import { WorkoutStats, WeeklyGoal } from '@/types';
import { mockWorkouts } from '@/data/mockWorkouts';

export function useStats() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 500));

      const completed = mockWorkouts.filter((w) => w.status === 'completed');
      const totalDuration = completed.reduce(
        (sum, w) => sum + (w.durationSeconds || 0),
        0
      );
      const totalSets = completed.reduce(
        (sum, w) => sum + w.exercises.reduce((es, ex) => es + ex.sets.length, 0),
        0
      );
      const totalVolume = completed.reduce((sum, w) => {
        return (
          sum +
          w.exercises.reduce((es, ex) => {
            return (
              es +
              ex.sets.reduce((sv, s) => sv + (s.weightKg || 0) * (s.reps || 0), 0)
            );
          }, 0)
        );
      }, 0);

      setStats({
        totalWorkouts: completed.length,
        totalDurationMinutes: Math.round(totalDuration / 60),
        totalSets,
        totalVolumeKg: Math.round(totalVolume),
        currentStreak: 2,
        longestStreak: 5,
        weeklyAverage: 2.5,
        favoriteExercise: 'Bankdrücken',
      });

      setWeeklyGoal({
        id: 'wg-001',
        userId: 'user-1',
        weekStart: '2026-04-20',
        workoutGoal: 4,
        durationGoalMinutes: 240,
        completedWorkouts: 2,
        completedDurationMinutes: 125,
      });
    } catch (e) {
      setError('Statistiken konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, weeklyGoal, loading, error, refetch: fetchStats };
}
