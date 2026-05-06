import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = '🏋️', title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : <Dumbbell size={28} color={Colors.textMuted} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: Colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
    lineHeight: 20,
  },
});
