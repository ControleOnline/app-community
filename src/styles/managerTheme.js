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
const required=['buttonBackground','buttonText','cardBackground','cardBorder','cardIconBackground','headerBackground','headerBorder','navigationActiveBackground','navigationActiveText','navigationBackground','navigationBorder','navigationIcon','navigationText','pageBackground','textMuted','textPrimary','textSecondary','textSuccess','textWarning','tableHeaderBackground','tableRowEvenBackground','tableRowOddBackground'];
const mapping=mode=>{
 if(!['light','dark'].includes(mode))throw new Error('Modo de tema inválido.');
 return {...tableMap(mode),...(mode==='dark'?darkMap:{})};
};
export function resolveManagerTheme(theme={},mode='light'){
 const result={...theme};
 for(const [target,source] of Object.entries(mapping(mode)))result[target]=theme[source];
 // Older domain maps name their light row colors listItemEvenRow/listItemOddRow.
 // Reuse those configured tokens only when the explicit mode token is absent.
 if(mode==='light'){
  result.tableRowEvenBackground=theme['bg-even-light'] || theme.listItemEvenRow;
  result.tableRowOddBackground=theme['bg-odd-light'] || theme.listItemOddRow;
 }
 return result;
}
export function missingManagerThemeTokens(theme={},mode='light'){
 const map=mapping(mode),resolved=resolveManagerTheme(theme,mode);
 return [...new Set(required.filter(key=>typeof resolved[key]!=='string'||!resolved[key].trim()).map(key=>map[key]||key))].sort();
}
