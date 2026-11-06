import { themeEditorText as t, useThemeEditorPalette } from "./themeToolPresentation";import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { env } from '@env';
import { resolveAppDomain } from '@controleonline/ui-common/src/utils/appDomain';
import { useThemeRuntime } from '../../styles/themeRuntime';
import { resolveManagerThemeDetails, describeResolvedThemeColor } from '../../styles/managerTheme';
import contract from '../../styles/themeContract.generated';
import { loadDomainTheme, editorContext } from './themeService';
import ThemeEditorDialog from './ThemeEditorDialog';
import CompanyBrandingEditor from './CompanyBrandingEditor';
import ThemeCatalog from './ThemeCatalog';
import { useThemeTools } from './ThemeToolsProvider';

// The active domain and the selected company are different identities. Never rebind either here.
export default function AppliedThemeOverview({ companyThemes = [], onResolved, onViewChange, showDomain = true }) {const c = useThemeEditorPalette();
  const runtime = useThemeRuntime(),tools = useThemeTools();
  const [theme, setTheme] = useState(null),[error, setError] = useState(''),[open, setOpen] = useState(false),[expanded, setExpanded] = useState(false),[search, setSearch] = useState(''),[reload, setReload] = useState(0);
  const context = editorContext(),domain = resolveAppDomain(env.DOMAIN);
  useEffect(() => {
    let current = true;setTheme(null);setError('');onResolved?.(null);
    loadDomainTheme().then((value) => {if (current) {setTheme(value);onResolved?.(value);}}).catch((e) => {if (current) setError(e.message || t("Não foi possível identificar o cadastro do domínio."));});
    return () => {current = false;};
  }, [context, runtime.raw, reload, onResolved]);
  const raw = runtime.preview || runtime.raw;
  const modes = useMemo(() => ({ light: resolveManagerThemeDetails(raw, 'light'), dark: resolveManagerThemeDetails(raw, 'dark') }), [raw]);
  const count = contract.names.filter((token) => describeResolvedThemeColor(modes[runtime.mode], token).value !== '').length;
  return <View dataSet={{ coThemeTools: 'true' }} style={{ padding: 16, gap: 12, backgroundColor: c.modalBackground, borderWidth: 1, borderColor: c.modalBorder, borderRadius: 14, marginBottom: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: '700', color: c.modalText }}>{t("Tema aplicado à aplicação")}</Text>
  <Text selectable style={{ color: c.textSecondary }}>{domain} · {theme ? `${theme.theme} #${theme.id}` : error ? t("Cadastro não identificado") : t("Identificando cadastro…")}{t(" · modo ")}{runtime.mode === 'dark' ? t("escuro") : t("claro")}{runtime.preview ? t(" · prévia local") : ''}</Text>
  {!!error && <View style={{ gap: 6 }}><Text accessibilityRole="alert" style={{ color: c.textDanger }}>{t(error)}</Text><Pressable accessibilityRole="button" onPress={() => setReload((value) => value + 1)}><Text style={{ color: c.textLink }}>{t("Identificar novamente")}</Text></Pressable></View>}
  <Text style={{ color: c.textSecondary }}>{t("Cores recebidas de themes-colors.css: ")}{count}/{contract.names.length}{t(" papéis com valor no modo atual. Ausências não recebem cores inventadas.")}</Text>
  {companyThemes.map((companyTheme) => <Text key={companyTheme.id} style={{ color: c.textSecondary }}>{t("Cadastro da empresa selecionada: ")}{companyTheme.theme} #{companyTheme.id}{theme ? String(companyTheme.id) === String(theme.id) ? t(" · é o tema aplicado.") : t(" · é diferente do tema aplicado pelo domínio.") : ''}</Text>)}
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
   {theme && tools.available && <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={{ padding: 10, backgroundColor: c.buttonBackground, borderRadius: 6 }}><Text style={{ color: c.buttonText }}>{t("Editar tema aplicado")}</Text></Pressable>}
   {tools.available && <Pressable accessibilityRole="button" onPress={tools.openEditor} style={{ padding: 10, backgroundColor: c.sectionBackground, borderRadius: 6 }}><Text style={{ color: c.modalText }}>{t("Abrir painel e inspetor")}</Text></Pressable>}
   <Pressable accessibilityRole="button" onPress={() => setExpanded((value) => !value)} style={{ padding: 10, backgroundColor: c.sectionBackground, borderRadius: 6 }}><Text style={{ color: c.modalText }}>{expanded ? t("Ocultar cores aplicadas") : t("Mostrar cores aplicadas e origens")}</Text></Pressable>
  </View>
  {theme && onViewChange && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
   <Pressable accessibilityRole="button" accessibilityState={{ selected: showDomain }} onPress={() => onViewChange(true)} style={{ padding: 10, borderWidth: 1, borderColor: showDomain ? c.buttonBorder : c.modalBorder, borderRadius: 6 }}><Text style={{ color: c.modalText }}>{t("Componentes do tema aplicado #")}{theme.id}</Text></Pressable>
   <Pressable accessibilityRole="button" accessibilityState={{ selected: !showDomain }} onPress={() => onViewChange(false)} style={{ padding: 10, borderWidth: 1, borderColor: !showDomain ? c.buttonBorder : c.modalBorder, borderRadius: 6 }}><Text style={{ color: c.modalText }}>{t("Cadastro da empresa selecionada")}</Text></Pressable>
  </View>}
  {expanded && <View style={{ gap: 10 }}>
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
  <ThemeCatalog />
  <CompanyBrandingEditor />
  {open && theme && <ThemeEditorDialog theme={theme} onClose={() => setOpen(false)} onSaved={(next) => {setTheme(next);setOpen(false);}} />}
 </View>;
}
