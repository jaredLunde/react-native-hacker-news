import type { ExpoConfig } from "@expo/config-types";

const config: ExpoConfig = {
  name: "HN Reader for Hacker News",
  slug: "hn",
  sdkVersion: "43.0.0",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jaredlunde.hn",
  },
  android: {
    jsEngine: "hermes",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["sentry-expo"],
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "jaredLunde",
          project: "hacker-news",
          authToken: "9981442a345911eca563061c02109a53",
        },
      },
    ],
  },
};

export default config;
