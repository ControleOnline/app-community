import React from 'react';
import {Modal,Pressable,ScrollView,Text,View} from 'react-native';
import ThemeColorEditor from './ThemeColorEditor';
export default function ThemeEditorDialog({theme,onClose,onSaved,selectedTokens,onPreviewColors}) {
  if(!theme)return null;
  return <Modal transparent visible animationType="fade" onRequestClose={onClose}>
    <View dataSet={{coThemeTools:'true'}} style={{flex:1,backgroundColor:'rgba(15,23,42,0.35)',justifyContent:'center',padding:20}}>
      <View style={{width:'100%',maxWidth:850,maxHeight:'90%',alignSelf:'center',backgroundColor:'#ffffff',borderRadius:14,overflow:'hidden'}}>
        <View style={{padding:16,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={{fontWeight:'700',fontSize:16,color:'#0f172a'}}>Cores por modo · {theme.theme}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar editor e cancelar prévia" onPress={onClose}><Text style={{color:'#0f172a',padding:8}}>Fechar ✕</Text></Pressable>
        </View>
        <ScrollView><ThemeColorEditor theme={theme} selectedTokens={selectedTokens} onSaved={onSaved} onPreviewColors={onPreviewColors}/></ScrollView>
      </View>
    </View>
  </Modal>;
}
