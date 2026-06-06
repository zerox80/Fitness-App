import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'app/(tabs)/profile.{ts,tsx}',
        'app/(tabs)/tasks.{ts,tsx}',
        'components/activity/CalorieChatCard.{ts,tsx}',
        'components/cards/TaskCard.{ts,tsx}',
        'components/forms/TaskForm.{ts,tsx}',
        'constants/muscleGroups.{ts,tsx}',
        'data/**/*.{ts,tsx}',
        'hooks/useDebounce.{ts,tsx}',
        'hooks/useExercises.{ts,tsx}',
        'hooks/useLocalState.{ts,tsx}',
        'hooks/useStats.{ts,tsx}',
        'hooks/useWorkouts.{ts,tsx}',
        'lib/api.{ts,tsx}',
        'lib/auth-context.{ts,tsx}',
        'lib/formatters.{ts,tsx}',
        'lib/storage.{ts,tsx}',
        'plugins/**/*.js',
        'utils/activityMerge.{ts,tsx}',
        'utils/colors.{ts,tsx}',
        'utils/date.{ts,tsx}',
        'utils/numbers.{ts,tsx}',
        'utils/taskProgress.{ts,tsx}',
        'utils/validation.{ts,tsx}',
        'utils/workoutCategory.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        'app-example/**',
        'review-dist/**',
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
        perFile: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
