# Tabbed Card

A custom card for home assistant that utilizes tabs to segregate individual cards.

This is the [SeanChengN maintained fork](https://github.com/SeanChengN/tabbed-card)
of kinghat/tabbed-card. Prerelease `v0.4.0-beta.4` fixes tab icon/title alignment
on desktop and mobile. Independent Home Assistant acceptance of this version
is pending.
See [maintenance, candidate installation and rollback](docs/MAINTENANCE.md).

![Tabbed Card](assets/tabbed-card.png)

## Installation

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

Add this fork as a custom Dashboard repository in
[HACS](https://hacs.xyz) and enable beta versions to select a prerelease. For
installation and rollback steps, follow
the [candidate installation guide](docs/MAINTENANCE.md#candidate-installation-and-rollback).

## Card Schema

```yaml
type: custom:tabbed-card
options?:
  defaultTabIndex?: number
  tabWidthMode?: equal | dynamic
styles?:
attributes?:
  label?: string
  icon?: string
  isFadingIndicator?: boolean
  minWidth?: boolean
  isMinWidthIndicator?: boolean
  stacked?: boolean
tabs:
  - card:
      type:
    styles?:
    attributes?:
      label?: string
      icon?: string
      isFadingIndicator?: boolean
      minWidth?: boolean
      isMinWidthIndicator?: boolean
      stacked?: boolean
```

### Example

```yaml
- type: custom:tabbed-card
  tabs:
    - card:
        type: button
        entity: light.bed_light
        tap_action:
          action: toggle
        show_name: true
        show_icon: true
        show_state: true
      attributes:
        label: Button
    - card:
        type: entities
        title: Air Quality
        entities:
          - air_quality.demo_air_quality_home
          - air_quality.demo_air_quality_office
      attributes:
        label: Air Quality
    - card:
        type: entities
        title: Binary sensor
        entities:
          - binary_sensor.basement_floor_wet
          - binary_sensor.movement_backyard
      attributes:
        label: Binary Sensor
    - card:
        type: entities
        title: Calendar
        entities:
          - entity: calendar.calendar_1
            name: "1"
          - entity: calendar.calendar_2
            name: "2"
      attributes:
        label: Calendar
```

## Configuration

You can apply global and per tab configuration to your card. Global configuration(top level properties) are expressed on all tabs in your card. You can also set local configuration, per tab styles and attributes that take precedence over any corresponding global configuration.

### **Options**

| Property          | Default | Description                    |
| ----------------- | ------- | ------------------------------ |
| `defaultTabIndex` | `0`     | tab to display on first render |
| `tabWidthMode` | unset | `equal` shares the available width; `dynamic` fits labels and scrolls. Unset keeps upstream sizing. |

```yaml
type: custom:tabbed-card
options:
  defaultTabIndex: 1 # in a 0 based index, the second tab would be the active tab on render
tabs: ...
```

### **Styling**

This card tries to closely match home assistants default tab styles. You can override and apply additional styling to the card via provided material web components custom properties.

Default Custom Properties:

| Name                                 | Default                    | Description                                                                                                                                                    |
| ------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--mdc-theme-primary`                | `--primary-text-color`     | Color of the activated tab's text, indicator, and ripple.                                                                                                      |
| `--mdc-tab-text-label-color-default` | `rgba(225, 225, 225, 0.8)` | Color of an unactivated tab label. **_If you want transpareny on the unactivated tabs, you need to use an `rgba` value incorporating the 4th alpha channel._** |
| `--mdc-typography-button-font-size`  | `14px`                     | Font size of the tab label.                                                                                                                                    |

```yaml
type: custom:tabbed-card
styles: # global styles applied to all tabs
  --mdc-theme-primary: yellow
  --mdc-tab-text-label-color-default: orange
tabs: ...
```

![Styling](assets/global-styles.png)

See the full list of exposed custom properties: [`<mwc-tab>`](https://github.com/material-components/material-web/blob/mwc/packages/tab/README.md#css-custom-properties)

### **Attributes**

| Name                  | Default | Description                                                     |
| --------------------- | ------- | --------------------------------------------------------------- |
| `label`               | `""`    | Text label to display in tab.                                   |
| `icon`                | `""`    | Home Assistant `mdi:icon` name.                                 |
| `isFadingIndicator`   | `false` | Indicator fades in and out instead of sliding.                  |
| `minWidth`            | `false` | Shrinks tab as narrow as possible without causing text to wrap. |
| `isMinWidthIndicator` | `false` | Shrinks indicator to be the size of the content.                |
| `stacked`             | `false` | Stacks icon on top of label text.                               |

Global attributes:

```yaml
type: custom:tabbed-card
styles:
  ...
attributes:
  icon: mdi:fire # global attribute applied to all tabs
tabs:
  - attributes:
      label: Button
    card:
      type: button
      entity: light.bed_light
      tap_action:
        action: toggle
      show_name: true
      show_icon: true
      show_state: true
  ...
```

![Global Attributes](assets/global-attributes.png)

Local attributes:

```yaml
type: custom:tabbed-card
styles: ...
tabs:
  - attributes:
      label: Button # local attributes that apply only to individual tabs
      icon: mdi:play
    card:
      type: button
      entity: light.bed_light
      tap_action:
        action: toggle
      show_name: true
      show_icon: true
      show_state: true
  - attributes:
      label: Sensors
      icon: mdi:pause
    card:
      type: entities
      title: Sensor
      entities:
        - sensor.carbon_dioxide
        - sensor.carbon_monoxide
        - sensor.outside_humidity
        - sensor.outside_temperature
        - sensor.power_consumption
        - sensor.today_energy
  - attributes:
      label: Air Quality
      icon: mdi:stop
    card:
      type: entities
      title: Air Quality
      entities:
        - air_quality.demo_air_quality_home
        - air_quality.demo_air_quality_office
```

![Local Attributes](assets/local-attributes.png)

## Appreciation

Thanks for the support and services provided ![Home Assistant](https://avatars.githubusercontent.com/u/13844975?s=24) [Home Assistant](https://www.home-assistant.io/), ![HACS](https://avatars.githubusercontent.com/u/56713226?s=24) [HACS](https://hacs.xyz/) and ![lit](https://avatars.githubusercontent.com/u/18489846?s=24) [lit](https://lit.dev/) 🥰 Aslo, thanks to the [swipe-card](https://github.com/bramkragten/swipe-card) for inspiration and all of the other open source cards/projects as references.


## Visual editor

The native editor supports tabs and nested card collections, including grids,
stacks, expander title/content cards and stack-in-card containers. Add, copy,
remove and reorder tabs or child cards, and edit tab labels, icons and the default
index without rewriting YAML. Explicit default selections follow their tab when
it moves; deleting the selected tab chooses the next available valid index.

Child cards use Home Assistant's registered visual editor. The child form/YAML
button exposes YAML for unsupported cards and advanced settings. Unknown keys,
custom styling and third-party options are preserved. Opening the editor alone
does not emit a configuration change. Unknown containers keep their own editor;
known container navigation does not replace their advanced YAML settings.

Run `pnpm install --frozen-lockfile`, `pnpm test` and `pnpm build` to validate the
editor. Tests use synthetic entities and image paths; never add HA storage exports,
credentials or personal dashboard data to this repository.

The maintained fork highlights the selected card only in an editor preview.
Selection is temporary and is never saved into YAML. Opaque custom containers
are highlighted as a whole when they do not expose individual `hui-card` children.

Bubble `pop-up` cards with embedded `cards` use this editor's container navigation.
Edit the popup name/hash/icon here, child cards in their own forms, and advanced
popup settings through container YAML. Bubble's standalone child dialog can
reopen a nested stack with the outer save callback, discarding other tabs.
Card content in an editor preview is inert; use the editor navigation controls
to select and edit children. Normal dashboard popups remain interactive.
