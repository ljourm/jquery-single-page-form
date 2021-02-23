module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  rules: {
    semi: ["error", "never"],
    "no-console": "off",
    "max-len": ["error", { code: 140 }],
    "prettier/prettier": ["error", { semi: false, trailingComma: "es5" }],
  },
}
