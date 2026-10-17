import type { ConfigPath } from "./types";

// Transient editor state: never written into the dashboard configuration.
export interface EditorSelection { signature: string; path: ConfigPath; owner: object }
export const SELECTION_EVENT = "tabbed-card-editor-selection";
let selection: EditorSelection | undefined;
export function getSelection(): EditorSelection | undefined { return selection; }
export function selectForPreview(owner: object, config: unknown, path: ConfigPath): void {
  selection = {owner, signature: JSON.stringify(config), path: [...path]};
  window.dispatchEvent(new Event(SELECTION_EVENT));
}
export function clearPreview(owner: object): void {
  if (selection?.owner !== owner) return;
  selection = undefined;
  window.dispatchEvent(new Event(SELECTION_EVENT));
}

export function previewMatches(config: unknown, preview: boolean, editMode: boolean): boolean {
  return Boolean(selection && (preview || editMode) && selection.signature === JSON.stringify(config));
}

export function findPreviewTarget(root: HTMLElement, config: unknown): HTMLElement {
  const signature = JSON.stringify(config);
  function visit(element: HTMLElement): HTMLElement | undefined {
    // hui-card exposes its config publicly. Do not inspect private plugin state.
    if (element.tagName.toLowerCase() === "hui-card" &&
      JSON.stringify((element as any).config) === signature) return element;
    for (const child of [...element.children, ...Array.from(element.shadowRoot?.children || [])]) {
      const match = visit(child as HTMLElement); if (match) return match;
    }
    return undefined;
  }
  // Some custom containers do not expose hui-card children; outline their tab.
  return visit(root) || root;
}
