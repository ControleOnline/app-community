import React, {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {useStore} from '@store';
import {app_type_base} from '@appType';
import {resolveRuntimeMenuLabel, userHasRole} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import {resolveModuleAccent, modulePropertyColor} from '../manager-preview/moduleAccent';
import {findModuleRecord, invalidateModuleAppearance, loadModuleAppearanceCached, moduleAppearanceContext,
  moduleSourceTarget, persistedAppearanceFields, refreshModuleMenus, saveModuleAppearance} from './moduleAppearanceService';
import {themeEditorText as t} from './themeToolPresentation';
import ColorBox from './ColorBox';

// Inline editor for colors that come from category/route records. Saving keeps the
// exact catalog flow: draft per record, explicit save, PATCH on the same endpoints.
// Same names the "Menus por perfil" editor uses for these columns.
const FIELD_LABELS = {categoryCardMenu: 'MenuText', color: 'Cor'};
const fieldLabel = field => FIELD_LABELS[field] || field.replace(/^(?:category|route)(?=Card|Menu)/, '');
export default function ModuleSourceEditor({sources, palette, colors: c, record}) {
  const {user} = useStore('auth').getters;
  const people = useStore('people');
  const theme = useStore('theme');
  const canManage = app_type_base === 'ADMIN' && userHasRole(user, 'ROLE_SUPER');
  const context = moduleAppearanceContext();
  const [catalog, setCatalog] = useState(null), [reload, setReload] = useState(0);
  const [drafts, setDrafts] = useState({}), [saving, setSaving] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    if (!canManage) return undefined;
    loadModuleAppearanceCached(context).then(groups => {
      if (active) setCatalog({context, groups});
    }).catch(e => {if (active) setError(e.message || t('Não foi possível carregar os cadastros dos módulos.'));});
    return () => {active = false;};
  }, [context, canManage, reload]);
  const groups = catalog?.context === context ? catalog.groups : [];
  const editable = canManage && catalog?.context === context && !saving;
  const keyOf = (kind, item) => `${kind}:${kind === 'route' ? item.routeId || item.route : item.id}`;
  const nameOf = item => resolveRuntimeMenuLabel({menuKey: item.menuKey || item.label, label: item.label}, global.t?.t) || item.label || item.route;
  const edit = (kind, item, field, value) => {
    setDrafts(previous => ({...previous, [keyOf(kind, item)]: {...previous[keyOf(kind, item)], [field]: value}}));
    setNotice('');setError('');
  };
  const save = async (kind, item) => {
    setSaving(true);setError('');setNotice('');
    let committed = false;
    try {
      await saveModuleAppearance({kind, original: item, draft: {...item, ...drafts[keyOf(kind, item)]}, palette, context});
      committed = true;
      setDrafts(previous => {const next = {...previous};delete next[keyOf(kind, item)];return next;});
      setNotice(t('Propriedades de aparência salvas no cadastro.'));
      setReload(value => value + 1);
      const companyId = people.getters.currentCompany?.id;
      try {await refreshModuleMenus(companyId, theme.actions, context, () => people.getters.currentCompany?.id === companyId);}
      catch {setNotice(t('Cadastro salvo. Recarregue a página para atualizar os menus.'));}
    } catch (e) {
      setError(committed ? t('O cadastro foi salvo, mas não foi possível atualizar a lista. Recarregue os cadastros.') : e.message || t('Não foi possível salvar.'));
      if (committed) invalidateModuleAppearance();
    } finally {setSaving(false);}
  };
  const button = (label, action, disabled = false) => <Pressable accessibilityRole="button" accessibilityLabel={label}
    onPress={action} disabled={disabled} style={{padding: 8, minHeight: 36, justifyContent: 'center', borderRadius: 7,
      backgroundColor: c.buttonBackgroundSecondary, opacity: disabled ? .5 : 1}}><Text style={{fontSize: 12, color: c.buttonTextSecondary}}>{label}</Text></Pressable>;
  const readOnly = source => <Text key={`${source.property}:${source.source}:${source.record}`} selectable style={{fontSize: 12, color: c.textPrimary}}>
    {source.source} · {source.record} · {source.value} ({source.property})
  </Text>;

  const records = new Map();
  const loose = [];
  const ready = canManage && catalog?.context === context;
  const sourceOf = new Map();
  const add = (kind, item, field, source) => {
    if (!(field === 'color' || Object.hasOwn(item, field))) return false;
    const key = keyOf(kind, item);
    if (!records.has(key)) records.set(key, {kind, item, fields: new Map()});
    const fields = records.get(key).fields;
    if (!fields.has(field) || source) fields.set(field, source || fields.get(field) || null);
    return true;
  };
  if (ready && record?.kind) {
    const item = findModuleRecord(groups, record.kind, record.record);
    if (item) for (const field of record.fields) add(record.kind, item, field, null);
  }
  for (const source of sources) {
    const target = moduleSourceTarget(source.source);
    const item = target && ready ? findModuleRecord(groups, target.kind, source.record) : null;
    if (!item || !add(target.kind, item, target.field, source)) loose.push(source);
  }

  return <View style={{gap: 8}}>
    {!!error && <Text accessibilityRole="alert" style={{fontSize: 12, color: c.textDanger}}>{error}</Text>}
    {!!notice && <Text accessibilityRole="status" style={{fontSize: 12, color: c.textSuccess}}>{notice}</Text>}
    {canManage && !catalog && !error && <Text style={{fontSize: 12, color: c.textSecondary}}>{t('Carregando cadastros…')}</Text>}
    {canManage && !!error && !catalog && button(t('Recarregar cadastros'), () => {invalidateModuleAppearance();setError('');setReload(value => value + 1);}, saving)}
    {[...records.values()].map(({kind, item, fields}) => {
      const draft = {...item, ...drafts[keyOf(kind, item)]};
      const dirty = persistedAppearanceFields(item, kind).some(field => String(draft[field] || '').trim() !== String(item[field] || '').trim());
      const prefix = kind === 'category' ? t('Categoria') : t('Rota');
      return <View key={keyOf(kind, item)} style={{gap: 8, padding: 8, borderWidth: 1, borderRadius: 7, borderColor: c.modalBorder}}>
        <Text style={{fontSize: 12, fontWeight: '700', color: c.modalText}}>{prefix}: {nameOf(item)}</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          {[...fields.entries()].map(([field, source]) => {
            const value = draft[field] || '';
            const resolve = field === 'color' ? resolveModuleAccent : modulePropertyColor;
            const resolved = resolve(value, palette);
            const name = source?.source || `${kind === 'category' ? 'category' : 'routes'}.${field}`;
            const shown = source?.value || '';
            const label = `${prefix} — ${name}`;
            return <View key={field} style={{width: 130}}>
              <Text style={{fontSize: 11, fontWeight: '800', marginBottom: 5, color: c.textSecondary}}>{fieldLabel(field)}</Text>
              <ColorBox value={value} resolved={resolved || (!value ? shown : '')} label={label} placeholder={shown || fieldLabel(field)}
                disabled={!editable} colors={c} onChangeText={next => edit(kind, item, field, next)} />
              {!!value && !resolved && <Text style={{fontSize: 11, color: c.textDanger}}>{t('Cor inválida ou referência sem valor')}</Text>}
            </View>;
          })}
        </View>
        <Text style={{fontSize: 11, color: c.textSecondary}}>{t('Campo vazio: usa o valor herdado ou a cor do tema.')}</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          {button(`${t('Salvar cadastro')}: ${nameOf(item)}`, () => save(kind, item), !editable || !dirty)}
          {button(`${t('Descartar prévia')}: ${nameOf(item)}`, () => setDrafts(previous => {
            const next = {...previous};delete next[keyOf(kind, item)];return next;
          }), saving || !drafts[keyOf(kind, item)])}
        </View>
      </View>;
    })}
    {loose.map(readOnly)}
  </View>;
}
