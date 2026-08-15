# Using Ledger in another project

Ledger ships to npm as **`@mcleanstewart/ledger`**. A consuming project installs
it like any other package — no path pointing back at this repo, no token, no
`.npmrc`.

## Install

```bash
npm i @mcleanstewart/ledger
```

Then, once, at the app entry:

```tsx
import "@mcleanstewart/ledger/styles.css";
```

Then render:

```tsx
import { Card, Button } from "@mcleanstewart/ledger";

export function App() {
  return (
    <Card>
      <Button variant="primary">Ship it</Button>
    </Card>
  );
}
```

That's the whole setup. React is a peer dependency — the consumer supplies its
own `react` and `react-dom` (>=18). Ledger's one runtime dependency,
`lucide-react` for icons, installs automatically.

## The stylesheet is not optional

Ledger is vanilla CSS, not CSS-in-JS. Skip the `styles.css` import and every
component renders as unstyled markup — no error, no warning, just a kit that
looks broken. It is one line and it belongs at the app entry, imported before
your own styles so yours can override.

Three entrypoints, and you almost always want the first:

| Import | What you get |
| --- | --- |
| `@mcleanstewart/ledger/styles.css` | Tokens **and** all component CSS. The normal choice. |
| `@mcleanstewart/ledger/tokens/index.css` | Tokens only — to style your own markup in the same voice, without the component CSS. |
| `@mcleanstewart/ledger/tokens/brand.css` | The list of `--brand-*` override inputs. Reference, not something to import. |

`styles.css` already includes the tokens; importing both is redundant, not
harmful.

To retint the kit, declare the `--brand-*` custom properties in your own sheet
loaded after `styles.css` — see
[`tokens/brand.css`](../packages/ledger/src/tokens/brand.css) for the full list.
Dark is the default; light is `[data-theme="light"]` on any ancestor.

The package declares `"sideEffects": ["*.css"]`, so bundlers keep the stylesheet
instead of tree-shaking a side-effect-only import away. That failure used to
show up only in production builds.

### It resets `box-sizing`, globally

`styles.css` sets `box-sizing: border-box` on `*, *::before, *::after`, so it
reaches your elements too, not only `.lg-*` ones. That is deliberate: the kit's
own geometry is written for border-box (`PageColumn` is `width: 100%` plus a
symmetric gutter, `AppShell` is `100dvh` plus padding), and components portal to
`document.body`, so there is no subtree it could be confined to. If you already
ship a reset — Preflight, normalize, your own — this changes nothing. If you
need it gone, an unlayered `box-sizing` rule of your own outranks it, but expect
the layout bugs it exists to prevent.

## Publishing a new version

**npm caches by version.** This is the one thing that bites silently: if the
package contents change and the version does not, a consumer running
`npm i @mcleanstewart/ledger@0.1.0` can be served the cached 0.1.0 and get the
old files. No error, no warning — just stale components and an afternoon spent
wondering why the fix didn't take.

So: **any content change gets a version bump** in
`packages/ledger/package.json`. Never republish the same number.

From the repo root:

```bash
npm run release:ledger:dry   # build + print exactly what would be published
npm run release:ledger       # build + publish
```

`prepublishOnly` runs the build for you, so `dist/` is always compiled from the
current source at publish time — that is why `dist/` and the `.tgz` are
gitignored rather than committed.

Read the dry-run file list before publishing. `files` is `["dist", "README.md"]`
plus `package.json` and `LICENSE`; if `src/` or the playground shows up in that
list, something is wrong with `files`.

First publish only: the `@mcleanstewart` scope has to exist on npm and be one
you own — a free npm org covers unlimited public packages. `publishConfig.access`
is already `public`, so a scoped package won't fail the default-private check.

Consumers update the ordinary way:

```bash
npm i @mcleanstewart/ledger@latest
```

## Working against unpublished changes

For testing a change in a real consumer before it is published, pack a tarball
and install that:

```bash
npm run pack:ledger   # writes mcleanstewart-ledger-<version>.tgz at the repo root
```

```bash
npm i /path/to/ui-designs/mcleanstewart-ledger-0.1.0.tgz
```

The tarball is byte-identical to what npm would publish, and it is a genuine
self-contained copy — the consumer gets `lucide-react` installed properly. It is
a local testing tool, not a distribution channel: the path only resolves on the
machine holding this repo. If you need a tarball to travel — an air-gapped
consumer, or a decision to keep the kit off npm entirely — commit it *into the
consumer* as `file:./vendor/mcleanstewart-ledger-0.1.0.tgz` so it is versioned
alongside the code that uses it. Same version-bump rule applies, and you repeat
the copy for every consumer.

## Why not `npm link` or `file:packages/ledger`

Both symlink `node_modules/@mcleanstewart/ledger` back to `packages/ledger`
instead of copying it, and they break in a way local testing hides:

- npm does **not** install the linked package's own dependencies into the
  consumer, so `lucide-react` is missing from the consumer's `node_modules`.
- It still works on this machine, because resolution follows the symlink into
  `packages/ledger` and walks up to this monorepo's hoisted
  `node_modules/lucide-react`.
- On any machine without this repo checked out next door — CI, a deploy, a
  second laptop — the import fails. `npm ls` in the consumer reports nothing
  wrong.

A published package, or a packed tarball, has no such gap: everything the
package declares gets installed in the consumer.

A git dependency (`github:user/repo`) is not an option either. npm's git URL
grammar has no subdirectory component, so it can only install a repo's *root*
package — and this repo's root is the private `ui-designs` workspace, not
`packages/ledger`.

## Don't copy the source in

Copying components into each project forks them. The kit is 55 components plus
tokens, shared CSS primitives (`.lg-control`, the hairline scale) and utilities
that components rely on across category boundaries — a partial copy pulls more
than it looks like it will, and a fix then has to be applied N times. Install it.

## Reference

- [API reference](api/README.md) — every prop of every component, generated from
  the source. Point an agent working in a consumer project at this file.
- [Guide](guide.md) — tokens, theming, layout conventions.
- [Recipes](recipes.md) — full page compositions.
