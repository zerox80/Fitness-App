import { useState, useCallback, useEffect } from 'react';
import { api, ApiTaskWithCompletion, CreateTaskData, UpdateTaskData } from '@/lib/api';

export function useTasks() {
  const [tasks, setTasks] = useState<ApiTaskWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.tasks.today();
      setTasks(data);
    } catch {
      setError('Tasks konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: CreateTaskData) => {
    await api.tasks.create(data);
    await fetchTasks();
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, data: UpdateTaskData) => {
    await api.tasks.update(id, data);
    await fetchTasks();
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await api.tasks.delete(id);
    await fetchTasks();
  }, [fetchTasks]);

  const toggleTask = useCallback(async (id: string) => {
    const result = await api.tasks.toggle(id);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed_today: result.completed, completed_sets_today: result.completed ? 1 : 0 } : t))
    );
    return result.completed;
  }, []);

  const incrementSet = useCallback(async (id: string) => {
    const result = await api.tasks.incrementSet(id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed_today: result.completed_sets > 0,
              completed_sets_today: result.completed_sets,
            }
          : t
      )
    );
    return result.completed_sets;
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    incrementSet,
  };
}
