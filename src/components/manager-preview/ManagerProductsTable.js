import React,{useMemo,useState} from 'react';
import {Pressable,Text,View,useWindowDimensions} from 'react-native';
import {useStore} from '@store';
import {useRoute} from '@react-navigation/native';
import DefaultTable from '../../../node_modules/@controleonline/ui-default/src/react/components/table/DefaultTable';
import {DefaultTableThemeContext} from '../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';
import {DefaultFileCacheContext} from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {pdvImageCache} from '../../experience/pdvImageCache';
import {useManagerPreview} from './ManagerPreviewProvider';
import {presentProduct,productColumns,productPresentation} from './productPresentation';
import {managerTableTheme} from './managerTableTheme';

export default function ManagerProductsTable(props) {
 const route=useRoute(),{width}=useWindowDimensions(),{colors:c}=useManagerPreview();
 const store=useStore('products'),people=useStore('people');
 const pdv=(props.interactionModeOverride||route.params?.interactionMode)==='pdv',mobile=width<=760;
 const [advanced,setAdvanced]=useState(false);
 const columns=productColumns(store.getters.columns?.length?store.getters.columns:props.columns||[],pdv,advanced);
 const count=pdv?(mobile?1:width<1440?2:3):1;
 const mode=store.getters.configs?.effectiveViewMode||store.getters.configs?.viewMode||(pdv||mobile?'cards':'table');
 const palette={...c,cardText:c.textPrimary,iconDisabled:c.textMuted};
 const presentation=productPresentation(c,pdv);
 const renderCard=cardProps=>presentProduct(props.renderCard?.(cardProps),presentation,palette);
 const Actions=useMemo(()=>function ProductActions({row}){
  return presentProduct(props.renderCard?.({item:row}),{...productPresentation(c,true),actionOnly:true},palette);
 },[props.renderCard,c]);
 const company=people.getters.currentCompany?.id||'';
 const cache=useMemo(()=>({load:(uri,headers,load)=>pdvImageCache.load(company,uri,headers,load)}),[company]);
 const toolbarActions=useMemo(()=>{
  const actions=props.toolbarActions;
  if(!actions?.some(action=>action.key==='products-all'))return actions;
  return actions.map(action=>action.key==='products-all'?{...action,label:'Todos os produtos',color:c.textMuted,style:{...action.style,backgroundColor:c.cardBackground,borderColor:c.cardBorder}}:action);
 },[props.toolbarActions,c]);
 const theme=managerTableTheme(c);
 const button=(label,onPress)=><Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
  style={{minHeight:44,borderWidth:1,borderColor:c.cardBorder,borderRadius:10,paddingHorizontal:12,justifyContent:'center',backgroundColor:c.cardBackground}}><Text style={{color:c.textPrimary,fontSize:12}}>{label}</Text></Pressable>;
 return <View style={{flex:1,minHeight:0,backgroundColor:c.pageBackground}}>
  {!(mobile&&pdv&&props.inlineCatalog)&&<View style={{padding:mobile?12:18,gap:10,flexDirection:'row',flexWrap:'wrap',alignItems:'center'}}>
   <View style={{flex:1,minWidth:180}}><Text accessibilityRole="header" style={{fontSize:18,fontWeight:'700',color:c.textPrimary}}>{props.catalogTitle||(pdv?'Adicionar produtos ao pedido':'Produtos')}</Text>
</View>
   {!pdv&&props.add&&button('Novo produto',props.onAdd)}
   {!pdv&&button(advanced?'Recolher opções administrativas':'Opções administrativas',()=>setAdvanced(!advanced))}
  </View>}
  <DefaultFileCacheContext.Provider value={cache}><DefaultTableThemeContext.Provider value={theme}>
   <DefaultTable {...props} presentationColumns={columns} appearance={pdv?'soft':undefined} initialViewMode={pdv||mobile?'cards':'table'}
    renderCard={renderCard} showSearch={props.externalCatalogSearch?false:props.inlineCatalog?true:props.showSearch} showToolbar showToolbarControls showToolbarActions showAdministrativeTools={advanced&&!pdv} showRowActions={pdv&&mode==='table'}
    onEditRow={pdv?null:props.onEditRow} onRowPress={pdv?null:props.onRowPress} rowActionsComponent={pdv&&mode==='table'?Actions:undefined} rowActionsWidth={170}
    toolbarActions={toolbarActions} importAction={advanced?props.importAction:null} exportAction={advanced?props.exportAction:null} onImport={advanced?props.onImport:null} onExport={advanced?props.onExport:null}
    add={false} searchPlaceholder="Buscar produto por nome ou código" compactBreakpoint={760}
    visibleColumnsPreferenceKey={`manager-products:${pdv?'pdv':'cadastro'}:${advanced?'completo':'essencial'}`}
    rowStyle={mode==='cards'&&count>1?{flex:1,minWidth:0,maxWidth:count===2?'48%':'32%'}:undefined}
    cardListProps={{...props.cardListProps,numColumns:count,key:`manager-products-${pdv?'pdv':'cadastro'}-${count}`,
      columnWrapperStyle:count>1?{gap:12}:undefined,contentContainerStyle:{padding:12,gap:12,paddingBottom:24}}}/>
  </DefaultTableThemeContext.Provider></DefaultFileCacheContext.Provider>
 </View>;
}
