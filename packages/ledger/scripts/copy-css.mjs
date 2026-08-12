// tsc only emits JS/d.ts — copy every .css under src/ into dist/ preserving
// structure so the "./styles.css" export (and its relative @imports) resolve.
import { cpSync, statSync, writeFileSync } from "node:fs";

cpSync("src", "dist", {
  recursive: true,
  filter: (src) => statSync(src).isDirectory() || src.endsWith(".css"),
});

/* A side-effect CSS import has nothing for TypeScript to resolve, so a consumer
   on strict TS without a framework's ambient CSS types gets
   "Cannot find module or type declarations for side-effect import".
   Vite and Next ship those types; a bare tsc setup does not. Declaring the
   subpaths here means the fix travels with the package instead of every
   consumer having to write `declare module "*.css"` themselves. */
const cssSubpaths = [
  "@mcleanstewart/ledger/styles.css",
  "@mcleanstewart/ledger/tokens/index.css",
  "@mcleanstewart/ledger/tokens/brand.css",
];
writeFileSync(
  "dist/css.d.ts",
  cssSubpaths.map((p) => `declare module "${p}";`).join("\n") + "\n",
);
