import { describe, it, expect } from 'vitest';
import { hexToRgba, lighten, darken } from '@/utils/colors';

describe('hexToRgba', () => {
  it('converts hex to rgba with default alpha', () => {
    expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)');
  });

  it('converts hex to rgba with custom alpha', () => {
    expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('handles hex without hash', () => {
    expect(hexToRgba('00ff00')).toBe('rgba(0, 255, 0, 1)');
  });

  it('converts black', () => {
    expect(hexToRgba('#000000')).toBe('rgba(0, 0, 0, 1)');
  });

  it('converts white', () => {
    expect(hexToRgba('#ffffff')).toBe('rgba(255, 255, 255, 1)');
  });

  it('handles zero alpha', () => {
    expect(hexToRgba('#0000ff', 0)).toBe('rgba(0, 0, 255, 0)');
  });

  it('converts mixed color', () => {
    expect(hexToRgba('#3366cc')).toBe('rgba(51, 102, 204, 1)');
  });
});

describe('lighten', () => {
  it('lightens a color by default amount', () => {
    const result = lighten('#808080');
    expect(result).toBe('#999999');
  });

  it('lightens with custom amount', () => {
    const result = lighten('#000000', 0.5);
    expect(result).toBe('#808080');
  });

  it('does not exceed 255', () => {
    const result = lighten('#ffffff', 0.5);
    expect(result).toBe('#ffffff');
  });

  it('lightens black to gray at 0.5', () => {
    const result = lighten('#000000', 0.5);
    expect(result).toBe('#808080');
  });

  it('lightens with amount 1 returns white', () => {
    const result = lighten('#808080', 1);
    expect(result).toBe('#ffffff');
  });

  it('lightens with amount 0 returns same', () => {
    const result = lighten('#808080', 0);
    expect(result).toBe('#808080');
  });

  it('handles hex without hash', () => {
    const result = lighten('808080', 0.5);
    expect(result).toBe('#c0c0c0');
  });
});

describe('darken', () => {
  it('darkens a color by default amount', () => {
    const result = darken('#808080');
    expect(result).toBe('#666666');
  });

  it('darkens with custom amount', () => {
    const result = darken('#ffffff', 0.5);
    expect(result).toBe('#808080');
  });

  it('does not go below 0', () => {
    const result = darken('#000000', 0.5);
    expect(result).toBe('#000000');
  });

  it('darkens with amount 1 returns black', () => {
    const result = darken('#ffffff', 1);
    expect(result).toBe('#000000');
  });

  it('darkens with amount 0 returns same', () => {
    const result = darken('#808080', 0);
    expect(result).toBe('#808080');
  });

  it('handles hex without hash', () => {
    const result = darken('ffffff', 0.5);
    expect(result).toBe('#808080');
  });
});
