import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { absoluteFill } from '@/utils/styles';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

const trendSymbols = {
  up: '↑',
  down: '↓',
  stable: '→',
};

const trendColors = {
  up: '#22c55e',
  down: Colors.tertiary,
  stable: Colors.textMuted,
};

export function StatCard({ title, value, subtitle, trend, color = Colors.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[`${color}08`, 'transparent']}
        style={absoluteFill}
      />
      <View style={[styles.accent, { backgroundColor: color }]} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {trend && (
          <Text style={[styles.trend, { color: trendColors[trend] }]}>
            {trendSymbols[trend]}
          </Text>
        )}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: 24,
    padding: 20,
    flex: 1,
    minWidth: 140,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  accent: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
    opacity: 0.7,
  },
  title: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  trend: {
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
