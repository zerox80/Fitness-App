import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

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
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    flex: 1,
    minWidth: 140,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
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
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: '800',
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
