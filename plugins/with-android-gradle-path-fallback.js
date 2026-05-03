const { withAppBuildGradle } = require('expo/config-plugins');

const projectRootLine = 'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()';

const pathSetup = [
  projectRootLine,
  'def reactNativeDirPath = ["node", "--print", "require.resolve(\'react-native/package.json\')"].execute(null, rootDir).text.trim()',
  'def reactNativeDirFile = reactNativeDirPath ? new File(reactNativeDirPath).getParentFile() : file("$projectRoot/node_modules/react-native")',
  'def codegenDirPath = ["node", "--print", "require.resolve(\'@react-native/codegen/package.json\', { paths: [require.resolve(\'react-native/package.json\')] })"].execute(null, rootDir).text.trim()',
  'def codegenDirFile = codegenDirPath ? new File(codegenDirPath).getParentFile() : file("$projectRoot/node_modules/@react-native/codegen")',
  'def expoCliPath = ["node", "--print", "require.resolve(\'@expo/cli\', { paths: [require.resolve(\'expo/package.json\')] })"].execute(null, rootDir).text.trim()',
].join('\n');

const defaultReactPaths = [
  '    reactNativeDir = new File(["node", "--print", "require.resolve(\'react-native/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()',
  '    hermesCommand = new File(["node", "--print", "require.resolve(\'react-native/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"',
  '    codegenDir = new File(["node", "--print", "require.resolve(\'@react-native/codegen/package.json\', { paths: [require.resolve(\'react-native/package.json\')] })"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()',
].join('\n');

const patchedReactPaths = [
  '    reactNativeDir = reactNativeDirFile.getAbsoluteFile()',
  '    hermesCommand = reactNativeDirFile.getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"',
  '    codegenDir = codegenDirFile.getAbsoluteFile()',
].join('\n');

const defaultCliFile = '    cliFile = new File(["node", "--print", "require.resolve(\'@expo/cli\', { paths: [require.resolve(\'expo/package.json\')] })"].execute(null, rootDir).text.trim())';
const patchedCliFile = '    cliFile = expoCliPath ? new File(expoCliPath) : file("$projectRoot/node_modules/expo/node_modules/@expo/cli/build/bin/cli")';

function patchAppBuildGradle(contents) {
  if (contents.includes('def reactNativeDirPath = ')) {
    return contents;
  }

  return contents
    .replace(projectRootLine, pathSetup)
    .replace(defaultReactPaths, patchedReactPaths)
    .replace(defaultCliFile, patchedCliFile);
}

module.exports = function withAndroidGradlePathFallback(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = patchAppBuildGradle(config.modResults.contents);
    return config;
  });
};

module.exports.patchAppBuildGradle = patchAppBuildGradle;
