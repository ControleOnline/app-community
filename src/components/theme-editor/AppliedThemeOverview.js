import { themeEditorText as t, useThemeEditorPalette } from "./themeToolPresentation";import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { env } from '@env';
import { resolveAppDomain } from '@controleonline/ui-common/src/utils/appDomain';
import { useThemeRuntime } from '../../styles/themeRuntime';
import { resolveManagerThemeDetails, describeResolvedThemeColor, missingManagerThemeTokens } from '../../styles/managerTheme';
import contract from '../../styles/themeContract.generated';
import { loadDomainBinding, loadDomainTheme, editorContext } from './themeService';
import ThemeEditorDialog from './ThemeEditorDialog';
import CompanyBrandingEditor from './CompanyBrandingEditor';
import ThemeCatalog from './ThemeCatalog';
import ModuleAccentSettings from './ModuleAccentSettings';
import { useManagerPreview } from '../manager-preview/ManagerPreviewProvider';
import { useThemeTools } from './ThemeToolsProvider';

// The active domain and the selected company are different identities. Never rebind either here.
export default function AppliedThemeOverview({ companyThemes = [], onResolved, onViewChange, showDomain = true }) {const c = useThemeEditorPalette();
  const runtime = useThemeRuntime(),tools = useThemeTools();
  const {sidebar, moduleIcons, moduleAccent, menus} = useManagerPreview() || {};
  const [bindingState, setBindingState] = useState(null);
  const [showModuleColors, setShowModuleColors] = useState(false);
  const [theme, setTheme] = useState(null),[error, setError] = useState(''),[open, setOpen] = useState(false),[expanded, setExpanded] = useState(false),[search, setSearch] = useState(''),[reload, setReload] = useState(0);
  const context = editorContext(),domain = resolveAppDomain(env.DOMAIN);
  const binding = bindingState?.context === context ? bindingState.value : null;
  useEffect(() => {
    let current = true;
    setTheme(null);setError('');onResolved?.(null);
    loadDomainBinding().then(async (value) => {
      if (!current) return;
      setBindingState({context, value});
      if (!value) throw new Error(t("Cadastro do domínio indisponível para esta conta."));
      if (!value.themeId) return;
      const loaded = await loadDomainTheme(value);
      if (current) {setTheme(loaded);onResolved?.(loaded);}
    }).catch((e) => {
      if (current) setError(e.message || t("Não foi possível identificar o cadastro do domínio."));
    });
    return () => {current = false;};
  }, [context, runtime.raw, reload, onResolved]);

  const raw = runtime.preview || runtime.raw;
  const modes = useMemo(() => ({
    light: resolveManagerThemeDetails(raw, 'light'),
    dark: resolveManagerThemeDetails(raw, 'dark'),
  }), [raw]);
  const values = modes[runtime.mode].values;
  const count = contract.names.filter((token) => describeResolvedThemeColor(modes[runtime.mode], token).value !== '').length;
  const missing = missingManagerThemeTokens(raw, runtime.mode, values);
  const card = {padding: 16, gap: 12, backgroundColor: c.modalBackground, borderWidth: 1, borderColor: c.modalBorder, borderRadius: 14};
  const title = {fontSize: 18, fontWeight: '700', color: c.modalText};
  const text = {color: c.textSecondary};
  const actions = {flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center'};
  const button = (label, onPress, selected) => <Pressable accessibilityRole="button"
    accessibilityState={selected === undefined ? undefined : {selected}} onPress={onPress}
    style={{minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1,
      borderRadius: 8, borderColor: selected ? c.buttonBorder : c.modalBorder,
      backgroundColor: selected ? c.buttonBackground : c.buttonBackgroundSecondary}}>
    <Text style={{color: selected ? c.buttonText : c.buttonTextSecondary}}>{label}</Text>
  </Pressable>;

  return <View dataSet={{coThemeTools: 'true'}} style={{gap: 12, marginBottom: 16}}>
   <View style={card}>
    <Text accessibilityRole="header" style={title}>{t("Tema do domínio")}</Text>
    <Text selectable style={text}>{domain}</Text>
    <Text selectable style={{color: c.modalText, fontWeight: '700', fontSize: 16}}>
     {theme ? `${theme.theme} #${theme.id}` : binding && !binding.themeId ? t("Sem tema vinculado")
       : error ? t("Cadastro não identificado") : t("Identificando tema…")}
    </Text>
    {!!error && <View style={{gap: 6}}>
     <Text accessibilityRole="alert" style={{color: c.textDanger}}>{t(error)}</Text>
     {button(t("Identificar novamente"), () => setReload((value) => value + 1))}
    </View>}
    {runtime.status === 'ready' && <Text style={{color: missing.length ? c.textWarning : c.textSuccess}}>
     {missing.length ? t("Tema incompleto") : t("Tema pronto")} · {runtime.mode === 'dark' ? t("Escuro") : t("Claro")}
     {runtime.preview ? t(" · prévia local") : ''}
    </Text>}
    {binding?.applyBlockedReason === 'ambiguous-company' && <Text style={text}>
     {t("Há registros deste domínio vinculados a empresas diferentes. A troca está indisponível.")}
    </Text>}
    <View style={actions}>
     {binding?.canApply && <ThemeCatalog mode="apply" primary />}
     {theme && tools.available && button(t("Editar tema aplicado"), () => setOpen(true))}
     {tools.available && button(t("Abrir painel e inspetor"), tools.openEditor)}
     {button(expanded ? t("Ocultar detalhes") : t("Ver detalhes"), () => setExpanded((value) => !value))}
    </View>
  {expanded && <View style={{ gap: 10 }}>
   <Text style={text}>{count}/{contract.names.length} {t("variáveis com valor no modo atual")}</Text>
   {!!missing.length && <Text selectable style={text}>{t("Variáveis obrigatórias ausentes")}: {missing.join(', ')}</Text>}
   <TextInput accessibilityLabel={t("Buscar cor aplicada ou componente")} placeholder={t("Buscar variável ou componente")} value={search} onChangeText={setSearch} style={{ padding: 9, borderWidth: 1, borderColor: c.modalBorder, borderRadius: 6, color: c.modalText }} />
   {contract.groups.map((group) => ({ ...group, tokens: group.tokens.filter((token) => `${group.label} ${token}`.toLowerCase().includes(search.toLowerCase())) })).filter((group) => group.tokens.length).map((group) => <View key={group.label} style={{ gap: 6, paddingVertical: 8 }}>
    <Text style={{ color: c.modalText, fontWeight: '700' }}>{t(group.label)}</Text>
    {group.tokens.map((token) => <View key={token} style={{ padding: 8, gap: 4, borderBottomWidth: 1, borderColor: c.dividerBackground }}>
     <Text selectable style={{ color: c.modalText, fontWeight: '600' }}>{token}</Text>
     {['light', 'dark'].map((mode) => {const color = describeResolvedThemeColor(modes[mode], token);return <View key={mode} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <View style={{ width: 18, height: 18, borderWidth: 1, borderColor: c.inputBorder, backgroundColor: token === 'buttonDisabledOpacity' ? 'transparent' : color.value || 'transparent' }} />
      <Text selectable style={{ color: c.textSecondary, flex: 1 }}>{mode === 'light' ? t("Claro") : t("Escuro")}: {color.value || t("Sem valor aplicado")}{t(" · origem: ")}{color.source ? `theme.colors[${color.source}] → CSS` : t("sem variável cadastrada para este papel")}</Text>
     </View>;})}
    </View>)}
   </View>)}
  </View>}
   </View>
   {(sidebar?.ready || moduleIcons?.key) && <View style={card}>
    <Text accessibilityRole="header" style={title}>{t("Minha interface")}</Text>
    {sidebar?.ready && <View style={[actions, {justifyContent: 'space-between'}]}>
     <View style={{flex: 1, gap: 4}}>
      <Text style={{color: c.modalText, fontWeight: '600'}}>{t("Mostrar menu lateral")}</Text>
      <Text style={text}>{t("Preferência desta conta neste aparelho. Você também pode mudar pelo menu da sua conta.")}</Text>
     </View>
     <Switch accessibilityLabel={t("Mostrar menu lateral")} value={sidebar.visible}
       onValueChange={sidebar.setRememberedVisible}
       trackColor={{false: c.switchOffTrack, true: c.switchOnTrack}}
       thumbColor={sidebar.visible ? c.switchOnThumb : c.switchOffThumb} />
    </View>}
    {!!sidebar?.error && <Text accessibilityRole="alert" style={{color: c.textDanger}}>{t(sidebar.error)}</Text>}
    {moduleIcons?.key && <View style={[actions, {justifyContent: 'space-between'}]}>
     <View style={{flex: 1, gap: 4}}>
      <Text style={{color: c.modalText, fontWeight: '600'}}>{t("Mostrar módulos como ícones")}</Text>
      <Text style={text}>{t("Alterna entre lista e grade em Explorar módulos, na Home.")}</Text>
     </View>
     <Switch accessibilityLabel={t("Mostrar módulos como ícones")} value={moduleIcons.value}
       disabled={!moduleIcons.ready} onValueChange={moduleIcons.setValue}
       trackColor={{false: c.switchOffTrack, true: c.switchOnTrack}}
       thumbColor={moduleIcons.value ? c.switchOnThumb : c.switchOffThumb} />
    </View>}
    {!!moduleIcons?.error && <Text accessibilityRole="alert" style={{color: c.textDanger}}>{t(moduleIcons.error)}</Text>}
   </View>}
   {moduleAccent?.key && <View style={card}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded: showModuleColors}}
      onPress={() => setShowModuleColors(value => !value)} style={[actions, {minHeight: 44, justifyContent: 'space-between'}]}>
     <Text style={title}>{t("Cores dos módulos")}</Text>
     <Text style={text}>{showModuleColors ? t("Recolher") : t("Ver cores")}</Text>
    </Pressable>
    {showModuleColors && <ModuleAccentSettings key={moduleAccent.key} preference={moduleAccent}
      menus={menus} palette={values} colors={c} />}
   </View>}
   <View style={card}>
    <Text accessibilityRole="header" style={title}>{t("Cores e componentes")}</Text>
    {companyThemes.map((item) => <Text key={item.id} style={text}>
     {t("Tema da empresa selecionada")}: {item.theme} #{item.id}{theme && String(item.id) !== String(theme.id) ? t(" · é diferente do tema do domínio") : ''}
    </Text>)}
    {theme && onViewChange && <View style={actions}>
     {button(t("Tema do domínio"), () => onViewChange(true), showDomain)}
     {button(t("Tema da empresa selecionada"), () => onViewChange(false), !showDomain)}
    </View>}
    <View style={actions}><ThemeCatalog /><CompanyBrandingEditor /></View>
   </View>
   {open && theme && <ThemeEditorDialog theme={theme} onClose={() => setOpen(false)}
     onSaved={(next) => {setTheme(next);setOpen(false);}} />}
  </View>;
}
