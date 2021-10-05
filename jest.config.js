// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestPreset = require("react-native/jest-preset");

module.exports = {
  ...jestPreset,
  transform: {
    "^.+\\.tsx?$": [
      "@swc-node/jest",
      {
        react: {
          pragma: "React.createElement",
          pragmaFrag: "React.Fragment",
          throwIfNamespace: true,
          development: true,
          useBuiltins: true,
        },
      },
    ],
    ...jestPreset.transform,
  },
  moduleDirectories: ["node_modules", "src", "test"],
  testMatch: ["<rootDir>/src/**/?(*.)test.{ts,tsx}"],
  collectCoverageFrom: ["<rootDir>/src/**/*.{ts,tsx}"],
  setupFilesAfterEnv: ["./test/setup.ts"],
  cacheDirectory: ".jest/cache",
};
