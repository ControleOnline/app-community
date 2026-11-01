import React, {useEffect, useState} from 'react';
import {api} from '@controleonline/ui-common/src/api';
import {parseConfigsObject} from '@controleonline/ui-common/src/react/config/deviceConfigBootstrap';
import DefaultTooltip from '@controleonline/ui-default/src/react/components/help/DefaultTooltip';
import {buildPosOperationInfo} from '@controleonline/ui-orders/src/react/utils/posOperationInfo';
import HomeIcon from '../HomeIcon';

export default function SingleItemOperationInfo({currentCompany,deviceConfig,color}) {
  const configs=parseConfigsObject(deviceConfig?.configs);
  const id=String(configs['pos-product-showcase-id'] || configs['product-showcase-id'] || '').replace(/\D/g,'');
  const [showcase,setShowcase]=useState(null);
  const key=`${currentCompany?.id}:${id}`;
  useEffect(()=>{
    let active=true;
    if(id && currentCompany?.id) api.fetch(`product_showcases/${id}`).then(value=>{
      const company=String(value?.company?.id || value?.company?.['@id'] || value?.company || '').replace(/\D/g,'');
      if(active && company===String(currentCompany.id)) setShowcase({key,name:value.name});
    }).catch(()=>{});
    return ()=>{active=false;};
  },[key,id,currentCompany?.id]);
  const value=id ? `${showcase?.key===key && showcase.name ? showcase.name : 'Vitrine'} (#${id})`
    : 'Sem vínculo específico; usa padrão da empresa ou catálogo geral';
  const rows=[...buildPosOperationInfo({currentCompany,deviceConfig}),{key:'configured-showcase',label:'Vitrine configurada',value}];
  return <DefaultTooltip accessibilityLabel="Ver configuração do PDV" title="Configuração do PDV"
    label={<HomeIcon name="info" size={14} color={color}/>} rows={rows}
    closeLabel="×" closeAccessibilityLabel="Fechar configuração do PDV" accentColor={color}
    hitSlop={{top:8,bottom:8,left:8,right:8}} style={{width:20,height:20,borderWidth:0,backgroundColor:'transparent'}}
    dialogTestID="operation-info-dialog"/>;
}
