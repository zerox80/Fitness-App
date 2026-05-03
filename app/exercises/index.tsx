import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { useExercises } from '@/hooks/useExercises';
import { useDebounce } from '@/hooks/useDebounce';
import { ExerciseCard } from '@/components/cards/ExerciseCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorBanner } from '@/components/feedback/ErrorBanner';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { FadeIn } from '@/components/FadeIn';
import { Exercise, MuscleGroup } from '@/types';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const muscleGroupOptions: { label: string; value: MuscleGroup | 'all' }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Brust', value: 'chest' },
  { label: 'Rücken', value: 'back' },
  { label: 'Beine', value: 'legs' },
  { label: 'Schultern', value: 'shoulders' },
  { label: 'Arme', value: 'biceps' },
];

export default function ExercisesScreen() {
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  const { exercises, loading, error, refetch } = useExercises({
    muscleGroup: muscleGroup === 'all' ? undefined : muscleGroup,
    search: debouncedSearch || undefined,
  });

  const handlePress = (exercise: Exercise) => {
    console.log('Selected exercise:', exercise.name);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FadeIn delay={200 + index * 50}>
            <ExerciseCard exercise={item} onPress={handlePress} />
          </FadeIn>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <FadeIn delay={0}>
              <Text style={styles.header}>Übungen</Text>
            </FadeIn>
            <FadeIn delay={80}>
              <View style={styles.searchWrap}>
                <Search size={18} color={Colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Übung suchen..."
                  placeholderTextColor={Colors.textMuted}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                    <X size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </FadeIn>
            <FadeIn delay={140}>
              <View style={styles.filterContainer}>
                <SegmentedControl
                  options={muscleGroupOptions}
                  value={muscleGroup}
                  onChange={setMuscleGroup}
                />
              </View>
            </FadeIn>
            {error && <ErrorBanner message={error} onRetry={refetch} />}
            {loading && <LoadingSpinner message="Übungen werden geladen..." />}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <FadeIn delay={200}>
              <EmptyState
                icon="🔍"
                title="Keine Übungen gefunden"
                subtitle="Versuche eine andere Suche oder Kategorie."
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
  header: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginTop: 12,
    marginBottom: 24,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 20,
  },
});
