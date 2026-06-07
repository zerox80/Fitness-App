// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const widthState = vi.hoisted(() => ({ value: 400 }));
const platformState = vi.hoisted(() => ({ OS: 'ios' as 'web' | 'ios' | 'android' }));

vi.mock('react-native', async () => {
  const ReactActual = (await vi.importActual('react')) as any;

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, animationType, behavior, presentationStyle, transparent, visible, ...rest } = props;
    void style;
    void activeOpacity;
    void animationType;
    void behavior;
    void presentationStyle;
    void transparent;
    void visible;
    return rest;
  }

  return {
    ActivityIndicator: ({ color }: any) => <span data-testid="activity" data-color={color} />,
    Modal: ({ children }: any) => <div data-testid="modal">{children}</div>,
    Platform: {
      get OS() {
        return platformState.OS;
      },
    },
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TouchableOpacity: ({ children, onPress, disabled, ...props }: any) =>
      ReactActual.createElement(
        'button',
        { ...cleanProps(props), disabled, onClick: onPress, type: 'button' },
        children
      ),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    useWindowDimensions: () => ({ width: widthState.value, height: 800 }),
  };
});

vi.mock('lucide-react-native', () => ({
  X: () => null,
  Clock: () => null,
  Zap: () => null,
  Target: () => null,
  Heart: () => null,
  Activity: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Bike: () => null,
  Dumbbell: () => null,
  Home: () => null,
  User: () => null,
  Utensils: () => null,
  ChevronRight: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Trophy: () => null,
  TrendingUp: () => null,
  Shield: () => null,
  Bell: () => null,
  Mail: () => null,
  Lock: () => null,
  Check: () => null,
  Apple: () => null,
  ListChecks: () => null,
  Repeat: () => null,
  Trash2: () => null,
  Plus: () => null,
  ClipboardList: () => null,
  Play: () => null,
  Eye: () => null,
  HeartPulse: () => null,
  Flame: () => null,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    text: '#17212b',
    textMuted: '#6f7782',
    card: '#fff',
    cardLight: '#eef2f0',
    primary: '#178864',
    borderSoft: '#e9eef1',
  },
}));

import { QuickStartModal } from '@/components/modals/QuickStartModal';

describe('QuickStartModal', () => {
  afterEach(() => {
    cleanup();
    widthState.value = 400;
    platformState.OS = 'ios';
  });

  it('renders the title, subtitle, and "Training planen" button', () => {
    const onClose = vi.fn();
    const onGenerate = vi.fn();

    render(
      <QuickStartModal
        visible
        onClose={onClose}
        onGenerate={onGenerate}
        loading={false}
      />
    );

    expect(screen.getByText('Schnellstart')).toBeTruthy();
    expect(
      screen.getByText('Erstelle einen Trainingsvorschlag für heute.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Training planen' })).toBeTruthy();
  });

  it('renders all duration, focus, and intensity options', () => {
    render(
      <QuickStartModal visible onClose={vi.fn()} onGenerate={vi.fn()} loading={false} />
    );

    expect(screen.getByRole('button', { name: '15 min' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '30 min' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '45 min' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ganzkörper' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Oberkörper' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Unterkörper' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Core' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Leicht' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mittel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Intensiv' })).toBeTruthy();
  });

  it('invokes onGenerate with the selected duration, focus, and intensity', () => {
    const onGenerate = vi.fn();
    render(
      <QuickStartModal visible onClose={vi.fn()} onGenerate={onGenerate} loading={false} />
    );

    fireEvent.click(screen.getByRole('button', { name: '45 min' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oberkörper' }));
    fireEvent.click(screen.getByRole('button', { name: 'Intensiv' }));
    fireEvent.click(screen.getByRole('button', { name: 'Training planen' }));

    expect(onGenerate).toHaveBeenCalledWith(45, 'Upper Body', 'High');
  });

  it('invokes onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <QuickStartModal visible onClose={onClose} onGenerate={vi.fn()} loading={false} />
    );

    // The close button has no text — find by role
    const closeBtn = screen.getAllByRole('button').find((b) => b.textContent?.trim() === '');
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a loading spinner and disables the generate button while loading', () => {
    render(
      <QuickStartModal visible onClose={vi.fn()} onGenerate={vi.fn()} loading />
    );

    expect(screen.getByTestId('activity')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Training planen' })).toBeNull();
  });
});
