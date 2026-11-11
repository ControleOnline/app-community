import React from 'react';
import {Text, View} from 'react-native';
import HomeIcon from '../HomeIcon';
import {resolveModuleAccent, moduleListAppearance, modulePropertyColor} from '../manager-preview/moduleAccent';
import {themeEditorText as t} from './themeToolPresentation';

export default function ModuleAppearancePreview({category, route, enabled, palette: c}) {
  const accent = value => enabled ? resolveModuleAccent(value, c) : undefined;
  const optional = value => enabled ? modulePropertyColor(value, c) : undefined;
  const groupColor = accent(category.color);
  const routeColor = accent(route?.color);
  const list = moduleListAppearance({accent: routeColor, colors: c, record: route || category, enabled});
  const sidebar = moduleListAppearance({accent: routeColor, colors: c, sidebar: true, active: true, record: route || category, enabled});
  const glyph = route?.icon || category.icon || 'grid';
  const label = route?.label || route?.route || category.label;
  const row = {flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8};
  return <View style={{gap: 8}}>
    <Text style={{color: c.textSecondary}}>{t('Prévias locais: não alteram a página nem salvam os cadastros.')}</Text>
    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
      {['list', 'grid', 'sidebar'].map(mode => <View key={mode} testID={`module-preview-${mode}`}
        style={{flexGrow: 1, flexBasis: 200, gap: 8, padding: 12, borderWidth: 1, borderColor: c.cardBorder,
          borderRadius: 10, backgroundColor: mode === 'sidebar' ? c.navigationBackground : groupColor ?? c.cardBackground}}>
        <Text style={{color: mode === 'sidebar' ? c.navigationCaptionText : optional(category.textColor) ?? c.cardText}}>
          {t(mode === 'list' ? 'Home — lista' : mode === 'grid' ? 'Home — ícones' : 'Menu lateral')}
        </Text>
        <Text style={{color: mode === 'sidebar' ? c.navigationCaptionText : optional(category.textColor) ?? c.cardText}}>{category.label}</Text>
        <View testID={`module-preview-item-${mode}`} style={{...row,
          ...(mode === 'grid' ? {flexDirection: 'column', alignSelf: 'flex-start', minWidth: 100} : {}),
          backgroundColor: mode === 'sidebar' ? sidebar.backgroundColor : mode === 'list' ? list.backgroundColor : routeColor ?? c.listItemBackground,
          borderLeftWidth: mode === 'sidebar' ? 3 : 0,
          borderLeftColor: c.navigationActiveBorder}}>
          <View style={{padding: mode === 'grid' ? 6 : 0, borderRadius: 8,
            backgroundColor: mode === 'grid' ? optional(route?.iconBackgroundColor) ?? c.iconBackground : c.containerTransparentBackground}}>
            <HomeIcon name={glyph} size={mode === 'grid' ? 22 : 18}
              color={optional((route || category).iconColor) ?? (mode === 'sidebar' ? sidebar.iconColor : mode === 'grid' ? c.listItemIcon : list.iconColor)} />
          </View>
          <Text style={{color: optional((route || category).textColor) ?? (mode === 'sidebar' ? sidebar.textColor : mode === 'grid' ? c.listItemText : list.textColor), flexShrink: 1}}>{label}</Text>
          {mode === 'list' && <HomeIcon name="chevron-right" size={14} color={optional((route || category).iconColor) ?? list.iconColor} />}
        </View>
      </View>)}
    </View>
    <Text style={{color: c.textSecondary, fontSize: 12}}>{t('Com as cores dos módulos ligadas, o item lateral acompanha a rota da Home em lista. Desligadas, cada área usa suas cores do tema. A prévia lateral mostra o item ativo.')}</Text>
  </View>;
}
