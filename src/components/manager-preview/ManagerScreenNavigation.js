import React from 'react';
import {resolveManagementPageTitle} from './managementPageTitle';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export function goBackFromManagement(navigation, route, fallback) {
  if (navigation.canGoBack?.()) return navigation.goBack();
  const target = typeof fallback === 'function' ? fallback({navigation, route}) : fallback;
  if (target?.resetRoutes?.length) return navigation.reset({index: target.resetRoutes.length - 1, routes: target.resetRoutes});
  if (target?.name) return navigation.navigate(target.name, target.params || {});
  return navigation.navigate('HomePage');
}

export default function ManagerScreenNavigation({navigation, route, options = {}, colors: c}) {
  if ((options.headerShown === false && options.headerBackVisible === false) || route.name === 'HomePage' || (route.name === 'DisplayDetails' && options.headerShown === false)) return null;
  // Some operational displays explicitly lock navigation. Keep that contract.
  const allowBack = options.headerBackVisible !== false;
  const props = {tintColor: c.textPrimary, canGoBack: !!navigation.canGoBack?.()};
  const customLeft = options.headerShown !== false && typeof options.headerLeft === 'function'
    ? options.headerLeft(props) : null;
  const actions = options.headerShown !== false && typeof options.headerRight === 'function'
    ? options.headerRight(props) : null;
  const customTitle = options.headerShown !== false && typeof options.headerTitle === 'function'
    ? options.headerTitle({...props, children: options.title || ''}) : null;
  const simpleText = (node, inText = false) => {
    if (node == null || node === false) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) {
      const parts = node.map(child => simpleText(child, inText));
      if (parts.some(part => part === null) || (!inText && parts.filter(Boolean).length > 1)) return null;
      return parts.join('');
    }
    if (React.isValidElement(node) && node.type === Text) return simpleText(node.props.children, true);
    if (React.isValidElement(node) && [View, React.Fragment].includes(node.type)) return simpleText(node.props.children, inText);
    return null;
  };
  const extractedTitle = simpleText(customTitle);
  const title = resolveManagementPageTitle(route, {...options, headerTitle: extractedTitle || options.headerTitle});
  // Composite order headers may include status/actions; they are not disposable titles.
  const operationalHeader = customTitle && extractedTitle === null ? customTitle : null;
  // Title alone is redundant with the shell header/breadcrumb — drop the gray strip.
  if (!customLeft && !actions && !operationalHeader) return null;
  return <View testID="management-screen-navigation" style={[s.container, {borderBottomColor: c.headerBorder, backgroundColor: c.pageBackground}]}>
    {(customLeft || operationalHeader || actions) ? <View style={s.details}>
      {customLeft && <View style={s.operational}>{customLeft}</View>}
      {operationalHeader && <View style={s.operational}>{operationalHeader}</View>}
      {actions && <View style={s.actions}>{actions}</View>}
    </View> : null}
  </View>;
}

const s = StyleSheet.create({
  container: {paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, gap: 6},
  row: {flexDirection: 'row', alignItems: 'center', minHeight: 44},
  side: {width: 12, flexShrink: 0},
  back: {minHeight: 44, paddingHorizontal: 10, justifyContent: 'center', alignSelf: 'flex-start', borderWidth: 1, borderRadius: 10},
  title: {flex: 1, minWidth: 0, paddingHorizontal: 4},
  titleText: {fontSize: 16, fontWeight: '600', textAlign: 'center'},
  details: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8},
  operational: {maxWidth: '100%', flexShrink: 1},
  actions: {marginLeft: 'auto', maxWidth: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flexShrink: 1},
});
