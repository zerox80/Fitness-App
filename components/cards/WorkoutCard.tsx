import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Workout } from '@/types';
import { formatDate, formatDuration } from '@/utils/date';
import { calculateVolume } from '@/utils/numbers';
import { absoluteFill } from '@/utils/styles';

interface WorkoutCardProps {
  workout: Workout;
  onPress?: (workout: Workout) => void;
}

export function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
  const totalVolume = workout.exercises.reduce((sum, ex) => {
    return sum + calculateVolume(ex.sets);
  }, 0);

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  const statusColor =
    workout.status === 'completed'
      ? Colors.primary
      : workout.status === 'in_progress'
      ? '#f59e0b'
      : workout.status === 'cancelled'
      ? Colors.tertiary
      : Colors.textMuted;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(workout)} activeOpacity={0.85}>
      <LinearGradient
        colors={[`${statusColor}06`, 'transparent']}
        style={absoluteFill}
      />
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.title} numberOfLines={1}>
          {workout.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{workout.status === 'completed' ? 'Done' : workout.status === 'in_progress' ? 'Active' : workout.type.toUpperCase()}</Text>
        </View>
      </View>
      {workout.description && (
        <Text style={styles.description} numberOfLines={2}>
          {workout.description}
        </Text>
      )}
      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Text style={styles.metaValue}>{workout.scheduledAt ? formatDate(workout.scheduledAt) : '—'}</Text>
        </View>
        {workout.durationSeconds && (
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{formatDuration(workout.durationSeconds)}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Text style={styles.metaValue}>{totalSets}</Text>
          <Text style={styles.metaLabel}>Sets</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaValue}>{totalVolume.toFixed(0)}</Text>
          <Text style={styles.metaLabel}>kg Vol</Text>
        </View>
      </View>
      {workout.tags.length > 0 && (
        <View style={styles.tags}>
          {workout.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '900',
    flex: 1,
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  description: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
});
