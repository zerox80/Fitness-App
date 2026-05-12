import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

import { ApiError, api, resolveApiBase, setToken } from '@/lib/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

function mockNoContentResponse() {
  return {
    ok: true,
    status: 204,
    json: () => Promise.reject(new Error('no body')),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  setToken(null);
});

afterEach(() => {
  setToken(null);
});

describe('setToken', () => {
  it('sets token for subsequent requests', async () => {
    setToken('my-token');
    mockFetch.mockResolvedValue(mockJsonResponse({ id: '1' }));

    await api.auth.me();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer my-token');
  });

  it('clears auth header when set to null', async () => {
    setToken('my-token');
    setToken(null);
    mockFetch.mockResolvedValue(mockJsonResponse({ id: '1' }));

    await api.auth.me();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });
});

describe('request() — auth headers', () => {
  it('adds Authorization header when token is set', async () => {
    setToken('test-jwt');
    mockFetch.mockResolvedValue(mockJsonResponse({ id: '1', email: 'a@b.com', name: 'A' }));

    await api.auth.me();

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer test-jwt');
  });

  it('omits Authorization header when token is null', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ id: '1', email: 'a@b.com', name: 'A' }));

    await api.auth.me();

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });
});

describe('request() — error handling', () => {
  it('throws with error message from JSON body', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Invalid credentials' }, 401));

    await expect(api.auth.login({ email: 'a@b.com', password: 'bad' })).rejects.toThrow(
      'Invalid credentials'
    );

    mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Invalid credentials' }, 401));
    await expect(api.auth.login({ email: 'a@b.com', password: 'bad' })).rejects.toMatchObject({
      status: 401,
    });
  });

  it('throws ApiError instances with status metadata', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ error: 'Forbidden' }, 403));

    let caughtError: unknown;
    try {
      await api.auth.me();
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ApiError);
    expect((caughtError as ApiError).message).toBe('Forbidden');
    expect((caughtError as ApiError).status).toBe(403);
  });

  it('throws HTTP status when body has no error field', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ message: 'oops' }, 500));

    await expect(api.stats.get()).rejects.toThrow('HTTP 500');
  });

  it('handles non-JSON error response gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(api.stats.get()).rejects.toThrow('Unknown error');
  });
});

describe('request() — 204 No Content', () => {
  it('returns undefined for 204 status', async () => {
    mockFetch.mockResolvedValue(mockNoContentResponse());

    const result = await api.workouts.delete('wo-001');
    expect(result).toBeUndefined();
  });
});

describe('request() — URL construction', () => {
  it('correctly concatenates API_BASE + path', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.workouts.list();

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('/api/workouts');
  });
});

describe('resolveApiBase()', () => {
  it('uses configured API URL when present', () => {
    expect(
      resolveApiBase(
        'web',
        { EXPO_PUBLIC_API_URL: 'https://fit.example.com/api', NODE_ENV: 'production' },
        false
      )
    ).toBe('https://fit.example.com/api');
  });

  it('keeps development fallback URLs for web and Android', () => {
    expect(resolveApiBase('web', {}, true)).toBe('http://localhost:4000/api');
    expect(resolveApiBase('android', {}, true)).toBe('http://10.0.2.2:4000/api');
  });

  it('requires EXPO_PUBLIC_API_URL for production builds', () => {
    expect(() => resolveApiBase('web', { NODE_ENV: 'production' }, true)).toThrow(
      'EXPO_PUBLIC_API_URL is required'
    );
    expect(() => resolveApiBase('android', {}, false)).toThrow('EXPO_PUBLIC_API_URL is required');
  });
});

describe('api.workouts.list()', () => {
  it('builds query string with category param', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.workouts.list({ category: 'strength' });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('category=strength');
  });

  it('builds query string with completed param', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.workouts.list({ completed: true });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('completed=true');
  });

  it('omits params when not provided', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.workouts.list();

    const url = mockFetch.mock.calls[0][0];
    expect(url).not.toContain('?');
  });

  it('combines multiple params', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.workouts.list({ category: 'cardio', completed: false, page: 2, per_page: 50 });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('category=cardio');
    expect(url).toContain('completed=false');
    expect(url).toContain('page=2');
    expect(url).toContain('per_page=50');
  });

  it('listAll fetches workout pages until the final short page', async () => {
    mockFetch
      .mockResolvedValueOnce(mockJsonResponse(Array.from({ length: 100 }, (_, index) => ({ id: `wo-${index}` }))))
      .mockResolvedValueOnce(mockJsonResponse([{ id: 'wo-final' }]));

    const result = await api.workouts.listAll({ completed: true });

    expect(result).toHaveLength(101);
    expect(mockFetch.mock.calls[0][0]).toContain('page=1');
    expect(mockFetch.mock.calls[0][0]).toContain('per_page=100');
    expect(mockFetch.mock.calls[0][0]).toContain('completed=true');
    expect(mockFetch.mock.calls[1][0]).toContain('page=2');
  });
});

describe('api.exercises', () => {
  it('list() builds exercise query params', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.exercises.list({
      muscle_group: 'chest',
      equipment: 'barbell',
      difficulty: 'beginner',
      search: 'press',
      page: 2,
      per_page: 50,
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/exercises?');
    expect(url).toContain('muscle_group=chest');
    expect(url).toContain('equipment=barbell');
    expect(url).toContain('difficulty=beginner');
    expect(url).toContain('search=press');
    expect(url).toContain('page=2');
    expect(url).toContain('per_page=50');
    expect(options.method).toBeUndefined();
  });

  it('get() sends GET to exercise detail endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'ex-001' }));

    await api.exercises.get('ex-001');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/exercises/ex-001');
    expect(options.method).toBeUndefined();
  });
});

describe('api.stats.weekly()', () => {
  it('sends GET to the weekly stats endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ week_start: '2026-05-04' }));

    await api.stats.weekly();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/stats/weekly');
    expect(options.method).toBeUndefined();
  });
});

describe('api.users.profile()', () => {
  it('sends GET to the current user profile endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'user-1' }));

    await api.users.profile();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/users/me');
    expect(options.method).toBeUndefined();
  });
});

describe('api.auth.register()', () => {
  it('sends POST with correct body', async () => {
    const data = { email: 'new@user.com', name: 'New', password: 'pass1234' };
    mockFetch.mockResolvedValue(mockJsonResponse({ token: 'tok', user: { id: '1', ...data, created_at: '' } }));

    await api.auth.register(data);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(data);
  });
});

describe('api.auth.login()', () => {
  it('sends POST with correct body', async () => {
    const data = { email: 'a@b.com', password: 'pass1234' };
    mockFetch.mockResolvedValue(mockJsonResponse({ token: 'tok', user: { id: '1', email: 'a@b.com', name: 'A', created_at: '' } }));

    await api.auth.login(data);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(data);
  });
});

describe('api.workouts.complete()', () => {
  it('sends PUT to correct endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'wo-001' }));

    await api.workouts.complete('wo-001');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/workouts/wo-001/complete');
    expect(options.method).toBe('PUT');
  });
});

describe('api.workouts.get()', () => {
  it('sends GET to the workout detail endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'wo-001', exercises: [] }));

    await api.workouts.get('wo-001');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/workouts/wo-001');
    expect(options.method).toBeUndefined();
  });
});

describe('api.workouts.delete()', () => {
  it('sends DELETE to correct endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ deleted: true }));

    await api.workouts.delete('wo-001');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/workouts/wo-001');
    expect(options.method).toBe('DELETE');
  });
});

describe('api.workouts.deleteAll()', () => {
  it('sends DELETE to the workouts collection endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ deleted: true, count: 2 }));

    await api.workouts.deleteAll();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/workouts');
    expect(url).not.toContain('/workouts/');
    expect(options.method).toBe('DELETE');
  });
});

describe('api.workouts.create()', () => {
  it('sends POST with workout data', async () => {
    const data = {
      title: 'Test Workout',
      duration_minutes: 60,
      intensity: 'high',
      category: 'strength',
      exercises: [
        { name: 'Squat', sets: 3, reps: '10', rest_seconds: 90 },
      ],
    };
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'wo-new', ...data }));

    await api.workouts.create(data);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/workouts');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(data);
  });
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
