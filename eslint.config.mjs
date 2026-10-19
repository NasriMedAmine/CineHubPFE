import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Les affiches sont des fichiers SVG locaux : une simple balise <img> suffit.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts", "public/sw.js"]),
]);
