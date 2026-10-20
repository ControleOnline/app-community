import React,{useSyncExternalStore} from 'react';
import {Platform,Text} from 'react-native';
const empty={};const snapshot=()=>empty,subscribe=()=>()=>{};
export default function CollectionReadStatus({catalog,endpoint,color,hideFresh=false,onlyProblems=false}){
 const state=useSyncExternalStore(catalog?.subscribe||subscribe,catalog?.snapshot||snapshot);
 const status=state[endpoint];
 if((onlyProblems&&status&&!['offline','error'].includes(status.mode))||!status||(hideFresh&&status.mode==='fresh'))return null;
 const label=status.mode==='offline'?'Sem conexão · exibindo dados salvos':status.mode==='refreshing'?'Dados salvos · atualizando…':status.mode==='cached'?'Dados da última consulta':status.mode==='error'?'Não foi possível atualizar. Tente novamente.':'Dados atualizados';
 return <Text accessibilityRole={Platform?.OS==='web'?'status':undefined} accessibilityLiveRegion={Platform?.OS==='android'?'polite':undefined} style={{color,fontSize:12,paddingHorizontal:16,paddingBottom:8}}>{label}</Text>;
}
