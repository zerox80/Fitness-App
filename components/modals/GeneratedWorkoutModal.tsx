import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Clock, Zap, Play, List } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GeneratedWorkout } from '@/lib/api';

interface GeneratedWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  workout: GeneratedWorkout | null;
  onStart: () => void;
}

export function GeneratedWorkoutModal({ visible, onClose, workout, onStart }: GeneratedWorkoutModalProps) {
  if (!workout) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.overline}>AI GENERIERT</Text>
              <Text style={styles.title}>{workout.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{workout.total_duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Zap size={16} color={Colors.tertiary} />
              <Text style={styles.metaText}>{workout.intensity}</Text>
            </View>
          </View>

          <Text style={styles.description}>{workout.description}</Text>

          <View style={styles.listHeader}>
            <List size={18} color={Colors.text} />
            <Text style={styles.listTitle}>Übungen</Text>
          </View>

          <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
            {workout.exercises.map((ex, idx) => (
              <View key={idx} style={styles.exerciseCard}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseSub}>
                    {ex.sets} Sätze × {ex.reps}
                  </Text>
                </View>
                <View style={styles.restBadge}>
                  <Text style={styles.restText}>{ex.rest_seconds}s Pause</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.startBtn} onPress={onStart}>
            <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startBtnText}>Training starten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '85%',
    width: '100%',
    maxWidth: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  overline: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
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
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  exerciseList: {
    flex: 1,
    marginBottom: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  exerciseSub: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  restBadge: {
    backgroundColor: 'rgba(32,183,127,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  startBtn: {
    backgroundColor: Colors.primary,
    height: 64,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
