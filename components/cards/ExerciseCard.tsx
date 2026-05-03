import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Exercise } from '@/types';
import { absoluteFill } from '@/utils/styles';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: (exercise: Exercise) => void;
}

const difficultyColors: Record<string, string> = {
  beginner: Colors.primary,
  intermediate: '#f59e0b',
  advanced: Colors.tertiary,
};

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const diffColor = difficultyColors[exercise.difficulty] || Colors.textMuted;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(exercise)} activeOpacity={0.85}>
      <LinearGradient
        colors={[`${diffColor}05`, 'transparent']}
        style={absoluteFill}
      />
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${diffColor}18` }]}>
          <Text style={[styles.badgeText, { color: diffColor }]}>
            {exercise.difficulty === 'beginner' ? 'Anfänger' : exercise.difficulty === 'intermediate' ? 'Mittel' : 'Fortgeschritten'}
          </Text>
        </View>
      </View>
      {exercise.description && (
        <Text style={styles.description} numberOfLines={2}>
          {exercise.description}
        </Text>
      )}
      <View style={styles.muscles}>
        {exercise.muscleGroups.map((m) => (
          <View key={m} style={styles.muscleTag}>
            <Text style={styles.muscleText}>{translateMuscle(m)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.equipment}>
        <Text style={styles.equipmentLabel}>Equipment:</Text>
        <Text style={styles.equipmentText}>
          {exercise.equipment.map(translateEquipment).join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function translateMuscle(m: string): string {
  const map: Record<string, string> = {
    chest: 'Brust',
    back: 'Rücken',
    shoulders: 'Schultern',
    biceps: 'Bizeps',
    triceps: 'Trizeps',
    abs: 'Bauch',
    legs: 'Beine',
    glutes: 'Gesäß',
    calves: 'Waden',
    forearms: 'Unterarme',
    traps: 'Nacken',
    lats: 'Latissimus',
    hamstrings: 'Oberschenkel hinten',
    quadriceps: 'Oberschenkel vorne',
  };
  return map[m] || m;
}

function translateEquipment(e: string): string {
  const map: Record<string, string> = {
    barbell: 'Langhantel',
    dumbbell: 'Kurzhantel',
    kettlebell: 'Kettlebell',
    machine: 'Maschine',
    cable: 'Kabelzug',
    bodyweight: 'Eigengewicht',
    resistance_band: 'Theraband',
    medicine_ball: 'Medizinball',
    none: 'Keins',
  };
  return map[e] || e;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 18,
    marginBottom: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }
    })
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  description: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '500',
    lineHeight: 18,
  },
  muscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  muscleTag: {
    backgroundColor: Colors.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  muscleText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  equipment: {
    flexDirection: 'row',
    gap: 4,
  },
  equipmentLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  equipmentText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
