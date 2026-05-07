import React, { useCallback, useMemo, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { api, DailyActivity } from '@/lib/api';
import { readTodayHealthConnectActivity } from '@/lib/healthConnect';
import { useAuth } from '@/lib/auth-context';
import { DashboardData, DESKTOP_BREAKPOINT, STEP_GOAL } from '@/constants/dashboard-constants';
import { MobileHome } from '@/components/dashboard/MobileHome';
import { WebDashboard } from '@/components/dashboard/WebDashboard';
import { mergeHealthActivity } from '@/utils/activityMerge';
import { formatLocalDateKey } from '@/utils/date';

function formatGermanDate(date: Date) {
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const now = new Date();
      const activityDate = formatLocalDateKey(now);
      const serverActivity = await api.activity.today({ date: activityDate });
      const healthActivity = await readTodayHealthConnectActivity(now);

      if (!healthActivity) {
        setActivity(serverActivity);
        return;
      }

      const mergedActivity = mergeHealthActivity(serverActivity, healthActivity);

      if (
        mergedActivity.steps !== serverActivity.steps ||
        mergedActivity.calories !== serverActivity.calories
      ) {
        try {
          setActivity(await api.activity.update(mergedActivity, { date: activityDate }));
        } catch {
          setActivity(mergedActivity);
        }
        return;
      }

      setActivity(serverActivity);
    } catch {
      setActivity(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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

  if (Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT) {
    return <WebDashboard data={data} />;
  }

  return <MobileHome data={data} />;
}
