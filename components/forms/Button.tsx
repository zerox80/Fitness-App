import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary: { backgroundColor: Colors.primary, color: '#FFFFFF' },
  secondary: { backgroundColor: Colors.card, color: Colors.text },
  danger: { backgroundColor: Colors.tertiary, color: '#FFFFFF' },
  ghost: { backgroundColor: 'transparent', color: Colors.textMuted },
};

const sizeStyles = {
  sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 13, borderRadius: 14 },
  md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, borderRadius: 16 },
  lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17, borderRadius: 18 },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: v.backgroundColor,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
        },
        variant === 'secondary' && styles.secondaryBorder,
        variant === 'ghost' && styles.ghostBorder,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.color} size="small" />
      ) : (
        <Text style={[styles.text, { color: v.color, fontSize: s.fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  ghostBorder: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.4,
  },
});
