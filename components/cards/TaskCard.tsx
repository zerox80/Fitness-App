import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Trash2, Dumbbell, Apple, Repeat, ListChecks } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { ApiTaskWithCompletion, ApiTaskCategory } from '@/lib/api';
import { TASK_CATEGORY_LABELS, TASK_RECURRENCE_LABELS } from '@/types';
import { isTaskFullyCompleted } from '@/utils/taskProgress';

const CATEGORY_ICONS: Record<ApiTaskCategory, typeof Dumbbell> = {
  workout: Dumbbell,
  nutrition: Apple,
  habit: Repeat,
  general: ListChecks,
};

const CATEGORY_COLORS: Record<ApiTaskCategory, string> = {
  workout: Colors.primary,
  nutrition: '#4CAF50',
  habit: Colors.secondary,
  general: Colors.textMuted,
};

interface TaskCardProps {
  task: ApiTaskWithCompletion;
  onToggle: (id: string) => void;
  onIncrementSet: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onIncrementSet, onDelete }: TaskCardProps) {
  const Icon = CATEGORY_ICONS[task.category];
  const accentColor = CATEGORY_COLORS[task.category];
  const isCompleted = isTaskFullyCompleted(task);

  const handlePress = () => {
    if (task.target_sets > 1) {
      onIncrementSet(task.id);
    } else {
      onToggle(task.id);
    }
  };

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <TouchableOpacity
        style={styles.checkboxTouch}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isCompleted && { backgroundColor: accentColor, borderColor: accentColor }]}>
          {isCompleted && task.target_sets <= 1 && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
          {task.target_sets > 1 && (
            <Text style={[styles.setCount, isCompleted && { color: '#FFFFFF' }]}>
              {task.completed_sets_today}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.iconBox}>
        <Icon size={18} color={accentColor} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: `${accentColor}20` }]}>
            <Text style={[styles.badgeText, { color: accentColor }]}>
              {TASK_CATEGORY_LABELS[task.category]}
            </Text>
          </View>
          <Text style={styles.recurrence}>
            {TASK_RECURRENCE_LABELS[task.recurrence]}
          </Text>
          {task.target_sets > 1 && (
            <Text style={[styles.setProgress, isCompleted && { color: accentColor }]}>
              • {task.completed_sets_today} / {task.target_sets} Sätze
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(task.id)}
        activeOpacity={0.7}
      >
        <Trash2 size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 12,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  checkboxTouch: {
    padding: 8,
    marginLeft: -8,
    marginRight: -8,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recurrence: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCount: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.text,
  },
  setProgress: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
});
