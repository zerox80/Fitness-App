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
  description?: string | null;
  duration_minutes: number;
  intensity: string;
  category: string;
  exercises?: GeneratedExercise[];
}

export interface UpdateWorkoutData {
  title?: string;
  description?: string | null;
  duration_minutes?: number;
  intensity?: string;
  category?: string;
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
  description?: string | null;
  recurrence: ApiTaskRecurrence;
  custom_days?: number[];
  category: ApiTaskCategory;
  target_sets?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
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
