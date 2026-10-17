import { LitElement, html, PropertyValueMap, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import {
  getLovelace,
  hasConfigOrEntityChanged,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
  LovelaceConfig,
} from "custom-card-helpers";
import "./registry-patch.ts";
import "./tabbed-card-editor";
import "@material/mwc-tab-bar";
import "@material/mwc-tab";

interface mwcTabBarEvent extends Event {
  detail: {
    index: number;
  };
}

import type { TabConfig, TabbedCardConfig } from "./types";
import { defaultIndex } from "./editor-model";
import { readAt } from "./editor-model";
import { tabLayout } from "./tab-layout";
import { SELECTION_EVENT, getSelection, previewMatches, findPreviewTarget } from "./editor-preview";

interface RenderedTab {
  card: LovelaceCard;
  attributes?: TabConfig["attributes"];
  styles?: TabConfig["styles"];
}

@customElement("tabbed-card")
export class TabbedCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({type: Boolean}) public preview = false;
  @property({type: Boolean}) public editMode = false;
  private _outlined?: {element: HTMLElement; outline: string; offset: string};
  private _selectionListener = () => {
    if (!previewMatches(this._config, this.preview, this.editMode)) { this._clearOutline(); return; }
    const path = getSelection()!.path;
    if (path[0] === 'tabs' && typeof path[1] === 'number') this.selectedTabIndex = path[1];
    this.requestUpdate();
  };
  @property() protected selectedTabIndex = 0;
  @property() private _helpers: any;

  @state() private _config!: TabbedCardConfig;
  @state() private _tabs!: RenderedTab[];
  @property() protected _styles = {
    "--mdc-theme-primary": "var(--primary-text-color)", // Color of the activated tab's text, indicator, and ripple.
    "--mdc-tab-text-label-color-default":
      "rgba(var(--rgb-primary-text-color), 0.8)", // Color of an unactivated tab label.
    "--mdc-tab-color-default": "rgba(var(--rgb-primary-text-color), 0.7)", // Color of an unactivated icon.
    "--mdc-typography-button-font-size": "14px",
  };

  private async loadCardHelpers() {
    this._helpers = await (window as any).loadCardHelpers();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(SELECTION_EVENT, this._selectionListener);
    this._selectionListener();
  }

  disconnectedCallback() {
    window.removeEventListener(SELECTION_EVENT, this._selectionListener);
    this._clearOutline();
    super.disconnectedCallback();
  }

  private _clearOutline() {
    if (!this._outlined) return;
    const {element, outline, offset} = this._outlined;
    element.style.outline = outline; element.style.outlineOffset = offset;
    this._outlined = undefined;
  }

  protected updated() {
    this._clearOutline();
    if (!previewMatches(this._config, this.preview, this.editMode)) return;
    const root = this._tabs?.[this.selectedTabIndex]?.card;
    if (!root) return;
    const target = findPreviewTarget(root, readAt(this._config, getSelection()!.path));
    this._outlined = {element: target, outline: target.style.outline, offset: target.style.outlineOffset};
    target.style.outline = '2px solid var(--primary-color, #03a9f4)'; target.style.outlineOffset = '-2px';
  }

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("tabbed-card-editor");
  }

  static getStubConfig() {
    return {
      options: {},
      tabs: [{ card: { type: "entity", entity: "sun.sun" }, attributes: { label: "Sun" } }],
    };
  }

  public setConfig(config: TabbedCardConfig) {
    if (!config || !Array.isArray(config.tabs)) {
      throw new Error("A tabs array is required.");
    }
    if (!this._config || this._config.options?.defaultTabIndex !== config.options?.defaultTabIndex) {
      this.selectedTabIndex = defaultIndex(config);
    } else {
      this.selectedTabIndex = Math.min(this.selectedTabIndex, Math.max(0, config.tabs.length - 1));
    }
    this._config = config;

    this._styles = {
      ...this._styles,
      ...this._config.styles,
    };

    this.loadCardHelpers();
    this._selectionListener();
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (this._helpers && (_changedProperties.has("_helpers") || _changedProperties.has("_config"))) {
      this._createTabs(this._config);
    }
    if (_changedProperties.has("hass") && this._tabs?.length) {
      this._tabs.forEach((tab) => (tab.card.hass = this.hass));
    }
  }

  async _createTabs(config: TabbedCardConfig) {
    const tabs = await Promise.all(
      config.tabs.map(async (tab) => {
        return {
          styles: tab?.styles,
          attributes: { ...config?.attributes, ...tab?.attributes },
          card: await this._createCard(tab.card),
        };
      }),
    );

    if (config === this._config) this._tabs = tabs;
  }

  async _createCard(cardConfig: LovelaceCardConfig) {
    const cardElement = await this._helpers.createCardElement(cardConfig);

    cardElement.hass = this.hass;

    cardElement.addEventListener(
      "ll-rebuild",
      (ev: Event) => {
        ev.stopPropagation();
        this._rebuildCard(cardElement, cardConfig);
      },
      { once: true },
    );

    return cardElement;
  }

  async _rebuildCard(
    cardElement: LovelaceCard,
    cardConfig: LovelaceCardConfig,
  ) {
    console.log("_rebuildCard: ", cardElement, cardConfig);

    const newCardElement = await this._helpers.createCardElement(cardConfig);

    cardElement.replaceWith(newCardElement);

    // TODO: figure out a way to update the tabs array with the rebuilt card
    // this._tabs.splice(this._tabs.indexOf(cardElement), 1, newCardElement);
  }

  render() {
    if (!this.hass || !this._config || !this._helpers || !this._tabs?.length) {
      return html``;
    }

    return html`
      <mwc-tab-bar
        @MDCTabBar:activated=${(ev: mwcTabBarEvent) =>
        (this.selectedTabIndex = ev.detail.index)}
        style=${styleMap(this._styles)}
        .activeIndex=${this.selectedTabIndex}
      >
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._tabs.map(
          (tab) =>
            html`
              <mwc-tab
                style=${styleMap({...tab?.styles, ...tabLayout(this._config.options?.tabWidthMode)})}
                label="${tab?.attributes?.label || nothing}"
                ?hasImageIcon=${tab?.attributes?.icon}
                ?isFadingIndicator=${tab?.attributes?.isFadingIndicator}
                ?minWidth=${this._config.options?.tabWidthMode === 'dynamic' || (this._config.options?.tabWidthMode !== 'equal' && tab?.attributes?.minWidth)}
                ?isMinWidthIndicator=${tab?.attributes?.isMinWidthIndicator}
                ?stacked=${tab?.attributes?.stacked}
              >
                ${tab?.attributes?.icon
                ? html`<ha-icon
                      slot="icon"
                      icon="${tab?.attributes?.icon}"
                    ></ha-icon>`
                : html``}
              </mwc-tab>
            `,
        )}
      </mwc-tab-bar>
      <section ?inert=${this.preview || this.editMode}>
        <article>
          ${this._tabs.find((_, index) => index == this.selectedTabIndex)?.card}
        </article>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tabbed-card": TabbedCard;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "tabbed-card",
  name: "Tabbed Card",
  description: "A tabbed card of cards.",
});
