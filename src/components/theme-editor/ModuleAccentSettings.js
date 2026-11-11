import React, {useState} from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import ModuleAppearanceCatalog from './ModuleAppearanceCatalog';
import {themeEditorText as t} from './themeToolPresentation';

export default function ModuleAccentSettings({menus, palette, preference, colors: c}) {
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const enabled = draft ?? preference.value;
  const dirty = enabled !== preference.value;
  const label = t('Usar as cores das categorias do menu');

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
    <Text style={{color: c.textSecondary}}>{t('Ligada: usa as cores cadastradas dos módulos. Desligada: usa as cores do tema, preservando os dois conjuntos.')}</Text>
    <Text style={{color: c.textSecondary}}>{t('Ao salvar, esta opção fica no tema do domínio e vale para todos os usuários e domínios que usam esse tema.')}</Text>
    {!!preference.error && <Text accessibilityRole="alert" style={{color: c.textDanger}}>{t(preference.error)}</Text>}
    {dirty && <View style={s.actions}>
      <Pressable accessibilityRole="button" onPress={() => setDraft(null)} disabled={saving}
        style={[s.button, {backgroundColor: c.buttonBackgroundSecondary}]}>
        <Text style={{color: c.buttonTextSecondary}}>{t('Cancelar prévia')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Salvar opção no tema')}
        onPress={save} disabled={saving || !preference.ready}
        style={[s.button, {backgroundColor: c.buttonBackground}]}>
        <Text style={{color: c.buttonText}}>{t('Salvar opção no tema')}</Text>
      </Pressable>
    </View>}
    <ModuleAppearanceCatalog menus={menus} palette={palette} enabled={enabled} colors={c} />
  </View>;
}

const s = StyleSheet.create({
  section:{gap:8},
  row:{flexDirection:'row',alignItems:'center',gap:8},
  actions:{flexDirection:'row',flexWrap:'wrap',gap:8},
  button:{minHeight:44,paddingHorizontal:12,justifyContent:'center',borderRadius:8},
});
