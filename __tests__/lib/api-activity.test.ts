import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import { api, setToken } from '@/lib/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  setToken(null);
});

afterEach(() => {
  setToken(null);
});

describe('api.activity', () => {
  it('today() sends GET to /activity/today', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ steps: 5000 }));

    await api.activity.today();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/activity/today');
    expect(options.method).toBeUndefined();
  });

  it('today() includes date query when provided', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ steps: 5000 }));

    await api.activity.today({ date: '2026-05-07' });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/activity/today?date=2026-05-07');
    expect(options.method).toBeUndefined();
  });

  it('update() sends PUT with data', async () => {
    const data = {
      steps: 8000,
      calories: 400,
      active_minutes: 45,
      move_progress: 0.8,
      exercise_progress: 0.6,
      stand_progress: 0.7,
    };
    mockFetch.mockResolvedValue(mockJsonResponse(data));

    await api.activity.update(data);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual(data);
  });

  it('update() includes date query when provided', async () => {
    const data = {
      steps: 8000,
      calories: 400,
      active_minutes: 45,
      move_progress: 0.8,
      exercise_progress: 0.6,
      stand_progress: 0.7,
    };
    mockFetch.mockResolvedValue(mockJsonResponse(data));

    await api.activity.update(data, { date: '2026-05-07' });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/activity/today?date=2026-05-07');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual(data);
  });

  it('estimateCalories() sends chat request to calorie endpoint', async () => {
    const data = {
      date: '2026-05-07',
      messages: [{ role: 'user' as const, content: '45 Minuten joggen' }],
    };
    mockFetch.mockResolvedValue(mockJsonResponse({
      status: 'estimated',
      reply: 'Das waren etwa 420 kcal.',
      estimate: {
        total_calories: 420,
        active_minutes: 45,
        confidence: 0.8,
        activities: [],
      },
    }));

    await api.activity.estimateCalories(data);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/activity/calorie-chat');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(data);
  });

  it('entries.list() includes date query when provided', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.activity.entries.list({ date: '2026-05-07' });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/activity/entries?date=2026-05-07');
    expect(options.method).toBeUndefined();
  });

  it('entries.create() sends additional activity entries', async () => {
    const data = {
      date: '2026-05-07',
      entries: [
        {
          name: 'Joggen',
          duration_minutes: 45,
          intensity: 'mittel',
          calories: 420,
          source: 'ai',
        },
      ],
    };
    mockFetch.mockResolvedValue(mockJsonResponse({ activity: {}, entries: [] }));

    await api.activity.entries.create(data);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/activity/entries');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(data);
  });

  it('entries.delete() sends DELETE to the entry endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ activity: {}, entries: [] }));

    await api.activity.entries.delete('ae-001');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/activity/entries/ae-001');
    expect(options.method).toBe('DELETE');
  });
});
