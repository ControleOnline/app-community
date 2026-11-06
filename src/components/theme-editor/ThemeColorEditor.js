import React,{memo,useEffect,useMemo,useRef,useState} from 'react';
import {Platform,Pressable,StyleSheet,Text,TextInput,View,useWindowDimensions} from 'react-native';
import contract from '../../styles/themeContract.generated';
import {resolveManagerThemeDetails,describeResolvedThemeColor} from '../../styles/managerTheme';
import {themeFieldValue,themeFieldLabel,themeColorKey,validThemeValue,tokenFromKey} from '../../styles/themeEditorModel';
import {useThemeRuntime,previewTheme,clearThemePreview,setThemeMode} from '../../styles/themeRuntime';
import {editorContext,loadDomainTheme,saveThemeChanges} from './themeService';
import NativeColorInput from './NativeColorInput';
import {describeThemeScope} from '../../styles/themeVariations';
import {resolveScreenThemeDetails} from '../../styles/screenTheme';
import {screenThemeKey,parseScreenThemeKey} from '../../styles/screenThemeKeys';
const emptyColors=Object.freeze({});

// Tool chrome deliberately stays readable while the administrator edits the app palette.
export default memo(function ThemeColorEditor({theme,onSaved,onPreviewColors,selectedTokens=[],search='',onlyFilled=false,compact=false,screen=null,concise=false}) {
  const mobile=useWindowDimensions().width<=600;
  const [changes,setChanges]=useState({});
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  const [filter,setFilter]=useState(search);
  const runtime=useThemeRuntime();
  const owner=useRef({});
  const context=useRef(editorContext());
  const raw=theme.colors || {};
  const draft=useMemo(()=>({...raw,...changes}),[raw,changes]);
  const appliedColors=runtime.preview || runtime.raw || emptyColors;
  const appliedModes=useMemo(()=>({light:resolveScreenThemeDetails(appliedColors,'light',screen?.id),dark:resolveScreenThemeDetails(appliedColors,'dark',screen?.id)}),[appliedColors,screen?.id]);
  const draftModes=useMemo(()=>({light:resolveScreenThemeDetails(draft,'light',screen?.id),dark:resolveScreenThemeDetails(draft,'dark',screen?.id)}),[draft,screen?.id]);
  useEffect(()=>{setFilter(search);},[search]);
  useEffect(()=>{if(runtime.themeId==null && runtime.status==='ready')loadDomainTheme().catch(()=>{});},[runtime.themeId,runtime.status,runtime.raw]);
  useEffect(()=>()=>clearThemePreview(owner.current),[]);
  useEffect(()=>{setChanges({});context.current=editorContext();},[theme.id,theme.colors]);
  const dirty=Object.keys(changes).length>0;
  const scopes=useMemo(()=>describeThemeScope(selectedTokens),[selectedTokens]);
  useEffect(()=>{
    if(dirty && context.current===editorContext())previewTheme(draft,theme.id,owner.current);
    else clearThemePreview(owner.current);
  },[draft,dirty,theme.id,runtime.themeId]);
  useEffect(()=>{onPreviewColors?.(dirty?draft:null);},[draft,dirty]);
  const cancel=()=>{setChanges({});setError('');clearThemePreview(owner.current);};
  const save=async()=>{
    setSaving(true);setError('');
    try{const updated=await saveThemeChanges(theme,changes,context.current);setChanges({});clearThemePreview(owner.current);onSaved?.(updated);}
    catch(e){setError(e?.message || 'Não foi possível salvar. Confira a sessão e sua permissão.');}
    finally{setSaving(false);}
  };
  const edit=(key,value)=>{setChanges(current=>{
    const token=tokenFromKey(key);
    const initial={};
    if(!parseScreenThemeKey(key) && /-(light|dark)$/.test(key) && !Object.hasOwn(raw,`${token}-light`) && !Object.hasOwn(raw,`${token}-dark`) && Object.hasOwn(raw,token)) {
      initial[`${token}-light`]=raw[token];initial[`${token}-dark`]=raw[token];
    }
    return {...initial,...current,[key]:value};
  });setError('');};
  const field=(token,mode)=>{
    const key=screen?screenThemeKey(screen.id,token,mode):themeColorKey(token,mode);
    const own=describeResolvedThemeColor(draftModes[mode],token);
    const direct=screen?draft[key] || '':themeFieldValue(draft,token,mode);
    const variation=contract.variants?.[token];
    const value=(screen || variation) && !direct?own.value:direct;
    const inherited=!Object.hasOwn(draft,`${token}-light`)&&!Object.hasOwn(draft,`${token}-dark`)&&!!raw[token];
    const invalid=!validThemeValue(token,String(value));
    const applied=describeResolvedThemeColor(appliedModes[mode],token);
    return <View key={mode} style={[s.field,mobile&&{flexGrow:0,flexShrink:0,flexBasis:'auto',width:'100%',minWidth:0}]}>
      <Text style={s.caption}>{mode==='light'?'☀ Claro':'☾ Escuro'}</Text>
      <View style={s.inputRow}>
        {token!=='buttonDisabledOpacity' && <View style={[s.swatch,{backgroundColor:invalid || !value?'transparent':value}]} />}
        <TextInput accessibilityLabel={`${concise?token:themeFieldLabel(token)} — ${mode==='light'?'claro':'escuro'}`}
          value={String(value)} editable={!saving} onChangeText={value=>edit(key,value.trim())}
          placeholder={token==='buttonDisabledOpacity'?'0 a 1':'Sem valor'} style={[s.input,mobile&&{minHeight:44,fontSize:16},invalid&&s.invalid]} />
        {Platform.OS==='web' && token!=='buttonDisabledOpacity' && <NativeColorInput value={value} disabled={saving} label={`Escolher ${token} ${mode}`} touch={mobile} onColor={value=>edit(key,value)}/>}
      </View>
      {concise?<Text style={s.caption}>{screen?direct?'Cor própria desta tela':'Usando a cor global':`Cor global${variation?' desta finalidade':''}`}{!value?' · sem valor':''}</Text>:<>
        <Text selectable style={[s.key,mobile&&{fontSize:12}]}>Cadastro: {inherited?`${token} · compartilhado`:key}{value?'':' · sem valor direto'}</Text>
        {!!variation && <Text style={s.caption}>{direct?`Cor própria da variação. Padrão ${variation.base} preservado.`:`Herdando ${variation.base} neste modo. Editar cria uma cor somente para esta variação.`}</Text>}
        {!!own.value && own.source!==key && own.source!==token && <Text selectable style={[s.key,mobile&&{fontSize:12}]}>Neste cadastro: {own.value} · origem: {own.source}</Text>}
        <Text selectable style={[s.key,mobile&&{fontSize:12}]}>Aplicação: {applied.value || 'Sem valor aplicado'} · origem: {applied.source || 'sem variável cadastrada'}</Text>
      </>}
      {!!(screen || variation) && !!direct && <Pressable accessibilityRole="button" accessibilityLabel={`Usar padrão ${token} ${mode}`} disabled={saving} onPress={()=>edit(key,'')} style={s.button}><Text>{screen?'Usar cor global':'Usar padrão'}</Text></Pressable>}
    </View>;
  };
  const groups=contract.groups.map(group=>({...group,tokens:group.tokens.filter(token=>{
    if(selectedTokens.length && !selectedTokens.includes(token))return false;
    if(filter && !`${token} ${group.label}`.toLowerCase().includes(filter.toLowerCase()))return false;
    return !onlyFilled || ['light','dark'].some(mode=>themeFieldValue(draft,token,mode)!=='');
  })})).filter(group=>group.tokens.length);
  return <View style={s.editor} dataSet={{coThemeTools:'true'}}>
    <View style={s.toolbar}>
      {!compact && <TextInput accessibilityLabel="Buscar variável ou grupo" placeholder="Buscar variável ou grupo" value={filter} onChangeText={setFilter} style={[s.input,{flex:1}]} />}
      {['light','dark'].map(mode=><Pressable key={mode} accessibilityRole="button" accessibilityState={{selected:runtime.mode===mode}} onPress={()=>setThemeMode(mode)} style={[s.button,runtime.mode===mode&&s.active]}><Text>{mode==='light'?'☀ Claro':'☾ Escuro'}</Text></Pressable>)}
    </View>
    {!concise && <>
      <Text style={s.caption}>Variáveis do themes-map.md · cores compartilhadas inicializam os dois modos antes da edição.</Text>
      {selectedTokens.length>0?scopes.length?scopes.map(scope=><Text key={scope.label} style={s.notice}>Variação: {scope.label}. Alcance: {scope.usage}. As cores padrão e as outras variações não são alteradas.</Text>):<Text style={s.notice}>Padrão compartilhado: alterações afetam todos os componentes que usam estas variáveis e as variações que ainda herdam delas.</Text>:<Text style={s.notice}>Cada campo identifica o padrão compartilhado ou a variação. Variações sem cor própria herdam o padrão no mesmo modo.</Text>}
      <Text style={s.notice}>Editando cadastro: {theme.theme} #{theme.id}. {runtime.themeId?String(runtime.themeId)!==String(theme.id)?`Tema aplicado pelo domínio: #${runtime.themeId}. Este cadastro não altera a prévia global.`:'Este é o tema aplicado pelo domínio.':'A identificação do tema aplicado está em andamento.'}</Text>
    </>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <View style={[s.footer,mobile&&Platform.OS==='web'&&{position:'sticky',top:0,zIndex:2,backgroundColor:'#ffffff'}]}>
      <Text style={[s.caption,{minWidth:mobile?0:135,...(mobile?{width:'100%'}:{})}]}>{dirty?`Prévia local · ${Object.keys(changes).length} alteração(ões)`:'Nenhuma alteração pendente'}</Text>
      <Pressable accessibilityRole="button" disabled={saving || !dirty} onPress={cancel} style={[s.button,mobile&&{minHeight:44,justifyContent:'center'}]}><Text>Cancelar</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={saving || !dirty || Object.entries(changes).some(([key,value])=>!validThemeValue(tokenFromKey(key),value))} onPress={save} style={[s.button,s.active,mobile&&{minHeight:44,justifyContent:'center'}]}><Text>{saving?'Salvando…':'Salvar cores'}</Text></Pressable>
    </View>
    {groups.map(group=><View key={group.label} style={s.group}>
      <Text style={s.groupTitle}>{group.label}</Text>
      {group.tokens.map(token=><View key={token} style={s.token}>
        <Text selectable style={s.tokenName}>{concise?token:themeFieldLabel(token)}</Text>
        <View style={[s.modes,mobile&&{flexDirection:'column'}]}>{field(token,'light')}{field(token,'dark')}</View>
      </View>)}
    </View>)}
    {selectedTokens.filter(token=>!contract.names.includes(token) && Object.hasOwn(raw,token)).map(token=><View key={token} style={s.token}>
      <Text selectable style={s.tokenName}>{token} · referência legada compartilhada</Text>
      <TextInput accessibilityLabel={`Cor legada ${token}`} value={String(draft[token] ?? '')} onChangeText={value=>edit(token,value.trim())} editable={!saving} style={s.input}/>
    </View>)}
    {!groups.length && !selectedTokens.some(token=>Object.hasOwn(raw,token)) && <Text style={s.notice}>Nenhuma variável corresponde à seleção.</Text>}

  </View>;
});
const s=StyleSheet.create({
  editor:{padding:10,gap:10,backgroundColor:'#ffffff'},toolbar:{flexDirection:'row',flexWrap:'wrap',gap:6,alignItems:'center'},
  button:{paddingHorizontal:10,paddingVertical:8,borderWidth:1,borderColor:'#cbd5e1',borderRadius:7,backgroundColor:'#f8fafc'},active:{backgroundColor:'#dbeafe',borderColor:'#2563eb'},
  caption:{fontSize:11,color:'#475569'},key:{fontSize:10,color:'#64748b',marginTop:3},notice:{fontSize:12,color:'#475569'},
  group:{gap:4},groupTitle:{fontSize:12,fontWeight:'700',textTransform:'uppercase',color:'#334155',paddingVertical:8},
  token:{paddingVertical:8,borderBottomWidth:1,borderColor:'#e2e8f0',gap:6},tokenName:{fontSize:12,fontWeight:'600',color:'#0f172a'},
  modes:{flexDirection:'row',gap:8,flexWrap:'wrap'},field:{flex:1,minWidth:125},inputRow:{flexDirection:'row',gap:4,alignItems:'center',marginTop:4},
  input:{minWidth:0,flex:1,borderWidth:1,borderColor:'#cbd5e1',borderRadius:6,padding:6,fontSize:12,color:'#0f172a',backgroundColor:'#ffffff'},
  swatch:{width:20,height:24,borderWidth:1,borderColor:'#94a3b8',borderRadius:4},invalid:{borderColor:'#dc2626'},error:{color:'#b91c1c',fontSize:12},
  footer:{flexDirection:'row',flexWrap:'wrap',gap:8,alignItems:'center',paddingVertical:10,borderTopWidth:1,borderColor:'#cbd5e1'},
});
