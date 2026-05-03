export const MUSCLE_GROUPS = [
  { key: 'chest', label: 'Brust', icon: '💪' },
  { key: 'back', label: 'Rücken', icon: '🏋️' },
  { key: 'shoulders', label: 'Schultern', icon: '🦾' },
  { key: 'biceps', label: 'Bizeps', icon: '💪' },
  { key: 'triceps', label: 'Trizeps', icon: '🦾' },
  { key: 'abs', label: 'Bauch', icon: '🍫' },
  { key: 'legs', label: 'Beine', icon: '🦵' },
  { key: 'glutes', label: 'Gesäß', icon: '🍑' },
  { key: 'calves', label: 'Waden', icon: '🦵' },
  { key: 'forearms', label: 'Unterarme', icon: '💪' },
  { key: 'traps', label: 'Nacken', icon: '🦒' },
  { key: 'lats', label: 'Latissimus', icon: '🏋️' },
  { key: 'hamstrings', label: 'Oberschenkel hinten', icon: '🦵' },
  { key: 'quadriceps', label: 'Oberschenkel vorne', icon: '🦵' },
] as const;

export type MuscleGroupKey = (typeof MUSCLE_GROUPS)[number]['key'];
