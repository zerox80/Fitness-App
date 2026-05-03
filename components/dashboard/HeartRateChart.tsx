import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { palette } from '@/constants/dashboard-constants';
import { styles } from './dashboard.styles';

export function HeartRateChart({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.chartWrap, compact && styles.webChartWrap]}>
      <Svg width="100%" height="100%" viewBox="0 0 220 105">
        <Path
          d="M6 70 C18 52 31 82 44 65 C55 50 61 34 75 47 C88 60 91 82 106 72 C119 62 125 80 137 67 C148 54 155 62 166 44 C177 26 186 62 198 54 C207 47 213 61 218 55"
          fill="none"
          stroke={palette.red}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M6 70 C18 52 31 82 44 65 C55 50 61 34 75 47 C88 60 91 82 106 72 C119 62 125 80 137 67 C148 54 155 62 166 44 C177 26 186 62 198 54 C207 47 213 61 218 55 L218 105 L6 105 Z"
          fill="rgba(255,95,112,0.12)"
        />
        <Circle cx={166} cy={44} r={5} fill={palette.red} />
      </Svg>
      <View style={[styles.heartBadge, { left: '70%' }]}>
        <Text style={styles.heartBadgeText}>128</Text>
      </View>
      <View style={styles.chartAxis}>
        <Text style={styles.chartAxisText}>160</Text>
        <Text style={styles.chartAxisText}>120</Text>
        <Text style={styles.chartAxisText}>80</Text>
        <Text style={styles.chartAxisText}>40</Text>
      </View>
    </View>
  );
}
