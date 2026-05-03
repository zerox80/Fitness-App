import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { palette, trainings } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';
import { webStyles } from './dashboard-web.styles';

export function TrainingList({ desktop = false }: { desktop?: boolean }) {
  const { width } = useWindowDimensions();
  const viewportWidth = Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : width;
  const isNarrow = viewportWidth < 380;

  return (
    <>
      <View style={[styles.trainingsHeader, desktop && webStyles.webTrainingsHeader]}>
        <Text style={desktop ? webStyles.webCardTitle : styles.sectionTitle}>Trainings</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.showAll}>Alle anzeigen</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.trainingCard, desktop && webStyles.webTrainingCard]}>
        {trainings.map((training, index) => {
          const Icon = training.icon;
          return (
            <TouchableOpacity
              key={training.title}
              style={[styles.trainingRow, desktop && webStyles.webTrainingRow, index === trainings.length - 1 && styles.trainingRowLast, isNarrow && { minHeight: 72, gap: 12 }]}
              activeOpacity={0.75}
            >
              <View style={[styles.trainingIcon, { backgroundColor: training.color }, isNarrow && { width: 40, height: 40, borderRadius: 20 }]}>
                <Icon size={isNarrow ? 20 : 24} color="#FFFFFF" strokeWidth={2.3} />
              </View>
              <View style={[styles.trainingContent, desktop && webStyles.webTrainingContent]}>
                <Text style={[styles.trainingTitle, isNarrow && { fontSize: 15 }]}>{training.title}</Text>
                <Text style={[styles.trainingMeta, isNarrow && { fontSize: 12 }]}>{training.meta}</Text>
              </View>
              <View style={[styles.kcalBlock, desktop && webStyles.webKcalBlock]}>
                <Text style={[styles.kcalValue, isNarrow && { fontSize: 15 }]}>{training.kcal}</Text>
                <Text style={styles.kcalUnit}>kcal</Text>
              </View>
              {!isNarrow && <ChevronRight size={22} color={palette.softMuted} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
