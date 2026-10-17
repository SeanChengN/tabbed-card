# v0.4.0-beta.1

Native visual configuration for tabs and nested containers, with Home Assistant
child forms and YAML fallback. Add, copy, remove and reorder tabs or child cards
without discarding unknown options, custom styles or picture-element masks.

Optional `options.tabWidthMode: equal | dynamic` controls tab sizing. Omitting
it retains the original behavior. Editor previews follow the selected card and
outline it temporarily; normal dashboard cards are unaffected.

The card type remains `custom:tabbed-card`. Disable the original bundle and any
independent editor bridge before loading the fork; identical registered element
names prevent side-by-side loading. Back up resources and dashboard configuration
first, and restore the previous resources to roll back.

The repository contains synthetic regression and desktop/mobile playground
checks. Independent acceptance on a separate HA instance is required before any
production switch. See MAINTENANCE.md for installation and rollback details.
