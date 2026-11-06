import { themeEditorText as t, useThemeEditorPalette } from "./themeToolPresentation";import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useThemeTools } from './ThemeToolsProvider';
import { useThemeRuntime } from '../../styles/themeRuntime';
import { resolveManagerTheme } from '../../styles/managerTheme';
import { editorContext } from './themeService';
import { loadThemeCatalog, loadCatalogTheme, applyDomainTheme, deleteUnusedTheme } from './themeManagementService';
import ThemeEditorDialog from './ThemeEditorDialog';

// Only company information already disclosed by the API is used for presentation.
const companiesOf = (item) => [...new Map(item.usage.links.filter((link) => link.type === 'domain' && link.companyId != null).
map((link) => [String(link.companyId), link.companyName || t("Empresa #{{v0}}", { v0: link.companyId })])).values()];

function CatalogDialog({ onClose }) {
  const tools = useThemeTools(),runtime = useThemeRuntime();
  const c = useThemeEditorPalette();
  const [catalog, setCatalog] = useState(null),[busy, setBusy] = useState(false),[error, setError] = useState(''),[notice, setNotice] = useState(''),[search, setSearch] = useState(''),[confirmation, setConfirmation] = useState(null),[editing, setEditing] = useState(null),[reload, setReload] = useState(0);
  const [scope, setScope] = useState('companies'),[canManageGlobal, setCanManageGlobal] = useState(false);
  const [expandedLinks, setExpandedLinks] = useState({});
  const context = editorContext(),lifetime = useRef({});
  useEffect(() => {
    const owner = {};lifetime.current = owner;let current = true;
    setBusy(true);setCatalog(null);setError('');setConfirmation(null);setEditing(null);setExpandedLinks({});
    loadThemeCatalog(context, () => current && lifetime.current === owner, scope).then((value) => {if (current) {setCatalog(value);setCanManageGlobal(Boolean(value.canManageGlobal));}}).catch((e) => {if (current) setError(e.message);}).finally(() => {if (current) setBusy(false);});
    return () => {current = false;lifetime.current = null;};
  }, [context, reload, scope]);
  const button = (label, onPress, disabled = false) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || busy} onPress={onPress} style={{ padding: 10, minHeight: 44, justifyContent: 'center', borderWidth: 1, borderRadius: 8, borderColor: c.buttonBorder, backgroundColor: c.buttonBackgroundSecondary, opacity: disabled || busy ? .55 : 1 }}><Text style={{ color: c.buttonTextSecondary }}>{label}</Text></Pressable>;
  const label = (theme) => theme ? `${theme.theme} #${theme.id}` : t("Sem tema");
  const visibleThemes = (catalog?.items || []).filter((item) => `${companiesOf(item).join(' ')} ${item.theme} ${item.id}`.toLowerCase().includes(search.toLowerCase())).
  sort((a, b) => Number(Number(b.id) === Number(catalog.domain?.themeId)) - Number(Number(a.id) === Number(catalog.domain?.themeId)));
  const applied = catalog?.items.find((item) => Number(item.id) === Number(catalog.domain?.themeId));
  const edit = async (theme) => {
    const owner = lifetime.current;
    if (!tools.available || !owner) return;
    setBusy(true);setError('');
    try {const full = await loadCatalogTheme(theme, context, () => lifetime.current === owner);if (lifetime.current === owner) setEditing(full);}
    catch (e) {if (lifetime.current === owner) setError(e.message);} finally
    {if (lifetime.current === owner) setBusy(false);}
  };
  const confirm = async () => {
    const action = confirmation,owner = lifetime.current;
    if (!action || !tools.available || !owner) return;
    const current = () => lifetime.current === owner;
    setBusy(true);setError('');
    try {
      if (action.type === 'apply') await applyDomainTheme(catalog.domain, action.theme, action.context, current);else
      await deleteUnusedTheme(action.theme, action.context, current);
      if (current()) {setConfirmation(null);setNotice(action.type === 'apply' ? t("Tema aplicado ao domínio.") : t("Tema excluído."));setReload((value) => value + 1);}
    } catch (e) {if (current()) {setError(e.message);setConfirmation(null);}} finally
    {if (current()) setBusy(false);}
  };
  return <Modal visible transparent animationType="fade" onRequestClose={() => {if (!busy) onClose();}}>
  <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: c.modalOverlay }}>
   <View accessibilityViewIsModal style={{ maxHeight: '90%', width: '100%', maxWidth: 900, alignSelf: 'center', backgroundColor: c.modalBackground, borderColor: c.modalBorder, borderWidth: 1, borderRadius: 12, padding: 16, gap: 12 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: c.modalText, flex: 1 }}>{t("Temas e vínculos")}</Text>{button(t("Fechar"), onClose)}</View>
    {!!notice && <Text accessibilityRole="status" style={{ color: c.textSuccess }}>{notice}</Text>}
    {!!error && <Text accessibilityRole="alert" style={{ color: c.textDanger }}>{t(error)}</Text>}
    {busy && <Text style={{ color: c.modalText }}>{t("Carregando…")}</Text>}
    {confirmation ? <View style={{ gap: 12 }}>
     <Text style={{ color: c.modalText, fontWeight: '700' }}>{confirmation.type === 'apply' ? t("Confirmar troca de tema") : t("Confirmar exclusão")}</Text>
     <Text style={{ color: c.modalText }}>{confirmation.type === 'apply' ? t("Domínio: {{v0}}\nDe: {{v1}}\nPara: {{v2}}\nA troca vale para todos os usuários deste domínio. As cores ausentes não serão preenchidas automaticamente.", { v0: catalog.domain.domain, v1: label(applied), v2: label(confirmation.theme) }) : t("Excluir {{v0}}? A API verificará novamente se há vínculos. Essa exclusão é permanente.", { v0: label(confirmation.theme) })}</Text>
     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{button(t("Cancelar"), () => setConfirmation(null))}{button(confirmation.type === 'apply' ? t("Confirmar aplicação") : t("Confirmar exclusão"), confirm)}</View>
    </View> : <>
     <Text style={{ color: c.modalText }}>{catalog?.domain ? t("Domínio atual: {{v0}} · {{v1}}", { v0: catalog.domain.domain, v1: label(applied) }) : t("A troca exige permissão sobre a empresa do domínio atual.")}</Text>
     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{button(t("Temas das minhas empresas"), () => setScope('companies'), scope === 'companies')}{canManageGlobal && button(t("Gestão global"), () => setScope('global'), scope === 'global')}</View>
     <Text style={{ color: c.textSecondary }}>{scope === 'global' ? t("Catálogo global · somente superadministrador. Inclui temas sem vínculos.") : t("Temas dos domínios das empresas às quais você tem acesso.")}</Text>
     <TextInput accessibilityLabel={t("Buscar tema")} placeholder={t("Buscar empresa, tema ou ID")} placeholderTextColor={c.inputPlaceholderText} value={search} onChangeText={setSearch} style={{ padding: 10, minHeight: 44, borderWidth: 1, borderColor: c.inputBorder, borderRadius: 8, color: c.inputText, backgroundColor: c.inputBackground }} />
     <ScrollView contentContainerStyle={{ gap: 12 }}>
      {visibleThemes.map((item) => <View key={item.id} testID={`theme-catalog-card-${item.id}`} style={{ padding: 12, gap: 8, borderWidth: 1, borderColor: c.cardBorder, borderRadius: 10, backgroundColor: c.cardBackground }}>
       <Text selectable style={{ color: c.cardText, fontWeight: '700', fontSize: 16 }}>{companiesOf(item).join(' · ') || (item.usage.count === 0 ? t("Sem empresa vinculada") : t("Empresa não disponível neste escopo"))}</Text>
       <Text selectable style={{ color: c.textSecondary }}>{t("Tema: ")}{label(item)}</Text>
       {Number(item.id) === Number(catalog.domain?.themeId) && <Text style={{ color: c.textSuccess, fontWeight: '700' }}>{t("Em uso em ")}{catalog.domain.domain}</Text>}
       {item.usage.count === 0 ? <Text style={{ color: c.textSecondary }}>{t("Sem vínculos")}</Text> : <>
        <Pressable accessibilityRole="button" accessibilityLabel={t("{{v0}} vínculos de {{v1}}", { v0: expandedLinks[item.id] ? t("Ocultar") : t("Ver"), v1: item.theme })} accessibilityState={{ expanded: Boolean(expandedLinks[item.id]) }} disabled={busy}
                onPress={() => setExpandedLinks((previous) => ({ ...previous, [item.id]: !previous[item.id] }))}
                style={{ paddingVertical: 8, minHeight: 44, justifyContent: 'center' }}>
         <Text style={{ color: c.textLink }}>{item.usage.count}{t(" vínculo(s) · ")}{expandedLinks[item.id] ? t("Ocultar domínios") : t("Ver domínios")}</Text>
        </Pressable>
        {expandedLinks[item.id] && <View style={{ gap: 6 }}>
         {item.usage.links.map((link, index) => <Text selectable key={`${link.type}:${link.id}:${index}`} style={{ color: c.textSecondary }}>{link.type === 'domain' ? t("Domínio: {{v0}} · #{{v1}} · {{v2}} #{{v3}}", { v0: link.domain, v1: link.id, v2: link.companyName || t("Empresa"), v3: link.companyId }) : t("Referência: {{v0}} · #{{v1}}", { v0: link.type, v1: link.id })}</Text>)}
         {item.usage.hiddenCount > 0 && <Text style={{ color: c.textSecondary }}>{item.usage.hiddenCount}{t(" vínculo(s) sem permissão para exibir detalhes.")}</Text>}
        </View>}
       </>}
       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tools.available && button(t("Editar cores de {{v0}}", { v0: item.theme }), () => edit(item), !item.canEdit)}
        {tools.available && button(t("Aplicar {{v0}} neste domínio", { v0: item.theme }), () => setConfirmation({ type: 'apply', theme: item, context }), !catalog.domain?.canApply || Number(item.id) === Number(catalog.domain?.themeId))}
        {tools.available && scope === 'global' && catalog?.canManageGlobal && button(t("Excluir {{v0}}", { v0: item.theme }), () => setConfirmation({ type: 'delete', theme: item, context }), !item.canDelete)}
       </View>
       {item.usage.count > 0 && <Text style={{ color: c.textSecondary }}>{t("Exclusão bloqueada: tema em uso.")}</Text>}
      </View>)}
      {catalog && !visibleThemes.length && <Text style={{ color: c.modalText }}>{catalog.items.length ? t("Nenhum tema encontrado nesta busca.") : t("Nenhum tema acessível.")}</Text>}
     </ScrollView>
     {scope === 'global' && !catalog?.canDeleteUnused && <Text style={{ color: c.textSecondary }}>{t("Somente superadministradores podem excluir temas sem vínculos.")}</Text>}
     {button(t("Atualizar lista"), () => {setNotice('');setReload((value) => value + 1);})}
    </>}
   </View>
  </View>
  {editing && <ThemeEditorDialog theme={editing} onClose={() => setEditing(null)} onSaved={() => {setEditing(null);setReload((value) => value + 1);}} />}
 </Modal>;
}
export default function ThemeCatalog() {
  const [open, setOpen] = useState(false),runtime = useThemeRuntime();
  const c = useThemeEditorPalette();
  return <View>
  <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={{ padding: 10, minHeight: 44, justifyContent: 'center', borderWidth: 1, borderRadius: 8, borderColor: c.buttonBorder, backgroundColor: c.buttonBackgroundSecondary }}><Text style={{ color: c.buttonTextSecondary }}>{t("Gerenciar temas e vínculos")}</Text></Pressable>
  {open && <CatalogDialog key={editorContext()} onClose={() => setOpen(false)} />}
 </View>;
}
