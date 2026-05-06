const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@': projectRoot,
};

config.watchFolders = Array.from(
  new Set([...(config.watchFolders || []), projectRoot])
);

module.exports = config;
