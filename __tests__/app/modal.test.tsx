// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('expo-router', () => ({
  Link: ({ children, href, dismissTo, ...props }: any) => (
    <a href={href || '/'} data-href={href} data-dismiss-to={dismissTo ? 'true' : 'false'} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, type, ...rest }: any) => (
    <span data-type={type} {...rest}>{children}</span>
  ),
}));

vi.mock('@/components/themed-view', () => ({
  ThemedView: ({ children, style, ...rest }: any) => (
    <div data-style={JSON.stringify(style ?? null)} {...rest}>{children}</div>
  ),
}));

import ModalScreen from '@/app/modal';

describe('ModalScreen', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the modal title', () => {
    render(<ModalScreen />);
    expect(screen.getByText('This is a modal')).toBeTruthy();
  });

  it('renders a Link back to the home screen with dismissTo', () => {
    render(<ModalScreen />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('data-href')).toBe('/');
    expect(link.getAttribute('data-dismiss-to')).toBe('true');
  });
});
