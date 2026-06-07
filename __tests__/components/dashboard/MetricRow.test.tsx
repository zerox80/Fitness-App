// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, ...rest } = props;
    void style;
    return rest;
  }

  return {
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('lucide-react-native', () => ({
  Flame: () => null,
  Footprints: () => null,
  PersonStanding: () => null,
  Timer: () => null,
  Heart: () => null,
  Activity: () => null,
  Bike: () => null,
  Dumbbell: () => null,
  Home: () => null,
  User: () => null,
  Utensils: () => null,
  Target: () => null,
  ChevronRight: () => null,
  Settings: () => null,
  CalendarDays: () => null,
  Zap: () => null,
  Trophy: () => null,
  TrendingUp: () => null,
  Shield: () => null,
  Bell: () => null,
  Mail: () => null,
  Lock: () => null,
  X: () => null,
  Check: () => null,
  Apple: () => null,
  ListChecks: () => null,
  Repeat: () => null,
  Trash2: () => null,
  ArrowRight: () => null,
  ArrowLeft: () => null,
  Plus: () => null,
  ClipboardList: () => null,
  Play: () => null,
  Eye: () => null,
  HeartPulse: () => null,
}));

vi.mock('./dashboard.styles', () => ({
  styles: {
    metricRow: { flexDirection: 'row' },
    compactMetricRow: { paddingVertical: 4 },
    metricIcon: { padding: 8 },
    compactMetricIcon: { padding: 4 },
    metricLabel: { fontSize: 12 },
    compactMetricLabel: { fontSize: 11 },
    metricValue: { fontSize: 18, fontWeight: '800' },
    compactMetricValue: { fontSize: 16 },
    metricUnit: { fontSize: 12 },
    compactMetricUnit: { fontSize: 11 },
  },
}));

import { MetricRow } from '@/components/dashboard/MetricRow';
import { Flame } from 'lucide-react-native';

describe('MetricRow', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the label, value, and unit', () => {
    render(
      <MetricRow
        icon={Flame}
        iconColor="#65BE20"
        iconFill="#65BE20"
        label="Kalorien"
        value={320}
        unit="kcal"
        softColor="#e5f3ee"
      />
    );
    expect(screen.getByText('Kalorien')).toBeTruthy();
    expect(screen.getByText('320')).toBeTruthy();
    expect(screen.getByText('kcal')).toBeTruthy();
  });

  it('accepts a string value', () => {
    render(
      <MetricRow
        icon={Flame}
        iconColor="#65BE20"
        label="Strecke"
        value="5,2"
        unit="km"
        softColor="#e5f3ee"
      />
    );
    expect(screen.getByText('5,2')).toBeTruthy();
  });
});
