// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const useTasksMock = vi.hoisted(() => vi.fn());
const routerMocks = vi.hoisted(() => ({
  setParams: vi.fn(),
}));

vi.mock('@/hooks/useTasks', () => ({
  useTasks: useTasksMock,
}));

vi.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => routerMocks,
}));

vi.mock('react-native-safe-area-context', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) =>
      ReactActual.createElement('div', null, children),
  };
});

vi.mock('lucide-react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  const Icon = () => ReactActual.createElement('span', { 'aria-hidden': true });

  return {
    Activity: Icon,
    Bike: Icon,
    CircleCheck: Icon,
    Dumbbell: Icon,
    Home: Icon,
    PersonStanding: Icon,
    Plus: Icon,
    Target: Icon,
    User: Icon,
    Utensils: Icon,
  };
});

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const {
      activeOpacity,
      contentContainerStyle,
      refreshControl,
      showsVerticalScrollIndicator,
      style,
      ...rest
    } = props;
    return rest;
  }

  return {
    RefreshControl: () => null,
    ScrollView: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TouchableOpacity: ({ children, disabled, onPress, ...props }: any) =>
      ReactActual.createElement(
        'button',
        { ...cleanProps(props), disabled, onClick: onPress, type: 'button' },
        children
      ),
    useWindowDimensions: () => ({ height: 800, width: 1200 }),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/activity/CalorieChatCard', () => ({
  CalorieChatCard: () => <div data-testid="calorie-chat" />,
}));

vi.mock('@/components/cards/TaskCard', () => ({
  TaskCard: ({ task }: any) => <div>{task.title}</div>,
}));

vi.mock('@/components/forms/TaskForm', () => ({
  TaskForm: () => null,
}));

vi.mock('@/components/feedback/ErrorBanner', () => ({
  ErrorBanner: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div role="alert">
      <span>{message}</span>
      <button onClick={onRetry} type="button">
        retry
      </button>
    </div>
  ),
}));

vi.mock('@/components/feedback/EmptyState', () => ({
  EmptyState: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <span>{title}</span>
      <span>{subtitle}</span>
    </div>
  ),
}));

vi.mock('@/components/feedback/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message: string }) => <div>{message}</div>,
}));

import TasksScreen from '@/app/(tabs)/tasks';
import TasksScreenWeb from '@/app/(tabs)/tasks.web';

function mockUseTasks(overrides: Record<string, unknown> = {}) {
  const refetch = vi.fn();
  useTasksMock.mockReturnValue({
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    error: null,
    incrementSet: vi.fn(),
    loading: false,
    refetch,
    tasks: [],
    toggleTask: vi.fn(),
    ...overrides,
  });
  return { refetch };
}

describe('Task screens', () => {
  beforeEach(() => {
    useTasksMock.mockReset();
    routerMocks.setParams.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('native screen shows API errors instead of an empty state', () => {
    const { refetch } = mockUseTasks({ error: 'Tasks konnten nicht geladen werden.' });

    render(<TasksScreen />);

    expect(screen.getByRole('alert').textContent).toContain('Tasks konnten nicht geladen werden.');
    expect(screen.queryByText('Keine Aufgaben vorhanden')).toBeNull();

    fireEvent.click(screen.getByText('retry'));
    expect(refetch).toHaveBeenCalled();
  });

  it('web screen shows API errors instead of an empty state', () => {
    mockUseTasks({ error: 'Tasks konnten nicht geladen werden.' });

    render(<TasksScreenWeb />);

    expect(screen.getByRole('alert').textContent).toContain('Tasks konnten nicht geladen werden.');
    expect(screen.queryByText('Alles erledigt')).toBeNull();
  });
});
