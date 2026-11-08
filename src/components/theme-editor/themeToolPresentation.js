import {useStore} from '@store';
import {useThemeRuntime} from '../../styles/themeRuntime';
import {resolveManagerTheme} from '../../styles/managerTheme';

// Natural message keys use the same company/language translation buckets as the app.
// Substitute values only after translation so IDs and company names never become keys.
export function themeEditorText(message,values={}) {
 const source=String(message ?? '');
 const translator=globalThis.t;
 const translated=translator?.t?.('configs','theme_editor',source);
 const fallback=translator?.formatMessage?.(source);
 const text=translated && translated!==source && translated!==fallback?translated:source;
 return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
  // The translation formatter can capitalize the numbered placeholders.
  const valueKey = /^V\d+$/.test(key) ? key.toLowerCase() : key;
  return Object.hasOwn(values, valueKey) ? String(values[valueKey] ?? '') : match;
 });
}
export function useThemeEditorPalette() {
 // Subscribe to the existing translation store; its updates rerender tool labels.
 useStore('translate');
 const runtime=useThemeRuntime();
 // Preview edits affect the inspected screen, not the controls needed to cancel them.
 return resolveManagerTheme(runtime.raw || {},runtime.mode);
}
