import { describe, it, expect } from 'vitest';
import {
  TASK_RECURRENCE_LABELS,
  TASK_CATEGORY_LABELS,
  WEEKDAY_LABELS,
  TaskRecurrence,
  TaskCategory,
  Weekday,
} from '@/types';

describe('TASK_RECURRENCE_LABELS', () => {
  it('has labels for all recurrence types', () => {
    const recurrences: TaskRecurrence[] = ['daily', 'weekdays', 'weekly', 'custom'];
    for (const r of recurrences) {
      expect(TASK_RECURRENCE_LABELS[r]).toBeDefined();
      expect(TASK_RECURRENCE_LABELS[r].length).toBeGreaterThan(0);
    }
  });

  it('has correct German labels', () => {
    expect(TASK_RECURRENCE_LABELS.daily).toBe('Täglich');
    expect(TASK_RECURRENCE_LABELS.weekdays).toBe('Werktags');
    expect(TASK_RECURRENCE_LABELS.weekly).toBe('Wöchentlich');
    expect(TASK_RECURRENCE_LABELS.custom).toBe('Benutzerdefiniert');
  });
});

describe('TASK_CATEGORY_LABELS', () => {
  it('has labels for all categories', () => {
    const categories: TaskCategory[] = ['workout', 'nutrition', 'habit', 'general'];
    for (const c of categories) {
      expect(TASK_CATEGORY_LABELS[c]).toBeDefined();
      expect(TASK_CATEGORY_LABELS[c].length).toBeGreaterThan(0);
    }
  });

  it('has correct German labels', () => {
    expect(TASK_CATEGORY_LABELS.workout).toBe('Workout');
    expect(TASK_CATEGORY_LABELS.nutrition).toBe('Ernährung');
    expect(TASK_CATEGORY_LABELS.habit).toBe('Gewohnheit');
    expect(TASK_CATEGORY_LABELS.general).toBe('Allgemein');
  });
});

describe('WEEKDAY_LABELS', () => {
  it('has labels for all 7 days', () => {
    for (let i = 0; i <= 6; i++) {
      expect(WEEKDAY_LABELS[i as Weekday]).toBeDefined();
    }
  });

  it('has correct short German labels', () => {
    expect(WEEKDAY_LABELS[0]).toBe('So');
    expect(WEEKDAY_LABELS[1]).toBe('Mo');
    expect(WEEKDAY_LABELS[2]).toBe('Di');
    expect(WEEKDAY_LABELS[3]).toBe('Mi');
    expect(WEEKDAY_LABELS[4]).toBe('Do');
    expect(WEEKDAY_LABELS[5]).toBe('Fr');
    expect(WEEKDAY_LABELS[6]).toBe('Sa');
  });
});
