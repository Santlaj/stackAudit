import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      sourceType: "module",
    },
  },
];