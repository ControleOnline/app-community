import React,{useState} from 'react';
import {Pressable,Text,View,useWindowDimensions} from 'react-native';
import DefaultTable from '../../../node_modules/@controleonline/ui-default/src/react/components/table/DefaultTable';
import {DefaultTableThemeContext} from '../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';
import {managerTableTheme} from './managerTableTheme';
import {useStore} from '@store';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {groupCategoryCards} from './categoryHierarchy';
import {useManagerPreview} from './ManagerPreviewProvider';

export function categoryTint(background,color) {
 const rgb=value=>{
  if(typeof value!=='string')return null;
  const hex=value.trim().replace(/^#/,'');
  const full=/^[a-f0-9]{3}$/i.test(hex)?hex.split('').map(ch=>ch+ch).join(''):hex;
  return /^[a-f0-9]{6}$/i.test(full)?full.match(/../g).map(ch=>parseInt(ch,16)):null;
 };
 const base=rgb(background),accent=rgb(color);
 if(!base||!accent)return background;
 // A subtle category layer over the configured surface, including dark mode.
 return '#'+base.map((channel,i)=>Math.round(channel*.94+accent[i]*.06).toString(16).padStart(2,'0')).join('');
}
export function pdvCategoryPresentation(c,advanced,color) {
  const background=categoryTint(c.cardBackground,color);
  return {FileComponent:DefaultFile,showManagement:advanced,background,text:c.textPrimary,border:c.cardBorder,
    styles:{cardImage:{width:'100%',height:88,borderRadius:12,overflow:'hidden',borderWidth:1,borderColor:c.cardBorder,flexDirection:'row',alignItems:'center',gap:12,padding:12},
      cardImageCompact:{},cardImageMobile:{},
      cardCoverImage:{width:60,height:60,borderRadius:8,flexShrink:0},
      cardOverlay:{flex:1,minWidth:0,minHeight:44,justifyContent:'center',backgroundColor:background},
      cardOverlayCompact:{},cardOverlayMobile:{},
      cardOverlayName:{fontSize:14,fontWeight:'700',color:c.textPrimary},cardOverlayNameCompact:{},cardOverlayNameMobile:{}}};
}
export default function ManagerPdvCatalog(props) {
 const {colors:c}=useManagerPreview(),{width}=useWindowDimensions();
 const categoryStore=useStore('categories');
 const configs=categoryStore.getters.configs||{};
 const viewMode=props.nativeCatalogEntry?'cards':configs.effectiveViewMode||configs.viewMode||'cards';
 const sourceColumns=props.columns||categoryStore.getters.columns||[];
 const labels={id:'Código',name:'Categoria',sortOrder:'Ordem de exibição',color:'Cor',icon:'Ícone',categoryFiles:'Imagem',parent:'Categoria principal'};
 const tableColumns=sourceColumns.map(column=>({...column,label:labels[column.name]||column.label}));
 const [advanced,setAdvanced]=useState(false);
 const columns=width<=760?2:width<1280?3:5;
 const renderCard=cardProps=>{
  const renderNode=node=>{
   const category=node.category;
   const card=props.renderCard?.({...cardProps,item:category,row:category,
    openRow:()=>props.onRowPress?.(category),openEdit:()=>props.onEditRow?.(category)});
   const presented=React.isValidElement(card)?React.cloneElement(card,{presentation:pdvCategoryPresentation(c,advanced,category.color)}):card;
   return <View key={category.id||category['@id']} style={{gap:8}}>
    {presented}
    {!props.nativeCatalogEntry&&node.children.length>0&&<View accessibilityLabel={`Subcategorias de ${category.name}`}
     style={{marginLeft:12,paddingLeft:10,borderLeftWidth:1,borderLeftColor:c.cardBorder,gap:8}}>
     {node.children.map(child=>renderNode(child))}
    </View>}
   </View>;
  };
  const node=cardProps.item?.__pdvCategoryNode;
  if(node)return renderNode(node);
  const card=props.renderCard?.(cardProps);
  return React.isValidElement(card)?React.cloneElement(card,{presentation:pdvCategoryPresentation(c,advanced,card.props.category?.color)}):card;
 };
 const theme=managerTableTheme(c);
 return <View style={{flex:1,minHeight:0,backgroundColor:c.pageBackground}}>
  {!props.nativeCatalogEntry&&<View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:8,paddingHorizontal:12,paddingVertical:8}}>
   <Text style={{flex:1,color:c.textMuted,fontSize:12}}>Selecione uma categoria para ver os produtos.</Text>
   <Pressable accessibilityRole="button" accessibilityLabel={advanced?'Recolher opções do catálogo':'Mais opções do catálogo'}
    onPress={()=>setAdvanced(!advanced)} style={{minHeight:44,paddingHorizontal:12,borderRadius:10,borderWidth:1,borderColor:c.cardBorder,justifyContent:'center',backgroundColor:c.cardBackground}}>
    <Text style={{color:c.textPrimary,fontSize:12}}>{advanced?'Recolher opções':'Mais opções do catálogo'}</Text>
   </Pressable>
  </View>}
  <DefaultTableThemeContext.Provider value={theme}>
   <DefaultTable {...props} appearance="soft" columns={tableColumns} initialViewMode="cards" viewMode={props.nativeCatalogEntry?'cards':undefined} renderCard={renderCard}
    showToolbarActions={props.nativeCatalogEntry||advanced} showToolbarControls={props.nativeCatalogEntry?false:advanced} showAdministrativeTools={advanced&&!props.nativeCatalogEntry} showRowActions={props.showRowActions} add={advanced?props.add:false}
    searchPlaceholder="Buscar categoria" rowStyle={viewMode==='cards'?{flex:1,minWidth:0,maxWidth:columns===2?'48%':columns===3?'32%':'19%'}:undefined}
    cardListProps={{...props.cardListProps,transformData:groupCategoryCards,key:`manager-pdv-categories-${columns}`,numColumns:columns,
      columnWrapperStyle:{gap:12,alignItems:'flex-start'},contentContainerStyle:{gap:12,padding:12,paddingBottom:24}}}/>
  </DefaultTableThemeContext.Provider>
 </View>;
}
