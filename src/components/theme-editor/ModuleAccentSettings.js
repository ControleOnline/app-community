import React, {useState} from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {filterRuntimeMenuModulesByType, resolveRuntimeMenuLabel} from '@controleonline/ui-common/src/react/utils/runtimeMenu';
import HomeIcon from '../HomeIcon';
import {moduleAccentBackground, resolveModuleAccent} from '../manager-preview/moduleAccent';
import {themeEditorText as t} from './themeToolPresentation';

export default function ModuleAccentSettings({menus, palette, preference, colors: c}) {
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const groups = [...new Map(['home', 'toolbar'].flatMap(type =>
    filterRuntimeMenuModulesByType(menus, type)).map(group => [group.id, group])).values()];
  const selected = groups.find(group => group.id === selectedId) || groups[0];
  const enabled = draft ?? preference.value;
  const dirty = enabled !== preference.value;
  const label = t('Usar as cores das categorias do menu');
  const nameOf = group => resolveRuntimeMenuLabel({menuKey: group.menuKey || group.label, label: group.label}, global.t?.t) || group.label;
  const colorOf = group => resolveModuleAccent(group.color, palette);
  const accent = enabled && selected ? colorOf(selected) : undefined;

  const save = async () => {
    setSaving(true);
    try {
      if (await preference.setValue(enabled)) setDraft(null);
    } finally {
      setSaving(false);
    }
  };

  return <View style={s.section}>
    <View style={s.row}>
      <Text style={{color: c.modalText, flex: 1}}>{label}</Text>
      <Switch accessibilityLabel={label}
        value={enabled} disabled={!preference.ready || saving} onValueChange={setDraft}
        trackColor={{false: c.switchOffTrack, true: c.switchOnTrack}}
        thumbColor={enabled ? c.switchOnThumb : c.switchOffThumb} />
    </View>
    <Text style={{color: c.textSecondary}}>{t('Aplica a cor da categoria aos ícones e fundos em Explorar módulos e no menu lateral.')}</Text>
    <Text style={{color: c.textSecondary}}>{t('Preferência desta conta neste aparelho e domínio. Selecione uma categoria para ver a prévia.')}</Text>
    {groups.map(group => {
      const color = colorOf(group);
      const name = nameOf(group);
      const reference = typeof group.color === 'string' && group.color.trim().startsWith('$');
      return <Pressable key={group.id} accessibilityRole="button"
        accessibilityLabel={t('Prévia de {{v0}}', {v0: name})}
        accessibilityState={{selected: selected === group}}
        onPress={() => setSelectedId(group.id)}
        style={[s.row, s.category, {borderColor: selected === group ? c.buttonBorder : c.modalBorder}]}>
        <View style={[s.swatch, {backgroundColor: color, borderColor: c.modalBorder}]} />
        <Text style={{color: c.modalText, flex: 1}}>{name}</Text>
        <Text style={{color: c.textSecondary, flexShrink: 1}}>
          {reference ? `${group.color} → ${color || t('Sem valor no tema')}` : color || t('Sem cor configurada')}
        </Text>
      </Pressable>;
    })}
    {!selected && <Text style={{color: c.textSecondary}}>{t('Nenhuma categoria de menu disponível.')}</Text>}
    {selected && <View style={s.section}>
      <Text style={{color: c.textSecondary}}>{t('Prévia do módulo ativo')}</Text>
      <View testID="module-accent-preview" style={{...s.row, ...s.preview,
        backgroundColor: moduleAccentBackground(accent, true) ?? c.navigationActiveBackground,
        borderLeftColor: accent || c.navigationActiveBorder}}>
        <HomeIcon name={selected.icon || 'grid'} size={18} color={accent || c.navigationActiveIcon} />
        <Text style={{color: c.navigationActiveText}}>{nameOf(selected)}</Text>
      </View>
    </View>}
    {!!preference.error && <Text accessibilityRole="alert" style={{color: c.textDanger}}>{t(preference.error)}</Text>}
    {dirty && <View style={s.actions}>
      <Pressable accessibilityRole="button" onPress={() => setDraft(null)} disabled={saving}
        style={[s.button, {backgroundColor: c.buttonBackgroundSecondary}]}>
        <Text style={{color: c.buttonTextSecondary}}>{t('Cancelar prévia')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Salvar preferência de destaque')}
        onPress={save} disabled={saving || !preference.ready}
        style={[s.button, {backgroundColor: c.buttonBackground}]}>
        <Text style={{color: c.buttonText}}>{t('Salvar preferência')}</Text>
      </Pressable>
    </View>}
  </View>;
}

const s = StyleSheet.create({
  section:{gap:8},
  row:{flexDirection:'row',alignItems:'center',gap:8},
  category:{minHeight:44,borderWidth:1,borderRadius:8,paddingHorizontal:10,paddingVertical:8},
  swatch:{width:16,height:16,borderRadius:4,borderWidth:1},
  preview:{minHeight:42,borderLeftWidth:3,borderRadius:8,paddingHorizontal:10},
  actions:{flexDirection:'row',flexWrap:'wrap',gap:8},
  button:{minHeight:44,paddingHorizontal:12,justifyContent:'center',borderRadius:8},
});
