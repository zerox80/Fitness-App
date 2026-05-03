export function hexToRgba(hex: string, alpha: number = 1): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lighten(hex: string, amount: number = 0.2): string {
  const sanitized = hex.replace('#', '');
  let r = parseInt(sanitized.substring(0, 2), 16);
  let g = parseInt(sanitized.substring(2, 4), 16);
  let b = parseInt(sanitized.substring(4, 6), 16);

  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function darken(hex: string, amount: number = 0.2): string {
  const sanitized = hex.replace('#', '');
  let r = parseInt(sanitized.substring(0, 2), 16);
  let g = parseInt(sanitized.substring(2, 4), 16);
  let b = parseInt(sanitized.substring(4, 6), 16);

  r = Math.max(0, Math.round(r * (1 - amount)));
  g = Math.max(0, Math.round(g * (1 - amount)));
  b = Math.max(0, Math.round(b * (1 - amount)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
