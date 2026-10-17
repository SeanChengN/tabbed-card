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
types retain their native editor. Preview content remains interactive, including
room expansion, entity actions and tab switching. Capture listeners intercept
only Bubble popup Edit/Create events and its Add button while in edit/preview
mode, before they can launch the unsafe second global editor. A notification
directs the user to the Tabbed Card editor for popup structure changes. Normal
dashboard interaction is unchanged. The Add button guard uses Bubble's
`bubble-cards-add-button` class and must be rechecked if Bubble changes its markup.

Regression tests cover no-change navigation, popup and child field changes,
save/reopen, both tabs, unknown options, image masks, card copy/reorder/remove,
picker insertion, YAML round trips/error recovery, ordinary Bubble button editors,
and built-bundle preview interaction with targeted popup editor guards. All 20
automated cases passed, along with strict TypeScript, the production build and
local package validation. These automated tests use synthetic cards, not a live
Bubble or Home Assistant runtime. The fix must be accepted on the real HA editor
before claiming that the complete popup editing workflow passes.
