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

const localSearchParamsState = vi.hoisted(() => ({ create: '0' }));
vi.mock('expo-router', () => ({
  useLocalSearchParams: () => localSearchParamsState,
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
    RefreshControl: ({ onRefresh }: any) =>
      ReactActual.createElement('button', { onClick: onRefresh, type: 'button', 'data-testid': 'refresh-btn' }, 'refresh'),
    ScrollView: ({ children, refreshControl, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), [refreshControl, children]),
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
  TaskCard: ({ task, onToggle, onIncrementSet, onDelete }: any) => (
    <div>
      <span>{task.title}</span>
      <button onClick={() => onToggle(task.id)} type="button">toggle</button>
      <button onClick={() => onIncrementSet(task.id)} type="button">increment</button>
      <button onClick={() => onDelete(task.id)} type="button">delete</button>
    </div>
  ),
}));

vi.mock('@/components/forms/TaskForm', () => ({
  TaskForm: ({ visible, onClose, onSubmit }: any) => {
    if (!visible) return null;
    return (
      <div>
        <button onClick={onClose} type="button">close</button>
        <button onClick={() => onSubmit({ title: 'New Mock Task' })} type="button">submit</button>
      </div>
    );
  },
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
    localSearchParamsState.create = '0';
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

  it('shows loading spinner when loading is true', () => {
    mockUseTasks({ loading: true });

    const { rerender } = render(<TasksScreen />);
    expect(screen.getByText('Aufgaben laden...')).toBeTruthy();

    rerender(<TasksScreenWeb />);
    expect(screen.getByText('Aufgaben laden...')).toBeTruthy();
  });

  it('shows empty state when there are no tasks', () => {
    mockUseTasks({ tasks: [] });

    const { rerender } = render(<TasksScreen />);
    expect(screen.getByText('Keine Aufgaben vorhanden')).toBeTruthy();

    rerender(<TasksScreenWeb />);
    expect(screen.getByText('Alles erledigt')).toBeTruthy();
  });

  it('triggers refetch on pulling to refresh', () => {
    const { refetch } = mockUseTasks({ tasks: [] });

    render(<TasksScreen />);
    fireEvent.click(screen.getByTestId('refresh-btn'));

    expect(refetch).toHaveBeenCalled();
  });

  it('opens and closes form, and submits a task', () => {
    const createTask = vi.fn();
    mockUseTasks({ tasks: [], createTask });

    render(<TasksScreen />);
    
    // TaskForm is not visible initially
    expect(screen.queryByText('close')).toBeNull();

    // Click plus button to open form
    const buttons = screen.getAllByRole('button');
    const addBtn = buttons.find(b => b.textContent === '');
    expect(addBtn).toBeTruthy();
    fireEvent.click(addBtn!);

    // Now TaskForm close/submit buttons are visible
    expect(screen.getByText('close')).toBeTruthy();
    expect(screen.getByText('submit')).toBeTruthy();

    // Submit the form
    fireEvent.click(screen.getByText('submit'));
    expect(createTask).toHaveBeenCalledWith({ title: 'New Mock Task' });

    // Close the form
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByText('close')).toBeNull();
  });

  it('handles task actions: toggle, increment, delete', () => {
    const toggleTask = vi.fn();
    const incrementSet = vi.fn();
    const deleteTask = vi.fn();
    
    const mockTasks = [
      { id: 't1', title: 'Task 1', completed: false, sets: 0, target_sets: 3 }
    ];

    mockUseTasks({ tasks: mockTasks, toggleTask, incrementSet, deleteTask });

    const { rerender } = render(<TasksScreen />);
    
    expect(screen.getByText('Task 1')).toBeTruthy();

    fireEvent.click(screen.getByText('toggle'));
    expect(toggleTask).toHaveBeenCalledWith('t1');

    fireEvent.click(screen.getByText('increment'));
    expect(incrementSet).toHaveBeenCalledWith('t1');

    fireEvent.click(screen.getByText('delete'));
    expect(deleteTask).toHaveBeenCalledWith('t1');

    // Test on web screen too
    rerender(<TasksScreenWeb />);
    fireEvent.click(screen.getByText('toggle'));
    expect(toggleTask).toHaveBeenCalledWith('t1');

    fireEvent.click(screen.getByText('increment'));
    expect(incrementSet).toHaveBeenCalledWith('t1');

    fireEvent.click(screen.getByText('delete'));
    expect(deleteTask).toHaveBeenCalledWith('t1');
  });

  it('opens and closes form, and submits a task on web', () => {
    const createTask = vi.fn();
    mockUseTasks({ tasks: [], createTask });

    render(<TasksScreenWeb />);
    
    // TaskForm is not visible initially
    expect(screen.queryByText('close')).toBeNull();

    // Click "Aufgabe hinzufügen" button to open form
    fireEvent.click(screen.getByText('Aufgabe hinzufügen'));

    // Now TaskForm close/submit buttons are visible
    expect(screen.getByText('close')).toBeTruthy();
    expect(screen.getByText('submit')).toBeTruthy();

    // Submit the form
    fireEvent.click(screen.getByText('submit'));
    expect(createTask).toHaveBeenCalledWith({ title: 'New Mock Task' });

    // Close the form
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByText('close')).toBeNull();
  });

  it('opens TaskForm automatically when router parameter create is 1 on native and web', () => {
    localSearchParamsState.create = '1';
    mockUseTasks({ tasks: [] });

    const { unmount } = render(<TasksScreen />);
    expect(screen.getByText('close')).toBeTruthy();
    expect(routerMocks.setParams).toHaveBeenCalledWith({ create: '0' });

    unmount();
    routerMocks.setParams.mockClear();

    localSearchParamsState.create = '1';
    render(<TasksScreenWeb />);
    expect(screen.getByText('close')).toBeTruthy();
    expect(routerMocks.setParams).toHaveBeenCalledWith({ create: '0' });
  });
});
