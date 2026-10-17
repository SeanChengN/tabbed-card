# Tabbed Card maintenance

This maintained fork preserves `custom:tabbed-card` and the upstream YAML shape.
The parent workspace AGENTS.md applies. Keep test fixtures synthetic; never copy
HA storage, household entities, credentials or private image assets here.

- `fix/native-visual-editor` carries the upstream editor PR. Fork-only layout and
  preview enhancements belong in separate feature branches.
- Preserve unknown configuration keys. Editor selection must never be persisted
  or affect a normal dashboard card.
- Run `pnpm test`, `pnpm build`, `pnpm check:hacs` and `git diff --check`.
- Package candidates with `pnpm package`; publishing and HA deployment are
  separate acceptance stages. Never load upstream and fork bundles together.
- Follow [docs/MAINTENANCE.md](docs/MAINTENANCE.md) for provenance and rollback.
