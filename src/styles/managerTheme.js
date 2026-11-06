import contract from './themeContract.generated';
const canonical = new Set(contract.names);
// Token-to-token contract only. Every color value is supplied by Themes.
const tableMap=mode=>({tableHeaderBackground:`bg-headers-${mode}`,tableRowEvenBackground:`bg-even-${mode}`,tableRowOddBackground:`bg-odd-${mode}`});
const darkMap={
 appBackground:'bg-dark',containerBackground:'bg-dark',pageBackground:'bg-dark',screenBackground:'bg-dark',
 panelBackground:'darkCard',surface:'darkCard',cardBackground:'darkCard',cardIconBackground:'bg-headers-dark',cardIconColor:'text-headers-dark',
 panelBorder:'darkBorder',cardBorder:'darkBorder',headerBorder:'darkBorder',navigationBorder:'darkBorder',
 headerBackground:'bg-headers-dark',headerText:'text-headers-dark',headerIcon:'text-menu-dark',
 navigationBackground:'bg-menu-dark',navigationText:'text-menu-dark',navigationIcon:'text-menu-dark',
 navigationActiveBackground:'bg-even-dark',navigationActiveText:'text-headers-dark',navigationActiveIcon:'text-headers-dark',
 textPrimary:'text-headers-dark',textSecondary:'text-menu-dark',textMuted:'text-menu-dark',
 inputBackground:'darkCard',inputText:'text-headers-dark',inputBorder:'darkBorder',
 selectBackground:'darkCard',selectText:'text-headers-dark',selectBorder:'darkBorder',
 modalBackground:'darkCard',modalBorder:'darkBorder',modalTitle:'text-headers-dark',modalCloseIcon:'text-menu-dark',
 listItemBackground:'darkCard',listItemBorder:'darkBorder',listItemText:'text-headers-dark',
 listItemSubtitleText:'text-menu-dark',listItemIcon:'text-menu-dark',cardText:'text-headers-dark',
 toolbarBackground:'darkCard',toolbarBorder:'darkBorder',
 tableFooterBackground:'darkCard',tableFooterBorder:'darkBorder',tableFooterText:'text-headers-dark',
 tableContainerBorder:'darkBorder',tableBorder:'darkBorder',tableHeaderBorder:'darkBorder',tableRowBorder:'darkBorder',tableToolbarBorder:'darkBorder',
 tableHeaderText:'text-headers-dark',tableFilterBackground:'bg-headers-dark',tableFilterBorder:'darkBorder',tableFilterText:'text-menu-dark',
 tableActionBackground:'darkCard',tableActionBorder:'darkBorder',tableActionIcon:'text-headers-dark',
 badgeBackground:'bg-headers-dark',badgeText:'text-headers-dark',
 chipBackground:'bg-headers-dark',chipText:'text-menu-dark',chipBorder:'darkBorder',
 chipSelectedBackground:'bg-even-dark',chipSelectedBorder:'darkBorder',chipSelectedText:'text-headers-dark',chipIcon:'text-menu-dark',
 modalHeaderText:'text-headers-dark',modalText:'text-headers-dark',
 footerBackground:'darkCard',footerBorder:'darkBorder',footerText:'text-menu-dark',
};
export const managerObjectThemeTokens = contract.managerTokens;
const required=['buttonBackground','buttonText','cardBackground','cardBorder','cardIconBackground','headerBackground','headerBorder','navigationActiveBackground','navigationActiveText','navigationBackground','navigationBorder','navigationIcon','navigationText','pageBackground','textMuted','textPrimary','textSecondary','textSuccess','textWarning','tableHeaderBackground','tableRowEvenBackground','tableRowOddBackground'];
const mapping=mode=>{
 if(!['light','dark'].includes(mode))throw new Error('Modo de tema inválido.');
 return {...tableMap(mode),...(mode==='dark'?darkMap:{})};
};
// Mode suffixes are transport keys; visual objects still consume canonical tokens.
export function apiModeTheme(theme={},mode='light'){
 if(!['light','dark'].includes(mode))throw new Error('Modo de tema inválido.');
 const suffix=`-${mode}`;
 const entries=Object.entries(theme).filter(([key])=>key.endsWith(suffix) && canonical.has(key.slice(0, -suffix.length)));
 if(!entries.length)return null;
 return Object.fromEntries(entries.map(([key,value])=>[key.slice(0,-suffix.length),value]));
}
export function resolveManagerThemeDetails(input={},mode='light'){
 // Screen transport keys must never become global palette roles or CSS aliases.
 const theme=Object.fromEntries(Object.entries(input).filter(([key])=>!key.startsWith('screen_') && !key.startsWith('q-screen_')));
 if(!['light','dark'].includes(mode))throw new Error('Modo de tema inválido.');
 const values={...theme},sources=Object.fromEntries(Object.keys(theme).map(key=>[key,key]));
 const modern=Object.keys(theme).some(key=>/-(light|dark)$/.test(key) && canonical.has(key.replace(/-(light|dark)$/, '')) && !contract.variants?.[key.replace(/-(light|dark)$/, '')]);
 if(modern){
  for(const key of Object.keys(values)){
   const variant=/-(light|dark)$/.test(key);
   if((variant && !canonical.has(key.replace(/-(light|dark)$/, ''))) || (!variant && (key.startsWith('q-') || Object.hasOwn(theme,key+'-light') || Object.hasOwn(theme,key+'-dark')))){delete values[key];delete sources[key];}
  }
  for(const token of canonical){const key=`${token}-${mode}`;if(Object.hasOwn(theme,key)){values[token]=theme[key];sources[token]=key;}}
 }else{
  for(const [target,source] of Object.entries(mapping(mode))){values[target]=theme[source];sources[target]=source;}
  if(mode==='light'){
   for(const [target,first,second] of [['tableRowEvenBackground','bg-even-light','listItemEvenRow'],['tableRowOddBackground','bg-odd-light','listItemOddRow']]){
    const source=theme[first]?first:second;values[target]=theme[source];sources[target]=source;
   }
  }
 }
 // Optional purpose variants inherit only the resolved base of the same mode.
 // This is a read-time relationship, never a migration or a persisted copy.
 for(const [token,{base}] of Object.entries(contract.variants || {})){
  const key=`${token}-${mode}`;
  // Variations also work on legacy palettes, without changing their resolution model.
  if(Object.hasOwn(theme,`${token}-light`) || Object.hasOwn(theme,`${token}-dark`)){
   if(Object.hasOwn(theme,key)){values[token]=theme[key];sources[token]=key;}
   else{delete values[token];delete sources[token];}
  }
  if(values[token]===undefined || values[token]===null || String(values[token]).trim()===''){
   values[token]=values[base];sources[token]=sources[base];
  }
 }
 return {values,sources};
}
export function resolveManagerTheme(theme={},mode='light'){return resolveManagerThemeDetails(theme,mode).values;}
export function describeThemeColor(theme={},token,mode='light'){
 return describeResolvedThemeColor(resolveManagerThemeDetails(theme,mode),token);
}
export function describeResolvedThemeColor({values,sources},token){
 const value=values[token];
 return value===undefined || value===null || String(value).trim()===''?{value:'',source:null}:{value,source:sources[token] || null};
}
export function missingManagerThemeTokens(theme={},mode='light',objectTheme=null){
 if(objectTheme) return [...new Set(managerObjectThemeTokens.filter(key=>{
  const value=objectTheme[key] || objectTheme[contract.variants?.[key]?.base];
  return typeof value!=='string'||!value.trim();
 }).map(key=>contract.variants?.[key]?.base || key))].sort();
 const map=mapping(mode),resolved=resolveManagerTheme(theme,mode);
 return [...new Set(required.filter(key=>typeof resolved[key]!=='string'||!resolved[key].trim()).map(key=>map[key]||key))].sort();
}
