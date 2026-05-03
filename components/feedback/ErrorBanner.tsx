import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <AlertTriangle size={20} color={Colors.tertiary} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton} activeOpacity={0.8}>
          <Text style={styles.retryText}>Erneut versuchen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${Colors.tertiary}10`,
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.tertiary}20`,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: `${Colors.tertiary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  message: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
