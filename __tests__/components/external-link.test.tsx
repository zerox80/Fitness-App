// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const browserMocks = vi.hoisted(() => ({
  openBrowserAsync: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

vi.mock('expo-router', () => ({
  Link: ({ children, href, onPress, target, ...rest }: any) => (
    <a
      data-href={href}
      data-target={target}
      onClick={(event) => onPress?.(event)}
      {...rest}
    >
      {children}
    </a>
  ),
}));

vi.mock('expo-web-browser', () => ({
  openBrowserAsync: browserMocks.openBrowserAsync,
  WebBrowserPresentationStyle: { AUTOMATIC: 'automatic' },
}));

import { ExternalLink } from '@/components/external-link';

function setExpoOS(value: 'web' | 'ios' | 'android') {
  Object.defineProperty(process, 'env', {
    value: { ...process.env, EXPO_OS: value },
    configurable: true,
  });
}

describe('ExternalLink', () => {
  afterEach(() => {
    cleanup();
    browserMocks.openBrowserAsync.mockReset();
  });

  it('renders an anchor with target="_blank" and the given href', () => {
    setExpoOS('web');
    const { container } = render(<ExternalLink href="https://example.com">Open</ExternalLink>);

    const anchor = container.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('data-href')).toBe('https://example.com');
    expect(anchor?.getAttribute('data-target')).toBe('_blank');
  });

  it('does not open the in-app browser when running on web (no preventDefault)', () => {
    setExpoOS('web');
    const { container } = render(<ExternalLink href="https://example.com">Go</ExternalLink>);

    const anchor = container.querySelector('a') as HTMLAnchorElement;
    const clickEvent = new Event('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(false);
    expect(browserMocks.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens the in-app browser and prevents default on native', async () => {
    setExpoOS('ios');
    browserMocks.openBrowserAsync.mockResolvedValue({ type: 'cancel' } as never);

    const { container } = render(<ExternalLink href="https://example.com">Native</ExternalLink>);

    const anchor = container.querySelector('a') as HTMLAnchorElement;
    const clickEvent = new Event('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(browserMocks.openBrowserAsync).toHaveBeenCalledWith('https://example.com', {
      presentationStyle: 'automatic',
    });
  });
});
