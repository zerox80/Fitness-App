// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const materialIconCaptured = vi.hoisted(() => ({ name: null as string | null }));

vi.mock('react-native', () => ({}));

vi.mock('@expo/vector-icons/MaterialIcons', () => ({
  __esModule: true,
  default: ({ name, size, color, style }: any) => {
    materialIconCaptured.name = name;
    return <span data-size={size} data-color={color} data-style={JSON.stringify(style ?? null)} />;
  },
}));

vi.mock('expo-symbols', () => ({
  SymbolWeight: { Regular: 'regular', Medium: 'medium', Bold: 'bold' },
}));

import { IconSymbol } from '@/components/ui/icon-symbol';

describe('IconSymbol (web fallback)', () => {
  afterEach(() => {
    cleanup();
    materialIconCaptured.name = null;
  });

  it('maps the "house.fill" SF symbol to the "home" Material icon', () => {
    render(<IconSymbol name="house.fill" size={20} color="#000" />);
    expect(materialIconCaptured.name).toBe('home');
  });

  it('forwards size, color, and style to the Material icon', () => {
    const utils = render(<IconSymbol name="chevron.right" size={32} color="#abc" style={{ margin: 4 }} />);

    const node = utils.container.querySelector('span') as HTMLElement;
    expect(node.getAttribute('data-size')).toBe('32');
    expect(node.getAttribute('data-color')).toBe('#abc');
    expect(JSON.parse(node.getAttribute('data-style') ?? 'null')).toEqual({ margin: 4 });
  });

  it('maps "paperplane.fill" to "send"', () => {
    render(<IconSymbol name="paperplane.fill" size={16} color="#fff" />);
    expect(materialIconCaptured.name).toBe('send');
  });

  it('maps "chevron.left.forwardslash.chevron.right" to "code"', () => {
    render(<IconSymbol name="chevron.left.forwardslash.chevron.right" size={16} color="#fff" />);
    expect(materialIconCaptured.name).toBe('code');
  });
});
