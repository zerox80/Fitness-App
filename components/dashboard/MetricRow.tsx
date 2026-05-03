import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import { styles } from './dashboard.styles';

export function MetricRow({
  icon: Icon,
  iconColor,
  iconFill,
  compact = false,
  label,
  softColor,
  unit,
  value,
}: {
  icon: typeof Flame;
  iconColor: string;
  iconFill?: string;
  compact?: boolean;
  label: string;
  softColor: string;
  unit: string;
  value: number | string;
}) {
  return (
    <View style={[styles.metricRow, compact && styles.compactMetricRow]}>
      <View style={[styles.metricIcon, compact && styles.compactMetricIcon, { backgroundColor: softColor }]}>
        <Icon size={compact ? 23 : 28} color={iconColor} fill={iconFill ?? 'transparent'} />
      </View>
      <View>
        <Text style={[styles.metricLabel, compact && styles.compactMetricLabel]}>{label}</Text>
        <Text style={[styles.metricValue, compact && styles.compactMetricValue]}>
          {value} <Text style={[styles.metricUnit, compact && styles.compactMetricUnit]}>{unit}</Text>
        </Text>
      </View>
    </View>
  );
}
