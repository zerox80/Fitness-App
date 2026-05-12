import { Platform } from 'react-native';

const DEV_ANDROID_API_BASE = 'http://10.0.2.2:4000/api';
const DEV_LOCAL_API_BASE = 'http://localhost:4000/api';
const API_BASE_REQUIRED_MESSAGE =
  'EXPO_PUBLIC_API_URL is required for production builds. Set it to your public API base URL, for example https://example.com/api.';

declare const __DEV__: boolean;

type ApiBaseEnv = {
  EXPO_PUBLIC_API_URL?: string;
  NODE_ENV?: string;
};

function isDevelopmentBuild() {
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }

  return process.env.NODE_ENV !== 'production';
}

export function resolveApiBase(
  platformOS: typeof Platform.OS,
  env: ApiBaseEnv = process.env,
  isDev = isDevelopmentBuild()
) {
  const configuredBase = env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredBase) {
    return configuredBase;
  }

  if (!isDev || env.NODE_ENV === 'production') {
    throw new Error(API_BASE_REQUIRED_MESSAGE);
  }

  return platformOS === 'android' ? DEV_ANDROID_API_BASE : DEV_LOCAL_API_BASE;
}

const API_BASE = resolveApiBase(Platform.OS);

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

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

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
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
  updated_at: string;
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

export interface WeeklyActivitySummary {
  week_start: string;
  total_steps: number;
  total_calories: number;
  total_active_minutes: number;
  workout_count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  stats?: UserStats | null;
}

export interface DailyActivity {
  steps: number;
  calories: number;
  active_minutes: number;
  move_progress: number;
  exercise_progress: number;
  stand_progress: number;
  base_calories?: number;
  base_active_minutes?: number;
  additional_calories?: number;
  additional_active_minutes?: number;
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

export interface ActivityEntry {
  id: string;
  user_id: string;
  activity_date: string;
  name: string;
  duration_minutes: number;
  intensity: string;
  calories: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityEntry {
  name: string;
  duration_minutes: number;
  intensity: string;
  calories: number;
  source?: string;
}

export interface CreateActivityEntriesRequest {
  date: string;
  entries: CreateActivityEntry[];
}

export interface ActivityEntriesResponse {
  activity: DailyActivity;
  entries: ActivityEntry[];
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

export type ApiMuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'legs'
  | 'glutes'
  | 'calves'
  | 'forearms'
  | 'traps'
  | 'lats'
  | 'hamstrings'
  | 'quadriceps';

export type ApiEquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'resistance_band'
  | 'medicine_ball'
  | 'bench'
  | 'squat_rack'
  | 'pull_up_bar'
  | 'dip_station'
  | 'treadmill'
  | 'none';

export type ApiDifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ApiExercise {
  id: string;
  name: string;
  description: string | null;
  muscle_groups: ApiMuscleGroup[];
  equipment: ApiEquipmentType[];
  difficulty: ApiDifficultyLevel;
  instructions: string[] | null;
  image_url: string | null;
  video_url: string | null;
  is_custom: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseListParams {
  muscle_group?: ApiMuscleGroup;
  equipment?: ApiEquipmentType;
  difficulty?: ApiDifficultyLevel;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface WorkoutListParams {
  category?: string;
  completed?: boolean;
  page?: number;
  per_page?: number;
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
    const message =
      err && typeof err === 'object' && 'error' in err && typeof err.error === 'string'
        ? err.error
        : `HTTP ${res.status}`;
    throw new ApiError(message, res.status, err);
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

function appendDefinedParams(query: URLSearchParams, params?: object) {
  if (!params) {
    return;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
}

async function listAllPages<T>(
  fetchPage: (page: number, perPage: number) => Promise<T[]>,
  perPage = 100
) {
  const all: T[] = [];
  let page = 1;

  for (;;) {
    const current = await fetchPage(page, perPage);
    all.push(...current);

    if (current.length < perPage) {
      return all;
    }

    page += 1;
  }
}

export const api = {
  auth: {
    register: (data: RegisterData) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: LoginData) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<AuthUserResponse>('/auth/me'),
  },
  users: {
    profile: () => request<UserProfile>('/users/me'),
  },
  workouts: {
    list: (params?: WorkoutListParams) => {
      const query = new URLSearchParams();
      appendDefinedParams(query, params);
      const qs = query.toString();
      return request<ApiWorkout[]>(`/workouts${qs ? `?${qs}` : ''}`);
    },
    listAll: (params?: Omit<WorkoutListParams, 'page' | 'per_page'>) =>
      listAllPages<ApiWorkout>((page, perPage) =>
        api.workouts.list({ ...params, page, per_page: perPage })
      ),
    create: (data: CreateWorkoutData) => request<ApiWorkout>('/workouts', { method: 'POST', body: JSON.stringify(data) }),
    generate: (data: GenerateWorkoutRequest) => request<GeneratedWorkout>('/workouts/generate', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<ApiWorkout>(`/workouts/${id}`),
    complete: (id: string) => request<ApiWorkout>(`/workouts/${id}/complete`, { method: 'PUT' }),
    delete: (id: string) => request<{ deleted: boolean }>(`/workouts/${id}`, { method: 'DELETE' }),
    deleteAll: () => request<{ deleted: boolean; count: number }>('/workouts', { method: 'DELETE' }),
  },
  stats: {
    get: () => request<UserStats>('/stats'),
    weekly: () => request<WeeklyActivitySummary>('/stats/weekly'),
  },
  activity: {
    today: (params?: ActivityDateParams) => request<DailyActivity>(activityPath(params)),
    update: (data: UpdateActivityData, params?: ActivityDateParams) => request<DailyActivity>(activityPath(params), { method: 'PUT', body: JSON.stringify(data) }),
    entries: {
      list: (params?: ActivityDateParams) => request<ActivityEntry[]>(pathWithDate('/activity/entries', params)),
      create: (data: CreateActivityEntriesRequest) =>
        request<ActivityEntriesResponse>('/activity/entries', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<ActivityEntriesResponse>(`/activity/entries/${id}`, { method: 'DELETE' }),
    },
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
  exercises: {
    list: (params?: ExerciseListParams) => {
      const query = new URLSearchParams();
      appendDefinedParams(query, params);
      const qs = query.toString();
      return request<ApiExercise[]>(`/exercises${qs ? `?${qs}` : ''}`);
    },
    listAll: (params?: Omit<ExerciseListParams, 'page' | 'per_page'>) =>
      listAllPages<ApiExercise>((page, perPage) =>
        api.exercises.list({ ...params, page, per_page: perPage })
      ),
    get: (id: string) => request<ApiExercise>(`/exercises/${id}`),
  },
};
