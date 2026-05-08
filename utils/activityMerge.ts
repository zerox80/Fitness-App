import type { DailyActivity } from '@/lib/api';

export type HealthActivitySnapshot = {
  steps?: number;
  calories?: number;
};

export function mergeHealthActivity(
  serverActivity: DailyActivity,
  healthActivity: HealthActivitySnapshot
): DailyActivity {
  const hasCalorieBreakdown =
    typeof serverActivity.base_calories === 'number' ||
    typeof serverActivity.additional_calories === 'number';
  const additionalCalories = serverActivity.additional_calories ?? 0;
  const currentBaseCalories =
    serverActivity.base_calories ?? Math.max(0, serverActivity.calories - additionalCalories);
  const baseCalories =
    typeof healthActivity.calories === 'number' && healthActivity.calories > 0
      ? hasCalorieBreakdown
        ? healthActivity.calories
        : Math.max(currentBaseCalories, healthActivity.calories)
      : currentBaseCalories;

  const additionalActiveMinutes = serverActivity.additional_active_minutes ?? 0;
  const baseActiveMinutes =
    serverActivity.base_active_minutes ??
    Math.max(0, serverActivity.active_minutes - additionalActiveMinutes);

  return {
    ...serverActivity,
    steps: healthActivity.steps ?? serverActivity.steps,
    calories: baseCalories + additionalCalories,
    active_minutes: baseActiveMinutes + additionalActiveMinutes,
    base_calories: baseCalories,
    base_active_minutes: baseActiveMinutes,
    additional_calories: additionalCalories,
    additional_active_minutes: additionalActiveMinutes,
  };
}
