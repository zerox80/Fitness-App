// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const apiMocks = vi.hoisted(() => ({
  estimateCalories: vi.fn(),
  today: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    activity: {
      estimateCalories: apiMocks.estimateCalories,
      today: apiMocks.today,
      update: apiMocks.update,
    },
  },
}));

vi.mock('@/utils/date', () => ({
  formatLocalDateKey: () => '2026-05-07',
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    background: '#fff',
    card: '#fff',
    cardLight: '#f0f0f0',
    primary: '#178864',
    primaryGlow: '#e5f3ee',
    tertiary: '#d84d5a',
    text: '#17212b',
    textMuted: '#6f7782',
    textSoft: '#9aa2ac',
    borderSoft: '#e9eef1',
  },
}));

vi.mock('lucide-react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  const Icon = () => ReactActual.createElement('span', { 'aria-hidden': true });

  return {
    Check: Icon,
    Flame: Icon,
    Send: Icon,
  };
});

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const {
      accessibilityRole,
      activeOpacity,
      borderColor,
      disabled,
      placeholderTextColor,
      style,
      ...rest
    } = props;
    return { ...rest, disabled };
  }

  return {
    ActivityIndicator: () => ReactActual.createElement('span', { 'aria-label': 'loading' }),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    TextInput: ({ accessibilityLabel, onChangeText, placeholder, value }: any) =>
      ReactActual.createElement('textarea', {
        'aria-label': accessibilityLabel,
        onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChangeText?.(event.target.value),
        placeholder,
        value,
      }),
    TouchableOpacity: ({ accessibilityLabel, children, disabled, onPress }: any) =>
      ReactActual.createElement(
        'button',
        {
          'aria-label': accessibilityLabel,
          disabled,
          onClick: onPress,
          type: 'button',
        },
        children
      ),
  };
});

import { CalorieChatCard } from '@/components/activity/CalorieChatCard';

describe('CalorieChatCard', () => {
  beforeEach(() => {
    apiMocks.estimateCalories.mockReset();
    apiMocks.today.mockReset();
    apiMocks.update.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('sends chat messages and applies an estimated calorie value', async () => {
    const onActivityUpdated = vi.fn();
    apiMocks.estimateCalories.mockResolvedValue({
      status: 'estimated',
      reply: 'Das waren etwa 420 kcal.',
      estimate: {
        total_calories: 420,
        active_minutes: 45,
        confidence: 0.82,
        activities: [
          {
            name: 'Joggen',
            duration_minutes: 45,
            intensity: 'mittel',
            calories: 420,
          },
        ],
      },
    });
    apiMocks.today.mockResolvedValue({
      steps: 3000,
      calories: 20,
      active_minutes: 3,
      move_progress: 0.1,
      exercise_progress: 0.1,
      stand_progress: 0.1,
    });
    apiMocks.update.mockResolvedValue({
      steps: 3000,
      calories: 420,
      active_minutes: 45,
      move_progress: 0.1,
      exercise_progress: 0.1,
      stand_progress: 0.1,
    });

    render(<CalorieChatCard onActivityUpdated={onActivityUpdated} />);

    fireEvent.change(screen.getByLabelText('Aktivitaet beschreiben'), {
      target: { value: '45 Minuten joggen, mittel intensiv' },
    });
    fireEvent.click(screen.getByLabelText('Kalorien schaetzen'));

    await screen.findByText('Das waren etwa 420 kcal.');
    expect(apiMocks.estimateCalories).toHaveBeenCalledWith({
      date: '2026-05-07',
      messages: [
        { role: 'assistant', content: 'Was hast du heute gemacht?' },
        { role: 'user', content: '45 Minuten joggen, mittel intensiv' },
      ],
    });
    expect(screen.getByText('420 kcal')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Kalorienschaetzung uebernehmen'));

    await waitFor(() => {
      expect(apiMocks.update).toHaveBeenCalledWith(
        {
          steps: 3000,
          calories: 420,
          active_minutes: 45,
          move_progress: 0.1,
          exercise_progress: 0.1,
          stand_progress: 0.1,
        },
        { date: '2026-05-07' }
      );
    });
    expect(onActivityUpdated).toHaveBeenCalledWith({
      steps: 3000,
      calories: 420,
      active_minutes: 45,
      move_progress: 0.1,
      exercise_progress: 0.1,
      stand_progress: 0.1,
    });
  });

  it('keeps higher current activity values when applying an estimate', async () => {
    const onActivityUpdated = vi.fn();
    apiMocks.estimateCalories.mockResolvedValue({
      status: 'estimated',
      reply: 'Das waren etwa 420 kcal.',
      estimate: {
        total_calories: 420,
        active_minutes: 45,
        confidence: 0.82,
        activities: [
          {
            name: 'Joggen',
            duration_minutes: 45,
            intensity: 'mittel',
            calories: 420,
          },
        ],
      },
    });
    apiMocks.today.mockResolvedValue({
      steps: 8000,
      calories: 650,
      active_minutes: 70,
      move_progress: 0.6,
      exercise_progress: 0.5,
      stand_progress: 0.3,
    });
    apiMocks.update.mockResolvedValue({
      steps: 8000,
      calories: 650,
      active_minutes: 70,
      move_progress: 0.6,
      exercise_progress: 0.5,
      stand_progress: 0.3,
    });

    render(<CalorieChatCard onActivityUpdated={onActivityUpdated} />);

    fireEvent.change(screen.getByLabelText('Aktivitaet beschreiben'), {
      target: { value: '45 Minuten joggen, mittel intensiv' },
    });
    fireEvent.click(screen.getByLabelText('Kalorien schaetzen'));

    await screen.findByText('Das waren etwa 420 kcal.');
    fireEvent.click(screen.getByLabelText('Kalorienschaetzung uebernehmen'));

    await waitFor(() => {
      expect(apiMocks.update).toHaveBeenCalledWith(
        {
          steps: 8000,
          calories: 650,
          active_minutes: 70,
          move_progress: 0.6,
          exercise_progress: 0.5,
          stand_progress: 0.3,
        },
        { date: '2026-05-07' }
      );
    });
    expect(onActivityUpdated).toHaveBeenCalledWith({
      steps: 8000,
      calories: 650,
      active_minutes: 70,
      move_progress: 0.6,
      exercise_progress: 0.5,
      stand_progress: 0.3,
    });
  });

  it('shows a follow-up question when the backend needs more information', async () => {
    apiMocks.estimateCalories.mockResolvedValue({
      status: 'needs_more_info',
      reply: 'Wie lange und wie intensiv war das?',
      estimate: null,
    });

    render(<CalorieChatCard />);

    fireEvent.change(screen.getByLabelText('Aktivitaet beschreiben'), {
      target: { value: 'Ich war laufen' },
    });
    fireEvent.click(screen.getByLabelText('Kalorien schaetzen'));

    await screen.findByText('Wie lange und wie intensiv war das?');
    expect(screen.queryByLabelText('Kalorienschaetzung uebernehmen')).toBeNull();
  });

  it('limits the sent chat history before the backend message limit', async () => {
    let replyNumber = 0;
    apiMocks.estimateCalories.mockImplementation(async () => {
      replyNumber += 1;
      return {
        status: 'needs_more_info',
        reply: `Rueckfrage ${replyNumber}`,
        estimate: null,
      };
    });

    render(<CalorieChatCard />);

    for (let index = 1; index <= 11; index += 1) {
      fireEvent.change(screen.getByLabelText('Aktivitaet beschreiben'), {
        target: { value: `Aktivitaet ${index}` },
      });
      fireEvent.click(screen.getByLabelText('Kalorien schaetzen'));

      await screen.findByText(`Rueckfrage ${index}`);
    }

    const calls = apiMocks.estimateCalories.mock.calls;
    const lastPayload = calls[calls.length - 1][0];
    const sentMessages = lastPayload.messages;

    expect(sentMessages.length).toBeLessThanOrEqual(20);
    expect(sentMessages[0].role).toBe('user');
    expect(sentMessages[sentMessages.length - 1]).toEqual({
      role: 'user',
      content: 'Aktivitaet 11',
    });
    expect(screen.getByText('Aktivitaet 1')).toBeTruthy();
  });
});
