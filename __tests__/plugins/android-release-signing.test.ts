import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const appBuildGradle = readFileSync(
  join(process.cwd(), 'android', 'app', 'build.gradle'),
  'utf8'
);

function extractNamedBlock(source: string, blockName: string): string {
  const start = source.indexOf(`${blockName} {`);
  expect(start).toBeGreaterThanOrEqual(0);

  const openBrace = source.indexOf('{', start);
  let depth = 0;

  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(openBrace + 1, index);
      }
    }
  }

  throw new Error(`Could not extract ${blockName} block`);
}

describe('Android release signing configuration', () => {
  it('does not sign release builds with the debug key', () => {
    const buildTypesBlock = extractNamedBlock(appBuildGradle, 'buildTypes');
    const releaseBlock = extractNamedBlock(buildTypesBlock, 'release');

    expect(releaseBlock).not.toContain('signingConfig signingConfigs.debug');
    expect(releaseBlock).toContain('signingConfig signingConfigs.release');
  });

  it('requires environment-backed release signing values', () => {
    expect(appBuildGradle).toContain('FITPULSE_RELEASE_STORE_FILE');
    expect(appBuildGradle).toContain('FITPULSE_RELEASE_STORE_PASSWORD');
    expect(appBuildGradle).toContain('FITPULSE_RELEASE_KEY_ALIAS');
    expect(appBuildGradle).toContain('FITPULSE_RELEASE_KEY_PASSWORD');
    expect(appBuildGradle).toContain('throw new GradleException');
  });
});
