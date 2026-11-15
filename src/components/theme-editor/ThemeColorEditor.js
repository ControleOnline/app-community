import { themeEditorText as t, useThemeEditorPalette } from "./themeToolPresentation";import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { THEME_TOOL_BUTTON_HEIGHT } from './themeToolMetrics';
import contract from '../../styles/themeContract.generated';
import { resolveManagerThemeDetails, describeResolvedThemeColor } from '../../styles/managerTheme';
import { themeFieldValue, themeFieldLabel, themeFieldDisplayName, themeColorKey, validThemeValue, tokenFromKey } from '../../styles/themeEditorModel';
import { useThemeRuntime, previewTheme, clearThemePreview, setThemeMode } from '../../styles/themeRuntime';
import { editorContext, loadDomainTheme, saveThemeChanges } from './themeService';
import NativeColorInput from './NativeColorInput';
import { describeThemeScope } from '../../styles/themeVariations';
import { resolveScreenThemeDetails } from '../../styles/screenTheme';
import { screenThemeKey, parseScreenThemeKey } from '../../styles/screenThemeKeys';
import {homeMetrics, metricChoice, metricTokens} from '../../styles/homeMetricAppearance';
import HomeMetricAppearanceControls from './HomeMetricAppearanceControls';
const emptyColors = Object.freeze({});

// Tool chrome deliberately stays readable while the administrator edits the app palette.
export default memo(function ThemeColorEditor({ theme, onSaved, onPreviewColors, selectedTokens = [], search = '', onlyFilled = false, compact = false, screen = null, concise = false, homeMetric = null, fixedHeader = false, fixedMode = false }) {const c = useThemeEditorPalette();const s = editorStyles(c);
  const mobile = useWindowDimensions().width <= 600;
  const [changes, setChanges] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState(search);
  const runtime = useThemeRuntime();
  const owner = useRef({});
  const context = useRef(editorContext());
  const raw = theme.colors || {};
  const draft = useMemo(() => ({ ...raw, ...changes }), [raw, changes]);
  const metric = Object.hasOwn(homeMetrics,homeMetric) ? homeMetric : null;
  const chosenTokens = metric ? metricTokens(metric,metricChoice(draft,metric)) : selectedTokens;
  const appliedColors = runtime.preview || runtime.raw || emptyColors;
  const appliedModes = useMemo(() => ({ light: resolveScreenThemeDetails(appliedColors, 'light', screen?.id), dark: resolveScreenThemeDetails(appliedColors, 'dark', screen?.id) }), [appliedColors, screen?.id]);
  const draftModes = useMemo(() => ({ light: resolveScreenThemeDetails(draft, 'light', screen?.id), dark: resolveScreenThemeDetails(draft, 'dark', screen?.id) }), [draft, screen?.id]);
  useEffect(() => {setFilter(search);}, [search]);
  useEffect(() => {if (runtime.themeId == null && runtime.status === 'ready') loadDomainTheme().catch(() => {});}, [runtime.themeId, runtime.status, runtime.raw]);
  useEffect(() => () => clearThemePreview(owner.current), []);
  useEffect(() => {setChanges({});context.current = editorContext();}, [theme.id, theme.colors]);
  const dirty = Object.keys(changes).length > 0;
  const scopes = useMemo(() => describeThemeScope(selectedTokens), [selectedTokens]);
  useEffect(() => {
    if (dirty && context.current === editorContext()) previewTheme(draft, theme.id, owner.current);else
    clearThemePreview(owner.current);
  }, [draft, dirty, theme.id, runtime.themeId]);
  useEffect(() => {onPreviewColors?.(dirty ? draft : null);}, [draft, dirty]);
  const cancel = () => {setChanges({});setError('');clearThemePreview(owner.current);};
  const save = async () => {
    setSaving(true);setError('');
    try {const updated = await saveThemeChanges(theme, changes, context.current);setChanges({});clearThemePreview(owner.current);onSaved?.(updated);}
    catch (e) {setError(e?.message || t("Não foi possível salvar. Confira a sessão e sua permissão."));} finally
    {setSaving(false);}
  };
  const edit = (key, value) => {setChanges((current) => {
      const token = tokenFromKey(key);
      const initial = {};
      if (!parseScreenThemeKey(key) && /-(light|dark)$/.test(key) && !Object.hasOwn(raw, `${token}-light`) && !Object.hasOwn(raw, `${token}-dark`) && Object.hasOwn(raw, token)) {
        initial[`${token}-light`] = raw[token];initial[`${token}-dark`] = raw[token];
      }
      return { ...initial, ...current, [key]: value };
    });setError('');};
  const field = (token, mode) => {
    const key = screen ? screenThemeKey(screen.id, token, mode) : themeColorKey(token, mode);
    const own = describeResolvedThemeColor(draftModes[mode], token);
    const direct = screen ? draft[key] || '' : themeFieldValue(draft, token, mode);
    const variation = contract.variants?.[token];
    const value = (screen || variation || metric) && !direct ? own.value : direct;
    const inherited = !Object.hasOwn(draft, `${token}-light`) && !Object.hasOwn(draft, `${token}-dark`) && !!raw[token];
    const invalid = !validThemeValue(token, String(value));
    const applied = describeResolvedThemeColor(appliedModes[mode], token);
    return <View key={mode} style={[s.field, mobile && { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%', minWidth: 0 }]}>
      <Text style={s.caption}>{mode === 'light' ? t("☀ Claro") : t("☾ Escuro")}</Text>
      <View style={s.inputRow}>
        {token !== 'buttonDisabledOpacity' && <View style={[s.swatch, { backgroundColor: invalid || !value ? 'transparent' : value }]} />}
        <TextInput accessibilityLabel={`${concise ? token : themeFieldLabel(token,t)} — ${mode === 'light' ? t("claro") : t("escuro")}`}
        value={String(value)} editable={!saving} onChangeText={(value) => edit(key, value.trim())}
        placeholder={token === 'buttonDisabledOpacity' ? t("0 a 1") : t("Sem valor")} style={[s.input, mobile && { minHeight: 44, fontSize: 16 }, invalid && s.invalid]} />
        {Platform.OS === 'web' && token !== 'buttonDisabledOpacity' && <NativeColorInput value={value} disabled={saving} label={t("Escolher {{v0}} {{v1}}", { v0: token, v1: mode==='light'?t("claro"):t("escuro") })} touch={mobile} onColor={(value) => edit(key, value)} />}
      </View>
      {concise ? <Text style={s.caption}>{screen ? direct ? t("Cor própria desta tela") : t("Usando a cor global") : t("Cor global{{v0}}", { v0: variation ? t(" desta finalidade") : '' })}{!value ? t(" · sem valor") : ''}</Text> : <>
        <Text selectable style={[s.key, mobile && { fontSize: 12 }]}>{t("Cadastro: ")}{inherited ? t("{{v0}} · compartilhado", { v0: token }) : key}{value ? '' : t(" · sem valor direto")}</Text>
        {!!variation && <Text style={s.caption}>{direct ? t("Cor própria da variação. Padrão {{v0}} preservado.", { v0: variation.base }) : t("Herdando {{v0}} neste modo. Editar cria uma cor somente para esta variação.", { v0: variation.base })}</Text>}
        {!!own.value && own.source !== key && own.source !== token && <Text selectable style={[s.key, mobile && { fontSize: 12 }]}>{t("Neste cadastro: ")}{own.value}{t(" · origem: ")}{own.source}</Text>}
        <Text selectable style={[s.key, mobile && { fontSize: 12 }]}>{t("Aplicação: ")}{applied.value || t("Sem valor aplicado")}{t(" · origem: ")}{applied.source || t("sem variável cadastrada")}</Text>
      </>}
      {!!(screen || variation || (metric && metricChoice(draft,metric)!=='default')) && !!direct && <Pressable accessibilityRole="button" accessibilityLabel={t("Usar padrão {{v0}} {{v1}}", { v0: token, v1: mode==='light'?t("claro"):t("escuro") })} disabled={saving} onPress={() => edit(key, '')} style={s.button}><Text style={{color:c.buttonTextSecondary}}>{screen ? t("Usar cor global") : t("Usar padrão")}</Text></Pressable>}
    </View>;
  };
  const groups = contract.groups.map((group) => ({ ...group, tokens: group.tokens.filter((token) => {
      if (chosenTokens.length && !chosenTokens.includes(token)) return false;
      if (filter && !`${token} ${group.label} ${themeFieldDisplayName(token,t)}`.toLowerCase().includes(filter.toLowerCase())) return false;
      return !!metric || !onlyFilled || ['light', 'dark'].some((mode) => themeFieldValue(draft, token, mode) !== '');
    }) })).filter((group) => group.tokens.length);
  const metricControls = metric && <HomeMetricAppearanceControls id={metric} colors={draft} palette={c} disabled={saving}
      onChange={patch => {setChanges(current => ({...current,...patch}));setError('');}} />;
  const toolbar = (
    <View style={s.toolbar}>
      {!compact && <TextInput accessibilityLabel={t("Buscar variável ou grupo")} placeholder={t("Buscar variável ou grupo")} value={filter} onChangeText={setFilter} style={[s.input, fixedHeader ? s.toolSearch : { flex: 1 }]} />}
      {!fixedMode && ['light', 'dark'].map((mode) => <Pressable key={mode} accessibilityRole="button" accessibilityState={{ selected: runtime.mode === mode }} onPress={() => setThemeMode(mode)} style={[s.button, fixedHeader && s.toolButton, runtime.mode === mode && s.active]}><Text style={{color:runtime.mode===mode?c.buttonText:c.buttonTextSecondary}}>{mode === 'light' ? t("☀ Claro") : t("☾ Escuro")}</Text></Pressable>)}
    </View>
  );
  const notices = !concise && <>
      <Text style={s.caption}>{t("Variáveis do themes-map.md · cores compartilhadas inicializam os dois modos antes da edição.")}</Text>
      {selectedTokens.length > 0 ? scopes.length ? scopes.map((scope) => <Text key={scope.label} style={s.notice}>{t("Variação: ")}{t(scope.label)}{t(". Alcance: ")}{t(scope.usage)}{t(". As cores padrão e as outras variações não são alteradas.")}</Text>) : <Text style={s.notice}>{t("Padrão compartilhado: alterações afetam todos os componentes que usam estas variáveis e as variações que ainda herdam delas.")}</Text> : <Text style={s.notice}>{t("Cada campo identifica o padrão compartilhado ou a variação. Variações sem cor própria herdam o padrão no mesmo modo.")}</Text>}
      <Text style={s.notice}>{t("Editando cadastro: ")}{theme.theme} #{theme.id}. {runtime.themeId ? String(runtime.themeId) !== String(theme.id) ? t("Tema aplicado pelo domínio: #{{v0}}. Este cadastro não altera a prévia global.", { v0: runtime.themeId }) : t("Este é o tema aplicado pelo domínio.") : t("A identificação do tema aplicado está em andamento.")}</Text>
    </>;
  const errorNode = !!error && <Text accessibilityRole="alert" style={s.error}>{t(error)}</Text>;
  const footer = (
    <View style={[s.footer, mobile && Platform.OS === 'web' && { position: 'sticky', top: 0, zIndex: 2, backgroundColor: c.modalBackground }]}>
      <Text style={[s.caption, { minWidth: mobile ? 0 : 135, ...(mobile ? { width: '100%' } : {}) }]}>{dirty ? t("Prévia local · {{v0}} alteração(ões)", { v0: Object.keys(changes).length }) : t("Nenhuma alteração pendente")}</Text>
      <Pressable accessibilityRole="button" disabled={saving || !dirty} onPress={cancel} style={[s.button, fixedHeader ? s.toolButton : mobile && { minHeight: 44, justifyContent: 'center' }]}><Text style={{color:c.buttonTextSecondary}}>{t("Cancelar")}</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={saving || !dirty || Object.entries(changes).some(([key, value]) => !validThemeValue(tokenFromKey(key), value))} onPress={save} style={[s.button, s.active, fixedHeader ? s.toolButton : mobile && { minHeight: 44, justifyContent: 'center' }]}><Text style={{color:c.buttonText}}>{saving ? t("Salvando…") : t("Salvar cores")}</Text></Pressable>
    </View>
  );
  const groupsNode = (<>
    {groups.map((group) => <View key={group.label} style={s.group}>
      <Text style={s.groupTitle}>{t(group.label)}</Text>
      {group.tokens.map((token) => <View key={token} style={s.token}>
        <Text selectable style={s.tokenName}>{themeFieldDisplayName(token,t)}</Text>
        {themeFieldDisplayName(token,t) !== token && <Text selectable style={s.key}>{token}</Text>}
        <View style={[s.modes, mobile && { flexDirection: 'column' }]}>{fixedMode ? field(token, runtime.mode) : <>{field(token, 'light')}{field(token, 'dark')}</>}</View>
      </View>)}
    </View>)}
    {selectedTokens.filter((token) => !contract.names.includes(token) && Object.hasOwn(raw, token)).map((token) => <View key={token} style={s.token}>
      <Text selectable style={s.tokenName}>{token}{t(" · referência legada compartilhada")}</Text>
      <TextInput accessibilityLabel={t("Cor legada {{v0}}", { v0: token })} value={String(draft[token] ?? '')} onChangeText={(value) => edit(token, value.trim())} editable={!saving} style={s.input} />
    </View>)}
    {!groups.length && !selectedTokens.some((token) => Object.hasOwn(raw, token)) && <Text style={s.notice}>{t("Nenhuma variável corresponde à seleção.")}</Text>}
  </>);
  // Floating configurator: search, Claro/Escuro, pending changes and Save stay fixed above the
  // scrolling group list (#1509). Other consumers keep the single scrolling layout.
  if (fixedHeader) return <View style={[s.editor, s.editorFixed]} dataSet={{ coThemeTools: 'true' }}>
    <View style={s.fixedTools}>{toolbar}{errorNode}{footer}</View>
    <ScrollView style={s.scrollArea} contentContainerStyle={s.scrollContent}>{metricControls}{notices}{groupsNode}</ScrollView>
  </View>;
  return <View style={s.editor} dataSet={{ coThemeTools: 'true' }}>
    {metricControls}{toolbar}{notices}{errorNode}{footer}{groupsNode}
  </View>;
});
const editorStyles = (c) => StyleSheet.create({
  editor: { padding: 10, gap: 10, backgroundColor: c.modalBackground }, toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  button: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: c.modalBorder, borderRadius: 7, backgroundColor: c.buttonBackgroundSecondary }, active: { backgroundColor: c.buttonBackground, borderColor: c.buttonBorder },
  editorFixed: { padding: 0, gap: 0, flexShrink: 1, minHeight: 0 }, fixedTools: { padding: 10, paddingBottom: 0, gap: 10 },
  scrollArea: { flexShrink: 1, minHeight: 0 }, scrollContent: { padding: 10, paddingTop: 0, gap: 10 },
  toolButton: { minHeight: THEME_TOOL_BUTTON_HEIGHT, paddingVertical: 0, justifyContent: 'center' },
  toolSearch: { flexGrow: 0, flexShrink: 1, flexBasis: '33%', minWidth: 120 },
  caption: { fontSize: 11, color: c.textSecondary }, key: { fontSize: 10, color: c.textMuted, marginTop: 3 }, notice: { fontSize: 12, color: c.textSecondary },
  group: { gap: 4 }, groupTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', color: c.textSecondary, paddingVertical: 8 },
  token: { paddingVertical: 8, borderBottomWidth: 1, borderColor: c.dividerBackground, gap: 6 }, tokenName: { fontSize: 12, fontWeight: '600', color: c.modalText },
  modes: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, field: { flex: 1, minWidth: 125 }, inputRow: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 4 },
  input: { minWidth: 0, flex: 1, borderWidth: 1, borderColor: c.modalBorder, borderRadius: 6, padding: 6, fontSize: 12, color: c.inputText, backgroundColor: c.inputBackground },
  swatch: { width: 20, height: 24, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 4 }, invalid: { borderColor: c.textDanger }, error: { color: c.textDanger, fontSize: 12 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderColor: c.modalBorder }
});
