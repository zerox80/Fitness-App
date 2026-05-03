import { describe, it, expect } from 'vitest';
import {
  round,
  clamp,
  formatWeight,
  formatPercentage,
  calculate1RM,
  calculateBMI,
  calculateVolume,
  calculateTrend,
} from '@/utils/numbers';

describe('round', () => {
  it('rounds to 2 decimals by default', () => {
    expect(round(3.456)).toBe(3.46);
  });

  it('rounds to specified decimals', () => {
    expect(round(3.456, 1)).toBe(3.5);
  });

  it('rounds to 0 decimals', () => {
    expect(round(3.5, 0)).toBe(4);
  });

  it('handles negative numbers', () => {
    expect(round(-3.456, 2)).toBe(-3.46);
  });

  it('handles whole numbers', () => {
    expect(round(5, 2)).toBe(5);
  });

  it('handles zero', () => {
    expect(round(0, 2)).toBe(0);
  });

  it('handles very small numbers', () => {
    expect(round(0.001, 2)).toBe(0);
  });

  it('handles rounding edge case', () => {
    expect(round(2.5, 0)).toBe(3);
  });
});

describe('clamp', () => {
  it('returns value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('works with negative range', () => {
    expect(clamp(0, -10, -5)).toBe(-5);
  });

  it('works with single point range', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('works with floats', () => {
    expect(clamp(0.5, 0.0, 1.0)).toBe(0.5);
  });
});

describe('formatWeight', () => {
  it('formats weight with unit', () => {
    expect(formatWeight(75.5)).toBe('75.5 kg');
  });

  it('rounds to 1 decimal', () => {
    expect(formatWeight(75.56)).toBe('75.6 kg');
  });

  it('handles zero', () => {
    expect(formatWeight(0)).toBe('0 kg');
  });

  it('handles whole numbers', () => {
    expect(formatWeight(80)).toBe('80 kg');
  });
});

describe('formatPercentage', () => {
  it('formats percentage with default decimals', () => {
    expect(formatPercentage(75.5)).toBe('75.5%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercentage(75.567, 2)).toBe('75.57%');
  });

  it('handles zero', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('handles 100%', () => {
    expect(formatPercentage(100)).toBe('100%');
  });
});

describe('calculate1RM', () => {
  it('calculates 1RM using Epley formula', () => {
    expect(calculate1RM(100, 10)).toBe(133.3);
  });

  it('returns weight for 1 rep', () => {
    expect(calculate1RM(100, 1)).toBe(103.3);
  });

  it('returns 0 for zero weight', () => {
    expect(calculate1RM(0, 10)).toBe(0);
  });

  it('returns 0 for zero reps', () => {
    expect(calculate1RM(100, 0)).toBe(0);
  });

  it('returns 0 for negative weight', () => {
    expect(calculate1RM(-100, 10)).toBe(0);
  });

  it('returns 0 for negative reps', () => {
    expect(calculate1RM(100, -5)).toBe(0);
  });

  it('handles light weight', () => {
    expect(calculate1RM(20, 12)).toBe(28);
  });
});

describe('calculateBMI', () => {
  it('calculates BMI correctly', () => {
    expect(calculateBMI(80, 180)).toBe(24.7);
  });

  it('returns 0 for zero height', () => {
    expect(calculateBMI(80, 0)).toBe(0);
  });

  it('returns 0 for negative height', () => {
    expect(calculateBMI(80, -170)).toBe(0);
  });

  it('handles low weight', () => {
    expect(calculateBMI(50, 170)).toBe(17.3);
  });

  it('handles high weight', () => {
    expect(calculateBMI(120, 180)).toBe(37);
  });
});

describe('calculateVolume', () => {
  it('calculates total volume', () => {
    const sets = [
      { weightKg: 100, reps: 10 },
      { weightKg: 80, reps: 8 },
    ];
    expect(calculateVolume(sets)).toBe(1640);
  });

  it('returns 0 for empty sets', () => {
    expect(calculateVolume([])).toBe(0);
  });

  it('skips sets without weight', () => {
    const sets = [{ reps: 10 }, { weightKg: 80, reps: 8 }];
    expect(calculateVolume(sets as any)).toBe(640);
  });

  it('skips sets without reps', () => {
    const sets = [{ weightKg: 100 }, { weightKg: 80, reps: 8 }];
    expect(calculateVolume(sets as any)).toBe(640);
  });

  it('handles zero weight', () => {
    const sets = [{ weightKg: 0, reps: 10 }];
    expect(calculateVolume(sets)).toBe(0);
  });

  it('handles bodyweight sets', () => {
    const sets = [
      { weightKg: 0, reps: 15 },
      { weightKg: 100, reps: 5 },
    ];
    expect(calculateVolume(sets)).toBe(500);
  });
});

describe('calculateTrend', () => {
  it('returns stable for single value', () => {
    expect(calculateTrend([100])).toBe('stable');
  });

  it('returns stable for empty array', () => {
    expect(calculateTrend([])).toBe('stable');
  });

  it('returns up for increasing trend', () => {
    expect(calculateTrend([10, 20, 30, 40, 50])).toBe('up');
  });

  it('returns down for decreasing trend', () => {
    expect(calculateTrend([50, 40, 30, 20, 10])).toBe('down');
  });

  it('returns stable for flat values', () => {
    expect(calculateTrend([10, 10, 10, 10, 10])).toBe('stable');
  });

  it('returns up for slight increase', () => {
    expect(calculateTrend([100, 100, 100, 101, 102, 103])).toBe('up');
  });

  it('handles two values', () => {
    expect(calculateTrend([10, 20])).toBe('up');
  });

  it('handles negative values', () => {
    expect(calculateTrend([-50, -40, -30, -20, -10])).toBe('up');
  });
});
