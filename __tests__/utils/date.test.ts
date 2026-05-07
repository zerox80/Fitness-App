import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatDuration,
  getWeekStart,
  getWeekDays,
  isSameDay,
  addDays,
  startOfDay,
  endOfDay,
  formatDate,
  formatLocalDateKey,
  formatTime,
  formatDateTime,
  formatRelative,
} from '@/utils/date';

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('0:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1:30');
  });

  it('formats hours, minutes, seconds', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats exactly one minute', () => {
    expect(formatDuration(60)).toBe('1:00');
  });

  it('formats exactly one hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
  });

  it('pads single digits', () => {
    expect(formatDuration(65)).toBe('1:05');
  });

  it('handles large values', () => {
    expect(formatDuration(7200)).toBe('2:00:00');
  });
});

describe('getWeekStart', () => {
  it('returns Monday for a Wednesday', () => {
    const wednesday = new Date(2026, 3, 22); // April 22, 2026 is Wednesday
    const result = getWeekStart(wednesday);
    expect(result.getDay()).toBe(1); // Monday
  });

  it('returns same day for Monday', () => {
    const monday = new Date(2026, 3, 20); // April 20, 2026 is Monday
    const result = getWeekStart(monday);
    expect(result.getDate()).toBe(20);
  });

  it('returns Monday for Sunday', () => {
    const sunday = new Date(2026, 3, 26); // April 26, 2026 is Sunday
    const result = getWeekStart(sunday);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(20);
  });

  it('sets time to midnight', () => {
    const date = new Date(2026, 3, 22, 15, 30);
    const result = getWeekStart(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('getWeekDays', () => {
  it('returns 7 days', () => {
    const start = new Date(2026, 3, 20);
    const days = getWeekDays(start);
    expect(days).toHaveLength(7);
  });

  it('starts with the given date', () => {
    const start = new Date(2026, 3, 20);
    const days = getWeekDays(start);
    expect(days[0].getDate()).toBe(20);
  });

  it('ends 6 days later', () => {
    const start = new Date(2026, 3, 20);
    const days = getWeekDays(start);
    expect(days[6].getDate()).toBe(26);
  });

  it('has consecutive days', () => {
    const start = new Date(2026, 3, 20);
    const days = getWeekDays(start);
    for (let i = 1; i < days.length; i++) {
      const diff = days[i].getDate() - days[i - 1].getDate();
      expect(diff).toBe(1);
    }
  });
});

describe('isSameDay', () => {
  it('returns true for same date', () => {
    const a = new Date(2026, 3, 23, 10, 0);
    const b = new Date(2026, 3, 23, 22, 0);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('returns false for different dates', () => {
    const a = new Date(2026, 3, 23);
    const b = new Date(2026, 3, 24);
    expect(isSameDay(a, b)).toBe(false);
  });

  it('returns true for same date with strings', () => {
    expect(isSameDay('2026-04-23T10:00:00', '2026-04-23T22:00:00')).toBe(true);
  });

  it('returns false for different dates with strings', () => {
    expect(isSameDay('2026-04-23T10:00:00', '2026-04-24T10:00:00')).toBe(false);
  });

  it('handles mixed Date and string', () => {
    const date = new Date(2026, 3, 23);
    expect(isSameDay(date, '2026-04-23T15:00:00')).toBe(true);
  });
});

describe('addDays', () => {
  it('adds days correctly', () => {
    const date = new Date(2026, 3, 23);
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(28);
  });

  it('subtracts days with negative number', () => {
    const date = new Date(2026, 3, 23);
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(18);
  });

  it('handles month boundary', () => {
    const date = new Date(2026, 3, 28); // April 28
    const result = addDays(date, 5);
    expect(result.getMonth()).toBe(4); // May
    expect(result.getDate()).toBe(3);
  });

  it('adds zero days', () => {
    const date = new Date(2026, 3, 23);
    const result = addDays(date, 0);
    expect(result.getDate()).toBe(23);
  });
});

describe('startOfDay', () => {
  it('sets time to midnight', () => {
    const date = new Date(2026, 3, 23, 15, 45, 30);
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('preserves date', () => {
    const date = new Date(2026, 3, 23, 15, 45);
    const result = startOfDay(date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(23);
  });
});

describe('endOfDay', () => {
  it('sets time to end of day', () => {
    const date = new Date(2026, 3, 23, 10, 0);
    const result = endOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });

  it('preserves date', () => {
    const date = new Date(2026, 3, 23);
    const result = endOfDay(date);
    expect(result.getDate()).toBe(23);
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-04-23T10:00:00Z');
    expect(result).toContain('23');
    expect(result).toContain('04');
    expect(result).toContain('2026');
  });

  it('formats a Date object', () => {
    const date = new Date(2026, 3, 23);
    const result = formatDate(date);
    expect(result).toContain('23');
  });
});

describe('formatDateTime', () => {
  it('contains date and time parts', () => {
    const result = formatDateTime('2026-04-23T14:30:00Z');
    expect(result).toContain('2026');
    expect(result.length).toBeGreaterThan(10);
  });
});

describe('formatLocalDateKey', () => {
  it('formats the date from local calendar fields', () => {
    const date = new Date(2026, 4, 7, 1, 30, 0);
    expect(formatLocalDateKey(date)).toBe('2026-05-07');
  });

  it('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 2, 12, 0, 0);
    expect(formatLocalDateKey(date)).toBe('2026-01-02');
  });
});

describe('formatRelative', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "gerade eben" for <60s ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 23, 12, 0, 30));
    const date = new Date(2026, 3, 23, 12, 0, 0);
    expect(formatRelative(date)).toBe('gerade eben');
  });

  it('returns "vor X Min." for <60min ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 23, 12, 30, 0));
    const date = new Date(2026, 3, 23, 12, 5, 0);
    expect(formatRelative(date)).toBe('vor 25 Min.');
  });

  it('returns "vor X Std." for <24h ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 23, 18, 0, 0));
    const date = new Date(2026, 3, 23, 14, 0, 0);
    expect(formatRelative(date)).toBe('vor 4 Std.');
  });

  it('returns "vor 1 Tag" (singular) for 1 day ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 24, 12, 0, 0));
    const date = new Date(2026, 3, 23, 12, 0, 0);
    expect(formatRelative(date)).toBe('vor 1 Tag');
  });

  it('returns "vor X Tagen" (plural) for 2-6 days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 28, 12, 0, 0));
    const date = new Date(2026, 3, 23, 12, 0, 0);
    expect(formatRelative(date)).toBe('vor 5 Tagen');
  });

  it('returns formatted date for >=7 days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 1, 12, 0, 0));
    const date = new Date(2026, 3, 20, 12, 0, 0);
    const result = formatRelative(date);
    expect(result).toContain('20');
    expect(result).not.toContain('vor');
  });

  it('handles string input', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 23, 12, 0, 10));
    expect(formatRelative('2026-04-23T12:00:00')).toBe('gerade eben');
  });
});
