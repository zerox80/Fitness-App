import React from 'react';
import { View, Text } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { palette, weeklyProgress } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';
import { webStyles } from './dashboard-web.styles';

export function WeekCard({ desktop = false, compact = false }: { desktop?: boolean; compact?: boolean }) {
  return (
    <View style={[styles.smallCard, desktop && webStyles.webSmallCard]}>
      <View style={styles.weekHeader}>
        <Text style={styles.cardTitle}>Wochenfortschritt</Text>
        <View style={[styles.weekSelector, desktop && webStyles.webWeekSelector]}>
          <Text style={styles.weekSelectorText}>Diese Woche</Text>
          <ChevronDown size={13} color={palette.greenDark} />
        </View>
      </View>
      <Text style={[styles.weekValue, desktop && webStyles.webWeekValue, compact && { fontSize: 26, lineHeight: 30 }]}>
        0 <Text style={styles.weekUnit}>von 7</Text>
      </Text>
      <Text style={styles.cardMuted}>Diese Woche</Text>
      <View style={[styles.weekBars, compact && { marginTop: 14 }]}>
        {weeklyProgress.map((item, index) => (
          <View key={`${item.day}-${index}`} style={styles.weekBarItem}>
            <View style={styles.checkSpace}>{item.done && <Text style={styles.checkMark}>✓</Text>}</View>
            <View style={[styles.weekTrack, desktop && webStyles.webWeekTrack, compact && { height: 56, width: 10 }]}>
              <View
                style={[
                  styles.weekFill,
                  {
                    height: `${item.progress * 100}%`,
                    backgroundColor: item.muted ? '#E6EAEE' : palette.green,
                  },
                ]}
              />
            </View>
            <Text style={[styles.weekDay, compact && { fontSize: 11, marginTop: 6 }]}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
