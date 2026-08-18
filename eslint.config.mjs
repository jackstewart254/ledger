// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "packages/ledger/dist/**",
      "playground/dist/**",
      "docs/**",
    ],
  },
  {
    files: [
      "packages/ledger/src/**/*.ts",
      "packages/ledger/src/**/*.tsx",
      "playground/src/**/*.ts",
      "playground/src/**/*.tsx",
    ],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    rules: {},
  },
);
