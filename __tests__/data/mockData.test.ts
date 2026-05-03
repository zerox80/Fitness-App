import { describe, it, expect } from 'vitest';
import { defaultExercises } from '@/data/mockExercises';
import { mockWorkouts } from '@/data/mockWorkouts';

describe('defaultExercises', () => {
  it('is not empty', () => {
    expect(defaultExercises.length).toBeGreaterThan(0);
  });

  it('has unique IDs', () => {
    const ids = defaultExercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each exercise has a name', () => {
    for (const ex of defaultExercises) {
      expect(ex.name.length).toBeGreaterThan(0);
    }
  });

  it('each exercise has at least one muscle group', () => {
    for (const ex of defaultExercises) {
      expect(ex.muscleGroups.length).toBeGreaterThan(0);
    }
  });

  it('each exercise has at least one equipment', () => {
    for (const ex of defaultExercises) {
      expect(ex.equipment.length).toBeGreaterThan(0);
    }
  });

  it('each exercise has a valid difficulty', () => {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    for (const ex of defaultExercises) {
      expect(validDifficulties).toContain(ex.difficulty);
    }
  });

  it('has proper IDs format', () => {
    for (const ex of defaultExercises) {
      expect(ex.id).toMatch(/^ex-\d+$/);
    }
  });

  it('all are not custom', () => {
    for (const ex of defaultExercises) {
      expect(ex.isCustom).toBe(false);
    }
  });
});

describe('mockWorkouts', () => {
  it('is not empty', () => {
    expect(mockWorkouts.length).toBeGreaterThan(0);
  });

  it('has unique IDs', () => {
    const ids = mockWorkouts.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each workout has a title', () => {
    for (const w of mockWorkouts) {
      expect(w.title.length).toBeGreaterThan(0);
    }
  });

  it('each workout has a valid type', () => {
    const validTypes = ['strength', 'cardio', 'hiit', 'flexibility', 'sport', 'custom'];
    for (const w of mockWorkouts) {
      expect(validTypes).toContain(w.type);
    }
  });

  it('each workout has a valid status', () => {
    const validStatuses = ['planned', 'in_progress', 'completed', 'cancelled'];
    for (const w of mockWorkouts) {
      expect(validStatuses).toContain(w.status);
    }
  });

  it('completed workouts have completedAt', () => {
    for (const w of mockWorkouts) {
      if (w.status === 'completed') {
        expect(w.completedAt).toBeDefined();
      }
    }
  });

  it('each workout has exercises array', () => {
    for (const w of mockWorkouts) {
      expect(Array.isArray(w.exercises)).toBe(true);
    }
  });

  it('each workout exercise has sets', () => {
    for (const w of mockWorkouts) {
      for (const ex of w.exercises) {
        expect(Array.isArray(ex.sets)).toBe(true);
        expect(ex.sets.length).toBeGreaterThan(0);
      }
    }
  });

  it('each set has valid structure', () => {
    for (const w of mockWorkouts) {
      for (const ex of w.exercises) {
        for (const s of ex.sets) {
          expect(s.id).toBeDefined();
          expect(typeof s.setNumber).toBe('number');
          expect(typeof s.isWarmup).toBe('boolean');
          expect(typeof s.isDropset).toBe('boolean');
          expect(typeof s.isFailure).toBe('boolean');
          expect(typeof s.completed).toBe('boolean');
        }
      }
    }
  });

  it('has proper IDs format', () => {
    for (const w of mockWorkouts) {
      expect(w.id).toMatch(/^wo-\d+$/);
    }
  });

  it('completed workouts have duration', () => {
    for (const w of mockWorkouts) {
      if (w.status === 'completed') {
        expect(w.durationSeconds).toBeDefined();
        expect(w.durationSeconds!).toBeGreaterThan(0);
      }
    }
  });

  it('exercise references point to valid exercises', () => {
    const exerciseIds = new Set(defaultExercises.map((e) => e.id));
    for (const w of mockWorkouts) {
      for (const we of w.exercises) {
        expect(exerciseIds.has(we.exerciseId)).toBe(true);
      }
    }
  });
});
