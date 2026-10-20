import React from 'react';
import {View} from 'react-native';

// Visual composition only. The consuming module owns labels, data and actions.
export default function DefaultEntityCard({media=null,children,footer=null,palette={},style,contentStyle,footerStyle,bodyStyle,embedded=false}) {
 return <View style={[{width:'100%',padding:12,gap:12,borderRadius:12,borderWidth:1,borderColor:palette.cardBorder,backgroundColor:palette.cardBackground},embedded?{borderWidth:0,borderRadius:0,backgroundColor:'transparent'}:null,style]}>
  <View testID="default-entity-card-content" style={[{flexDirection:'row',alignItems:'flex-start',gap:12},contentStyle]}>
   {media}
   <View style={[{flex:1,minWidth:0},bodyStyle]}>{children}</View>
  </View>
  {footer&&<View testID="default-entity-card-footer" style={[{width:'100%'},footerStyle]}>{footer}</View>}
 </View>;
}
