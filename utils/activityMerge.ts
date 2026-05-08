import type { DailyActivity } from '@/lib/api';

export type HealthActivitySnapshot = {
  steps?: number;
  calories?: number;
};

export function mergeHealthActivity(
  serverActivity: DailyActivity,
  healthActivity: HealthActivitySnapshot
): DailyActivity {
  return {
    ...serverActivity,
    steps: healthActivity.steps ?? serverActivity.steps,
    calories:
      typeof healthActivity.calories === 'number' && healthActivity.calories > 0
        ? Math.max(serverActivity.calories, healthActivity.calories)
        : serverActivity.calories,
  };
}
