const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add wasm asset support
config.resolver.assetExts.push("wasm");

// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    middleware(req, res, next);
  };
};

// Ensure Metro treats .html as assets so they can be required and bundled
config.resolver.assetExts = config.resolver.assetExts.concat(["html"]);

module.exports = withNativeWind(config, { input: "./global.css" });
