# v0.4.0-beta.3

Fixes the beta.2 regression that disabled every control inside the right-hand
editor preview. Room expanders, entity actions and preview buttons are interactive
again; tab switching and selection highlighting remain available.

The previous whole-content `inert` restriction is replaced with capture guards
for Bubble popup Edit/Create events and the popup Add button. These entry points
can reuse Home Assistant's outer save callback and overwrite the root card.
They now show a notification directing users to the Tabbed Card editor on the
left. Ordinary popup controls remain interactive, and normal dashboard mode is
unaffected. The Add guard depends on Bubble's current button class; future Bubble
markup changes may require a compatibility update.

The beta.2 local popup editor, child forms, direct YAML control and preservation
of other tabs remain in place. No Bubble source is bundled.

## Validation and manual acceptance

The fix passed 20 automated regression tests, TypeScript/build checks and local
package validation. The new tests exercise the built bundle with synthetic
shadow-root controls, preview/mode changes, targeted editor interception and
non-popup controls. Live Bubble/Home Assistant manual acceptance is pending;
publishing does not update any HA deployment.

In HACS, enable beta versions, select `v0.4.0-beta.3`, then hard-refresh the browser
or clear its Home Assistant frontend cache. Back up the dashboard before testing.
In the right-hand preview, expand a room, use a normal control and switch floor
tabs. Use the left editor to edit a nested Bubble child field, save and reopen;
confirm both floor tabs and unrelated configuration remain intact. Verify that
Bubble's preview Edit/Add controls show the notification rather than reopening
the global editor. Also test normal popup interaction after leaving edit mode.

The card type and resource filename remain `custom:tabbed-card` and
`tabbed-card.js`. Existing fork installations need only update the bundle. Keep
the original plugin resource and independent editor bridge disabled. Earlier releases remain
available for rollback; restore a dashboard backup separately if configuration
was changed. See the attached INSTALL.md for installation and rollback details.
