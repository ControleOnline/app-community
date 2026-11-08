import contract from './themeContract.generated';
import {resolveManagerThemeDetails} from './managerTheme';
import {parseScreenThemeKey} from './screenThemeKeys';

export function resolveScreenThemeDetails(raw={},mode='light',screen,base=resolveManagerThemeDetails(raw,mode)){
  if(!screen)return base;
  const values={...base.values},sources={...base.sources},overrides=new Set();
  for(const [key,value] of Object.entries(raw)){
    const entry=parseScreenThemeKey(key);
    if(!entry || entry.screen!==screen || entry.mode!==mode || value==null || String(value).trim()==='')continue;
    values[entry.token]=value;sources[entry.token]=key;overrides.add(entry.token);
  }
  // Unconfigured purpose variants also inherit local base overrides. Explicit
  // global variants retain their meaning unless the screen overrides them too.
  for(const [token,{base:parent}] of Object.entries(contract.variants || {})){
    if(!overrides.has(token) && base.sources[token]===base.sources[parent]){
      values[token]=values[parent];sources[token]=sources[parent];
    }
  }
  return {values,sources};
}
export function screenThemePresentation(raw, mode, screen) {
  const base = resolveManagerThemeDetails(raw, mode);
  const {values} = resolveScreenThemeDetails(raw, mode, screen, base);
  const css = Object.fromEntries(Object.entries(values).filter(([token,value])=>value!=null && value!==base.values[token])
    .map(([token,value])=>[`--co-theme-${token}`,String(value)]));
  const scrollbars = values.scrollbarThumb && values.scrollbarTrack
    ? (values.scrollbarThumbHover ? 'hover' : 'normal') : undefined;
  return {css, scrollbars};
}

export const screenThemeCss = (raw, mode, screen) => screenThemePresentation(raw, mode, screen).css;
