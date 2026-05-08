import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Clock, Dumbbell, Eye, Flame, Play } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';
import { FadeIn } from '@/components/FadeIn';
import { QuickStartModal } from '@/components/modals/QuickStartModal';
import { GeneratedWorkoutModal, WorkoutModalData } from '@/components/modals/GeneratedWorkoutModal';
import { api, ApiWorkout, GeneratedWorkout } from '@/lib/api';

function formatIntensity(value: string) {
  const map: Record<string, string> = {
    low: 'Leicht',
    medium: 'Mittel',
    high: 'Intensiv',
  };
  return map[value.toLowerCase()] ?? value;
}

function formatCategory(value: string) {
  const map: Record<string, string> = {
    strength: 'Kraft',
    cardio: 'Cardio',
    hiit: 'HIIT',
    recovery: 'Regeneration',
  };
  return map[value] ?? value;
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

function WorkoutCard({ workout, onPress, loading }: { workout: ApiWorkout; onPress: () => void; loading?: boolean }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${workout.title} ansehen`}
      style={styles.workoutCard}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Dumbbell size={24} color={Colors.primary} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.category}>{formatCategory(workout.category)}</Text>
          <Text style={styles.intensity}>{formatIntensity(workout.intensity)}</Text>
        </View>
      </View>
      <Text style={styles.workoutTitle} numberOfLines={2}>{workout.title}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={16} color={Colors.textMuted} />
            <Text style={styles.metaText}>{workout.duration_minutes} Min</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={16} color={Colors.textMuted} />
            <Text style={styles.metaText}>0 kcal</Text>
          </View>
        </View>
        <View style={[styles.viewAction, loading && styles.viewActionLoading]}>
          <Eye size={16} color={Colors.primary} />
          <Text style={styles.viewActionText}>{loading ? 'Laden...' : 'Ansehen'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function WorkoutScreenWeb() {
  const { width } = useWindowDimensions();
  const isMobile = width < DESKTOP_BREAKPOINT;
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickStartVisible, setQuickStartVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [generatedFocus, setGeneratedFocus] = useState('');
  const [resultVisible, setResultVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<ApiWorkout | null>(null);
  const [openingWorkoutId, setOpeningWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    setLoading(true);
    try {
      setWorkouts(await api.workouts.list());
    } catch {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }

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
    <View>
      <View style={[styles.webHeader, isMobile && styles.mobileHeader]}>
        <View style={styles.headerCopy}>
          <Text style={[styles.webTitle, isMobile && { fontSize: 24 }]}>Trainings</Text>
          <Text style={styles.webSubtitle}>Plane und starte passende Einheiten.</Text>
        </View>
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85} onPress={() => setQuickStartVisible(true)}>
          <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startBtnText}>Schnellstart</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
      ) : workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Dumbbell size={42} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Noch keine Trainings</Text>
          <Text style={styles.emptySub}>Deine gespeicherten Einheiten erscheinen hier.</Text>
        </View>
      ) : (
        <View style={styles.workoutGrid}>
          {workouts.map((workout, index) => (
            <FadeIn key={workout.id} delay={index * 40} style={[styles.gridItem, isMobile && { width: '100%' }]}>
              <WorkoutCard
                workout={workout}
                onPress={() => handleOpenWorkout(workout.id)}
                loading={openingWorkoutId === workout.id}
              />
            </FadeIn>
          ))}
        </View>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 28 },
  mobileHeader: { flexDirection: 'column', alignItems: 'flex-start', gap: 16 },
  headerCopy: { flex: 1, minWidth: 0 },
  webTitle: { fontSize: 30, fontWeight: '800', color: Colors.text, lineHeight: 36 },
  webSubtitle: { fontSize: 16, color: Colors.textMuted, fontWeight: '500', marginTop: 4 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  startBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  workoutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  gridItem: { minWidth: 300, flex: 1 },
  workoutCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: Colors.borderSoft, minHeight: 178 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  iconBox: { width: 46, height: 46, borderRadius: 12, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  cardMeta: { alignItems: 'flex-end' },
  category: { color: Colors.text, fontSize: 13, fontWeight: '800' },
  intensity: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  workoutTitle: { fontSize: 19, fontWeight: '800', color: Colors.text, lineHeight: 25, marginBottom: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', gap: 18, flexWrap: 'wrap', flex: 1, minWidth: 180 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  viewAction: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors.primaryGlow, borderWidth: 1, borderColor: Colors.borderSoft },
  viewActionLoading: { opacity: 0.72 },
  viewActionText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  emptySub: { fontSize: 15, color: Colors.textMuted, fontWeight: '500' },
});
