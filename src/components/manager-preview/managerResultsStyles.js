import legacyStyles from '@controleonline/ui-financial/src/react/pages/reports/IncomeStatement.styles';

// Preserve the report layout; supply all presentation colors from the active theme.
export function managerResultsStyles(c) {
  const styles={...legacyStyles};
  const set=(name,values)=>{styles[name]={...styles[name],...values};};
  set('container',{backgroundColor:c.pageBackground});
  for(const name of ['pageTitle','monthTitle','emptyStateTitle','modalTitle','modalSectionTitle','modalText'])set(name,{color:c.textPrimary});
  for(const name of ['yearLabel','metricLabel','emptyStateText','modalEmptyText','loadingText'])set(name,{color:c.textMuted});
  for(const name of ['filterCard','monthCard','modalCard'])set(name,{backgroundColor:c.cardBackground,borderColor:c.cardBorder,borderRadius:14,shadowColor:c.cardShadow});
  set('pageTitle',{fontSize:18});
  set('yearInput',{color:c.inputText,backgroundColor:c.inputBackground,borderColor:c.inputBorder,borderBottomColor:c.inputBorder,minHeight:44,borderRadius:8});
  for(const name of ['filterButton','clearButton','modalButton'])set(name,{backgroundColor:c.buttonBackground,borderColor:c.buttonBorder,borderRadius:10,minHeight:44,shadowColor:c.cardShadow});
  for(const name of ['filterButtonText','modalButtonText'])set(name,{color:c.buttonText,textTransform:'none'});
  set('clearButton',{width:44});
  set('metricBox',{backgroundColor:c.cardBackground,borderColor:c.cardBorder,borderRadius:10,marginBottom:14});
  set('metricAction',{width:44,height:44,borderRadius:10,backgroundColor:c.buttonBackground});
  set('textGreen',{color:c.textSuccess});set('textRed',{color:c.textDanger});set('errorText',{color:c.textDanger});
  set('modalBackdrop',{backgroundColor:'transparent'});
  set('modalCard',{backgroundColor:c.modalBackground});
  set('loadingOverlay',{backgroundColor:c.cardBackground});
  return styles;
}
