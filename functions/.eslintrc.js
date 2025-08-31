module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/node_modules/**/*", // Ignore node_modules.
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "linebreak-style": "off", // Disable line ending checks
    "max-len": "off", // Disable line length checks
    "comma-dangle": "off", // Disable trailing comma checks
    "object-curly-spacing": "off", // Disable spacing checks
    "require-jsdoc": "off", // Disable JSDoc requirement
    "@typescript-eslint/no-unused-vars": "warn", // Make unused vars warnings
    "@typescript-eslint/no-explicit-any": "warn", // Make any type warnings
    "@typescript-eslint/no-var-requires": "warn", // Make require warnings
  },
};
