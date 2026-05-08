import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Dumbbell, Eye, Flame, HeartPulse, Play, Timer, Zap } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { QuickStartModal } from '@/components/modals/QuickStartModal';
import { GeneratedWorkoutModal, WorkoutModalData } from '@/components/modals/GeneratedWorkoutModal';
import { api, ApiWorkout, GeneratedWorkout } from '@/lib/api';

const CATEGORIES = [
  { label: 'Alle', value: undefined, icon: Zap, color: Colors.primary },
  { label: 'HIIT', value: 'hiit', icon: Flame, color: Colors.tertiary },
  { label: 'Kraft', value: 'strength', icon: Dumbbell, color: Colors.primary },
  { label: 'Cardio', value: 'cardio', icon: HeartPulse, color: Colors.secondary },
  { label: 'Regeneration', value: 'recovery', icon: Timer, color: Colors.textMuted },
];

function formatCategory(value: string) {
  const match = CATEGORIES.find((category) => category.value === value);
  return match?.label ?? value;
}

function formatIntensity(value: string) {
  const map: Record<string, string> = {
    low: 'Leicht',
    medium: 'Mittel',
    high: 'Intensiv',
  };
  return map[value.toLowerCase()] ?? value;
}

function toWorkoutModalData(workout: ApiWorkout): WorkoutModalData {
  return {
    title: workout.title,
    description: workout.description,
    exercises: workout.exercises ?? [],
    total_duration: workout.duration_minutes,
    intensity: formatIntensity(workout.intensity),
  };
}

function WorkoutDataCard({ workout, onPress, loading }: { workout: ApiWorkout; onPress: () => void; loading?: boolean }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${workout.title} ansehen`}
      style={styles.workoutCard}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.workoutIconBox}>
        <Dumbbell size={24} color={Colors.primary} />
      </View>
      <View style={styles.workoutBody}>
        <View style={styles.cardMetaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{formatCategory(workout.category)}</Text>
          </View>
          <Text style={styles.intensityText}>{formatIntensity(workout.intensity)}</Text>
        </View>
        <Text style={styles.workoutTitle} numberOfLines={2}>{workout.title}</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Clock size={15} color={Colors.textMuted} />
            <Text style={styles.metricText}>{workout.duration_minutes} Min</Text>
          </View>
          <View style={styles.metricItem}>
            <Flame size={15} color={Colors.textMuted} />
            <Text style={styles.metricText}>0 kcal</Text>
          </View>
        </View>
      </View>
      <View style={[styles.cardAction, loading && styles.cardActionLoading]}>
        <Eye size={17} color={Colors.primary} />
        <Text style={styles.cardActionText} numberOfLines={1}>{loading ? 'Laden...' : 'Ansehen'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function WorkoutScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 650;
  const isCompact = width < 380;
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [quickStartVisible, setQuickStartVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [generatedFocus, setGeneratedFocus] = useState('');
  const [resultVisible, setResultVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<ApiWorkout | null>(null);
  const [openingWorkoutId, setOpeningWorkoutId] = useState<string | null>(null);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const category = CATEGORIES[activeCategory]?.value;
      setWorkouts(await api.workouts.list(category ? { category } : undefined));
    } catch {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleGenerate = async (duration: number, focus: string, intensity: string) => {
    setGenerating(true);
    try {
      const res = await api.workouts.generate({ duration_minutes: duration, focus, intensity });
      setGeneratedWorkout(res);
      setGeneratedFocus(focus);
      setQuickStartVisible(false);
      setResultVisible(true);
    } catch (err) {
      alert('Fehler bei der Planung: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenWorkout = async (workoutId: string) => {
    setOpeningWorkoutId(workoutId);
    try {
      setSelectedWorkout(await api.workouts.get(workoutId));
    } catch (err) {
      alert('Trainingsplan konnte nicht geladen werden: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setOpeningWorkoutId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isWide && styles.scrollWide]} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Trainings</Text>
              <Text style={styles.subtitle}>Plane und starte passende Einheiten.</Text>
            </View>
            <TouchableOpacity style={styles.quickBtn} activeOpacity={0.85} onPress={() => setQuickStartVisible(true)}>
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
              {!isCompact && <Text style={styles.quickBtnText}>Schnellstart</Text>}
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            <View style={styles.catRow}>
              {CATEGORIES.map((cat, index) => {
                const active = index === activeCategory;
                const Icon = cat.icon;
                return (
                  <TouchableOpacity key={cat.label} style={[styles.chip, active && styles.chipActive]} activeOpacity={0.8} onPress={() => setActiveCategory(index)}>
                    <Icon size={15} color={active ? '#FFFFFF' : cat.color} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </FadeIn>

        <FadeIn delay={140}>
          <Text style={styles.sectionTitle}>Vorgeschlagen</Text>
        </FadeIn>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
        ) : workouts.length === 0 ? (
          <FadeIn delay={160}>
            <View style={styles.emptyBox}>
              <Dumbbell size={34} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Noch keine Trainings</Text>
              <Text style={styles.emptySub}>Starte mit einem Schnellstart und speichere deinen Vorschlag.</Text>
            </View>
          </FadeIn>
        ) : (
          workouts.map((workout, index) => (
            <FadeIn key={workout.id} delay={160 + index * 50}>
              <WorkoutDataCard
                workout={workout}
                onPress={() => handleOpenWorkout(workout.id)}
                loading={openingWorkoutId === workout.id}
              />
            </FadeIn>
          ))
        )}
      </ScrollView>

      <QuickStartModal visible={quickStartVisible} onClose={() => setQuickStartVisible(false)} onGenerate={handleGenerate} loading={generating} />

      <GeneratedWorkoutModal
        visible={resultVisible}
        onClose={() => setResultVisible(false)}
        workout={generatedWorkout}
        onStart={async () => {
          setResultVisible(false);
          if (generatedWorkout) {
            try {
              await api.workouts.create({
                title: generatedWorkout.title,
                description: generatedWorkout.description,
                duration_minutes: generatedWorkout.total_duration,
                intensity: generatedWorkout.intensity.toLowerCase(),
                category: generatedFocus.toLowerCase().replace(/\s+/g, '_'),
                exercises: generatedWorkout.exercises,
              });
              await loadWorkouts();
            } catch (err) {
              alert('Fehler beim Speichern: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
            }
          }
        }}
      />

      <GeneratedWorkoutModal
        visible={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        workout={selectedWorkout ? toWorkoutModalData(selectedWorkout) : null}
        overline="Gespeichertes Training"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  scrollWide: {
    maxWidth: 1040,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 12,
    marginBottom: 22,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text, lineHeight: 36 },
  subtitle: { fontSize: 15, color: Colors.textMuted, fontWeight: '500', marginTop: 4, lineHeight: 21 },
  quickBtn: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  quickBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  catScroll: { marginBottom: 22 },
  catRow: { flexDirection: 'row', gap: 8, paddingRight: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  chipTextActive: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  workoutCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  workoutBody: { flex: 1, minWidth: 0 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  metaPill: { backgroundColor: Colors.cardLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  metaPillText: { color: Colors.textMuted, fontSize: 11, fontWeight: '700' },
  intensityText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  workoutTitle: { color: Colors.text, fontSize: 17, fontWeight: '800', lineHeight: 22, marginBottom: 8 },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metricText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  cardAction: {
    minWidth: 92,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primaryGlow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  cardActionLoading: {
    opacity: 0.72,
  },
  cardActionText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 54,
    paddingHorizontal: 20,
  },
  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptySub: { color: Colors.textMuted, fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
});
