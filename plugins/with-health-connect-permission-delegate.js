const { createRunOncePlugin, withMainActivity } = require('@expo/config-plugins');

const importLine = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
const delegateLine = '    HealthConnectPermissionDelegate.setPermissionDelegate(this)';

function addImport(contents) {
  if (contents.includes(importLine)) {
    return contents;
  }

  return contents.replace('import android.os.Bundle\n', `import android.os.Bundle\n${importLine}\n`);
}

function addDelegate(contents) {
  if (contents.includes('HealthConnectPermissionDelegate.setPermissionDelegate(this)')) {
    return contents;
  }

  return contents.replace(/super\.onCreate\((null|savedInstanceState)\)/, (match) => `${match}\n${delegateLine}`);
}

function withHealthConnectPermissionDelegate(config) {
  return withMainActivity(config, (config) => {
    if (config.modResults.language !== 'kt') {
      return config;
    }

    config.modResults.contents = addDelegate(addImport(config.modResults.contents));
    return config;
  });
}

module.exports = createRunOncePlugin(
  withHealthConnectPermissionDelegate,
  'with-health-connect-permission-delegate',
  '1.0.0'
);
