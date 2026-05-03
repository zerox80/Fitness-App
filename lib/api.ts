const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
  };
}

export interface ApiWorkout {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  intensity: string;
  category: string;
  completed_at: string | null;
  created_at: string;
}

export interface CreateWorkoutData {
  title: string;
  description?: string;
  duration_minutes: number;
  intensity: string;
  category: string;
}

export interface UserStats {
  total_workouts: number;
  total_minutes: number;
  current_streak: number;
}

export interface DailyActivity {
  steps: number;
  calories: number;
  active_minutes: number;
  move_progress: number;
  exercise_progress: number;
  stand_progress: number;
}

export interface UpdateActivityData {
  steps: number;
  calories: number;
  active_minutes: number;
  move_progress: number;
  exercise_progress: number;
  stand_progress: number;
}

export type ApiTaskRecurrence = 'daily' | 'weekdays' | 'weekly' | 'custom';
export type ApiTaskCategory = 'workout' | 'nutrition' | 'habit' | 'general';

export interface ApiTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  recurrence: ApiTaskRecurrence;
  custom_days: number[];
  category: ApiTaskCategory;
  is_active: boolean;
  target_sets: number;
  created_at: string;
  updated_at: string;
}

export interface ApiTaskWithCompletion extends ApiTask {
  completed_today: boolean;
  completed_sets_today: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  recurrence: ApiTaskRecurrence;
  custom_days?: number[];
  category: ApiTaskCategory;
  target_sets?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  recurrence?: ApiTaskRecurrence;
  custom_days?: number[];
  category?: ApiTaskCategory;
  is_active?: boolean;
  target_sets?: number;
}

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: RegisterData) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: LoginData) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<{ id: string; email: string; name: string }>('/auth/me'),
  },
  workouts: {
    list: (params?: { category?: string; completed?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.completed !== undefined) query.set('completed', String(params.completed));
      const qs = query.toString();
      return request<ApiWorkout[]>(`/workouts${qs ? `?${qs}` : ''}`);
    },
    create: (data: CreateWorkoutData) => request<ApiWorkout>('/workouts', { method: 'POST', body: JSON.stringify(data) }),
    complete: (id: string) => request<ApiWorkout>(`/workouts/${id}/complete`, { method: 'PUT' }),
    delete: (id: string) => request<{ deleted: boolean }>(`/workouts/${id}`, { method: 'DELETE' }),
  },
  stats: {
    get: () => request<UserStats>('/stats'),
  },
  activity: {
    today: () => request<DailyActivity>('/activity/today'),
    update: (data: UpdateActivityData) => request<DailyActivity>('/activity/today', { method: 'PUT', body: JSON.stringify(data) }),
  },
  tasks: {
    list: () => request<ApiTask[]>('/tasks'),
    today: () => request<ApiTaskWithCompletion[]>('/tasks/today'),
    get: (id: string) => request<ApiTask>(`/tasks/${id}`),
    create: (data: CreateTaskData) => request<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTaskData) => request<ApiTask>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ deleted: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
    toggle: (id: string) => request<{ completed: boolean }>(`/tasks/${id}/toggle`, { method: 'PUT' }),
    incrementSet: (id: string) => request<{ completed_sets: number }>(`/tasks/${id}/increment-set`, { method: 'POST' }),
    completions: (id: string) => request<string[]>(`/tasks/${id}/completions`),
  },
};
