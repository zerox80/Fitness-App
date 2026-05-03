export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatWeight(kg: number): string {
  return `${round(kg, 1)} kg`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${round(value, decimals)}%`;
}

export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  // Epley formula
  return round(weightKg * (1 + reps / 30), 1);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return round(weightKg / (heightM * heightM), 1);
}

export function calculateVolume(sets: { weightKg?: number; reps?: number }[]): number {
  return sets.reduce((total, set) => {
    if (!set.weightKg || !set.reps) return total;
    return total + set.weightKg * set.reps;
  }, 0);
}

export function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  const recent = values.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const previous = values.slice(0, -1);
  const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

  const diff = avg - prevAvg;
  if (Math.abs(diff) < 0.01) return 'stable';
  return diff > 0 ? 'up' : 'down';
}
