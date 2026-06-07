import { describe, expect, it } from 'vitest';

import { absoluteFill } from '@/utils/styles';

describe('styles utility', () => {
  it('returns a frozen absolute positioning object', () => {
    expect(absoluteFill).toEqual({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('keeps numeric zero values for each inset', () => {
    expect(absoluteFill.top).toBe(0);
    expect(absoluteFill.right).toBe(0);
    expect(absoluteFill.bottom).toBe(0);
    expect(absoluteFill.left).toBe(0);
  });
});
