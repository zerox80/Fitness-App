const STRENGTH_FOCUS = new Set(['full_body', 'upper_body', 'lower_body', 'core']);
const CARDIO_FOCUS = new Set(['cardio', 'running', 'cycling', 'endurance']);

export function normalizeWorkoutFocus(focus: string) {
  return focus.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function categoryFromGeneratedWorkoutFocus(focus: string) {
  const normalized = normalizeWorkoutFocus(focus);

  if (STRENGTH_FOCUS.has(normalized)) {
    return 'strength';
  }

  if (CARDIO_FOCUS.has(normalized)) {
    return 'cardio';
  }

  return 'custom';
}
