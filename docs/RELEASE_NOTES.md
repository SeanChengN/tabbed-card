# v0.4.0-beta.2

Fixes nested Bubble Card popup editing that could replace the entire Tabbed Card
with one floor's container when saving, causing the remaining tabs to disappear.

- Embedded Bubble `pop-up` cards with child cards now use local container
  navigation, popup fields and add/copy/remove/reorder controls. Child cards keep
  their native Home Assistant editors; other Bubble card types are unchanged.
- Advanced popup YAML uses Home Assistant's YAML editor directly, avoiding the
  second Bubble editor dialog. Invalid drafts retain the last valid configuration;
  saving the overall dialog can still save earlier valid edits.
- Dashboard interactions are disabled inside editing previews, preventing popup
  clicks from reopening the standalone editor. Normal dashboard popups remain active.
- Existing tabs, unknown options, styles and picture-element configuration are
  preserved. No Bubble Card source is bundled.

## Validation and manual acceptance

The fix passed 18 automated regression tests, TypeScript/build checks, tracked
bundle consistency and local plus official HACS validation. Live Home Assistant
manual acceptance of beta.2 is pending; publishing does not update any HA deployment.

In HACS, enable beta versions, select `v0.4.0-beta.2`, then hard-refresh the browser
or clear its Home Assistant frontend cache. Back up the dashboard before testing.
Navigate into a nested Bubble popup, edit a child field, save and reopen; confirm
both floor tabs and unrelated configuration remain intact. Also test popup YAML
and normal popup interaction after leaving edit mode.

The card type and resource filename remain `custom:tabbed-card` and
`tabbed-card.js`. Existing fork installations need only update the bundle. Keep
the original plugin resource and independent editor bridge disabled. Beta.1 remains
available for rollback; restore a dashboard backup separately if configuration
was changed. See the attached INSTALL.md for installation and rollback details.
