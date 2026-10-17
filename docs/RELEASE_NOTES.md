# v0.4.0-beta.4

Fixes tab icons sitting lower than their titles on both desktop and mobile.
The slotted HA icon now uses a centered 24px flex box inside MWC's 24px icon
slot, removing the inline SVG baseline offset. The style is scoped to tab
header icons; icons inside child cards are unaffected.

Original, equal and dynamic tab widths, stacked icons, active colors and
indicators retain their existing behavior. No dashboard YAML changes are needed.
The beta.3 interactive preview and Bubble nested-editor safeguards remain intact.

## Validation and manual acceptance

The fix passed 20 automated regression tests, TypeScript/build checks and local
package validation. A real headless Chromium geometry check covers 18 combinations
of 360px/430px/1280px widths, original/equal/dynamic widths and horizontal/stacked
headers. It uses the compiled card, actual MWC components and a synthetic HA
icon matching HA's inline SVG host layout. The previous bundle reproduces an
approximately 2.5px offset; the corrected bundle has zero vertical center offset
in horizontal headers. Live HA/theme acceptance remains pending; publishing does
not update any HA deployment.

In HACS, enable beta versions, select `v0.4.0-beta.4`, then hard-refresh the browser
or clear its Home Assistant frontend cache. Back up the dashboard before testing.
Check icon/title alignment on both desktop and phone, including selected and
unselected tabs, then verify tab switching and the existing editor preview.

The card type and resource filename remain `custom:tabbed-card` and
`tabbed-card.js`. Existing fork installations need only update the bundle. Keep
the original plugin resource and independent editor bridge disabled. Earlier releases remain
available for rollback; restore a dashboard backup separately if configuration
was changed. See the attached INSTALL.md for installation and rollback details.
