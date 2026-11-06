import contract from './themeContract.generated';
import {parseScreenThemeKey} from './screenThemeKeys';
const names=new Set(contract.names);
export const themeColorKey = (token,mode) => `${token}-${mode}`;
export const tokenFromKey = key => parseScreenThemeKey(key)?.token || key.replace(/-(light|dark)$/,'');
export const isOfficialThemeKey = key => names.has(tokenFromKey(key));
export const themeFieldValue = (colors,token,mode) => {
  if(Object.hasOwn(colors,`${token}-light`) || Object.hasOwn(colors,`${token}-dark`))return colors[themeColorKey(token,mode)] ?? '';
  return colors[token] ?? '';
};
export const themeFieldLabel = token => {
  if(contract.variants?.[token])return `${token} · ${contract.variants[token].label}`;
  const variant=token.includes('Secondary')?'Secundário':token.startsWith('button')?'Primário':'';
  return variant ? `${token} · ${variant}` : token;
};
export const validThemeValue = (token,value) => {
  if(value==='')return true;
  if(token==='buttonDisabledOpacity')return /^(0(\.\d+)?|1(\.0+)?)$/.test(String(value));
  return /^(#[a-f\d]{3,4}|#[a-f\d]{6}|#[a-f\d]{8}|transparent)$/i.test(value)
    || /^rgba?\(\s*[\d.%]+\s*[, ]\s*[\d.%]+\s*[, ]\s*[\d.%]+(?:\s*[,/]\s*[\d.%]+)?\s*\)$/i.test(value);
};
export function themeEditorGroups() {
  // This is a presentation alias, not another token vocabulary. Keep the existing preview.
  return [{label:'tokens base',tokens:['loadingSpinner']},...contract.groups];
}
export function serializeThemeColors(draft) {
  return Object.fromEntries(Object.entries(draft).map(([key,value])=>{
    const normalized=typeof value==='string'?value.trim():String(value ?? '');
    if(isOfficialThemeKey(key) && !validThemeValue(tokenFromKey(key),normalized))throw new Error(`Valor inválido para ${key}.`);
    return [key,normalized];
  }));
}

export const displayedThemes = (companyThemes,domainTheme,showDomain=true) =>
  showDomain && domainTheme ? [domainTheme] : companyThemes;
