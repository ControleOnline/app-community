import {useManagementPageTitle} from './ManagementPageTitleContext';
import React from 'react';
import {Text,View} from 'react-native';
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
  const ownsTitle=useManagementPageTitle();
  const preview=useManagerPreview();
  if(!preview)return <Devices {...props}/>;
  const c=preview.colors;
  return <View style={{flex:1,minHeight:0,backgroundColor:c.pageBackground}}>
    <View style={{paddingHorizontal:16,paddingVertical:12,gap:8}}>

      {!ownsTitle && <Text accessibilityRole="header" style={{color:c.textPrimary,fontSize:18,fontWeight:'700'}}>Dispositivos</Text>}
      <Text style={{color:c.textMuted,fontSize:12}}>Consulte os aparelhos e suas configurações por tipo.</Text>
    </View>
    <Devices {...props} themePalette={managerDevicePalette(c)}/>
  </View>;
}
