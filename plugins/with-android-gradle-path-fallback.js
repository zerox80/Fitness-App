const { withAppBuildGradle } = require('expo/config-plugins');

const projectRootLine = 'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()';

const legacyPathSetup = [
  projectRootLine,
  'def reactNativeDirPath = ["node", "--print", "require.resolve(\'react-native/package.json\')"].execute(null, rootDir).text.trim()',
  'def reactNativeDirFile = reactNativeDirPath ? new File(reactNativeDirPath).getParentFile() : file("$projectRoot/node_modules/react-native")',
  'def codegenDirPath = ["node", "--print", "require.resolve(\'@react-native/codegen/package.json\', { paths: [require.resolve(\'react-native/package.json\')] })"].execute(null, rootDir).text.trim()',
  'def codegenDirFile = codegenDirPath ? new File(codegenDirPath).getParentFile() : file("$projectRoot/node_modules/@react-native/codegen")',
  'def expoCliPath = ["node", "--print", "require.resolve(\'@expo/cli\', { paths: [require.resolve(\'expo/package.json\')] })"].execute(null, rootDir).text.trim()',
].join('\n');

const pathSetup = [
  projectRootLine,
  'def resolveNodePath = { String resolveExpression ->',
  '    def stdout = new ByteArrayOutputStream()',
  '    def stderr = new ByteArrayOutputStream()',
  '    def result = exec {',
  '        workingDir rootDir',
  '        commandLine "node", "--print", resolveExpression',
  '        standardOutput = stdout',
  '        errorOutput = stderr',
  '        ignoreExitValue = true',
  '    }',
  '    if (result.exitValue == 0) {',
  '        def lines = stdout.toString().readLines().collect { it.trim() }.findAll { it }',
  '        return lines ? lines.last() : null',
  '    }',
  '    return null',
  '}',
  'def asExistingFile = { String resolvedPath ->',
  '    if (!resolvedPath) {',
  '        return null',
  '    }',
  '    def resolvedFile = new File(resolvedPath)',
  '    if (!resolvedFile.isAbsolute()) {',
  '        resolvedFile = new File(rootDir, resolvedPath)',
  '    }',
  '    return resolvedFile.exists() ? resolvedFile : null',
  '}',
  'def resolveNodeModuleDir = { String resolveExpression, String fallbackPath ->',
  '    def resolvedPackageJsonFile = asExistingFile(resolveNodePath(resolveExpression))',
  '    def resolvedPackageDir = resolvedPackageJsonFile?.getParentFile()',
  '    if (resolvedPackageDir != null && resolvedPackageDir.exists()) {',
  '        return resolvedPackageDir',
  '    }',
  '    return file("$projectRoot/node_modules/$fallbackPath")',
  '}',
  'def resolveNodeFile = { String resolveExpression, String fallbackPath ->',
  '    def resolvedFile = asExistingFile(resolveNodePath(resolveExpression))',
  '    if (resolvedFile != null) {',
  '        return resolvedFile',
  '    }',
  '    return file("$projectRoot/$fallbackPath")',
  '}',
  'def reactNativeDirFile = resolveNodeModuleDir("require.resolve(\'react-native/package.json\')", "react-native")',
  'def codegenDirFile = resolveNodeModuleDir("require.resolve(\'@react-native/codegen/package.json\', { paths: [require.resolve(\'react-native/package.json\')] })", "@react-native/codegen")',
  'def expoCliFile = resolveNodeFile("require.resolve(\'@expo/cli\', { paths: [require.resolve(\'expo/package.json\')] })", "node_modules/expo/node_modules/@expo/cli/build/bin/cli")',
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
const legacyPatchedCliFile = '    cliFile = expoCliPath ? new File(expoCliPath) : file("$projectRoot/node_modules/expo/node_modules/@expo/cli/build/bin/cli")';
const patchedCliFile = '    cliFile = expoCliFile';

function replacePathSetup(contents) {
  const start = contents.indexOf(projectRootLine);
  if (start === -1) {
    return contents;
  }

  const end = contents.indexOf('\n\n/**', start);
  if (end === -1) {
    return contents.replace(projectRootLine, pathSetup);
  }

  const setupBlock = contents.slice(start, end);
  const canReplaceSetup =
    setupBlock.includes('def reactNativeDirPath = ') ||
    setupBlock.includes('def resolveNodeModuleDir = ') ||
    setupBlock.trim() === projectRootLine;

  if (!canReplaceSetup) {
    return contents;
  }

  return contents.slice(0, start) + pathSetup + contents.slice(end);
}

function patchAppBuildGradle(contents) {
  let nextContents = replacePathSetup(contents);

  return nextContents
    .replace(defaultReactPaths, patchedReactPaths)
    .replace(defaultCliFile, patchedCliFile)
    .replace(legacyPatchedCliFile, patchedCliFile);
}

module.exports = function withAndroidGradlePathFallback(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = patchAppBuildGradle(config.modResults.contents);
    return config;
  });
};

module.exports.patchAppBuildGradle = patchAppBuildGradle;
