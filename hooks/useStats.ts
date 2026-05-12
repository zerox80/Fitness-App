import { useState, useCallback, useEffect } from 'react';
import { api, UserStats, WeeklyActivitySummary } from '@/lib/api';

export function useStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextStats, nextWeeklySummary] = await Promise.all([
        api.stats.get(),
        api.stats.weekly(),
      ]);
      setStats(nextStats);
      setWeeklySummary(nextWeeklySummary);
    } catch {
      setError('Statistiken konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, weeklySummary, loading, error, refetch: fetchStats };
}
