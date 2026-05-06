import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Plus, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';
import { FadeIn } from '@/components/FadeIn';
import { TaskCard } from '@/components/cards/TaskCard';
import { TaskForm } from '@/components/forms/TaskForm';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { useTasks } from '@/hooks/useTasks';
import { getCompletedTaskCount, getDailyTaskProgress } from '@/utils/taskProgress';

export default function TasksScreenWeb() {
  const { width } = useWindowDimensions();
  const isMobile = width < DESKTOP_BREAKPOINT;
  const router = useRouter();
  const params = useLocalSearchParams<{ create?: string }>();
  const { tasks, loading, createTask, deleteTask, toggleTask, incrementSet } = useTasks();
  const [formVisible, setFormVisible] = useState(false);

  const completedCount = getCompletedTaskCount(tasks);
  const totalCount = tasks.length;
  const progress = getDailyTaskProgress(tasks);

  useEffect(() => {
    if (params.create === '1') {
      setFormVisible(true);
      router.setParams({ create: '0' });
    }
  }, [params.create, router]);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.webHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
        <View>
          <Text style={[styles.webTitle, isMobile && { fontSize: 24 }]}>Tägliche Aufgaben</Text>
          <Text style={styles.webSubtitle}>{completedCount} von {totalCount} heute erledigt</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormVisible(true)} activeOpacity={0.7}>
          <Plus size={22} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Aufgabe hinzufügen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.row}>
              <CheckCircle2 size={20} color={Colors.primary} />
              <Text style={styles.progressLabel}>Dein Fortschritt heute</Text>
            </View>
            <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.max(progress * 100, 2)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <LoadingSpinner message="Aufgaben laden..." />
        ) : tasks.length === 0 ? (
          <EmptyState title="Alles erledigt" subtitle="Keine offenen Aufgaben für heute." />
        ) : (
          <View style={styles.taskGrid}>
            {tasks.map((task, i) => (
              <FadeIn key={task.id} delay={i * 50}>
                <TaskCard task={task} onToggle={toggleTask} onIncrementSet={incrementSet} onDelete={deleteTask} />
              </FadeIn>
            ))}
          </View>
        )}
      </View>

      <TaskForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={async (data) => {
          await createTask(data);
          setFormVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  webTitle: { fontSize: 30, fontWeight: '800', color: Colors.text },
  webSubtitle: { fontSize: 16, color: Colors.textMuted, fontWeight: '500', marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  progressSection: { marginBottom: 28 },
  progressCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: Colors.borderSoft },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressLabel: { fontSize: 16, fontWeight: '600', color: Colors.text },
  progressValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  barBg: { height: 12, borderRadius: 6, backgroundColor: Colors.cardLight, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6, backgroundColor: Colors.primary },
  listContainer: { paddingBottom: 100 },
  taskGrid: { gap: 10 },
});
