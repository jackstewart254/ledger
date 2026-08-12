import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point at ledger SOURCE — no package build step during dev, HMR just works.
      // Covers subpaths too ("@mcleanstewart/ledger/styles.css" → src/styles.css).
      "@mcleanstewart/ledger": fileURLToPath(new URL("../packages/ledger/src", import.meta.url)),
    },
  },
  server: {
    // PORT comes from the preview harness (autoPort); 5273 is the bare-`vite` fallback.
    // Not 5173 — the rugby dev server squats there.
    port: Number(process.env.PORT) || 5273,
  },
});
