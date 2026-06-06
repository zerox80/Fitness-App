const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const isWindows = process.platform === 'win32';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    stdio: 'inherit',
    shell: isWindows,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const expoCli = path.join(rootDir, 'node_modules', 'expo', 'bin', 'cli');

run(process.execPath, [expoCli, 'prebuild', '--platform', 'android', '--no-install']);

run(
  isWindows ? 'gradlew.bat' : './gradlew',
  [
    'testDebugUnitTest',
    'jacocoDebugUnitTestCoverageVerification',
    '--init-script',
    path.join('..', 'scripts', 'android-coverage-gate.gradle'),
    '--no-daemon',
  ],
  { cwd: androidDir }
);
