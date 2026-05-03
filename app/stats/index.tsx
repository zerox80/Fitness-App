import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Dumbbell, Timer, Flame, Calendar, Target } from 'lucide-react-native';
import { useStats } from '@/hooks/useStats';
import { StatCard } from '@/components/cards/StatCard';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorBanner } from '@/components/feedback/ErrorBanner';
import { ProgressRing } from '@/components/ProgressRing';
import { FadeIn } from '@/components/FadeIn';
import { Colors } from '@/constants/Colors';

export default function StatsScreen() {
  const { stats, weeklyGoal, loading, error, refetch } = useStats();

  const goalProgress = weeklyGoal
    ? Math.min(1, weeklyGoal.completedWorkouts / weeklyGoal.workoutGoal)
    : 0;

  const durationProgress = weeklyGoal
    ? Math.min(1, weeklyGoal.completedDurationMinutes / weeklyGoal.durationGoalMinutes)
    : 0;

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
                <StatCard title="Workouts" value={stats.totalWorkouts} trend="up" color={Colors.primary} />
                <StatCard
                  title="Dauer"
                  value={`${stats.totalDurationMinutes} min`}
                  subtitle="insgesamt"
                  color={Colors.secondary}
                />
              </View>
            </FadeIn>
            <FadeIn delay={150}>
              <View style={styles.row}>
                <StatCard title="Sätze" value={stats.totalSets} color="#22c55e" />
                <StatCard
                  title="Volumen"
                  value={`${stats.totalVolumeKg} kg`}
                  subtitle="bewegt"
                  trend="up"
                  color="#f59e0b"
                />
              </View>
            </FadeIn>
            <FadeIn delay={200}>
              <View style={styles.row}>
                <StatCard title="Streak" value={`${stats.currentStreak} Tage`} trend="up" color={Colors.tertiary} />
                <StatCard
                  title="Ø/Woche"
                  value={stats.weeklyAverage}
                  subtitle="Workouts"
                  color="#06b6d4"
                />
              </View>
            </FadeIn>

            {weeklyGoal && (
              <FadeIn delay={300}>
                <View style={styles.goalSection}>
                  <LinearGradient
                    colors={['rgba(32,183,127,0.08)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.goalHeader}>
                    <View style={styles.goalIconBox}>
                      <Target size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>Wochenziel</Text>
                  </View>
                  <View style={styles.goalRow}>
                    <View style={styles.goalItem}>
                      <ProgressRing progress={goalProgress} radius={48} strokeWidth={10} color={Colors.primary} backgroundColor="rgba(32,183,127,0.12)" />
                      <Text style={styles.goalValue}>{weeklyGoal.completedWorkouts} / {weeklyGoal.workoutGoal}</Text>
                      <Text style={styles.goalLabel}>Workouts</Text>
                    </View>
                    <View style={styles.goalDivider} />
                    <View style={styles.goalItem}>
                      <ProgressRing progress={durationProgress} radius={48} strokeWidth={10} color={Colors.secondary} backgroundColor="rgba(34,199,188,0.12)" />
                      <Text style={styles.goalValue}>{weeklyGoal.completedDurationMinutes} / {weeklyGoal.durationGoalMinutes}</Text>
                      <Text style={styles.goalLabel}>Minuten</Text>
                    </View>
                  </View>
                </View>
              </FadeIn>
            )}

            {stats.favoriteExercise && (
              <FadeIn delay={400}>
                <View style={styles.favoriteSection}>
                  <LinearGradient
                    colors={['rgba(34,199,188,0.08)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.favoriteLabel}>Lieblingsübung</Text>
                  <Text style={styles.favoriteText}>{stats.favoriteExercise}</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 150,
  },
  header: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginTop: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  goalSection: {
    marginTop: 16,
    backgroundColor: Colors.glass,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  goalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  goalItem: {
    alignItems: 'center',
  },
  goalDivider: {
    width: 1,
    height: 80,
    backgroundColor: Colors.glassBorder,
  },
  goalValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
  },
  goalLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  favoriteSection: {
    marginTop: 16,
    backgroundColor: Colors.glass,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  favoriteLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  favoriteText: {
    color: Colors.secondary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
});
