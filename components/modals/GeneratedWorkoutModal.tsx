import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { X, Clock, Zap, Play, List } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GeneratedExercise, GeneratedWorkout } from '@/lib/api';

export interface WorkoutModalData {
  title: string;
  description: string | null;
  exercises: GeneratedExercise[];
  total_duration: number;
  intensity: string;
}

interface GeneratedWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  workout: GeneratedWorkout | WorkoutModalData | null;
  onStart?: () => void | Promise<void>;
  overline?: string;
  primaryActionLabel?: string;
}

export function GeneratedWorkoutModal({
  visible,
  onClose,
  workout,
  onStart,
  overline = 'Trainingsvorschlag',
  primaryActionLabel = 'Training speichern',
}: GeneratedWorkoutModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

  if (!workout) return null;

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={onClose}>
      <View style={[styles.overlay, isDesktop ? styles.centerOverlay : styles.bottomOverlay]}>
        <View style={[styles.content, isDesktop ? styles.desktopContent : styles.sheetContent]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.overline}>{overline}</Text>
              <Text style={styles.title}>{workout.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{workout.total_duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Zap size={16} color={Colors.secondary} />
              <Text style={styles.metaText}>{workout.intensity}</Text>
            </View>
          </View>

          {!!workout.description && <Text style={styles.description}>{workout.description}</Text>}

          <View style={styles.listHeader}>
            <List size={18} color={Colors.text} />
            <Text style={styles.listTitle}>Uebungen</Text>
          </View>

          <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
            {workout.exercises.length === 0 ? (
              <View style={styles.emptyExercises}>
                <Text style={styles.emptyExercisesText}>Keine Uebungen gespeichert.</Text>
              </View>
            ) : (
              workout.exercises.map((exercise, index) => (
                <View key={`${exercise.name}-${index}`} style={styles.exerciseCard}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseSub}>
                      {exercise.sets} Saetze x {exercise.reps}
                    </Text>
                  </View>
                  <View style={styles.restBadge}>
                    <Text style={styles.restText}>{exercise.rest_seconds}s Pause</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {onStart && (
            <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
              <Play size={19} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startBtnText}>{primaryActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23,33,43,0.36)',
    padding: 18,
  },
  centerOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors.background,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  desktopContent: {
    maxWidth: 620,
    maxHeight: '86%',
    borderRadius: 16,
    padding: 24,
  },
  sheetContent: {
    height: '86%',
    maxWidth: 620,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  description: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 22,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  exerciseList: {
    flex: 1,
    marginBottom: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    gap: 12,
  },
  exerciseInfo: {
    flex: 1,
    minWidth: 0,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  exerciseSub: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  restBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  restText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyExercises: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  emptyExercisesText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
