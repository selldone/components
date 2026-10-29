/** Resolve the still-editable owner, including delayed dialog callbacks. */
export function articleAddonContext(element: HTMLElement | null) {
  const editor = element?.closest('.medium-editor-element[contenteditable="true"]');
  const core = editor && $(editor).data("plugin_mediumInsert");
  if (!element?.isConnected || !core?.options?.enabled) return null;
  // v-show keeps the editable tree mounted for article previews and other tabs.
  for (let node = element; node; node = node.parentElement) {
    if (node.hidden || node.inert || node.hasAttribute("inert") || node.style.display === "none") return null;
  }
  return { element, editor, core };
}
