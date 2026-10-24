import React, {useState} from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import CompanyFilter from '@controleonline/ui-manager/src/react/components/CompanyFilter';
import {isCompanySelectable} from '@controleonline/ui-people/src/react/utils/currentCompanySelection';

// The API-provided company list remains the authority, independent of menu placement.
export default function SingleItemCompanyControl({navigation, people, order, busy, colors: c, onSwitch, saleScreen}) {
  const [pending, setPending] = useState(null);
  const select = company => {
    if (busy || !isCompanySelectable(company) || String(company.id) === String(people.currentCompany?.id)) return;
    if (saleScreen || order?.orderProducts?.length || Number(order?.price || order?.total || 0) > 0) setPending(company);
    else onSwitch(company);
  };
  const confirm = () => {
    const company = people.companies?.find(item => String(item.id) === String(pending?.id));
    if (busy || !isCompanySelectable(company)) return;
    setPending(null);
    onSwitch(company);
  };
  return <>
    <CompanyFilter navigation={navigation} appearance="soft" mode="icon" align="end" wrapLabel compact onSelectCompany={select} disabled={busy}/>
    <Modal visible={!!pending} transparent animationType="fade" onRequestClose={()=>setPending(null)}>
      <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.35)',justifyContent:'center',padding:20}}>
        <View style={{backgroundColor:c.cardBackground,borderRadius:16,padding:20,gap:16}}>
          <Text style={{color:c.textPrimary,fontSize:18,fontWeight:'600'}}>Trocar empresa?</Text>
          <Text style={{color:c.textPrimary}}>O pedido permanece em {people.currentCompany?.alias || people.currentCompany?.name}. Você irá para a tela inicial de {pending?.alias || pending?.name}.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Continuar nesta empresa" onPress={()=>setPending(null)} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:c.textPrimary}}>Continuar nesta empresa</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Trocar empresa" disabled={busy} onPress={confirm} style={{minHeight:44,justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:c.buttonBackground}}><Text style={{color:c.buttonText}}>Trocar empresa</Text></Pressable>
        </View>
      </View>
    </Modal>
  </>;
}
