// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('react-native', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');

  function cleanProps(props: Record<string, unknown>) {
    const { style, activeOpacity, ...rest } = props;
    void style;
    void activeOpacity;
    return rest;
  }

  return {
    StyleSheet: { create: (styles: unknown) => styles },
    Text: ({ children, ...props }: any) =>
      ReactActual.createElement('span', cleanProps(props), children),
    TouchableOpacity: ({ children, onPress, ...props }: any) =>
      ReactActual.createElement(
        'button',
        { ...cleanProps(props), onClick: onPress, type: 'button' },
        children
      ),
    View: ({ children, ...props }: any) =>
      ReactActual.createElement('div', cleanProps(props), children),
  };
});

vi.mock('@/constants/Colors', () => ({
  Colors: {
    primary: '#178864',
    card: '#fff',
    text: '#17212b',
    textMuted: '#6f7782',
    borderSoft: '#e9eef1',
  },
}));

import { SegmentedControl } from '@/components/forms/SegmentedControl';

describe('SegmentedControl', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a button for each option', () => {
    render(
      <SegmentedControl
        options={[
          { label: 'Tag', value: 'day' },
          { label: 'Woche', value: 'week' },
        ]}
        value="day"
        onChange={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: 'Tag' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Woche' })).toBeTruthy();
  });

  it('calls onChange with the new value when an option is clicked', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={[
          { label: 'Tag', value: 'day' },
          { label: 'Woche', value: 'week' },
        ]}
        value="day"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Woche' }));
    expect(onChange).toHaveBeenCalledWith('week');
  });
});
