// Guard for SPEC.md's "Zero raw hex/px in component CSS — tokens only"
// — `node scripts/css-token-check.mjs`. No deps, no runner.
//
// Scope is src/components/**/*.css. src/tokens/*.css is deliberately NOT
// scanned: the tokens are where the raw values are DEFINED, so a hex or a px
// literal there is the thing the rest of the system spends, not a violation.
//
// Two values are allowed through on purpose:
//   - `var(--space-px)` and friends — a token NAME containing the letters "px"
//     carries no digit before them, so it never looks like a length.
//   - a zero length (`0`, `0px`) — zero is the absence of a value, not a
//     design decision, so there is nothing for a token to hold.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const root = join(pkgRoot, "src/components");

const cssFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? cssFiles(join(dir, e.name))
      : e.name.endsWith(".css")
        ? [join(dir, e.name)]
        : [],
  );

// Blank out comments, quoted strings and url() payloads, keeping every byte in
// place so line numbers still line up. Prose like "42px rows" and a `#` inside
// a url fragment are not declarations.
const blank = (css) =>
  css.replace(/\/\*[\s\S]*?\*\/|"[^"\n]*"|'[^'\n]*'|url\([^)]*\)/g, (m) =>
    m.replace(/[^\n]/g, " "),
  );

// The only spans worth reading: declaration values (`:` … `;`, which is what
// makes a multi-line linear-gradient one span) and at-rule preludes (`@media`
// … `{`, where a breakpoint would hide). Everything else is selector text,
// where a `#` is an id and not a colour.
const scannableSpans = (css) => {
  const spans = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < css.length; i += 1) {
    const c = css[i];
    if (start === -1) {
      if (c === "@") start = i;
      else if (c === ":" && depth > 0) start = i + 1;
      else if (c === "{") depth += 1;
      else if (c === "}") depth -= 1;
      continue;
    }
    if (c === ";" || c === "{" || c === "}") {
      spans.push([start, i]);
      start = -1;
      if (c === "{") depth += 1;
      else if (c === "}") depth -= 1;
    }
  }
  return spans;
};

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
// A number carrying `px`. The lookbehind is what keeps token names out of it:
// `--space-px` has no digit before the letters, `--text-16px` has a `-`.
const PX = /(?<![\w.-])-?\d*\.?\d+px\b/g;

const lineOf = (css, index) => css.slice(0, index).split("\n").length;

const violations = [];
const files = cssFiles(root).sort();

for (const file of files) {
  const css = blank(readFileSync(file, "utf8"));
  for (const [start, end] of scannableSpans(css)) {
    const span = css.slice(start, end);
    for (const re of [HEX, PX]) {
      re.lastIndex = 0;
      for (const m of span.matchAll(re)) {
        if (re === PX && Number.parseFloat(m[0]) === 0) continue;
        violations.push(`${relative(pkgRoot, file)}:${lineOf(css, start + m.index)}: ${m[0]}`);
      }
    }
  }
}

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  console.error(
    `css-token-check: ${violations.length} raw value(s) in component CSS — use a token (SPEC.md, "CSS rules").`,
  );
  process.exit(1);
}

console.log(`css-token-check: ok — no raw hex or px in ${files.length} component stylesheets`);
