import { describe, it, expect } from 'vitest';
import {
  formatDistance,
  formatCalories,
  formatHeartRate,
  truncate,
  formatNumber,
  formatCurrency,
  formatDateShort,
} from '@/lib/formatters';

describe('formatDistance', () => {
  it('formats meters under 1000', () => {
    expect(formatDistance(500)).toBe('500 m');
  });

  it('formats meters at 999', () => {
    expect(formatDistance(999)).toBe('999 m');
  });

  it('formats kilometers at 1000', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
  });

  it('formats kilometers over 1000', () => {
    expect(formatDistance(5500)).toBe('5.5 km');
  });

  it('rounds meters', () => {
    expect(formatDistance(550)).toBe('550 m');
  });

  it('formats zero', () => {
    expect(formatDistance(0)).toBe('0 m');
  });

  it('formats large distance', () => {
    expect(formatDistance(42195)).toBe('42.2 km');
  });
});

describe('formatCalories', () => {
  it('formats calories with unit', () => {
    expect(formatCalories(500)).toBe('500 kcal');
  });

  it('rounds calories', () => {
    expect(formatCalories(499.6)).toBe('500 kcal');
  });

  it('formats zero', () => {
    expect(formatCalories(0)).toBe('0 kcal');
  });

  it('formats large value', () => {
    expect(formatCalories(3500)).toBe('3500 kcal');
  });
});

describe('formatHeartRate', () => {
  it('formats bpm with unit', () => {
    expect(formatHeartRate(72)).toBe('72 bpm');
  });

  it('rounds bpm', () => {
    expect(formatHeartRate(72.6)).toBe('73 bpm');
  });

  it('formats zero', () => {
    expect(formatHeartRate(0)).toBe('0 bpm');
  });
});

describe('truncate', () => {
  it('returns string if shorter than max', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('returns string if equal to max', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('Hello World', 5)).toBe('Hell…');
  });

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });

  it('handles max length of 1', () => {
    expect(truncate('Hello', 1)).toBe('…');
  });

  it('handles max length of 2', () => {
    expect(truncate('Hello', 2)).toBe('H…');
  });
});

describe('formatNumber', () => {
  it('formats integer with German locale', () => {
    expect(formatNumber(1234)).toBe('1.234');
  });

  it('formats with decimals', () => {
    expect(formatNumber(1234.56)).toContain('1.234,56');
  });

  it('formats negative number', () => {
    expect(formatNumber(-42)).toContain('42');
  });

  it('formats with custom options', () => {
    const result = formatNumber(1234.5678, { maximumFractionDigits: 1 });
    expect(result).toContain('1.234,6');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatCurrency', () => {
  it('formats EUR by default', () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain('1.234,5');
    expect(result).toContain('€');
  });

  it('formats with custom currency', () => {
    const result = formatCurrency(100, 'USD');
    expect(result).toContain('100');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('formats negative (debt)', () => {
    const result = formatCurrency(-50);
    expect(result).toContain('50');
    expect(result).toContain('€');
  });
});

describe('formatDateShort', () => {
  it('formats Date object', () => {
    const date = new Date(2026, 3, 23); // April 23, 2026
    const result = formatDateShort(date);
    expect(result).toContain('23');
    expect(result).toContain('Apr');
  });

  it('formats date string', () => {
    const result = formatDateShort('2026-04-23T10:00:00Z');
    expect(result).toContain('23');
  });

  it('includes weekday abbreviation', () => {
    const date = new Date(2026, 3, 23); // Thursday
    const result = formatDateShort(date);
    expect(result.length).toBeGreaterThan(5);
  });
});
