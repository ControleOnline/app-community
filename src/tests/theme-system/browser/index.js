import '../../../styles/themeProvenance';
import '../../../web/registerVectorIconFonts';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {View,Text,Pressable} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ThemeManagerPage from '@controleonline/ui-layout/src/react/pages/ThemeManagerPage';
import {useStore} from './store';
import {api} from './api';
import ThemeToolsProvider,{useThemeTools} from '../../../components/theme-editor/ThemeToolsProvider';
import {useDomainThemeFetch,useDomainThemePublisher} from '../../../styles/themeRuntime';
const parseThemeCss=text=>Object.fromEntries([...text.matchAll(/--([\w-]+):([^;]+);/g)].map(m=>[m[1],m[2]]));
function Page(){
  const theme=useStore('theme'),qa=useStore('qa');const c=theme.getters.colors;
  const [,setBaseThemeColors]=useState({});const [clicks,setClicks]=useState(0);const [manager,setManager]=useState(false);
  useDomainThemeFetch({api,parseThemeCss,setBaseThemeColors});useDomainThemePublisher({actions:theme.actions});
  const tools=useThemeTools();
  return <View style={{padding:40,gap:24,minHeight:900,backgroundColor:c.pageBackground}}>
    <Text style={{fontSize:26,color:c.textPrimary}}>Teste local do configurador</Text>
    <View dataSet={{coThemeTools:'true'}} style={{gap:8}}>
      <Text style={{color:c.textPrimary}}>Dados sintéticos. Nenhuma conexão com o banco. Ferramentas: {tools.available?'ADMIN disponível':'indisponível'}.</Text>
      <Text style={{color:c.textPrimary}}>Gravações de teste: {qa.getters.saves} · Ações executadas: {clicks}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir configurador ADMIN" onPress={tools.openEditor} style={{padding:14,alignSelf:'flex-start',backgroundColor:c.buttonBackground,borderRadius:8}}><Text style={{color:c.buttonText}}>Abrir configurador ADMIN</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir Theme Manager" onPress={()=>setManager(value=>!value)} style={{padding:10}}><Text style={{color:c.textPrimary}}>Abrir Theme Manager</Text></Pressable>
      {!!qa.getters.toast && <Text style={{color:c.textPrimary}}>{qa.getters.toast}</Text>}
    </View>
    {manager ? <View style={{height:850}}><SafeAreaProvider><ThemeManagerPage/></SafeAreaProvider></View> : <View testID="qa-card" style={{width:480,padding:30,minHeight:220,gap:20,backgroundColor:c.cardBackground,borderColor:c.cardBorder,borderWidth:1,borderRadius:16}}>
      <Text style={{fontSize:20,color:c.cardText}}>Card inspecionável</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Ação de teste" onPress={()=>setClicks(value=>value+1)} style={{padding:12,backgroundColor:c.buttonBackground,borderColor:c.buttonBorder,borderWidth:1,borderRadius:8}}><Text style={{color:c.buttonText}}>Ação de teste</Text></Pressable>
    </View>}
  </View>;
}
createRoot(document.getElementById('root')).render(<ThemeToolsProvider><Page/></ThemeToolsProvider>);
