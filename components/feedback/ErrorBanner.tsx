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
    backgroundColor: Colors.tertiaryGlow,
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F0C9CD',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F4D6DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  message: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.tertiary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
