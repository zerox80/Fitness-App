import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Plus, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { DESKTOP_BREAKPOINT } from '@/constants/dashboard-constants';
import { FadeIn } from '@/components/FadeIn';
import { TaskCard } from '@/components/cards/TaskCard';
import { TaskForm } from '@/components/forms/TaskForm';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { useTasks } from '@/hooks/useTasks';

export default function TasksScreenWeb() {
  const { width } = useWindowDimensions();
  const isMobile = width < DESKTOP_BREAKPOINT;
  const router = useRouter();
  const params = useLocalSearchParams<{ create?: string }>();
  const { tasks, loading, refetch, createTask, deleteTask, toggleTask, incrementSet } = useTasks();
  const [formVisible, setFormVisible] = useState(false);

  const completedCount = tasks.filter((t) => t.completed_today).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

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
          <Text style={[styles.webTitle, isMobile && { fontSize: 24 }]}>Tägliche Tasks</Text>
          <Text style={styles.webSubtitle}>{completedCount} von {totalCount} heute erledigt</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setFormVisible(true)} activeOpacity={0.7}>
          <Plus size={22} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Task hinzufügen</Text>
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
            <LinearGradient
              colors={[Colors.primary, '#a8cc00']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.barFill, { width: `${Math.max(progress * 100, 2)}%` }]}
            />
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <LoadingSpinner message="Tasks laden..." />
        ) : tasks.length === 0 ? (
          <EmptyState icon="✅" title="Alles erledigt!" subtitle="Keine offenen Tasks für heute." />
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
  webHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  webTitle: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  webSubtitle: { fontSize: 16, color: Colors.textMuted, fontWeight: '500', marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  progressSection: { marginBottom: 40 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.glassBorder },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  progressValue: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  barBg: { height: 12, borderRadius: 6, backgroundColor: Colors.cardLight, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  listContainer: { paddingBottom: 100 },
  taskGrid: { gap: 16 },
});
