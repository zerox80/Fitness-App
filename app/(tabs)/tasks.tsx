import React, { useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet, View, Text, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { TaskCard } from '@/components/cards/TaskCard';
import { TaskForm } from '@/components/forms/TaskForm';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { useTasks } from '@/hooks/useTasks';
import { getCompletedTaskCount, getDailyTaskProgress } from '@/utils/taskProgress';

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ create?: string }>();
  const { tasks, loading, refetch, createTask, deleteTask, toggleTask, incrementSet } = useTasks();
  const [formVisible, setFormVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const completedCount = getCompletedTaskCount(tasks);
  const totalCount = tasks.length;
  const progress = getDailyTaskProgress(tasks);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
  };

  useEffect(() => {
    if (params.create === '1') {
      setFormVisible(true);
      router.setParams({ create: '0' });
    }
  }, [params.create, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Tägliche Aufgaben</Text>
              <Text style={styles.subtitle}>
                {completedCount} von {totalCount} erledigt
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setFormVisible(true)}
              activeOpacity={0.7}
            >
              <Plus size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Progress Bar */}
        <FadeIn delay={80}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLeft}>
                <CheckCircle2 size={20} color={Colors.primary} />
                <Text style={styles.progressLabel}>Fortschritt heute</Text>
              </View>
              <Text style={styles.progressValue}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${Math.max(progress * 100, 2)}%` }]} />
            </View>
          </View>
        </FadeIn>

        {/* Task List */}
        <FadeIn delay={160}>
          <View style={styles.listSection}>
            {loading ? (
              <LoadingSpinner message="Aufgaben laden..." />
            ) : tasks.length === 0 ? (
              <EmptyState title="Keine Aufgaben vorhanden" subtitle="Erstelle deine erste Aufgabe, um loszulegen." />
            ) : (
              tasks.map((task, i) => (
                <FadeIn key={task.id} delay={200 + i * 60}>
                  <TaskCard
                    task={task}
                    onToggle={toggleTask}
                    onIncrementSet={incrementSet}
                    onDelete={handleDelete}
                  />
                </FadeIn>
              ))
            )}
          </View>
        </FadeIn>
      </ScrollView>

      <TaskForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={async (data) => {
          await createTask(data);
          setFormVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 4,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  barBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.cardLight,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  listSection: {
    gap: 0,
  },
});
