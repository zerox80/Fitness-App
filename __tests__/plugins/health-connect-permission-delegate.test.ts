import { describe, expect, it } from 'vitest';

declare const require: (path: string) => {
  addImport: (contents: string) => string;
  addDelegate: (contents: string) => string;
};

const { addImport, addDelegate } = require('../../plugins/with-health-connect-permission-delegate.js');

describe('with-health-connect-permission-delegate patches', () => {
  it('adds the Health Connect delegate import idempotently', () => {
    const contents = [
      'package com.fitpulse',
      '',
      'import android.os.Bundle',
      'import expo.modules.ReactActivityDelegateWrapper',
    ].join('\n');

    const once = addImport(contents);
    const twice = addImport(once);

    expect(twice).toBe(once);
    expect(once).toContain('import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate');
  });

  it('adds the delegate setup after super.onCreate for null and saved state variants', () => {
    expect(addDelegate('super.onCreate(null)')).toBe(
      [
        'super.onCreate(null)',
        '    HealthConnectPermissionDelegate.setPermissionDelegate(this)',
      ].join('\n')
    );

    expect(addDelegate('super.onCreate(savedInstanceState)')).toBe(
      [
        'super.onCreate(savedInstanceState)',
        '    HealthConnectPermissionDelegate.setPermissionDelegate(this)',
      ].join('\n')
    );
  });

  it('does not duplicate an existing delegate setup', () => {
    const contents = [
      'super.onCreate(null)',
      '    HealthConnectPermissionDelegate.setPermissionDelegate(this)',
    ].join('\n');

    expect(addDelegate(contents)).toBe(contents);
  });
});
