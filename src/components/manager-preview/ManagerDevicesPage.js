import React from 'react';
import {Pressable,Text,View} from 'react-native';
import Devices from '@controleonline/ui-common/src/react/pages/Devices';
import {useManagerPreview} from './ManagerPreviewProvider';

// Device-list aliases reference the active domain tokens, including dark mode.
export function managerDevicePalette(colors) {
  return {...colors,background:colors.pageBackground,text:colors.textPrimary,
    cardText:colors.textPrimary,border:colors.cardBorder,primary:colors.buttonBackground,
    white:colors.buttonText,cardSelectedBackground:colors.navigationActiveBackground,
    cardSelectedBorder:colors.navigationActiveBorder,cardSelectedText:colors.navigationActiveText,
    badgeSelectedBackground:colors.navigationActiveBackground,badgeSelectedText:colors.navigationActiveText,
    deviceAccent:colors.cardIconColor};
}
export default function ManagerDevicesPage(props) {
  const preview=useManagerPreview();
  if(!preview)return <Devices {...props}/>;
  const c=preview.colors;
  return <View style={{flex:1,minHeight:0,backgroundColor:c.pageBackground}}>
    <View style={{paddingHorizontal:16,paddingVertical:12,gap:8}}>
      {props.navigation.canGoBack?.()&&<Pressable accessibilityRole="button" accessibilityLabel="Voltar"
        onPress={()=>props.navigation.goBack()} style={{minHeight:44,alignSelf:'flex-start',justifyContent:'center',paddingHorizontal:10}}>
        <Text style={{color:c.textPrimary}}>← Voltar</Text>
      </Pressable>}
      <Text accessibilityRole="header" style={{color:c.textPrimary,fontSize:18,fontWeight:'700'}}>Dispositivos</Text>
      <Text style={{color:c.textMuted,fontSize:12}}>Consulte os aparelhos e suas configurações por tipo.</Text>
    </View>
    <Devices {...props} themePalette={managerDevicePalette(c)}/>
  </View>;
}
