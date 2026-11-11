import React from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';
import {homeMetrics, metricChoice, metricNameKey, specificBase,
  appearanceName, encodeAppearanceName, chooseMetricAppearance} from '../../styles/homeMetricAppearance';
import {themeEditorText as t} from './themeToolPresentation';

export default function HomeMetricAppearanceControls({id, colors, onChange, disabled, palette: c}) {
  const choice = metricChoice(colors, id);
  const consumers = choice === 'specific' ? [id] : Object.keys(homeMetrics).filter(metric => choice === 'default' ||
    metricChoice(colors, metric) === choice || (metricChoice(colors, metric) === 'specific' && specificBase(colors, metric) === choice));
  return <View style={{gap: 8, padding: 10, borderWidth: 1, borderColor: c.modalBorder, borderRadius: 8}}>
    <Text style={{color: c.modalText, fontWeight: '700'}}>{t('Aparência de {{v0}}', {v0: t(homeMetrics[id].label)})}</Text>
    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6}}>
      {Object.entries({default:'Padrão',primary:'Primária',secondary:'Secundária',specific:'Específica'}).map(([value,label]) =>
        <Pressable key={value} accessibilityRole="radio" accessibilityLabel={t('Aparência {{v0}}', {v0:t(label)})}
          accessibilityState={{checked: choice === value}} disabled={disabled}
          onPress={() => onChange(chooseMetricAppearance(colors,id,value))}
          style={{padding: 9, minHeight: 40, borderRadius: 7, backgroundColor: choice === value ? c.buttonBackground : c.buttonBackgroundSecondary}}>
          <Text style={{color: choice === value ? c.buttonText : c.buttonTextSecondary}}>{t(label)}</Text>
        </Pressable>)}
    </View>
    <Text style={{color: c.textSecondary}}>{t('Pode afetar, conforme os valores próprios ou herdados')}: {consumers.map(metric => t(homeMetrics[metric].label)).join(', ')}.
      {choice !== 'specific' ? ` ${t('Inclui as específicas que herdam desta aparência.')}` : ''}</Text>
    {choice === 'specific' && <>
      <TextInput accessibilityLabel={t('Nome da aparência específica')} value={appearanceName(colors,id)} placeholder={t('Nome da aparência')} maxLength={80} editable={!disabled}
        onChangeText={value => onChange({[metricNameKey(id)]:encodeAppearanceName(value)})}
        style={{padding: 8, minHeight: 44, borderWidth: 1, borderColor: c.inputBorder, backgroundColor: c.inputBackground, color: c.inputText}} />
      <Text style={{color: c.textSecondary}}>{t('Somente este indicador. Renomear preserva o identificador e as configurações.')}</Text>
    </>}
    <Text style={{color: c.textSecondary}}>{choice === 'specific'
      ? t('Campos sem valor próprio herdam de {{v0}}.', {v0:t({default:'Padrão',primary:'Primária',secondary:'Secundária'}[specificBase(colors,id)])})
      : t('Sem cor própria, a aparência herda os valores do padrão.')}
      {' '}{t('As escolhas só são gravadas ao salvar as cores.')}</Text>
  </View>;
}
