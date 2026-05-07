const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind v5 handles the CSS through this wrapper
module.exports = withNativeWind(config, { input: "./global.css" });
