# v0.4.0-beta.1 candidate validation

Local validation on 2026-10-17:

- TypeScript strict checking and Vite production build passed.
- 13 isolated Node/Happy DOM tests passed. The upstream-only branch separately
  passed its 9 editor/model tests.
- Tests cover immutable deep edits, unknown options, image clipping masks,
  default-index movement/removal, child initialization events, invalid YAML,
  container code/form round trips, stale asynchronous editors and preview gating.
- Chrome synthetic playground checked desktop, 360px and 430px layouts, dark and
  light themes, equal tab widths, dynamic long labels, tab copy/reorder/delete,
  keyboard field edits, local draft save/reopen and form/code toggling.
- DOM inspection confirmed the selected public hui-card receives an outline in
  preview while the normal dashboard instance has no selection outline.
- At 360px the two equal-width tabs measured 147.5px each. At 430px the dynamic
  ten-tab list exceeded its viewport inside the Material tab scroller while the
  page itself had no horizontal overflow.

The playground supplies synthetic HA child editors, entity states and picture
content. Its code field uses JSON, a YAML subset. These checks do not establish
real HA YAML parsing, third-party card compatibility or independent acceptance.
Test the packaged candidate in a separate HA instance before any production switch.
The existing accepted HA resource list and dashboard have not been changed.

See GitHub Actions for official HACS validation and candidate build results;
`check:hacs` is a local package sanity check, not the official HACS action.
