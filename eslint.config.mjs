import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next. Leading "**/" so these also
    // match nested Next.js apps (apps/admin, apps/mobile) -- without it,
    // only the root .next/out/build/coverage were ignored, and Next's own
    // generated SSR runtime bundle inside apps/admin/.next/ started
    // getting linted as if it were source once that app had its own build.
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/coverage/**",
    "**/next-env.d.ts",
    "**/node_modules/**",
  ]),
]);

export default eslintConfig;
