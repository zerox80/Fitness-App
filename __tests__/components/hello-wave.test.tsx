// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { Text: ({ children, ...props }: any) => <span {...props}>{children}</span> },
}));

import { HelloWave } from '@/components/hello-wave';

describe('HelloWave', () => {
  it('renders the waving emoji', () => {
    render(<HelloWave />);

    expect(screen.getByText('\u{1F44B}')).toBeTruthy();
  });
});
