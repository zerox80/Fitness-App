// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    text: '#17212b',
    textMuted: '#6f7782',
  },
}));

import { ScreenHeader } from '@/components/layout/ScreenHeader';

describe('ScreenHeader', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the title and, if given, a subtitle', () => {
    render(<ScreenHeader title="Übersicht" subtitle="Dein Tag" />);

    expect(screen.getByText('Übersicht')).toBeTruthy();
    expect(screen.getByText('Dein Tag')).toBeTruthy();
  });

  it('omits the subtitle when none is provided', () => {
    render(<ScreenHeader title="Nur Titel" />);

    expect(screen.getByText('Nur Titel')).toBeTruthy();
    expect(screen.queryByText('Dein Tag')).toBeNull();
  });
});
