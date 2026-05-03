import React from 'react';
import { View, Text } from 'react-native';
import { Heart } from 'lucide-react-native';
import { palette } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';
import { webStyles } from './dashboard-web.styles';
import { HeartRateChart } from './HeartRateChart';

export function HeartCard({ desktop = false }: { desktop?: boolean }) {
  return (
    <View style={[styles.smallCard, desktop && webStyles.webSmallCard]}>
      <View style={styles.smallCardHeader}>
        <Text style={styles.cardTitle}>Herzfrequenz</Text>
        <View style={[styles.roundIcon, { backgroundColor: palette.redSoft }]}>
          <Heart size={18} color={palette.red} fill={palette.red} />
        </View>
      </View>
      <Text style={[styles.heartValue, desktop && webStyles.webHeartValue]}>
        0 <Text style={styles.heartUnit}>bpm</Text>
      </Text>
      <Text style={styles.cardMuted}>Keine Daten</Text>
      <HeartRateChart compact={desktop} />
      <View style={styles.timeLabels}>
        <Text style={styles.timeLabel}>00:00</Text>
        <Text style={styles.timeLabel}>12:00</Text>
        <Text style={styles.timeLabel}>24:00</Text>
      </View>
    </View>
  );
}
