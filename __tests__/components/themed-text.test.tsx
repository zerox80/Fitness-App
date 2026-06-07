// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, ...rest } = props;
    return rest;
  }

  return {
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
  };
});

vi.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

vi.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#17212b',
}));

import { ThemedText } from '@/components/themed-text';

describe('ThemedText', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children with the default style', () => {
    render(<ThemedText>Hallo Welt</ThemedText>);

    const el = screen.getByText('Hallo Welt');
    expect(el.tagName).toBe('SPAN');
  });

  it('applies the title preset when type="title"', () => {
    render(<ThemedText type="title">Titel</ThemedText>);

    expect(screen.getByText('Titel')).toBeTruthy();
  });

  it('applies the link preset when type="link"', () => {
    render(<ThemedText type="link">Link</ThemedText>);

    expect(screen.getByText('Link')).toBeTruthy();
  });

  it('applies the subtitle preset when type="subtitle"', () => {
    render(<ThemedText type="subtitle">Sub</ThemedText>);

    expect(screen.getByText('Sub')).toBeTruthy();
  });

  it('applies the defaultSemiBold preset when type="defaultSemiBold"', () => {
    render(<ThemedText type="defaultSemiBold">Fett</ThemedText>);

    expect(screen.getByText('Fett')).toBeTruthy();
  });
});
