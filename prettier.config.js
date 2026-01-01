/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  tabWidth: 2,
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "<TYPES>",
    "^(react/(.*)$)|^(react$)",
    "^@tanstack/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "",
    "^~/(.*)$",
    "",
    "^[../]",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};

export default config;
