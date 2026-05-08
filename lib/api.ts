import { Platform } from 'react-native';

const DEFAULT_API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';
const API_BASE = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE;

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
  exercises: GeneratedExercise[];
  completed_at: string | null;
  created_at: string;
}

export interface CreateWorkoutData {
  title: string;
  description?: string;
  duration_minutes: number;
  intensity: string;
  category: string;
  exercises?: GeneratedExercise[];
}

export interface GenerateWorkoutRequest {
  duration_minutes: number;
  focus: string;
  intensity: string;
}

export interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
}

export interface GeneratedWorkout {
  title: string;
  description: string;
  exercises: GeneratedExercise[];
  total_duration: number;
  intensity: string;
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

export interface ActivityDateParams {
  date?: string;
}

export type CalorieChatRole = 'user' | 'assistant';
export type CalorieChatStatus = 'needs_more_info' | 'estimated';

export interface CalorieChatMessage {
  role: CalorieChatRole;
  content: string;
}

export interface CalorieEstimateActivity {
  name: string;
  duration_minutes: number;
  intensity: string;
  calories: number;
}

export interface CalorieEstimate {
  total_calories: number;
  active_minutes: number;
  confidence: number;
  activities: CalorieEstimateActivity[];
}

export interface CalorieChatRequest {
  date?: string;
  messages: CalorieChatMessage[];
}

export interface CalorieChatResponse {
  status: CalorieChatStatus;
  reply: string;
  estimate?: CalorieEstimate | null;
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

function activityPath(params?: ActivityDateParams) {
  return pathWithDate('/activity/today', params);
}

function pathWithDate(path: string, params?: ActivityDateParams) {
  if (!params?.date) {
    return path;
  }

  const query = new URLSearchParams({ date: params.date });
  return `${path}?${query.toString()}`;
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
    generate: (data: GenerateWorkoutRequest) => request<GeneratedWorkout>('/workouts/generate', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<ApiWorkout>(`/workouts/${id}`),
    complete: (id: string) => request<ApiWorkout>(`/workouts/${id}/complete`, { method: 'PUT' }),
    delete: (id: string) => request<{ deleted: boolean }>(`/workouts/${id}`, { method: 'DELETE' }),
  },
  stats: {
    get: () => request<UserStats>('/stats'),
  },
  activity: {
    today: (params?: ActivityDateParams) => request<DailyActivity>(activityPath(params)),
    update: (data: UpdateActivityData, params?: ActivityDateParams) => request<DailyActivity>(activityPath(params), { method: 'PUT', body: JSON.stringify(data) }),
    estimateCalories: (data: CalorieChatRequest) =>
      request<CalorieChatResponse>('/activity/calorie-chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  tasks: {
    list: () => request<ApiTask[]>('/tasks'),
    today: (params?: ActivityDateParams) => request<ApiTaskWithCompletion[]>(pathWithDate('/tasks/today', params)),
    get: (id: string) => request<ApiTask>(`/tasks/${id}`),
    create: (data: CreateTaskData) => request<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTaskData) => request<ApiTask>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ deleted: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
    toggle: (id: string, params?: ActivityDateParams) => request<{ completed: boolean }>(pathWithDate(`/tasks/${id}/toggle`, params), { method: 'PUT' }),
    incrementSet: (id: string, params?: ActivityDateParams) => request<{ completed_sets: number }>(pathWithDate(`/tasks/${id}/increment-set`, params), { method: 'POST' }),
    completions: (id: string) => request<string[]>(`/tasks/${id}/completions`),
  },
};
