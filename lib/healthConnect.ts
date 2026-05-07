import { Platform } from 'react-native';
import {
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  requestPermission,
  SdkAvailabilityStatus,
  type Permission,
} from 'react-native-health-connect';

const READ_PERMISSIONS: Permission[] = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
];

let didRequestPermissions = false;

export type HealthConnectActivity = {
  steps?: number;
  calories?: number;
};

function samePermission(left: Permission, right: Permission) {
  return left.accessType === right.accessType && left.recordType === right.recordType;
}

function hasPermission(granted: Permission[], permission: Permission) {
  return granted.some((item) => samePermission(item, permission));
}

function todayRange(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  return {
    operator: 'between' as const,
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
}

async function ensureHealthConnectPermissions() {
  const granted = (await getGrantedPermissions()) as Permission[];
  const missing = READ_PERMISSIONS.filter((permission) => !hasPermission(granted, permission));

  if (missing.length === 0) {
    return granted;
  }

  if (didRequestPermissions) {
    return granted;
  }

  didRequestPermissions = true;
  const updated = (await requestPermission(missing)) as Permission[];
  return [...granted, ...updated];
}

export async function readTodayHealthConnectActivity(now = new Date()): Promise<HealthConnectActivity | null> {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      return null;
    }

    const initialized = await initialize();
    if (!initialized) {
      return null;
    }

    const granted = await ensureHealthConnectPermissions();
    const canReadSteps = hasPermission(granted, READ_PERMISSIONS[0]);
    const canReadCalories = hasPermission(granted, READ_PERMISSIONS[1]);

    if (!canReadSteps && !canReadCalories) {
      return null;
    }

    const timeRangeFilter = todayRange(now);
    const [stepsResult, caloriesResult] = await Promise.all([
      canReadSteps
        ? aggregateRecord({ recordType: 'Steps', timeRangeFilter }).catch(() => null)
        : Promise.resolve(null),
      canReadCalories
        ? aggregateRecord({ recordType: 'ActiveCaloriesBurned', timeRangeFilter }).catch(() => null)
        : Promise.resolve(null),
    ]);

    return {
      ...(stepsResult ? { steps: Math.round(stepsResult.COUNT_TOTAL ?? 0) } : {}),
      ...(caloriesResult
        ? { calories: Math.round(caloriesResult.ACTIVE_CALORIES_TOTAL?.inKilocalories ?? 0) }
        : {}),
    };
  } catch {
    return null;
  }
}
