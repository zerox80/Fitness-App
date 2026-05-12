import React from 'react';
import { View, Text } from 'react-native';
import { Activity, Flame } from 'lucide-react-native';
import { palette } from '@/constants/dashboard-constants';
import type { WeeklyActivitySummary } from '@/lib/api';
import { styles } from './dashboard.styles';
import { webStyles } from './dashboard-web.styles';

export function WeekCard({
  desktop = false,
  compact = false,
  summary,
}: {
  desktop?: boolean;
  compact?: boolean;
  summary?: WeeklyActivitySummary | null;
}) {
  const workoutCount = summary?.workout_count ?? 0;
  const activeMinutes = summary?.total_active_minutes ?? 0;
  const calories = summary?.total_calories ?? 0;

  return (
    <View style={[styles.smallCard, desktop && webStyles.webSmallCard]}>
      <View style={styles.weekHeader}>
        <Text style={styles.cardTitle}>Wochenfortschritt</Text>
        <Text style={styles.weekSelectorText}>Diese Woche</Text>
      </View>
      <Text style={[styles.weekValue, desktop && webStyles.webWeekValue, compact && { fontSize: 26, lineHeight: 30 }]}>
        {workoutCount} <Text style={styles.weekUnit}>Workouts</Text>
      </Text>
      <Text style={styles.cardMuted}>{summary?.week_start ?? 'Keine Wochenwerte'}</Text>
      <View style={[styles.weekBars, compact && { marginTop: 14 }]}>
        <View style={styles.weekBarItem}>
          <Activity size={18} color={palette.green} />
          <Text style={[styles.weekDay, compact && { fontSize: 11, marginTop: 6 }]}>
            {activeMinutes} Min.
          </Text>
        </View>
        <View style={styles.weekBarItem}>
          <Flame size={18} color={palette.red} />
          <Text style={[styles.weekDay, compact && { fontSize: 11, marginTop: 6 }]}>
            {calories} kcal
          </Text>
        </View>
      </View>
    </View>
  );
}
