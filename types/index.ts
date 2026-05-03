export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: WorkoutType;
  status: WorkoutStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  exercises: WorkoutExercise[];
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type WorkoutType =
  | 'strength'
  | 'cardio'
  | 'hiit'
  | 'flexibility'
  | 'sport'
  | 'custom';

export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  orderIndex: number;
  sets: ExerciseSet[];
  restSeconds: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  instructions?: string[];
  imageUrl?: string;
  videoUrl?: string;
  isCustom: boolean;
  userId?: string;
}

export type MuscleGroup =
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

export type EquipmentType =
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

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  isWarmup: boolean;
  isDropset: boolean;
  isFailure: boolean;
  completed: boolean;
}

export interface NutritionEntry {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize: number;
  servingUnit: ServingUnit;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  quantity: number;
}

export type ServingUnit = 'g' | 'ml' | 'oz' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'serving';

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  weightKg?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  bmi?: number;
  measurements: BodyPartMeasurement[];
}

export interface BodyPartMeasurement {
  bodyPart: BodyPart;
  valueCm: number;
}

export type BodyPart =
  | 'chest'
  | 'waist'
  | 'hips'
  | 'biceps_left'
  | 'biceps_right'
  | 'thigh_left'
  | 'thigh_right'
  | 'calf_left'
  | 'calf_right'
  | 'neck'
  | 'shoulders';

export interface WorkoutStats {
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalSets: number;
  totalVolumeKg: number;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  favoriteExercise?: string;
}

export interface WeeklyGoal {
  id: string;
  userId: string;
  weekStart: string;
  workoutGoal: number;
  durationGoalMinutes: number;
  caloriesGoal?: number;
  completedWorkouts: number;
  completedDurationMinutes: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
  category: AchievementCategory;
}

export type AchievementCategory =
  | 'workouts'
  | 'streaks'
  | 'volume'
  | 'nutrition'
  | 'social'
  | 'special';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export type NotificationType =
  | 'workout_reminder'
  | 'goal_achieved'
  | 'achievement_unlocked'
  | 'streak_warning'
  | 'system';

export type TaskRecurrence = 'daily' | 'weekdays' | 'weekly' | 'custom';

export type TaskCategory = 'workout' | 'nutrition' | 'habit' | 'general';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RecurringTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  recurrence: TaskRecurrence;
  customDays: Weekday[];
  category: TaskCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  completedDate: string;
  createdAt: string;
}

export interface TaskWithCompletion extends RecurringTask {
  completedToday: boolean;
  completedDates: string[];
}

export const TASK_RECURRENCE_LABELS: Record<TaskRecurrence, string> = {
  daily: 'Täglich',
  weekdays: 'Werktags',
  weekly: 'Wöchentlich',
  custom: 'Benutzerdefiniert',
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  workout: 'Workout',
  nutrition: 'Ernährung',
  habit: 'Gewohnheit',
  general: 'Allgemein',
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'So',
  1: 'Mo',
  2: 'Di',
  3: 'Mi',
  4: 'Do',
  5: 'Fr',
  6: 'Sa',
};
