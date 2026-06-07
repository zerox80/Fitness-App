// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

const hapticsMocks = vi.hoisted(() => ({
  impactAsync: vi.fn(),
}));

vi.mock('expo-router/react-navigation', () => ({
  PlatformPressable: ({ onPressIn, children, ...props }: any) => (
    <button data-testid="platform-pressable" onClick={(e) => onPressIn?.(e)} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('expo-haptics', () => ({
  impactAsync: hapticsMocks.impactAsync,
  ImpactFeedbackStyle: { Light: 'light' },
}));

import { HapticTab } from '@/components/haptic-tab';

function setExpoOS(value: 'ios' | 'android' | 'web') {
  Object.defineProperty(process, 'env', {
    value: { ...process.env, EXPO_OS: value },
    configurable: true,
  });
}

describe('HapticTab', () => {
  afterEach(() => {
    cleanup();
    hapticsMocks.impactAsync.mockReset();
  });

  it('does not trigger haptics on non-iOS platforms', () => {
    setExpoOS('android');
    const { getByTestId } = render(<HapticTab>tab</HapticTab>);
    fireEvent.click(getByTestId('platform-pressable'));
    expect(hapticsMocks.impactAsync).not.toHaveBeenCalled();
  });

  it('triggers haptics on iOS but skips them on Android', () => {
    setExpoOS('ios');
    const { getByTestId } = render(<HapticTab>tab</HapticTab>);
    fireEvent.click(getByTestId('platform-pressable'));
    expect(hapticsMocks.impactAsync).toHaveBeenCalledWith('light');
  });

  it('forwards the original onPressIn handler from the caller', () => {
    setExpoOS('web');
    const callerHandler = vi.fn();

    const { getByTestId } = render(<HapticTab onPressIn={callerHandler}>tab</HapticTab>);
    fireEvent.click(getByTestId('platform-pressable'));

    expect(callerHandler).toHaveBeenCalled();
  });
});
