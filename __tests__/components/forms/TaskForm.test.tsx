// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#fff',
    borderSoft: '#e9eef1',
    card: '#fff',
    primary: '#178864',
    secondary: '#1f9e9a',
    tertiary: '#d84d5a',
    text: '#17212b',
    textMuted: '#6f7782',
  },
}));

vi.mock('lucide-react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  const Icon = () => ReactActual.createElement('span', { 'aria-hidden': true });

  return {
    X: Icon,
  };
});

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const {
      accessibilityRole,
      activeOpacity,
      animationType,
      behavior,
      borderColor,
      keyboardType,
      placeholderTextColor,
      presentationStyle,
      showsVerticalScrollIndicator,
      style,
      ...rest
    } = props;
    return rest;
  }

  const TextInput = ReactActual.forwardRef<HTMLInputElement, Record<string, unknown>>(
    ({ onChangeText, placeholder, value, ...props }, ref) =>
      ReactActual.createElement('input', {
        ...cleanProps(props),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          typeof onChangeText === 'function' ? onChangeText(event.target.value) : undefined,
        placeholder,
        ref,
        value,
      })
  );

  return {
    ActivityIndicator: () => ReactActual.createElement('span', { 'aria-label': 'loading' }),
    KeyboardAvoidingView: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    Modal: ({ children, visible, ...props }: any) =>
      visible ? ReactActual.createElement('div', cleanProps(props), children) : null,
    Platform: { OS: 'web' },
    ScrollView: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    StyleSheet: { create: (styles: unknown) => styles },
    Switch: ({ value, onValueChange }: any) =>
      ReactActual.createElement('input', {
        checked: value,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => onValueChange?.(event.target.checked),
        type: 'checkbox',
      }),
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TextInput,
    TouchableOpacity: ({ accessibilityLabel, children, disabled, onPress, ...props }: any) =>
      ReactActual.createElement(
        'button',
        {
          ...cleanProps(props),
          'aria-label': accessibilityLabel,
          disabled,
          onClick: onPress,
          type: 'button',
        },
        children
      ),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

import { TaskForm } from '@/components/forms/TaskForm';

describe('TaskForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('blocks custom recurrence submission when no weekday is selected', () => {
    const onSubmit = vi.fn();

    render(<TaskForm visible onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Mobility' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Benutzerdefiniert' }));

    const submitButton = screen.getByRole('button', { name: 'Aufgabe erstellen' });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Bitte wähle mindestens einen Wochentag aus.')).toBeTruthy();

    fireEvent.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits custom recurrence once a weekday is selected', async () => {
    const onSubmit = vi.fn();

    render(<TaskForm visible onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Mobility' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Benutzerdefiniert' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mi' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        category: 'general',
        custom_days: [2],
        description: undefined,
        recurrence: 'custom',
        target_sets: 1,
        title: 'Mobility',
      });
    });
  });
});
