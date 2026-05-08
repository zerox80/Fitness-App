import { describe, expect, it } from 'vitest';
import { mergeHealthActivity } from '@/utils/activityMerge';
import type { DailyActivity } from '@/lib/api';

const serverActivity: DailyActivity = {
  steps: 1200,
  calories: 330,
  active_minutes: 22,
  move_progress: 0.3,
  exercise_progress: 0.2,
  stand_progress: 0.1,
};

describe('mergeHealthActivity', () => {
  it('keeps server calories when Health Connect reports zero calories', () => {
    const merged = mergeHealthActivity(serverActivity, {
      steps: 5000,
      calories: 0,
    });

    expect(merged.steps).toBe(5000);
    expect(merged.calories).toBe(330);
  });

  it('uses Health Connect calories when the value is above zero', () => {
    const merged = mergeHealthActivity(serverActivity, {
      calories: 410,
    });

    expect(merged.steps).toBe(1200);
    expect(merged.calories).toBe(410);
  });

  it('keeps server calories when Health Connect reports a lower positive value', () => {
    const merged = mergeHealthActivity(serverActivity, {
      calories: 50,
    });

    expect(merged.steps).toBe(1200);
    expect(merged.calories).toBe(330);
  });

  it('keeps server calories when Health Connect omits calories', () => {
    const merged = mergeHealthActivity(serverActivity, {
      steps: 8000,
    });

    expect(merged.steps).toBe(8000);
    expect(merged.calories).toBe(330);
  });

  it('adds saved additional calories on top of Health Connect base calories', () => {
    const merged = mergeHealthActivity(
      {
        ...serverActivity,
        calories: 300,
        active_minutes: 30,
        base_calories: 0,
        base_active_minutes: 0,
        additional_calories: 300,
        additional_active_minutes: 30,
      },
      {
        steps: 6000,
        calories: 200,
      }
    );

    expect(merged.steps).toBe(6000);
    expect(merged.base_calories).toBe(200);
    expect(merged.additional_calories).toBe(300);
    expect(merged.calories).toBe(500);
  });
});
