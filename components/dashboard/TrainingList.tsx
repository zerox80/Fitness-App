import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Activity, ChevronRight, Dumbbell, Flame, HeartPulse, Timer } from 'lucide-react-native';
import { palette } from '@/constants/dashboard-constants';
import { api, ApiWorkout } from '@/lib/api';
import { styles } from './dashboard.styles';
import { webStyles } from './dashboard-web.styles';

const MAX_TRAININGS = 4;

const CATEGORY_PRESENTATION: Record<
  string,
  { label: string; icon: typeof Activity; color: string }
> = {
  strength: { label: 'Kraft', icon: Dumbbell, color: palette.green },
  cardio: { label: 'Cardio', icon: HeartPulse, color: palette.teal },
  hiit: { label: 'HIIT', icon: Flame, color: palette.red },
  recovery: { label: 'Regeneration', icon: Timer, color: palette.muted },
};

function categoryPresentation(category: string) {
  return (
    CATEGORY_PRESENTATION[category] ?? {
      label: 'Training',
      icon: Activity,
      color: palette.green,
    }
  );
}

function intensityLabel(value: string) {
  const map: Record<string, string> = {
    low: 'Leicht',
    medium: 'Mittel',
    high: 'Intensiv',
  };
  return map[value.toLowerCase()] ?? value;
}

export function TrainingList({ desktop = false }: { desktop?: boolean }) {
  const { width } = useWindowDimensions();
  const viewportWidth = Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : width;
  const isNarrow = viewportWidth <= 430;
  const [workouts, setWorkouts] = useState<ApiWorkout[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api.workouts.list({ per_page: MAX_TRAININGS });
        if (!cancelled) {
          setWorkouts(data.slice(0, MAX_TRAININGS));
        }
      } catch {
        if (!cancelled) {
          setWorkouts([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <View style={[styles.trainingsHeader, desktop && webStyles.webTrainingsHeader]}>
        <Text style={desktop ? webStyles.webCardTitle : styles.sectionTitle}>Trainings</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.showAll}>Alle anzeigen</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.trainingCard, desktop && webStyles.webTrainingCard, isNarrow && { paddingHorizontal: 14 }]}>
        {workouts === null ? (
          <Text style={styles.trainingMeta}>Trainings werden geladen...</Text>
        ) : workouts.length === 0 ? (
          <Text style={styles.trainingMeta}>
            Noch keine Trainings gespeichert. Starte mit einem Schnellstart.
          </Text>
        ) : (
          workouts.map((workout, index) => {
            const presentation = categoryPresentation(workout.category);
            const Icon = presentation.icon;
            return (
              <TouchableOpacity
                key={workout.id}
                style={[
                  styles.trainingRow,
                  desktop && webStyles.webTrainingRow,
                  index === workouts.length - 1 && styles.trainingRowLast,
                  isNarrow && styles.compactTrainingRow
                ]}
                activeOpacity={0.75}
              >
                <View style={[
                  styles.trainingIcon,
                  { backgroundColor: presentation.color },
                  isNarrow && styles.compactTrainingIcon
                ]}>
                  <Icon size={isNarrow ? 22 : 24} color="#FFFFFF" strokeWidth={2.3} />
                </View>
                <View style={[styles.trainingContent, desktop && webStyles.webTrainingContent]}>
                  <Text
                    style={[styles.trainingTitle, isNarrow && styles.compactTrainingTitle]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {workout.title}
                  </Text>
                  <Text
                    style={[styles.trainingMeta, isNarrow && styles.compactTrainingMeta]}
                    numberOfLines={isNarrow ? 2 : 1}
                    ellipsizeMode="tail"
                  >
                    {presentation.label} · {intensityLabel(workout.intensity)}
                  </Text>
                </View>
                <View style={[styles.kcalBlock, desktop && webStyles.webKcalBlock]}>
                  <Text style={[styles.kcalValue, isNarrow && { fontSize: 16 }]}>{workout.duration_minutes}</Text>
                  <Text style={styles.kcalUnit}>Min</Text>
                </View>
                {!isNarrow && <ChevronRight size={22} color={palette.softMuted} />}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </>
  );
}
