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
  sm: { paddingVertical: 9, paddingHorizontal: 16, fontSize: 13, borderRadius: 10 },
  md: { paddingVertical: 13, paddingHorizontal: 20, fontSize: 15, borderRadius: 12 },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16, borderRadius: 14 },
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryBorder: {
    borderColor: Colors.borderSoft,
  },
  ghostBorder: {
    borderColor: Colors.borderSoft,
  },
  text: {
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.4,
  },
});
