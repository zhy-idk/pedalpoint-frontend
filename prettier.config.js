// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */

// prettier.config.js

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
}
