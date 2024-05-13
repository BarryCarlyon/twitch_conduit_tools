/** @type {import("prettier").Config} */
const config = {
  arrowParens: "always",
  bracketSpacing: true,
  printWidth: 100,
  quoteProps: "consistent",
  semi: true,
  singleAttributePerLine: true,
  singleQuote: false,
  tabWidth: 4,
  trailingComma: "all",
  useTabs: false,
  plugins: ["prettier-plugin-organize-imports"],
};

module.exports = config;
