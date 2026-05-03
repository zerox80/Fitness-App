import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helper?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helper, style, ...rest }, ref) => {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            error ? styles.inputError : null,
            style,
          ]}
          placeholderTextColor={Colors.textMuted}
          {...rest}
        />
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helper ? (
          <Text style={styles.helperText}>{helper}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    fontWeight: '600',
  },
  inputError: {
    borderColor: Colors.tertiary,
  },
  errorText: {
    color: Colors.tertiary,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '700',
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});
