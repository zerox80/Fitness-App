import { describe, it, expect } from 'vitest';
import { MUSCLE_GROUPS } from '@/constants/muscleGroups';

describe('MUSCLE_GROUPS', () => {
  it('has 14 entries', () => {
    expect(MUSCLE_GROUPS).toHaveLength(14);
  });

  it('all keys are unique', () => {
    const keys = MUSCLE_GROUPS.map((mg) => mg.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all have non-empty labels', () => {
    for (const mg of MUSCLE_GROUPS) {
      expect(mg.label.length).toBeGreaterThan(0);
    }
  });

  it('all have icons', () => {
    for (const mg of MUSCLE_GROUPS) {
      expect(mg.icon).toBeDefined();
      expect(mg.icon.length).toBeGreaterThan(0);
    }
  });

  it('contains expected muscle groups', () => {
    const keys = MUSCLE_GROUPS.map((mg) => mg.key);
    expect(keys).toContain('chest');
    expect(keys).toContain('back');
    expect(keys).toContain('legs');
    expect(keys).toContain('abs');
  });
});
