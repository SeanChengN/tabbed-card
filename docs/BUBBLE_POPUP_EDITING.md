# Bubble popup editing boundary

An embedded Bubble popup's standalone editor reuses HA's global card dialog.
Its parent-dialog bridge scans live configuration carriers, prefers the nearest
containing card and keeps the original dialog save callback. The installed
bridge's `findConfigPath` traversal recognizes cards/card/view/views but skips
containers whose only children are under `tabs`.

For `tabbed-card -> tabs[0].card (vertical-stack) -> Bubble pop-up`, the bridge
selects the stack from the preview. It reopens that stack while retaining the
callback for the outer tabbed card. Saving then replaces the tabbed card with
the stack, losing sibling tabs. This is a dialog ownership mismatch rather than
a child config-changed event leaking through the editor.

The behavior was reproduced with a synthetic two-tab configuration against
Bubble's `standalone-dialog-bridge.js` (upstream blob
`67f6300af8fe79ffd4df705739d14ca8630c9fb6`). The installed minified bundle was
also inspected: its traversal, scoring and parent-dialog reuse follow the same
path. No Bubble implementation is bundled in this fork.

The fork treats embedded Bubble popups as containers. It does not mount Bubble's
standalone popup form; popup child collections use local navigation and child
forms, while advanced popup options use HA's YAML control directly. Setting
GUImode=false on HA's card-element wrapper still initializes a plugin's form,
so that wrapper is intentionally bypassed for popup YAML. Invalid YAML remains
local and does not replace the last valid root configuration. HA can still save
earlier valid edits; correct the YAML before saving the complete card. Other Bubble card
types retain their native editor. Preview card content is inert in edit/preview
mode so popup menus cannot launch a second global editor; normal dashboard
interaction is unchanged.

Regression tests cover no-change navigation, popup and child field changes,
save/reopen, both tabs, unknown options, image masks, card copy/reorder/remove,
picker insertion, YAML round trips/error recovery, ordinary Bubble button editors,
and built-bundle preview interaction gating. All 18 automated cases passed,
along with strict TypeScript, the production build and local package validation.
These automated tests do not establish live HA GUI acceptance. Browser testing
was unavailable because the Windows Computer Use helper could not confidently
determine the active URL. The fix must be accepted on the real HA editor before
claiming that the complete popup editing workflow passes.
