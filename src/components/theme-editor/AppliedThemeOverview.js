import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,Text,TextInput,View} from 'react-native';
import {env} from '@env';
import {resolveAppDomain} from '@controleonline/ui-common/src/utils/appDomain';
import {useThemeRuntime} from '../../styles/themeRuntime';
import {resolveManagerThemeDetails,describeResolvedThemeColor} from '../../styles/managerTheme';
import contract from '../../styles/themeContract.generated';
import {loadDomainTheme,editorContext} from './themeService';
import ThemeEditorDialog from './ThemeEditorDialog';
import CompanyBrandingEditor from './CompanyBrandingEditor';
import ThemeCatalog from './ThemeCatalog';
import {useThemeTools} from './ThemeToolsProvider';

// The active domain and the selected company are different identities. Never rebind either here.
export default function AppliedThemeOverview({companyThemes=[],onResolved,onViewChange,showDomain=true}){
 const runtime=useThemeRuntime(),tools=useThemeTools();
 const [theme,setTheme]=useState(null),[error,setError]=useState(''),[open,setOpen]=useState(false),[expanded,setExpanded]=useState(false),[search,setSearch]=useState(''),[reload,setReload]=useState(0);
 const context=editorContext(),domain=resolveAppDomain(env.DOMAIN);
 useEffect(()=>{
  let current=true;setTheme(null);setError('');onResolved?.(null);
  loadDomainTheme().then(value=>{if(current){setTheme(value);onResolved?.(value);}}).catch(e=>{if(current)setError(e.message || 'Não foi possível identificar o cadastro do domínio.');});
  return()=>{current=false;};
 },[context,runtime.raw,reload,onResolved]);
 const raw=runtime.preview || runtime.raw;
 const modes=useMemo(()=>({light:resolveManagerThemeDetails(raw,'light'),dark:resolveManagerThemeDetails(raw,'dark')}),[raw]);
 const count=contract.names.filter(token=>describeResolvedThemeColor(modes[runtime.mode],token).value!=='').length;
 return <View dataSet={{coThemeTools:'true'}} style={{padding:16,gap:12,backgroundColor:'#ffffff',borderWidth:1,borderColor:'#cbd5e1',borderRadius:14,marginBottom:16}}>
  <Text style={{fontSize:18,fontWeight:'700',color:'#0f172a'}}>Tema aplicado à aplicação</Text>
  <Text selectable style={{color:'#334155'}}>{domain} · {theme?`${theme.theme} #${theme.id}`:error?'Cadastro não identificado':'Identificando cadastro…'} · modo {runtime.mode==='dark'?'escuro':'claro'}{runtime.preview?' · prévia local':''}</Text>
  {!!error && <View style={{gap:6}}><Text accessibilityRole="alert" style={{color:'#b91c1c'}}>{error}</Text><Pressable accessibilityRole="button" onPress={()=>setReload(value=>value+1)}><Text style={{color:'#1d4ed8'}}>Identificar novamente</Text></Pressable></View>}
  <Text style={{color:'#334155'}}>Cores recebidas de themes-colors.css: {count}/{contract.names.length} papéis com valor no modo atual. Ausências não recebem cores inventadas.</Text>
  {companyThemes.map(companyTheme=><Text key={companyTheme.id} style={{color:'#334155'}}>Cadastro da empresa selecionada: {companyTheme.theme} #{companyTheme.id}{theme?String(companyTheme.id)===String(theme.id)?' · é o tema aplicado.':' · é diferente do tema aplicado pelo domínio.':''}</Text>)}
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>
   {theme && tools.available && <Pressable accessibilityRole="button" onPress={()=>setOpen(true)} style={{padding:10,backgroundColor:'#dbeafe',borderRadius:6}}><Text style={{color:'#1e3a8a'}}>Editar tema aplicado</Text></Pressable>}
   {tools.available && <Pressable accessibilityRole="button" onPress={tools.openEditor} style={{padding:10,backgroundColor:'#f1f5f9',borderRadius:6}}><Text style={{color:'#0f172a'}}>Abrir painel e inspetor</Text></Pressable>}
   <Pressable accessibilityRole="button" onPress={()=>setExpanded(value=>!value)} style={{padding:10,backgroundColor:'#f1f5f9',borderRadius:6}}><Text style={{color:'#0f172a'}}>{expanded?'Ocultar cores aplicadas':'Mostrar cores aplicadas e origens'}</Text></Pressable>
  </View>
  {theme && onViewChange && <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
   <Pressable accessibilityRole="button" accessibilityState={{selected:showDomain}} onPress={()=>onViewChange(true)} style={{padding:10,borderWidth:1,borderColor:showDomain?'#2563eb':'#cbd5e1',borderRadius:6}}><Text style={{color:'#0f172a'}}>Componentes do tema aplicado #{theme.id}</Text></Pressable>
   <Pressable accessibilityRole="button" accessibilityState={{selected:!showDomain}} onPress={()=>onViewChange(false)} style={{padding:10,borderWidth:1,borderColor:!showDomain?'#2563eb':'#cbd5e1',borderRadius:6}}><Text style={{color:'#0f172a'}}>Cadastro da empresa selecionada</Text></Pressable>
  </View>}
  {expanded && <View style={{gap:10}}>
   <TextInput accessibilityLabel="Buscar cor aplicada ou componente" placeholder="Buscar variável ou componente" value={search} onChangeText={setSearch} style={{padding:9,borderWidth:1,borderColor:'#cbd5e1',borderRadius:6,color:'#0f172a'}}/>
   {contract.groups.map(group=>({...group,tokens:group.tokens.filter(token=>`${group.label} ${token}`.toLowerCase().includes(search.toLowerCase()))})).filter(group=>group.tokens.length).map(group=><View key={group.label} style={{gap:6,paddingVertical:8}}>
    <Text style={{color:'#0f172a',fontWeight:'700'}}>{group.label}</Text>
    {group.tokens.map(token=><View key={token} style={{padding:8,gap:4,borderBottomWidth:1,borderColor:'#e2e8f0'}}>
     <Text selectable style={{color:'#0f172a',fontWeight:'600'}}>{token}</Text>
     {['light','dark'].map(mode=>{const color=describeResolvedThemeColor(modes[mode],token);return <View key={mode} style={{flexDirection:'row',gap:8,alignItems:'center'}}>
      <View style={{width:18,height:18,borderWidth:1,borderColor:'#94a3b8',backgroundColor:token==='buttonDisabledOpacity'?'transparent':color.value || 'transparent'}}/>
      <Text selectable style={{color:'#334155',flex:1}}>{mode==='light'?'Claro':'Escuro'}: {color.value || 'Sem valor aplicado'} · origem: {color.source?`theme.colors[${color.source}] → CSS`:'sem variável cadastrada para este papel'}</Text>
     </View>;})}
    </View>)}
   </View>)}
  </View>}
  <ThemeCatalog/>
  <CompanyBrandingEditor/>
  {open && theme && <ThemeEditorDialog theme={theme} onClose={()=>setOpen(false)} onSaved={next=>{setTheme(next);setOpen(false);}}/>}
 </View>;
}
