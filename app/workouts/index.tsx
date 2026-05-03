import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Dumbbell } from 'lucide-react-native';
import { useWorkouts } from '@/hooks/useWorkouts';
import { WorkoutCard } from '@/components/cards/WorkoutCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorBanner } from '@/components/feedback/ErrorBanner';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { FadeIn } from '@/components/FadeIn';
import { Workout, WorkoutStatus } from '@/types';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const filterOptions: { label: string; value: WorkoutStatus | 'all' }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Geplant', value: 'planned' },
  { label: 'Abgeschlossen', value: 'completed' },
];

export default function WorkoutsScreen() {
  const [filter, setFilter] = useState<WorkoutStatus | 'all'>('all');
  const { workouts, loading, error, refetch } = useWorkouts({
    status: filter === 'all' ? undefined : filter,
  });
  const router = useRouter();

  const handlePress = (workout: Workout) => {
    console.log('Workout selected:', workout.title);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FadeIn delay={150 + index * 60}>
            <WorkoutCard workout={item} onPress={handlePress} />
          </FadeIn>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <FadeIn delay={0}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.overline}>DEINE TRAININGS</Text>
                  <Text style={styles.header}>Workouts</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => console.log('Create workout')}>
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </FadeIn>
            <FadeIn delay={80}>
              <View style={styles.filterContainer}>
                <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />
              </View>
            </FadeIn>
            {error && <ErrorBanner message={error} onRetry={refetch} />}
            {loading && <LoadingSpinner message="Workouts werden geladen..." />}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <FadeIn delay={200}>
              <EmptyState
                icon="📋"
                title="Keine Workouts gefunden"
                subtitle="Erstelle dein erstes Workout, um loszulegen."
              />
            </FadeIn>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 150,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 28,
  },
  overline: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  header: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  filterContainer: {
    marginBottom: 20,
  },
});
