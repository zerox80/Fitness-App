// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

vi.mock('react-native', () => ({}));

vi.mock('expo-symbols', () => ({
  SymbolView: ({ name, tintColor, weight, resizeMode, style }: any) => (
    <span
      data-name={name}
      data-tint={tintColor}
      data-weight={weight}
      data-resize={resizeMode}
      data-style={JSON.stringify(style ?? null)}
    />
  ),
  SymbolWeight: { Regular: 'regular', Medium: 'medium', Bold: 'bold' },
}));

import { IconSymbol } from '@/components/ui/icon-symbol.ios';

describe('IconSymbol (iOS)', () => {
  afterEach(() => {
    cleanup();
  });

  it('forwards size, color, weight, and style to the native SymbolView', () => {
    const { container } = render(
      <IconSymbol
        name="house.fill"
        size={28}
        color="#000"
        weight="bold"
        style={{ marginTop: 4 }}
      />
    );

    const node = container.querySelector('span') as HTMLElement;
    expect(node.getAttribute('data-name')).toBe('house.fill');
    expect(node.getAttribute('data-tint')).toBe('#000');
    expect(node.getAttribute('data-weight')).toBe('bold');
    expect(node.getAttribute('data-resize')).toBe('scaleAspectFit');
  });

  it('falls back to a 24x24 box when no size is provided', () => {
    const { container } = render(<IconSymbol name="chevron.right" color="#fff" weight="medium" />);

    const node = container.querySelector('span') as HTMLElement;
    const style = JSON.parse(node.getAttribute('data-style') ?? 'null') as
      | Array<{ width: number; height: number } | null>
      | null;
    expect(Array.isArray(style)).toBe(true);
    expect(style?.[0]).toEqual({ width: 24, height: 24 });
  });
});
