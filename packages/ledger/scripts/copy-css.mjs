// tsc only emits JS/d.ts — copy every .css under src/ into dist/ preserving
// structure so the "./styles.css" export (and its relative @imports) resolve.
import { cpSync, statSync } from "node:fs";

cpSync("src", "dist", {
  recursive: true,
  filter: (src) => statSync(src).isDirectory() || src.endsWith(".css"),
});
