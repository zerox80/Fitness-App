import React from 'react';
import { View, Text } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { palette } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';

export function DateRow({ dateLabel, desktop = false }: { dateLabel: string; desktop?: boolean }) {
  return (
    <View style={styles.dateRow}>
      <CalendarDays size={desktop ? 15 : 16} color={palette.greenDark} />
      <Text style={[styles.dateText, desktop && styles.webDateText]}>{dateLabel}</Text>
    </View>
  );
}
