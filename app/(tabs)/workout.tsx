import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Clock, Dumbbell, Zap, Heart, Flame, Timer, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { api, ApiWorkout } from '@/lib/api';
import { absoluteFill } from '@/utils/styles';

const CATEGORIES = [
  { label: 'All', value: undefined, icon: Zap, color: Colors.primary },
  { label: 'HIIT', value: 'hiit', icon: Flame, color: Colors.tertiary },
  { label: 'Strength', value: 'strength', icon: Dumbbell, color: Colors.primary },
  { label: 'Cardio', value: 'cardio', icon: Heart, color: Colors.secondary },
  { label: 'Recovery', value: 'recovery', icon: Timer, color: Colors.textMuted },
];

import { QuickStartModal } from '@/components/modals/QuickStartModal';
import { GeneratedWorkoutModal } from '@/components/modals/GeneratedWorkoutModal';
import { GeneratedWorkout } from '@/lib/api';

export default function WorkoutScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 650;
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);

  const [quickStartVisible, setQuickStartVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [generatedFocus, setGeneratedFocus] = useState('');
  const [resultVisible, setResultVisible] = useState(false);

  useEffect(() => { loadWorkouts(); }, [activeCategory]);

  async function loadWorkouts() {
    try {
      const category = CATEGORIES[activeCategory]?.value;
      setWorkouts(await api.workouts.list(category ? { category } : undefined));
    } catch {}
    finally { setLoading(false); }
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
      alert('Fehler bei der Generierung: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
    } finally {
      setGenerating(false);
    }
  };

  const featured = workouts[0];
  const rest = workouts.slice(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isWide && { maxWidth: 1000 }]} showsVerticalScrollIndicator={false}>
        
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.overline}>YOUR PROGRAM</Text>
              <Text style={styles.title}>Workouts</Text>
            </View>
            <TouchableOpacity 
              style={styles.quickBtn} 
              activeOpacity={0.8}
              onPress={() => setQuickStartVisible(true)}
            >
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Categories */}
        <FadeIn delay={100}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            <View style={styles.catRow}>
              {CATEGORIES.map((cat, idx) => {
                const active = idx === activeCategory;
                const Icon = cat.icon;
                return (
                  <TouchableOpacity key={idx} style={[styles.chip, active && styles.chipActive]} activeOpacity={0.8} onPress={() => setActiveCategory(idx)}>
                    <Icon size={14} color={active ? '#FFFFFF' : cat.color} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </FadeIn>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <FadeIn delay={200}>
                <Text style={styles.sectionTitle}>Featured</Text>
                <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
                  <View style={[styles.featuredImage, { backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Dumbbell size={80} color={Colors.glassBorder} />
                  </View>
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.featuredGradient} />
                  <View style={styles.featuredContent}>
                    <View style={[styles.badge, { backgroundColor: Colors.tertiary }]}>
                      <Text style={styles.badgeText}>{featured.intensity.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{featured.title}</Text>
                    <View style={styles.featuredMeta}>
                      <Clock size={14} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{featured.duration_minutes} min</Text>
                      <View style={styles.dotSep} />
                      <Dumbbell size={14} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{featured.category}</Text>
                    </View>
                  </View>
                  <View style={styles.playBtn}>
                    <Play size={24} color={Colors.text} fill={Colors.text} />
                  </View>
                </TouchableOpacity>
              </FadeIn>
            )}

            {/* List */}
            <FadeIn delay={300}>
              <Text style={styles.sectionTitle}>Recommended</Text>
            </FadeIn>

            {rest.map((w, i) => (
              <FadeIn key={w.id} delay={350 + i * 70}>
                <TouchableOpacity style={styles.listCard} activeOpacity={0.85}>
                  <View style={[styles.listImage, { backgroundColor: Colors.cardLight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Zap size={40} color={Colors.glassBorder} />
                  </View>
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.listOverlay} />
                  <View style={styles.listContent}>
                    <View style={styles.listTop}>
                      <View style={[styles.badgeSm, { backgroundColor: w.completed_at ? Colors.primary : Colors.secondary }]}>
                        <Text style={styles.badgeSmText}>{w.completed_at ? 'COMPLETED' : w.intensity.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.listTitle}>{w.title}</Text>
                    <View style={styles.listMeta}>
                      <Clock size={13} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{w.duration_minutes} min</Text>
                      <View style={styles.dotSep} />
                      <Flame size={13} color={Colors.textMuted} />
                      <Text style={styles.metaText}>0 kcal</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </FadeIn>
            ))}

            {workouts.length === 0 && (
              <FadeIn delay={200}>
                <View style={styles.empty}>
                  <Dumbbell size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyTitle}>No workouts yet</Text>
                  <Text style={styles.emptySub}>Tap Quick Start to begin</Text>
                </View>
              </FadeIn>
            )}
          </>
        )}
      </ScrollView>

      <QuickStartModal
        visible={quickStartVisible}
        onClose={() => setQuickStartVisible(false)}
        onGenerate={handleGenerate}
        loading={generating}
      />

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
              });
              await loadWorkouts();
            } catch (err) {
              alert('Fehler beim Speichern: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'));
            }
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 150,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center'
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, marginBottom: 28 },
  overline: { fontSize: 12, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: 6 },
  title: { fontSize: 36, fontWeight: '900', color: Colors.text, letterSpacing: -1.2 },
  quickBtn: { width: 52, height: 52, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  catScroll: { marginBottom: 28 },
  catRow: { flexDirection: 'row', gap: 10, paddingRight: 24 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.glassBorder },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '800', color: Colors.textMuted },
  chipTextActive: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 16, letterSpacing: -0.5 },

  featuredCard: { height: 300, borderRadius: 28, overflow: 'hidden', marginBottom: 28, justifyContent: 'flex-end' },
  featuredImage: { ...absoluteFill },
  featuredGradient: { ...absoluteFill },
  featuredContent: { padding: 24 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 12 },
  badgeText: { fontSize: 11, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  featuredTitle: { fontSize: 30, fontWeight: '900', color: Colors.text, marginBottom: 10, letterSpacing: -0.8 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: Colors.textMuted, marginLeft: 6, fontSize: 13, fontWeight: '700' },
  dotSep: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textMuted, marginHorizontal: 10, opacity: 0.5 },
  playBtn: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },

  listCard: { height: 130, borderRadius: 24, overflow: 'hidden', marginBottom: 14, justifyContent: 'flex-end' },
  listImage: { ...absoluteFill },
  listOverlay: { ...absoluteFill },
  listContent: { padding: 20 },
  listTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeSmText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { color: Colors.text, fontSize: 12, fontWeight: '800' },
  listTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginBottom: 6, letterSpacing: -0.3 },
  listMeta: { flexDirection: 'row', alignItems: 'center' },

  empty: { alignItems: 'center', marginTop: 60, gap: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
});
