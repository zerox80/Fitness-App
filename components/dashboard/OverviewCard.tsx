import React from 'react';
import { View, Text } from 'react-native';
import { Flame, Footprints, PersonStanding, Timer } from 'lucide-react-native';
import { DashboardData, palette, STEP_GOAL } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';
import { webStyles } from './dashboard-web.styles';
import { StepProgressRing } from './StepProgressRing';
import { MetricRow } from './MetricRow';
import { DateRow } from './DateRow';

function formatSteps(steps: number) {
  return Math.round(steps).toLocaleString('de-DE');
}

export function OverviewCard({ compact = false, data, desktop = false }: { compact?: boolean; data: DashboardData; desktop?: boolean }) {
  const ringSize = desktop ? 236 : compact ? 140 : 180;

  return (
    <View style={[styles.overviewCard, compact && styles.compactOverviewCard, desktop && webStyles.webOverviewCard]}>
      {desktop && (
        <View style={webStyles.webCardHeader}>
          <Text style={webStyles.webCardTitle}>Heute im Überblick</Text>
          <DateRow dateLabel={data.dateLabel} desktop />
        </View>
      )}

      <View style={[styles.overviewBody, compact && styles.compactOverviewBody, desktop && webStyles.webOverviewBody]}>
        <View style={[styles.stepRingArea, compact && styles.compactStepRingArea, desktop && webStyles.webStepRingArea]}>
          <StepProgressRing progress={data.stepProgress} size={ringSize} />
          <View style={styles.stepRingContent}>
            <Footprints size={desktop ? 35 : compact ? 27 : 34} color={palette.teal} strokeWidth={2.4} />
            <Text style={[styles.stepsValue, compact && styles.compactStepsValue, desktop && webStyles.webStepsValue]}>{formatSteps(data.steps)}</Text>
            <Text style={[styles.stepsGoal, compact && styles.compactStepsGoal, desktop && webStyles.webStepsGoal]}>/ {formatSteps(STEP_GOAL)} Schritte</Text>
            <Text style={styles.stepsPercent}>{Math.round(data.stepProgress * 100)}%</Text>
          </View>
        </View>

        <View style={[styles.metricsColumn, compact && styles.compactMetricsColumn, desktop && webStyles.webMetricsColumn]}>
          <MetricRow compact={compact} icon={Flame} iconColor="#65BE20" iconFill="#65BE20" label="Kalorien" value={Math.round(data.calories)} unit="kcal" softColor={palette.greenSoft} />
          <MetricRow compact={compact} icon={Timer} iconColor={palette.teal} label="Aktive Minuten" value={Math.round(data.activeMinutes)} unit="min" softColor={palette.tealSoft} />
          <MetricRow compact={compact} icon={PersonStanding} iconColor="#75BE25" label="Strecke" value={data.distance} unit="km" softColor={palette.greenSoft} />
        </View>
      </View>
    </View>
  );
}
