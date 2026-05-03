import React, { useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet, View, Text, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { FadeIn } from '@/components/FadeIn';
import { TaskCard } from '@/components/cards/TaskCard';
import { TaskForm } from '@/components/forms/TaskForm';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { useTasks } from '@/hooks/useTasks';

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ create?: string }>();
  const { tasks, loading, refetch, createTask, deleteTask, toggleTask, incrementSet } = useTasks();
  const [formVisible, setFormVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const completedCount = tasks.filter((t) => t.completed_today).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

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
              <Text style={styles.title}>Tägliche Tasks</Text>
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
            <LinearGradient
              colors={['rgba(32,183,127,0.08)', 'rgba(34,199,188,0.05)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
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
              <LinearGradient
                colors={[Colors.primary, '#a8cc00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${Math.max(progress * 100, 2)}%` }]}
              />
            </View>
          </View>
        </FadeIn>

        {/* Task List */}
        <FadeIn delay={160}>
          <View style={styles.listSection}>
            {loading ? (
              <LoadingSpinner message="Tasks laden..." />
            ) : tasks.length === 0 ? (
              <EmptyState
                icon="✅"
                title="Keine Tasks vorhanden"
                subtitle="Erstelle deinen ersten Task um loszulegen!"
              />
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
    paddingHorizontal: 24,
    paddingBottom: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
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
    fontWeight: '700',
    color: Colors.text,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '900',
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
  },
  listSection: {
    gap: 0,
  },
});
