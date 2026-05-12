import { describe, expect, it } from 'vitest';
import {
  categoryFromGeneratedWorkoutFocus,
  normalizeWorkoutFocus,
} from '@/utils/workoutCategory';

describe('workout category helpers', () => {
  it('normalizes generated focus labels', () => {
    expect(normalizeWorkoutFocus('Full Body')).toBe('full_body');
    expect(normalizeWorkoutFocus(' Upper-Body ')).toBe('upper_body');
  });

  it('maps generated strength focuses to strength', () => {
    expect(categoryFromGeneratedWorkoutFocus('Full Body')).toBe('strength');
    expect(categoryFromGeneratedWorkoutFocus('Upper Body')).toBe('strength');
    expect(categoryFromGeneratedWorkoutFocus('Lower Body')).toBe('strength');
    expect(categoryFromGeneratedWorkoutFocus('Core')).toBe('strength');
  });

  it('maps cardio-like focuses to cardio and unknown focuses to custom', () => {
    expect(categoryFromGeneratedWorkoutFocus('Cardio')).toBe('cardio');
    expect(categoryFromGeneratedWorkoutFocus('Mobility')).toBe('custom');
  });
});
