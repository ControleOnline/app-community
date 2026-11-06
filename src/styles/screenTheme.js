import contract from './themeContract.generated';
import {resolveManagerThemeDetails} from './managerTheme';
import {parseScreenThemeKey} from './screenThemeKeys';

export function resolveScreenThemeDetails(raw={},mode='light',screen){
  const base=resolveManagerThemeDetails(raw,mode);
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
export function screenThemeCss(raw,mode,screen){
  const base=resolveManagerThemeDetails(raw,mode).values;
  const local=resolveScreenThemeDetails(raw,mode,screen).values;
  return Object.fromEntries(Object.entries(local).filter(([token,value])=>value!=null && value!==base[token]).map(([token,value])=>[`--co-theme-${token}`,String(value)]));
}
