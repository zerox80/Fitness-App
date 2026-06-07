// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

vi.mock('react-native', () => ({
  View: ({ children, style, ...rest }: any) => (
    <div data-style={JSON.stringify(style ?? null)} {...rest}>
      {children}
    </div>
  ),
}));

import { BottomSpacer } from '@/components/layout/BottomSpacer';

describe('BottomSpacer', () => {
  afterEach(() => {
    cleanup();
  });

  it('uses the default height when none is provided', () => {
    const { container } = render(<BottomSpacer />);

    const node = container.querySelector('div') as HTMLElement | null;
    expect(node).toBeTruthy();
    const style = JSON.parse(node!.getAttribute('data-style') ?? 'null') as { height: number } | null;
    expect(style?.height).toBe(40);
  });

  it('honors a custom height', () => {
    const { container } = render(<BottomSpacer height={120} />);

    const node = container.querySelector('div') as HTMLElement | null;
    const style = JSON.parse(node!.getAttribute('data-style') ?? 'null') as { height: number } | null;
    expect(style?.height).toBe(120);
  });
});
