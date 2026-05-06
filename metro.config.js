const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@': projectRoot,
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(
      context,
      path.join(projectRoot, moduleName.slice(2)),
      platform
    );
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.watchFolders = Array.from(
  new Set([...(config.watchFolders || []), projectRoot])
);

module.exports = config;
