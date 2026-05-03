import React, { useEffect, useMemo, useState } from 'react';
import { api, DailyActivity } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardData, STEP_GOAL } from '@/constants/dashboard-constants';
import { WebDashboard } from '@/components/dashboard/WebDashboard';

function formatGermanDate(date: Date) {
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function HomeScreenWeb() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setActivity(await api.activity.today());
    } catch {
      setActivity(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const name = user?.name?.split(' ')[0] || '';
  const steps = activity?.steps ?? 0;
  const calories = activity?.calories ?? 0;
  const activeMinutes = activity?.active_minutes ?? 0;
  const stepProgress = Math.min(steps / STEP_GOAL, 1);
  const distance = useMemo(() => Math.max(0, steps * 0.00072).toFixed(1).replace('.', ','), [steps]);

  const data: DashboardData = {
    activeMinutes,
    calories,
    dateLabel: formatGermanDate(new Date()),
    distance,
    name,
    refreshing,
    stepProgress,
    steps,
    onRefresh,
  };

  return <WebDashboard data={data} />;
}
