// Cache the root theme palette until its style changes, not per rendered color.
let root = null;
let observer = null;
let dirty = true;
let colors = new Set();
export const invalidateWebThemeColors = () => { dirty = true; };
export const isConfiguredWebThemeColor = value => {
  if (typeof value !== 'string' || typeof document === 'undefined') return false;
  const nextRoot = document.documentElement;
  if (!nextRoot?.style) return false;
  if (root !== nextRoot) {
    observer?.disconnect();
    root = nextRoot;
    dirty = true;
    observer = typeof MutationObserver === 'function' ? new globalThis.MutationObserver(invalidateWebThemeColors) : null;
    observer?.observe(root, {attributes: true, attributeFilter: ['style']});
  }
  // takeRecords also catches synchronous writes made outside applyThemeCssVariables.
  if (observer?.takeRecords().length) dirty = true;
  if (dirty || !observer) {
    colors = new Set();
    const style = root.style;
    for (let index = 0; index < style.length; index += 1) {
      const key = style.item(index);
      if (key.startsWith('--')) {
        const color = style.getPropertyValue(key).trim().toLowerCase();
        if (color) colors.add(color);
      }
    }
    dirty = false;
  }
  return colors.has(value.trim().toLowerCase());
};
