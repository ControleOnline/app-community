import React, {useEffect, useState} from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';
import {useStore} from '@store';
import {app_type, app_type_base} from '@appType';
import {resolveRuntimeMenuLabel, userHasRole} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import IconPicker from '@controleonline/ui-default/src/react/components/inputs/DefaultFeatherIconPicker';
import HomeIcon from '../HomeIcon';
import NativeColorInput from './NativeColorInput';
import ModuleAppearancePreview from './ModuleAppearancePreview';
import {resolveModuleAccent, modulePropertyColor} from '../manager-preview/moduleAccent';
import {loadModuleAppearance, mergeModuleGroups, moduleAppearanceContext, refreshModuleMenus, saveModuleAppearance, persistedAppearanceFields} from './moduleAppearanceService';
import {themeEditorText as t} from './themeToolPresentation';

export default function ModuleAppearanceCatalog({menus, palette, enabled, colors: c}) {
  const {user} = useStore('auth').getters;
  const people = useStore('people');
  const theme = useStore('theme');
  const canManage = app_type_base === 'ADMIN' && userHasRole(user, 'ROLE_SUPER');
  const context = moduleAppearanceContext();
  const [catalog, setCatalog] = useState(null), [reload, setReload] = useState(0);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [saving, setSaving] = useState(false);
  const [selectedCategory, setCategory] = useState(null);
  const [selectedRoutes, setRoutes] = useState({}), [additionalFields, setAdditionalFields] = useState({});
  const [drafts, setDrafts] = useState({});
  useEffect(() => {
    let active = true;
    setCatalog(null);setDrafts({});setError('');setNotice('');
    if (canManage) loadModuleAppearance(context).then(groups => {
      if (active) setCatalog({context, groups});
    }).catch(e => {if (active) setError(e.message);});
    return () => {active = false;};
  }, [context, canManage, reload]);
  const groups = catalog?.context === context ? catalog.groups : mergeModuleGroups(menus);
  const editable = canManage && catalog?.context === context && !saving;
  const routeKey = item => `${item.id}:${item.menuType || 'home'}`;
  const nameOf = item => resolveRuntimeMenuLabel({menuKey: item.menuKey || item.label, label: item.label}, global.t?.t) || item.label || item.route;
  const keyOf = (kind, item) => `${kind}:${kind === 'route' ? item.routeId || item.route : item.id}`;
  const draftOf = (kind, item) => ({...item, ...drafts[keyOf(kind, item)]});
  const edit = (kind, item, field, value) => {
    setDrafts(previous => ({...previous, [keyOf(kind, item)]: {...previous[keyOf(kind, item)], [field]: value}}));
    setNotice('');setError('');
  };
  const save = async (kind, item) => {
    if (!editable) return;
    setSaving(true);setError('');setNotice('');
    let committed = false;
    try {
      await saveModuleAppearance({kind, original: item, draft: draftOf(kind, item), palette, context});
      committed = true;
      if (context !== moduleAppearanceContext()) return;
      setCatalog({context, groups: await loadModuleAppearance(context)});
      // Fields unsupported by the current API remain local previews and are never sent.
      setDrafts(previous => {
        const next = {...previous};
        const temporary = Object.fromEntries(Object.entries(next[keyOf(kind, item)] || {}).filter(([field]) => !persistedAppearanceFields(item, kind).includes(field)));
        next[keyOf(kind, item)] = temporary;
        return next;
      });
      setNotice(t('Propriedades de aparência salvas no cadastro. Campos de prévia não foram gravados.'));
      const companyId = people.getters.currentCompany?.id;
      try {await refreshModuleMenus(companyId, theme.actions, context, () => people.getters.currentCompany?.id === companyId);}
      catch {if (context === moduleAppearanceContext()) setNotice(t('Cadastro salvo. Recarregue a página para atualizar os menus.'));}
    } catch (e) {if (context === moduleAppearanceContext()) {
      setError(committed ? t('O cadastro foi salvo, mas não foi possível atualizar a lista. Recarregue os cadastros.') : e.message || t('Não foi possível salvar.'));
      if (committed) setCatalog(null);
    }}
    finally {if (context === moduleAppearanceContext()) setSaving(false);}
  };
  const button = (label, action, disabled = false) => <Pressable accessibilityRole="button" accessibilityLabel={label}
    onPress={action} disabled={disabled} style={{padding: 10, minHeight: 44, borderRadius: 8,
      backgroundColor: c.buttonBackgroundSecondary, opacity: disabled ? .5 : 1}}><Text style={{color: c.buttonTextSecondary}}>{label}</Text></Pressable>;
  const input = {minHeight: 44, padding: 8, borderWidth: 1, borderRadius: 6, borderColor: c.inputBorder,
    color: c.inputText, backgroundColor: c.inputBackground, flexGrow: 1};
  const colorField = (kind, item, field, label, temporary = false) => {
    const value = draftOf(kind, item)[field] || '';
    const resolved = ['textColor', 'iconColor', 'iconBackgroundColor'].includes(field) ? modulePropertyColor(value, palette) : resolveModuleAccent(value, palette);
    return <View key={field} style={{gap: 4}}>
      <Text style={{color: c.modalText}}>{label}{temporary ? ` · ${t('somente prévia')}` : ''}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <View style={{width: 20, height: 20, backgroundColor: resolved, borderColor: c.modalBorder, borderWidth: 1}} />
        <TextInput accessibilityLabel={label} value={value} editable={temporary ? !saving : editable} style={input}
          placeholder={temporary ? t('Usando o tema') : '#rrggbb / $primary'} placeholderTextColor={c.textPlaceholder}
          onChangeText={next => edit(kind, item, field, next)} />
        <NativeColorInput value={resolved} label={label} disabled={temporary ? saving : !editable}
          onColor={next => edit(kind, item, field, next)} />
      </View>
      {temporary && !Object.hasOwn(item, field) && <Text style={{color: c.textSecondary, fontSize: 12}}>{t('A gravação deste campo depende da atualização da API e do banco.')}</Text>}
      {!!value && <Text style={{color: c.textSecondary, fontSize: 12}}>{value}{value !== resolved ? ` → ${resolved || t('Cor inválida ou referência sem valor')}` : ''}</Text>}
    </View>;
  };
  const fields = (kind, item) => {
    const draft = draftOf(kind, item);
    const dirty = persistedAppearanceFields(item, kind).some(field => String(draft[field] || '').trim() !== String(item[field] || '').trim());
    const prefix = kind === 'category' ? t('Categoria') : t('Rota');
    return <View style={{gap: 10, padding: 12, borderWidth: 1, borderRadius: 8, borderColor: c.modalBorder}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <HomeIcon name={draft.icon || 'grid'} size={20} color={c.menuIcon} />
        <Text style={{color: c.modalText, fontWeight: '700'}}>{prefix}: {nameOf(item)}</Text>
      </View>
      {kind === 'route' && <Text selectable style={{color: c.textSecondary}}>{item.route} · {item.menuType || 'home'}{item.enabled === false ? ` · ${t('Menu desativado')}` : ''}</Text>}
      <Text style={{color: c.textSecondary}}>{t('Ícone cadastrado')}: {draft.icon || t('Sem ícone')}</Text>
      {editable && <IconPicker accessibilityLabel={`${prefix} — ${t('ícone')}`} value={draft.icon}
        onChange={value => edit(kind, item, 'icon', value)} />}
      {colorField(kind, item, 'color', `${prefix} — ${t('cor cadastrada (fundo)')}`)}
      <Pressable accessibilityRole="button" accessibilityLabel={`${prefix} — ${t('cores adicionais')}`}
        accessibilityState={{expanded: !!additionalFields[keyOf(kind, item)]}}
        onPress={() => setAdditionalFields(previous => ({...previous, [keyOf(kind, item)]: !previous[keyOf(kind, item)]}))}
        style={{flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44}}>
        <HomeIcon name={additionalFields[keyOf(kind, item)] ? 'chevron-down' : 'chevron-right'} size={16} color={c.menuIcon} />
        <Text style={{color: c.modalText}}>{t('Cores adicionais')}</Text>
      </Pressable>
      {!!additionalFields[keyOf(kind, item)] && <View style={{gap: 10}}>
        {colorField(kind, item, 'textColor', `${prefix} — ${t('cor do texto')}`, !Object.hasOwn(item, 'textColor') || !canManage)}
        {colorField(kind, item, 'iconColor', `${prefix} — ${t('cor do ícone')}`, !Object.hasOwn(item, 'iconColor') || !canManage)}
        {kind === 'route' && colorField(kind, item, 'iconBackgroundColor', `${prefix} — ${t('fundo do ícone na grade')}`, !Object.hasOwn(item, 'iconBackgroundColor') || !canManage)}
      </View>}
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
        {canManage && button(`${t('Salvar cadastro')}: ${nameOf(item)}`, () => save(kind, item), !editable || !dirty)}
        {button(`${t('Descartar prévia')}: ${nameOf(item)}`, () => setDrafts(previous => {
          const next = {...previous};delete next[keyOf(kind, item)];return next;
        }), saving || !drafts[keyOf(kind, item)])}
      </View>
    </View>;
  };
  return <View style={{gap: 12}}>
    <Text style={{color: c.textSecondary}}>{t('Categorias e rotas do contexto atual')}: {app_type}</Text>
    <Text style={{color: c.textSecondary}}>{t('As cores e os ícones cadastrados pertencem às categorias e rotas e podem afetar outros menus que usam os mesmos registros.')}</Text>
    {!canManage && <Text style={{color: c.textSecondary}}>{t('Consulta e prévias disponíveis. Editar cadastros mantém a exigência de ADMIN com ROLE_SUPER.')}</Text>}
    {canManage && !catalog && !error && <Text style={{color: c.textSecondary}}>{t('Carregando cadastros completos…')}</Text>}
    {!!error && <Text accessibilityRole="alert" style={{color: c.textDanger}}>{error}</Text>}
    {!!notice && <Text accessibilityRole="status" style={{color: c.textSuccess}}>{notice}</Text>}
    {canManage && !!error && button(t('Recarregar cadastros'), () => setReload(value => value + 1), saving)}
    <Text style={{color: c.textSecondary}}>{t('Clique na categoria ou rota para abrir ou recolher. Os rascunhos são preservados ao recolher.')}</Text>
    {groups.map(item => {
      const expanded = String(item.id) === selectedCategory;
      const route = item.menus.find(menu => routeKey(menu) === selectedRoutes[item.id]);
      return <View key={item.id} style={{gap: 8}}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${t('Categoria')}: ${nameOf(item)}`}
          accessibilityState={{expanded}} onPress={() => setCategory(previous => previous === String(item.id) ? null : String(item.id))}
          style={{flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, padding: 10, borderWidth: 1,
            borderRadius: 8, borderColor: expanded ? c.buttonBorder : c.modalBorder}}>
          <HomeIcon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} color={c.menuIcon} />
          <HomeIcon name={draftOf('category', item).icon || 'grid'} size={18} color={c.menuIcon} />
          <View style={{width: 16, height: 16, backgroundColor: resolveModuleAccent(draftOf('category', item).color, palette), borderWidth: 1, borderColor: c.modalBorder}} />
          <Text style={{color: c.modalText, flex: 1}}>{nameOf(item)} ({item.menus.length})</Text>
          <Text style={{color: c.textSecondary}}>{draftOf('category', item).color || t('Sem cor')}</Text>
        </Pressable>
        {expanded && <View style={{gap: 10, paddingLeft: 8}}>
          {fields('category', item)}
          {item.menus.map(menu => {
            const routeExpanded = route === menu;
            return <View key={routeKey(menu)} style={{gap: 8}}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${t('Rota')}: ${nameOf(menu)}`}
                accessibilityState={{expanded: routeExpanded}}
                onPress={() => setRoutes(previous => ({...previous, [item.id]: previous[item.id] === routeKey(menu) ? null : routeKey(menu)}))}
                style={{flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, minHeight: 44,
                  borderLeftWidth: 3, borderLeftColor: routeExpanded ? c.buttonBorder : c.modalBorder}}>
                <HomeIcon name={routeExpanded ? 'chevron-down' : 'chevron-right'} size={16} color={c.menuIcon} />
                <HomeIcon name={draftOf('route', menu).icon || 'grid'} size={18} color={c.menuIcon} />
                <View style={{width: 16, height: 16, backgroundColor: resolveModuleAccent(draftOf('route', menu).color, palette)}} />
                <Text style={{color: c.modalText, flex: 1}}>{nameOf(menu)} · {menu.route}</Text>
                <Text style={{color: c.textSecondary}}>{draftOf('route', menu).color}</Text>
              </Pressable>
              {routeExpanded && <>
                {fields('route', menu)}
                <ModuleAppearancePreview enabled={enabled} palette={palette}
                  category={{...draftOf('category', item), label: nameOf(item)}}
                  route={{...draftOf('route', menu), label: nameOf(menu)}} />
              </>}
            </View>;
          })}
          {!route && <ModuleAppearancePreview enabled={enabled} palette={palette}
            category={{...draftOf('category', item), label: nameOf(item)}} route={null} />}
        </View>}
      </View>;
    })}
    {!groups.length && <Text style={{color: c.textSecondary}}>{t('Nenhuma categoria de menu disponível.')}</Text>}

  </View>;
}
