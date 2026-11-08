import {installThemeScrollbarStyles} from './themeScrollbars';
import {invalidateWebThemeColors} from './webThemeColorCache';
import {colors as defaultColors} from '@controleonline/ui-layout/src/styles/colors';

export const resolveThemePalette = (themeColors = {}) => ({...themeColors});
export const withOpacity = (value, opacity = 1) => {
  if (typeof value !== 'string') return value;
  if (value.startsWith('var(')) return `color-mix(in srgb, ${value} ${Math.max(0,Math.min(1,opacity))*100}%, transparent)`;
  const hex=value.replace('#','');
  if (!/^[a-f0-9]{6}$/i.test(hex)) return value;
  return `rgba(${parseInt(hex.slice(0,2),16)}, ${parseInt(hex.slice(2,4),16)}, ${parseInt(hex.slice(4,6),16)}, ${opacity})`;
};
export const applyPaletteToRuntimeColors = (palette = {}, target = defaultColors) => {
  Object.keys(target).forEach(key => {delete target[key];});
  Object.assign(target,palette);
  return target;
};
let owner = null;
let managed = new Map();
export const applyThemeCssVariables = ({themeColors = {}} = {}) => {
  if (typeof document === 'undefined') return;
  const root=document.documentElement;
  if(owner!==root){owner=root;managed=new Map();installThemeScrollbarStyles(document);}
  const next=new Map();
  for(const [key,value] of Object.entries(themeColors)) {
    if(value===undefined || value===null || String(value).trim()==='') continue;
    next.set(`--${key}`,String(value));
    next.set(key.startsWith('q-')?`--${key.slice(2)}`:`--q-${key}`,String(value));
    next.set(`--co-theme-${key}`,String(value));
  }
  for(const key of managed.keys()) if(!next.has(key)) root.style.removeProperty(key);
  for(const [key,value] of next) if(managed.get(key)!==value)root.style.setProperty(key,value);
  managed=next;
  invalidateWebThemeColors();
};

// Asset resolution remains owned by the configured ui-layout module.
export {buildAssetUrl} from '@theme-original/ui-layout/branding';
