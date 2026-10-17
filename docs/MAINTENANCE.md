# Maintained fork

Upstream: https://github.com/kinghat/tabbed-card

Baseline: `41ce3d7ee4443b4d1d88d941ebd4cdc66f8375d5` (main, based on stable v0.3.3).
The upstream package.json still said 0.1.0; this fork's first candidate is
`0.4.0-beta.1`. This is a fork candidate, not an upstream release.

`origin` points to SeanChengN/tabbed-card; `upstream` points to kinghat/tabbed-card.
The `fix/native-visual-editor` branch contains the upstreamable editor change.
Fork-only layout/preview features and CI changes are separate commits on main.
To sync, fetch upstream, review its changes in a branch, run validation, then
merge deliberately. Never automatically overwrite the maintained branch.

The tab-width controls and editor selection indication take design inspiration
from Orbit Cards' Deck Card (https://github.com/Andyblac/Orbit-Cards/wiki/Deck-Card).
No Orbit source code or assets are copied. The original MIT LICENSE is retained.
Any future copied MIT code must retain its original copyright/license notices.

## Local validation

Use Node 22 or later and the packageManager version declared in package.json.
Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build` and
`pnpm check:hacs`. `pnpm dev` serves `/dev/` as an isolated synthetic playground;
the playground stubs HA card editors and never connects to a home or calls
device services. It is a UI smoke environment, not proof of live HA acceptance.

`pnpm package` writes the candidate JavaScript, SHA256 and provenance manifest
under artifacts/. No GitHub release, tag or HA deployment is created by it.
The manual Build candidate workflow provides the same package with a three-day
artifact retention. Validate uses pull requests/manual dispatch without nightly
or duplicate push builds.

## Candidate installation and rollback

Keep the currently accepted dashboard running while evaluating the candidate
in a separate HA test instance or isolated playground. Before any later HA
switch, back up the latest resource list and dashboard configuration. Replace
the original resource with the candidate resource, retaining a cache-busting
version query. Disable any separately installed editor bridge at the same time.
The fork and original register the same elements and must never be loaded together.

For manual installation after approval, copy the candidate bundle to
`/config/www/tabbed-card/tabbed-card.js` and register
`/local/tabbed-card/tabbed-card.js?v=0.4.0-beta.1` as a JavaScript module.
Existing `type: custom:tabbed-card` YAML is retained. Once a release is explicitly
approved and published, the fork can be added as a HACS custom dashboard repository.
No beta release is promised to be available in HACS before publication.

Rollback restores the previous resource URLs (including the editor bridge if
previously used) and reloads the browser. Restore dashboard configuration only
if it was changed, preserving any later unrelated user edits. Move retired
local assets into a recycle directory; do not permanently delete them.

## Acceptance checklist

- Desktop and 360/430px phone layouts, dark/light themes and keyboard controls.
- Original/equal/content-fit tabs and a long tab list that must scroll.
- Navigate nested title/content cards; edit, cancel, save and reopen.
- Unknown styles and picture-element lighting masks survive form/YAML edits.
- Add/copy/remove/reorder tabs and cards; explicit default selection stays valid.
- Only editor previews follow and outline a selection. Closing the editor clears
  it. Native hui-card descendants can be outlined individually; opaque custom
  containers fall back to outlining the tab surface.
- Unsupported child cards retain HA's YAML fallback. The candidate is not
  independently accepted merely because the earlier editor bridge was accepted.
