const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ensure Metro treats .html as assets so they can be required and bundled
config.resolver.assetExts = config.resolver.assetExts.concat(["html"]);

module.exports = withNativeWind(config, { input: "./global.css" });
