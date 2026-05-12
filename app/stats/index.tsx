import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStats } from '@/hooks/useStats';
import { StatCard } from '@/components/cards/StatCard';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorBanner } from '@/components/feedback/ErrorBanner';
import { FadeIn } from '@/components/FadeIn';
import { Colors } from '@/constants/Colors';

export default function StatsScreen() {
  const { stats, weeklySummary, loading, error, refetch } = useStats();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <Text style={styles.header}>Statistiken</Text>
        </FadeIn>

        {error && <ErrorBanner message={error} onRetry={refetch} />}
        {loading || !stats ? (
          <LoadingSpinner message="Statistiken werden geladen..." />
        ) : (
          <>
            <FadeIn delay={100}>
              <View style={styles.row}>
                <StatCard title="Trainings" value={stats.total_workouts} color={Colors.primary} />
                <StatCard
                  title="Dauer"
                  value={`${stats.total_minutes} min`}
                  subtitle="insgesamt"
                  color={Colors.secondary}
                />
              </View>
            </FadeIn>
            <FadeIn delay={150}>
              <View style={styles.row}>
                <StatCard
                  title="Serie"
                  value={`${stats.current_streak} Tage`}
                  color={Colors.tertiary}
                />
              </View>
            </FadeIn>

            {weeklySummary && (
              <FadeIn delay={220}>
                <View style={styles.weekSection}>
                  <Text style={styles.sectionTitle}>Diese Woche</Text>
                  <View style={styles.row}>
                    <StatCard
                      title="Workouts"
                      value={weeklySummary.workout_count}
                      color={Colors.primary}
                    />
                    <StatCard
                      title="Aktive Min."
                      value={weeklySummary.total_active_minutes}
                      color={Colors.secondary}
                    />
                  </View>
                  <View style={styles.row}>
                    <StatCard
                      title="Kalorien"
                      value={`${weeklySummary.total_calories} kcal`}
                      color="#f59e0b"
                    />
                    <StatCard
                      title="Schritte"
                      value={weeklySummary.total_steps}
                      color="#06b6d4"
                    />
                  </View>
                </View>
              </FadeIn>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  header: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  weekSection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
});
