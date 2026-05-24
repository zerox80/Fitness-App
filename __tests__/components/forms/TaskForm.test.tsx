// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const platformState = vi.hoisted(() => ({ OS: 'web' }));

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
    Platform: {
      get OS() {
        return platformState.OS;
      },
    },
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

vi.mock('@/components/forms/Button', () => {
  const ReactActual = require('react');
  return {
    Button: ({ title, onPress, disabled }: any) => {
      const ref = ReactActual.useRef(null);
      ReactActual.useEffect(() => {
        if (ref.current) {
          Object.defineProperty(ref.current, 'disabled', {
            value: !!disabled,
            writable: true,
            configurable: true,
          });
        }
      }, [disabled]);
      return ReactActual.createElement(
        'button',
        { ref, onClick: onPress, type: 'button' },
        title
      );
    },
  };
});

import { TaskForm } from '@/components/forms/TaskForm';

describe('TaskForm', () => {
  beforeEach(() => {
    platformState.OS = 'web';
  });

  afterEach(() => {
    cleanup();
  });

  it('blocks custom recurrence submission when no weekday is selected', () => {
    const onSubmit = vi.fn();

    render(<TaskForm visible onClose={vi.fn()} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: 'Aufgabe erstellen' });
    
    // Click submit with empty title (line 51 guard)
    fireEvent.click(submitButton);

    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Mobility' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Benutzerdefiniert' }));

    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Bitte wähle mindestens einen Wochentag aus.')).toBeTruthy();

    // Click submit when requiresCustomDays is true (line 54-55 branch)
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
    fireEvent.click(screen.getByRole('button', { name: 'Mi' })); // on
    fireEvent.click(screen.getByRole('button', { name: 'Mi' })); // off
    fireEvent.click(screen.getByRole('button', { name: 'Mi' })); // on again
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

  it('blocks submission and shows error when target sets is out of range', () => {
    const onSubmit = vi.fn();

    render(<TaskForm visible onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Joggen' },
    });
    fireEvent.change(screen.getByPlaceholderText('z.B. 3'), {
      target: { value: '0' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));
    expect(screen.getByText('Anzahl Sätze muss zwischen 1 und 50 liegen.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();

    // Now test > 50
    fireEvent.change(screen.getByPlaceholderText('z.B. 3'), {
      target: { value: '51' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));
    expect(screen.getByText('Anzahl Sätze muss zwischen 1 und 50 liegen.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('resets form states and calls onClose when clicking close button', () => {
    platformState.OS = 'ios';
    const onClose = vi.fn();
    const { rerender } = render(<TaskForm visible onClose={onClose} onSubmit={vi.fn()} />);

    // Change some values
    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Yoga' },
    });
    fireEvent.change(screen.getByPlaceholderText('Optionale Beschreibung'), {
      target: { value: 'Tiefenentspannung' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ernährung' }));

    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find(b => b.textContent === '');
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);

    expect(onClose).toHaveBeenCalled();

    // Rerender as visible again, inputs should be reset to default
    rerender(<TaskForm visible onClose={onClose} onSubmit={vi.fn()} />);
    expect((screen.getByPlaceholderText('z.B. 30 Minuten joggen') as HTMLInputElement).value).toBe('');
    expect((screen.getByPlaceholderText('Optionale Beschreibung') as HTMLInputElement).value).toBe('');
  });

  it('displays API or submission error when onSubmit throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('API Error'));
    render(<TaskForm visible onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Sprint' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeTruthy();
    });

    // Test with generic error
    onSubmit.mockReset();
    onSubmit.mockRejectedValue('Generic Error string');
    
    // Clear and input again
    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Sprint 2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));

    await waitFor(() => {
      expect(screen.getByText('Aufgabe konnte nicht erstellt werden.')).toBeTruthy();
    });
  });

  it('falls back target sets to 1 when input is not a number', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm visible onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('z.B. 30 Minuten joggen'), {
      target: { value: 'Sprint' },
    });
    fireEvent.change(screen.getByPlaceholderText('z.B. 3'), {
      target: { value: 'abc' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Aufgabe erstellen' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        target_sets: 1,
      }));
    });
  });
});
