const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(workspaceRoot, "packages/shared")];
config.resolver.extraNodeModules = {
  "@sappy/shared": path.resolve(workspaceRoot, "packages/shared/src"),
};
config.resolver.assetExts.push("wasm");

module.exports = config;
