import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Achievement } from '@/types';
import { absoluteFill } from '@/utils/styles';

interface AchievementCardProps {
  achievement: Achievement;
}

const categoryColors: Record<string, string> = {
  workouts: Colors.primary,
  streaks: '#f59e0b',
  volume: Colors.secondary,
  nutrition: '#22c55e',
  social: '#ec4899',
  special: Colors.tertiary,
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
  const isUnlocked = !!achievement.unlockedAt;
  const color = categoryColors[achievement.category] || Colors.textMuted;

  return (
    <View style={[styles.card, isUnlocked && styles.unlocked]}>
      <LinearGradient
        colors={isUnlocked ? [`${Colors.primary}08`, 'transparent'] : ['transparent', 'transparent']}
        style={absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{achievement.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{achievement.name}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.categoryText, { color }]}>{achievement.category}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={isUnlocked ? [Colors.primary, '#a8cc00'] : [color, color]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {achievement.progress} / {achievement.target}
        </Text>
      </View>
      {isUnlocked && (
        <Text style={styles.unlockedText}>Freigeschaltet!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    opacity: 0.7,
  },
  unlocked: {
    opacity: 1,
    borderColor: `${Colors.primary}30`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  description: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.cardLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'right',
  },
  unlockedText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
