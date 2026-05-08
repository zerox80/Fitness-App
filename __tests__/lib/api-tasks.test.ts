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
  setToken('test-token');
});

afterEach(() => {
  setToken(null);
});

describe('api.tasks.list()', () => {
  it('sends GET to /tasks', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.tasks.list();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks');
    expect(options.method).toBeUndefined();
  });
});

describe('api.tasks.today()', () => {
  it('sends GET to /tasks/today', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.tasks.today();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/today');
    expect(options.method).toBeUndefined();
  });

  it('includes date query when provided', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));

    await api.tasks.today({ date: '2026-05-07' });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/today?date=2026-05-07');
    expect(options.method).toBeUndefined();
  });
});

describe('api.tasks.get()', () => {
  it('sends GET to /tasks/{id}', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'task-1' }));

    await api.tasks.get('task-1');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1');
    expect(options.method).toBeUndefined();
  });
});

describe('api.tasks.create()', () => {
  it('sends POST with task data', async () => {
    const data = {
      title: '30 Minuten joggen',
      recurrence: 'daily' as const,
      category: 'workout' as const,
    };
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'task-new', ...data }));

    await api.tasks.create(data);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(data);
  });

  it('sends custom_days when recurrence is custom', async () => {
    const data = {
      title: 'Yoga',
      recurrence: 'custom' as const,
      custom_days: [1, 3, 5],
      category: 'habit' as const,
    };
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'task-new', ...data }));

    await api.tasks.create(data);

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.custom_days).toEqual([1, 3, 5]);
  });
});

describe('api.tasks.update()', () => {
  it('sends PUT with update data', async () => {
    const data = { title: 'Neuer Titel' };
    mockFetch.mockResolvedValue(mockJsonResponse({ id: 'task-1', title: 'Neuer Titel' }));

    await api.tasks.update('task-1', data);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual(data);
  });
});

describe('api.tasks.delete()', () => {
  it('sends DELETE to correct endpoint', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ deleted: true }));

    await api.tasks.delete('task-1');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1');
    expect(options.method).toBe('DELETE');
  });
});

describe('api.tasks.toggle()', () => {
  it('sends PUT to /tasks/{id}/toggle', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ completed: true }));

    await api.tasks.toggle('task-1');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1/toggle');
    expect(options.method).toBe('PUT');
  });

  it('includes date query when provided', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ completed: true }));

    await api.tasks.toggle('task-1', { date: '2026-05-07' });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1/toggle?date=2026-05-07');
    expect(options.method).toBe('PUT');
  });
});

describe('api.tasks.incrementSet()', () => {
  it('sends POST to /tasks/{id}/increment-set', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ completed_sets: 2 }));

    await api.tasks.incrementSet('task-1');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1/increment-set');
    expect(options.method).toBe('POST');
  });

  it('includes date query when provided', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ completed_sets: 2 }));

    await api.tasks.incrementSet('task-1', { date: '2026-05-07' });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1/increment-set?date=2026-05-07');
    expect(options.method).toBe('POST');
  });
});

describe('api.tasks.completions()', () => {
  it('sends GET to /tasks/{id}/completions', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse(['2026-04-23', '2026-04-22']));

    await api.tasks.completions('task-1');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/tasks/task-1/completions');
    expect(options.method).toBeUndefined();
  });
});
