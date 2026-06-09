import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: ['lucide-react-native', 'react-native-svg', 'expo-router', 'react-native-reanimated', 'react-native-worklets'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'constants/**/*.{ts,tsx}',
        'data/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'plugins/**/*.js',
        'utils/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        '**/*.types.ts',
        'app-example/**',
        'review-dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
