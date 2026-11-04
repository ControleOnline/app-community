import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useStore} from '@store';
import {getAvatarDisplayName} from '@controleonline/ui-common/src/react/utils/userAvatar';
import HomeIcon from '../HomeIcon';
import {managerMenu} from './model';
import {useManagerPreview} from './ManagerPreviewProvider';

export default function ManagerAdminHome({navigation}) {
  const {colors: c} = useManagerPreview();
  const {width} = useWindowDimensions();
  const {menus} = useStore('theme').getters;
  const {user} = useStore('auth').getters;
  const groups = managerMenu(menus, navigation.getState().routeNames, global.t?.t);
  const toolbar = managerMenu(menus, navigation.getState().routeNames, global.t?.t, 'toolbar')
    .flatMap(group => group.items).filter(item => !groups.some(group => group.items.some(other => other.name === item.name)));
  if (toolbar.length) groups.push({id: 'toolbar', title: global.t?.t('configs', 'section_title', 'more_access') || global.t?.t('menu', 'menu', 'more_access'), items: toolbar});
  return <ScrollView style={{backgroundColor: c.pageBackground}} contentContainerStyle={[s.page, {padding: width <= 760 ? 16 : 32}]}>
    <Text accessibilityRole="header" style={[s.heading, {color: c.textPrimary}]}>Olá, {getAvatarDisplayName(user).split(' ')[0] || global.t?.t('configs', 'label', 'user')}</Text>
    <Text style={[s.subtitle, {color: c.textSecondary}]}>{global.t?.t('configs', 'section_title', 'administration') || global.t?.t('menu', 'menu', 'administration')}</Text>
    {groups.map((group, index) => <View key={group.id || index} style={s.group}>
      <Text accessibilityRole="header" style={[s.groupTitle, {color: c.textPrimary}]}>{group.title}</Text>
      <View style={s.items}>{group.items.filter(item => item.name !== 'HomePage').map((item, i) => <Pressable key={item.id || i}
        accessibilityRole="button" accessibilityLabel={item.title} onPress={() => navigation.navigate(item.name, item.params)}
        style={({hovered, pressed}) => [s.item, {width: width <= 760 ? '100%' : '48%', borderColor: c.cardBorder,
          backgroundColor: hovered || pressed ? c.navigationActiveBackground : c.cardBackground}]}>
        <HomeIcon name={item.icon || 'grid'} size={20} color={c.navigationIcon} />
        <Text style={[s.itemTitle, {color: c.textPrimary}]}>{item.title}</Text>
        <HomeIcon name="chevron-right" size={16} color={c.textMuted} />
      </Pressable>)}</View>
    </View>)}
    {!groups.length && <Text style={{color: c.textSecondary}}>{global.t?.t('configs', 'message', 'waiting_menus')}</Text>}
  </ScrollView>;
}

const s = StyleSheet.create({
  page: {gap: 12}, heading: {fontSize: 24, fontWeight: '700'}, subtitle: {fontSize: 14},
  group: {gap: 12, marginTop: 12}, groupTitle: {fontSize: 16, fontWeight: '600'},
  items: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  item: {minHeight: 72, padding: 16, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12},
  itemTitle: {flex: 1, minWidth: 0, fontSize: 14, fontWeight: '600'},
});
