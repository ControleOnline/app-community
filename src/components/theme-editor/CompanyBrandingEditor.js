import { themeEditorText as t, useThemeEditorPalette } from "./themeToolPresentation";import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useStore } from '@store';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import { useThemeTools } from './ThemeToolsProvider';
import { editorContext } from './themeService';
import { loadCompanyBranding, saveCompanyBranding } from './companyBrandingService';
import { publishCompanyBranding, clearCompanyBranding } from './companyBrandingRuntime';
import { resolveCompanyMedia } from '../manager-preview/companyMedia';
import { validLogoReference } from '../manager-preview/companyBranding';
import { useThemeRuntime } from '../../styles/themeRuntime';
import { resolveManagerTheme } from '../../styles/managerTheme';

function LogoFields({ company, onClose }) {const c = useThemeEditorPalette();
  const [baseline, setBaseline] = useState(null),[draft, setDraft] = useState(null),[error, setError] = useState(''),[saving, setSaving] = useState(false);
  const owner = useRef({}),alive = useRef(true),context = useRef(editorContext());
  const runtime = useThemeRuntime();
  useEffect(() => {
    let current = true;alive.current = true;
    loadCompanyBranding(company).then((result) => {if (current) {setBaseline(result.branding);setDraft(result.branding);}}).catch((e) => {if (current) setError(e.message);});
    return () => {current = false;alive.current = false;clearCompanyBranding(company, owner.current);};
  }, []);
  const dirty = draft && JSON.stringify(draft) !== JSON.stringify(baseline);
  useEffect(() => {
    if (dirty && Object.values(draft).every(validLogoReference)) publishCompanyBranding(company, draft, owner.current);else
    clearCompanyBranding(company, owner.current);
  }, [draft, dirty]);
  const cancel = () => {clearCompanyBranding(company, owner.current);setDraft(baseline);setError('');};
  const save = async () => {
    setSaving(true);setError('');
    try {
      const result = await saveCompanyBranding(company, baseline, draft, context.current, () => alive.current);
      if (alive.current) {publishCompanyBranding(company, result, null);setBaseline(result);setDraft(result);}
    } catch (e) {if (alive.current) setError(e.message);} finally
    {if (alive.current) setSaving(false);}
  };
  return <View style={{ gap: 10, paddingTop: 8 }}>
  <Text style={{ color: c.textSecondary }}>{t("Empresa: ")}{company.alias || company.name} · #{company.id}{t(". Imagens da empresa; o modo e o fundo vêm do tema aplicado.")}</Text>
  <Text style={{ color: c.textSecondary, fontSize: 12 }}>{t("Use imagens com transparência, sem margens desnecessárias. Sem versão específica, mantém o logo atual. Nenhuma imagem é recortada ou recolorida.")}</Text>
  {dirty && <Text style={{ color: c.textSecondary, fontSize: 12 }}>{t("Prévia local · alterações ainda não salvas.")}</Text>}
  {!!error && <Text accessibilityRole="alert" style={{ color: c.textDanger }}>{t(error)}</Text>}
  {draft && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
   {['light', 'dark'].map((mode) => {
        const field = mode === 'light' ? 'logoLight' : 'logoDark';
        const label = mode === 'light' ? t("claro") : t("escuro");
        const palette = resolveManagerTheme(runtime.preview || runtime.raw, mode);
        const file = draft[field] || resolveCompanyMedia(company, { home: true });
        return <View key={mode} style={{ flex: 1, minWidth: 180, gap: 6 }}>
     <Text style={{ color: c.modalText, fontWeight: '600' }}>{t("Logo para modo ")}{label}</Text>
     <View style={{ height: 72, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.headerBackground || 'transparent', borderWidth: 1, borderColor: c.modalBorder }}>
      {file && validLogoReference(draft[field]) && <DefaultFile file={file} company={company} accessibilityLabel={t("Prévia do logo no modo {{v0}}", { v0: label })} resizeMode="contain" style={{ width: 140, height: 48 }} />}
     </View>
     <TextInput accessibilityLabel={t("Endereço do logo para modo {{v0}}", { v0: label })} placeholder={t("Endereço da imagem; vazio usa o logo atual")} value={draft[field]} editable={!saving} autoCapitalize="none"
          onChangeText={(value) => setDraft((previous) => ({ ...previous, [field]: value.trim() }))}
          style={{ padding: 8, borderWidth: 1, borderColor: validLogoReference(draft[field]) ? c.modalBorder : c.inputBorder, borderRadius: 6, color: c.modalText, backgroundColor: c.modalBackground }} />
     <Text style={{ color: c.textMuted, fontSize: 11 }}>{draft[field] ? t("Versão específica deste modo") : t("Origem: logo atual da empresa")}</Text>
    </View>;
      })}
  </View>}
  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
   <Pressable accessibilityRole="button" disabled={!dirty || saving} onPress={cancel} style={{ padding: 8 }}><Text style={{ color: c.textSecondary }}>{t("Cancelar prévia")}</Text></Pressable>
   <Pressable accessibilityRole="button" disabled={!dirty || saving || !Object.values(draft || {}).every(validLogoReference)} onPress={save} style={{ padding: 8 }}><Text style={{ color: c.textLink }}>{saving ? t("Salvando…") : t("Salvar logos da empresa")}</Text></Pressable>
   <Pressable accessibilityRole="button" disabled={saving} onPress={onClose} style={{ padding: 8 }}><Text style={{ color: c.textSecondary }}>{t("Fechar")}</Text></Pressable>
  </View>
 </View>;
}
export default function CompanyBrandingEditor() {const c = useThemeEditorPalette();
  const tools = useThemeTools();
  const { currentCompany, mainCompany } = useStore('people').getters;
  const company = currentCompany?.id ? currentCompany : mainCompany;
  const [open, setOpen] = useState(false);
  if (!tools.available || !company?.id) return null;
  return <View style={{ paddingTop: 10, borderTopWidth: 1, borderColor: c.modalBorder, gap: 8 }}>
  <Pressable accessibilityRole="button" onPress={() => setOpen((value) => !value)}><Text style={{ color: c.textLink, fontWeight: '600' }}>{open ? t("Ocultar identidade visual") : t("Logos da empresa para claro e escuro")}</Text></Pressable>
  {open && <LogoFields key={`${company.id}-${editorContext()}`} company={company} onClose={() => setOpen(false)} />}
 </View>;
}
