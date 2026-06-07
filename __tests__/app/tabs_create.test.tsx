// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

const redirectMock = vi.fn();

vi.mock('expo-router', () => ({
  Redirect: (props: any) => {
    redirectMock(props);
    return <div data-testid="redirect" data-href={props.href} />;
  },
}));

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import CreateTabRedirect from '@/app/(tabs)/create';

describe('CreateTabRedirect', () => {
  afterEach(() => {
    cleanup();
    redirectMock.mockReset();
  });

  it('redirects to the tasks screen with create=1', () => {
    render(<CreateTabRedirect />);

    const redirect = screen.getByTestId('redirect');
    expect(redirect.getAttribute('data-href')).toBe('/(tabs)/tasks?create=1');
  });
});
