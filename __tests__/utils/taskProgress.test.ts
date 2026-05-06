import { describe, expect, it } from 'vitest';
import {
  getCompletedTaskCount,
  getDailyTaskProgress,
  getTaskProgress,
  isTaskFullyCompleted,
} from '@/utils/taskProgress';

describe('task progress helpers', () => {
  it('calculates set-based progress for a four-set task', () => {
    expect(getTaskProgress({ completed_sets_today: 0, target_sets: 4 })).toBe(0);
    expect(getTaskProgress({ completed_sets_today: 1, target_sets: 4 })).toBe(0.25);
    expect(getTaskProgress({ completed_sets_today: 3, target_sets: 4 })).toBe(0.75);
    expect(getTaskProgress({ completed_sets_today: 4, target_sets: 4 })).toBe(1);
  });

  it('marks multi-set tasks complete only after the target set count is reached', () => {
    expect(isTaskFullyCompleted({ completed_sets_today: 1, target_sets: 4 })).toBe(false);
    expect(isTaskFullyCompleted({ completed_sets_today: 4, target_sets: 4 })).toBe(true);
    expect(isTaskFullyCompleted({ completed_sets_today: 5, target_sets: 4 })).toBe(true);
  });

  it('ignores stale completed_today flags from task API payloads', () => {
    const task = {
      completed_today: true,
      completed_sets_today: 3,
      target_sets: 4,
    };

    expect(isTaskFullyCompleted(task)).toBe(false);
    expect(getTaskProgress(task)).toBe(0.75);
    expect(getCompletedTaskCount([task])).toBe(0);
    expect(getDailyTaskProgress([task])).toBe(0.75);
  });

  it('averages progress across one-set and multi-set tasks', () => {
    const tasks = [
      { completed_sets_today: 1, target_sets: 1 },
      { completed_sets_today: 1, target_sets: 4 },
    ];

    expect(getDailyTaskProgress(tasks)).toBe(0.625);
    expect(getCompletedTaskCount(tasks)).toBe(1);
  });

  it('returns zero progress when there are no tasks', () => {
    expect(getDailyTaskProgress([])).toBe(0);
    expect(getCompletedTaskCount([])).toBe(0);
  });
});
