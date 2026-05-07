import React, { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { api, DailyActivity } from '@/lib/api';
import { readTodayHealthConnectActivity } from '@/lib/healthConnect';
import { useAuth } from '@/lib/auth-context';
import { DashboardData, DESKTOP_BREAKPOINT, STEP_GOAL } from '@/constants/dashboard-constants';
import { MobileHome } from '@/components/dashboard/MobileHome';
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
  const { width } = useWindowDimensions();
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const serverActivity = await api.activity.today();
      const healthActivity = await readTodayHealthConnectActivity();

      if (!healthActivity) {
        setActivity(serverActivity);
        return;
      }

      const mergedActivity = {
        ...serverActivity,
        steps: healthActivity.steps ?? serverActivity.steps,
        calories: healthActivity.calories ?? serverActivity.calories,
      };

      if (
        mergedActivity.steps !== serverActivity.steps ||
        mergedActivity.calories !== serverActivity.calories
      ) {
        setActivity(await api.activity.update(mergedActivity));
        return;
      }

      setActivity(serverActivity);
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

  if (width < DESKTOP_BREAKPOINT) {
    return <MobileHome data={data} />;
  }

  return <WebDashboard data={data} />;
}
