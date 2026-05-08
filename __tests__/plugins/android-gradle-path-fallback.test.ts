import { describe, expect, it } from 'vitest';

declare const require: (path: string) => {
  patchAppBuildGradle: (contents: string) => string;
  patchMainApplication: (contents: string) => string;
};

const { patchAppBuildGradle, patchMainApplication } = require(
  '../../plugins/with-android-gradle-path-fallback.js'
);

const defaultReactPaths = [
  '    reactNativeDir = new File(["node", "--print", "require.resolve(\'react-native/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()',
  '    hermesCommand = new File(["node", "--print", "require.resolve(\'react-native/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"',
  '    codegenDir = new File(["node", "--print", "require.resolve(\'@react-native/codegen/package.json\', { paths: [require.resolve(\'react-native/package.json\')] })"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()',
].join('\n');

const defaultCliFile =
  '    cliFile = new File(["node", "--print", "require.resolve(\'@expo/cli\', { paths: [require.resolve(\'expo/package.json\')] })"].execute(null, rootDir).text.trim())';

describe('with-android-gradle-path-fallback patches', () => {
  it('patches app/build.gradle idempotently', () => {
    const contents = [
      'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()',
      '',
      '/**',
      ' * React Native config',
      ' */',
      'react {',
      defaultReactPaths,
      defaultCliFile,
      '}',
    ].join('\n');

    const once = patchAppBuildGradle(contents);
    const twice = patchAppBuildGradle(once);

    expect(twice).toBe(once);
    expect(once).toContain('def resolveNodePath = { String resolveExpression ->');
    expect(once).toContain('reactNativeDir = reactNativeDirFile.getAbsoluteFile()');
    expect(once).toContain('cliFile = expoCliFile');
  });

  it('does not modify MainApplication contents', () => {
    const contents = [
      'import com.facebook.react.defaults.DefaultReactNativeHost',
      '',
      'import expo.modules.ApplicationLifecycleDispatcher',
      'import expo.modules.ReactNativeHostWrapper',
      '',
      'class MainApplication : Application(), ReactApplication {',
      '  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(',
      '    this,',
      '    object : DefaultReactNativeHost(this) {',
      '      override fun getUseDeveloperSupport() = BuildConfig.DEBUG',
      '    }',
      '  )',
      '}',
    ].join('\n');

    expect(patchMainApplication(contents)).toBe(contents);
  });
});
