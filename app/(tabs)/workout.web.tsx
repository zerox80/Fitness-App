import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Play, Clock, Dumbbell, Zap, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { api, ApiWorkout } from '@/lib/api';

export default function WorkoutScreenWeb() {
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadWorkouts(); }, []);

  async function loadWorkouts() {
    try {
      setWorkouts(await api.workouts.list());
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.webHeader}>
        <View>
          <Text style={styles.webTitle}>Trainings-Bibliothek</Text>
          <Text style={styles.webSubtitle}>Wähle ein Training aus und starte deine Session.</Text>
        </View>
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.8}>
          <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startBtnText}>Schnellstart</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 100 }} />
      ) : (
        <View style={styles.workoutGrid}>
          {workouts.map((w, i) => (
            <FadeIn key={w.id} delay={i * 50} style={styles.gridItem}>
              <TouchableOpacity style={styles.webWorkoutCard} activeOpacity={0.85}>
                <View style={styles.cardImagePlaceholder}>
                  <Dumbbell size={48} color={Colors.glassBorder} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={[styles.badge, { backgroundColor: Colors.primaryGlow }]}>
                      <Text style={[styles.badgeText, { color: Colors.primary }]}>{w.category.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.intensity}>{w.intensity.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.workoutTitle}>{w.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Clock size={16} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{w.duration_minutes} Min</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Flame size={16} color={Colors.textMuted} />
                      <Text style={styles.metaText}>0 kcal</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </FadeIn>
          ))}
          
          {workouts.length === 0 && (
            <View style={styles.emptyState}>
              <Dumbbell size={60} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Noch keine Trainings</Text>
              <Text style={styles.emptySub}>Deine absolvierten Trainings erscheinen hier.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  webTitle: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  webSubtitle: { fontSize: 16, color: Colors.textMuted, fontWeight: '500', marginTop: 4 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  startBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  workoutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  gridItem: { width: 'calc(33.33% - 16px)' },
  webWorkoutCard: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder, height: '100%' },
  cardImagePlaceholder: { height: 180, backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: 24 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '900' },
  intensity: { fontSize: 11, fontWeight: '800', color: Colors.textMuted },
  workoutTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 16, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', marginTop: 80, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  emptySub: { fontSize: 16, color: Colors.textMuted, fontWeight: '500' },
});
