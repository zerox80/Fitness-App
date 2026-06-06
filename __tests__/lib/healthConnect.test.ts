import { beforeEach, describe, expect, it, vi } from 'vitest';

const platformState = vi.hoisted(() => ({ OS: 'android' }));
const healthConnectMocks = vi.hoisted(() => ({
  aggregateRecord: vi.fn(),
  getGrantedPermissions: vi.fn(),
  getSdkStatus: vi.fn(),
  initialize: vi.fn(),
  requestPermission: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: platformState,
}));

vi.mock('react-native-health-connect', () => ({
  ...healthConnectMocks,
  SdkAvailabilityStatus: {
    SDK_AVAILABLE: 3,
  },
}));

async function loadHealthConnect() {
  vi.resetModules();
  return import('@/lib/healthConnect');
}

describe('readTodayHealthConnectActivity', () => {
  beforeEach(() => {
    platformState.OS = 'android';
    Object.values(healthConnectMocks).forEach((mock) => mock.mockReset());
    healthConnectMocks.getSdkStatus.mockResolvedValue(3);
    healthConnectMocks.initialize.mockResolvedValue(true);
    healthConnectMocks.getGrantedPermissions.mockResolvedValue([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    ]);
  });

  it('returns null outside Android', async () => {
    platformState.OS = 'web';
    const { readTodayHealthConnectActivity } = await loadHealthConnect();

    await expect(readTodayHealthConnectActivity()).resolves.toBeNull();

    expect(healthConnectMocks.getSdkStatus).not.toHaveBeenCalled();
  });

  it('returns null when the SDK is unavailable or initialization fails', async () => {
    const { readTodayHealthConnectActivity } = await loadHealthConnect();
    healthConnectMocks.getSdkStatus.mockResolvedValueOnce(1);

    await expect(readTodayHealthConnectActivity()).resolves.toBeNull();

    healthConnectMocks.getSdkStatus.mockResolvedValueOnce(3);
    healthConnectMocks.initialize.mockResolvedValueOnce(false);
    await expect(readTodayHealthConnectActivity()).resolves.toBeNull();
  });

  it('aggregates granted steps and calories for today', async () => {
    const { readTodayHealthConnectActivity } = await loadHealthConnect();
    const now = new Date('2026-06-06T10:30:00.000Z');
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    healthConnectMocks.aggregateRecord
      .mockResolvedValueOnce({ COUNT_TOTAL: 1234.4 })
      .mockResolvedValueOnce({ ACTIVE_CALORIES_TOTAL: { inKilocalories: 456.6 } });

    const result = await readTodayHealthConnectActivity(now);

    expect(result).toEqual({ steps: 1234, calories: 457 });
    expect(healthConnectMocks.aggregateRecord).toHaveBeenNthCalledWith(1, {
      recordType: 'Steps',
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: now.toISOString(),
      },
    });
    expect(healthConnectMocks.aggregateRecord).toHaveBeenNthCalledWith(2, {
      recordType: 'ActiveCaloriesBurned',
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: now.toISOString(),
      },
    });
  });

  it('requests missing permissions once and uses granted updates', async () => {
    const { readTodayHealthConnectActivity } = await loadHealthConnect();
    healthConnectMocks.getGrantedPermissions.mockResolvedValue([
      { accessType: 'read', recordType: 'Steps' },
    ]);
    healthConnectMocks.requestPermission.mockResolvedValue([
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    ]);
    healthConnectMocks.aggregateRecord
      .mockResolvedValueOnce({ COUNT_TOTAL: 1000 })
      .mockResolvedValueOnce({ ACTIVE_CALORIES_TOTAL: { inKilocalories: 220 } });

    await expect(readTodayHealthConnectActivity()).resolves.toEqual({
      steps: 1000,
      calories: 220,
    });

    expect(healthConnectMocks.requestPermission).toHaveBeenCalledWith([
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    ]);
  });

  it('returns null when no readable permissions are available after a prior request', async () => {
    const { readTodayHealthConnectActivity } = await loadHealthConnect();
    healthConnectMocks.getGrantedPermissions.mockResolvedValue([]);
    healthConnectMocks.requestPermission.mockResolvedValue([]);

    await expect(readTodayHealthConnectActivity()).resolves.toBeNull();
    await expect(readTodayHealthConnectActivity()).resolves.toBeNull();

    expect(healthConnectMocks.requestPermission).toHaveBeenCalledTimes(1);
    expect(healthConnectMocks.aggregateRecord).not.toHaveBeenCalled();
  });

  it('returns partial data when one aggregation fails and null on outer failures', async () => {
    const { readTodayHealthConnectActivity } = await loadHealthConnect();
    healthConnectMocks.aggregateRecord
      .mockRejectedValueOnce(new Error('steps unavailable'))
      .mockResolvedValueOnce({ ACTIVE_CALORIES_TOTAL: { inKilocalories: 180 } });

    await expect(readTodayHealthConnectActivity()).resolves.toEqual({ calories: 180 });

    healthConnectMocks.getSdkStatus.mockRejectedValueOnce(new Error('boom'));
    await expect(readTodayHealthConnectActivity()).resolves.toBeNull();
  });
});
