import React from 'react';
import DefaultEntityCard from '@controleonline/ui-default/src/react/components/cards/DefaultEntityCard';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';

export function productPresentation(c,pdv) {
 return {compact:true,pdv,FileComponent:DefaultFile,...(pdv?{CardComponent:DefaultEntityCard}:{}),
  styles:{card:{flexDirection:'row',width:'100%',minHeight:112,borderRadius:12,borderWidth:1,borderColor:c.cardBorder,padding:12,gap:12,backgroundColor:c.cardBackground},
   imageWrap:{width:pdv?76:64,height:pdv?76:80,flexShrink:0,alignItems:'center',justifyContent:'center'},coverImage:{width:pdv?76:64,height:pdv?76:80,borderRadius:8},
   body:{flex:1,minWidth:0,gap:8},bodyNoImage:{},cardContent:{gap:4},cardTopRow:{flexDirection:'row',alignItems:'flex-start',gap:8},cardIdentity:{flex:1,minWidth:0},
   nameRow:{},name:{fontSize:14,lineHeight:20,fontWeight:'700',color:c.textPrimary},
   description:{fontSize:12,lineHeight:17,color:c.textMuted},
   metaGridRow:{flexDirection:'row',gap:6,flexWrap:'wrap'},metaGridCell:{alignSelf:'flex-start'},
   categoryChip:{flexDirection:'row',gap:4,alignSelf:'flex-start',alignItems:'center',borderRadius:6,paddingHorizontal:6,paddingVertical:3},
   cardTypeChip:{alignSelf:'flex-start'},typeChip:{alignSelf:'flex-start',paddingHorizontal:6,paddingVertical:3,borderRadius:6},
   queueLine:{flexDirection:'row',gap:4},queueText:{fontSize:12,color:c.textMuted},
   priceRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
   price:{fontSize:16,fontWeight:'700',color:c.textPrimary},priceTotal:{color:c.textMuted},actionWrap:{flexShrink:0},
   customizeButton:{minHeight:44,paddingHorizontal:12,justifyContent:'center',borderRadius:8},customizeButtonText:{fontSize:12,fontWeight:'700'},
   managerMeta:{flexDirection:'row',gap:8,alignItems:'center'},skuLabel:{color:c.textMuted,fontSize:12},
  }};
}
// Preserve wrappers and every domain callback while injecting optional presentation.
export function presentProduct(element,presentation,palette) {
 if(!React.isValidElement(element))return element;
 if(element.props.product)return React.cloneElement(element,{presentation,palette,displayMode:'card'});
 return element.props.children?React.cloneElement(element,{},React.Children.map(element.props.children,child=>presentProduct(child,presentation,palette))):element;
}
function ProductThumbnail({row}) {
 const files=Array.isArray(row.productFiles)?row.productFiles:[];
 const coverId=row.extraData?.imageCoverRelationId;
 const relation=files.find(item=>String(item.id)===String(coverId)&&item.file)||files.find(item=>item.file);
 return relation?<DefaultFile file={relation.file} accessibilityLabel={`Foto de ${row.product}`} resizeMode="contain" style={{width:44,height:44,borderRadius:6}}/>:null;
}
export function productColumns(source,pdv,advanced) {
 const labels={id:'Código',sku:'SKU',product:'Produto',description:'Descrição',price:'Preço',active:'Situação',productUnit:'Unidade',queue:'Fila',type:'Tipo',productCondition:'Condição',featured:'Destaque',company:'Empresa',productFiles:'Imagens'};
 const essential=pdv?['product','price']:['id','sku','product','price','active'];
 const thumbnail={name:'__productPhoto',label:'Foto',sortable:false,filter:false,filters:false,editable:false,width:72,minWidth:72,maxWidth:72,cellComponent:ProductThumbnail};
 return [thumbnail,...source.filter(column=>advanced||essential.includes(column.name)).map(column=>({...column,
  label:labels[column.name]||column.label,...(column.name==='product'?{minWidth:260}:{}),
  ...(pdv?{editable:false,to:undefined}:{}),
 }))];
}
