import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {useStore, getAllStores} from '@store';
import {api} from '@controleonline/ui-common/src/api';
import {recoverManagerContext} from './recoverManagerContext';
import HomeIcon from '../HomeIcon';
import HomeAvatar from '../HomeAvatar';
import resolveHomeAvatar from '../resolveHomeAvatarUrl';
import {DefaultTableThemeContext} from '../../../node_modules/@controleonline/ui-default/src/react/components/table/useDefaultTableTheme';
import {managerTableTheme} from './managerTableTheme';
import {getAvatarDisplayName} from '@controleonline/ui-common/src/react/utils/userAvatar';
import ManagerCompanySelector from './ManagerCompanySelector';
import AppTypeSwitcher from '@controleonline/ui-common/src/react/components/AppTypeSwitcher';
import {app_type, app_type_base} from '@appType';
import {managerMenu, selectedManagerMenuItem} from './model';
import {useManagerPreview} from './ManagerPreviewProvider';
import ManagerGuide from './ManagerGuide';
import ManagerAccountMenu from './ManagerAccountMenu';
import ManagerBottomNavigation from './ManagerBottomNavigation';
import useJourneyReadiness from './useJourneyReadiness';
import ManagerBrand from './ManagerBrand';
import {ManagementPageTitleContext} from './ManagementPageTitleContext';
import ManagerScreenNavigation from './ManagerScreenNavigation';

export default function ManagerShell({navigation, route, options, children}) {
  const {width} = useWindowDimensions();
  const focused = useIsFocused();
  const {colors: c, themeIssues = [], mode, toggleMode, experience, setGuideOpen, avatarEnabled, bottomBar} = useManagerPreview();
  useJourneyReadiness({experience, route: route.name, focused});
  const tableTheme = useMemo(() => managerTableTheme(c), [c]);
  const themeStore = useStore('theme');
  const {menus} = themeStore.getters;
  const auth = useStore('auth');
  const {user} = auth.getters;
  const peopleStore = useStore('people');
  const {currentCompany} = peopleStore.getters;
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const recoveryAlive = useRef(true);
  useEffect(() => {recoveryAlive.current=true; return () => {recoveryAlive.current=false;};}, []);
  const retryContext = async () => {
    if (recovering) return;
    setRecovering(true); setRecoveryError('');
    const principal = auth.getters.user?.id || auth.getters.user?.username;
    const session = auth.getters.user?.api_key || auth.getters.user?.token;
    const isCurrent = () => {const a=getAllStores().auth?.getters; return recoveryAlive.current && !!a?.isLogged && (a.user?.id || a.user?.username) === principal && (a.user?.api_key || a.user?.token) === session;};
    try {await recoverManagerContext({people:peopleStore, theme:themeStore, api, isCurrent, getPeople:()=>getAllStores().people});}
    catch {if(isCurrent()) setRecoveryError('Não foi possível carregar o contexto. Confira a conexão com a API e tente novamente.');}
    finally {if(recoveryAlive.current) setRecovering(false);}
  };
  const canOpenProfile = navigation.getState().routeNames.includes('ProfilePage');
  const [accountAnchor, setAccountAnchor] = useState(null);
  const closeAccount = () => setAccountAnchor(null);
  const openAccount = anchor => {setOpen(false); setGuideOpen(false); setAccountAnchor(anchor);};
  const accountAction = action => () => {closeAccount(); action();};
  const avatar = size => <HomeAvatar imageUrl={resolveHomeAvatar(user, currentCompany)} name={getAvatarDisplayName(user)} size={size} backgroundColor={c.cardIconBackground} borderColor={c.cardBorder} textColor={c.textPrimary} />;
  const [open, setOpen] = useState(false);
  const catalogEntrySequence = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const mobile = width <= 760;
  const compact = !mobile && (width <= 1060 || collapsed);
  const groups = managerMenu(menus, navigation.getState().routeNames, global.t?.t);
  const toolbar = managerMenu(menus, navigation.getState().routeNames, global.t?.t, 'toolbar')
    .flatMap(group => group.items).filter(item => item.name !== 'HomePage' && !groups.some(group => group.items.some(home => home.name === item.name)));
  if (toolbar.length) groups.push({id: 'toolbar', title: 'Mais acessos', items: toolbar});
  const items = groups.flatMap(group => group.items);
  const selected = selectedManagerMenuItem(items, route);
  const section = groups.find(group => group.items.includes(selected));
  const name = getAvatarDisplayName(user) || 'Minha conta';
  useEffect(() => {
    if (!focused || !mobile) setOpen(false);
    closeAccount();
  }, [focused, mobile, route.name]);
  useEffect(() => {
    if (!mobile || !open || typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const close = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [mobile, open]);
  useLayoutEffect(() => {
    if (!focused || !experience) return;
    experience.setCapabilities(items.map(item => item.name));
    experience.present(route.name);
  }, [focused, route.name, menus, experience, currentCompany?.id, user?.id]);
  const go = item => {
    setOpen(false);
    experience?.begin(item.name, 'click');
    // Reselecting the focused PDV does not trigger a navigation focus event.
    const params = item.name === 'PdvPage'
      ? {...item.params, catalogResetKey: `menu:${Date.now()}:${++catalogEntrySequence.current}`}
      : item.params;
    navigation.navigate(item.name, params);
  };
  const icon = (value, size = 18, color = c.navigationIcon) => <HomeIcon name={value || 'grid'} size={size} color={color} />;
  const navItem = (item, key) => {
    const active = item === selected || item.name === 'HomePage' && route.name === 'HomePage';
    return <Pressable key={key} accessibilityRole="button" accessibilityLabel={item.title}
      accessibilityState={{selected: active}} title={compact ? item.title : undefined}
      onHoverIn={() => experience?.anticipate(item.name)} onHoverOut={() => experience?.cancelAnticipation()}
      onFocus={() => experience?.anticipate(item.name)} onBlur={() => experience?.cancelAnticipation()}
      onPress={() => go(item)} style={({hovered, pressed}) => [s.navItem,
        {backgroundColor: active ? c.navigationActiveBackground : hovered || pressed ? c.navigationActiveBackground : 'transparent',
          borderLeftColor: active ? c.navigationActiveBorder : 'transparent'}, compact && s.center]}>
      {icon(item.icon, 18, active ? c.navigationActiveIcon : c.navigationIcon)}
      {!compact && <Text numberOfLines={2} style={[s.navText, {color: active ? c.navigationActiveText : c.navigationText}]}>{item.title}</Text>}
    </Pressable>;
  };
  const sidebar = <View testID="manager-sidebar" style={[s.sidebar, {backgroundColor: c.navigationBackground, borderRightColor: c.navigationBorder,
    width: compact ? 76 : 254}, mobile && s.drawer]}>
    {mobile && <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={() => setOpen(false)} style={s.close}>{icon('x')}</Pressable>}
    <View style={[s.brand, compact && s.compactBrand]} />
    <ScrollView style={s.menu} contentContainerStyle={{padding: compact ? 10 : 12}}>
      {!compact && <Text style={[s.caption, {color: c.textMuted}]}>INÍCIO</Text>}
      {navItem({name: 'HomePage', title: 'Início', icon: 'grid'}, 'home')}
      {groups.map((group, i) => <View key={group.id || i} style={s.group}>
        {!compact && <Text style={[s.caption, {color: c.textMuted}]}>{group.title}</Text>}
        {group.items.map((item, j) => navItem(item, item.id || `${item.name}-${j}`))}
      </View>)}
      {!groups.length && !compact && <Text style={[s.navText, {color: c.textMuted}]}>Aguardando os menus disponíveis para seu perfil.</Text>}
    </ScrollView>
    <Pressable accessibilityRole="button" accessibilityLabel="Abrir opções do usuário" accessibilityState={{expanded: accountAnchor === 'sidebar'}} onPress={() => openAccount('sidebar')} style={[s.account, {borderColor: c.selectBorder, backgroundColor: c.selectBackground}, compact && s.center]}>{avatar(34)}
      {!compact && <View style={{flexShrink: 1, minWidth: 0}}><Text numberOfLines={1} style={[s.navText, {color: c.selectText}]}>{String(name)}</Text>
        <Text style={{fontSize: 11, color: c.textMuted}}>Minha conta</Text></View>}
    </Pressable>
  </View>;
  return <View  style={[s.shell, {backgroundColor: c.pageBackground}]}>
    {!mobile && sidebar}
    <View collapsable={false} style={s.main}>
      <View style={{backgroundColor: c.headerBackground, borderBottomColor: c.headerBorder, borderBottomWidth: 1}}>
      <View testID="manager-topbar" style={[s.topbar, mobile && s.mobileTop]}>
        <View style={[s.headerSide, s.headerLeft]}>
          <Pressable accessibilityRole="button" accessibilityLabel={mobile ? 'Abrir menu' : 'Alternar menu compacto'}
            onPress={() => mobile ? setOpen(true) : setCollapsed(!collapsed)} style={[s.iconButton, {borderColor: c.headerBorder}]}>{icon('menu', 18, c.headerIcon)}</Pressable>
        {!mobile && <View testID="manager-breadcrumb" style={s.breadcrumb}><Text numberOfLines={1} style={{color: c.headerText, fontSize: 12}}>
          {app_type}  /  {section?.title || 'Início'}  /  <Text style={{color: c.headerText, fontWeight: '600'}}>{selected?.title || (route.name === 'HomePage' ? 'Início' : 'Detalhes')}</Text>
        </Text></View>}
        </View>
        <View style={s.homeButton} testID="manager-header-company">
          <ManagerCompanySelector colors={c} compact mode="logo" />
        </View>
        <View style={[s.headerSide, s.headerRight, !mobile && s.headerControls]}>
          {app_type_base === 'ADMIN' && <AppTypeSwitcher colors={c} compact={mobile} />}
        </View>
      </View>
      </View>
      <ManagerScreenNavigation navigation={navigation} route={route} options={options} colors={c} />
      {themeIssues.length > 0 && <View accessibilityRole="alert" style={{padding:12,borderBottomWidth:1,borderColor:c.cardBorder}}><Text style={{color:c.textPrimary}}>Tema incompleto: {themeIssues.join(', ')}.</Text></View>}
      {(!currentCompany?.id || !items.length) && <View accessibilityRole="alert" style={{padding:12,gap:8,borderBottomWidth:1,borderColor:c.cardBorder,backgroundColor:c.cardBackground}}>
        <Text style={{color:c.textPrimary}}>{recoveryError || (!currentCompany?.id ? 'A empresa ainda não foi carregada.' : 'Nenhum menu foi carregado para este contexto.')}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Tentar carregar empresa e menus" disabled={recovering} onPress={retryContext} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:c.textPrimary,fontWeight:'600'}}>{recovering ? 'Carregando contexto…' : 'Tentar novamente'}</Text></Pressable>
      </View>}
      <View style={s.content}><DefaultTableThemeContext.Provider value={tableTheme}><ManagementPageTitleContext.Provider value={route.name !== 'HomePage' && !(route.name === 'DisplayDetails' && options?.headerShown === false)}>{children}</ManagementPageTitleContext.Provider></DefaultTableThemeContext.Provider></View>
      {mobile && focused && bottomBar?.visible && <ManagerBottomNavigation navigation={navigation} route={route} colors={c} />}
    </View>
    {focused && !open && !accountAnchor && <ManagerGuide navigation={navigation} route={route} items={items} />}
    {focused && <ManagerAccountMenu anchor={accountAnchor} mobile={mobile} colors={c} name={name} mode={mode}
      canOpenProfile={canOpenProfile} onClose={closeAccount}
      bottomBar={mobile ? bottomBar : undefined}
      onBarSession={accountAction(() => bottomBar.setSessionVisible(!bottomBar.visible))}
      onBarRemember={async () => {if (await bottomBar.setRememberedVisible(!bottomBar.rememberedVisible)) closeAccount();}}
      onProfile={accountAction(() => go({name: 'ProfilePage'}))}
      onHelp={avatarEnabled ? accountAction(() => setGuideOpen(true)) : undefined}
      onTheme={accountAction(toggleMode)}
      onLogout={auth.actions?.logOut ? accountAction(() => auth.actions.logOut()) : undefined} />}
    {mobile && open && <View accessibilityViewIsModal style={[StyleSheet.absoluteFill, s.drawerOverlay]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={() => setOpen(false)} style={[StyleSheet.absoluteFill, {backgroundColor: c.modalOverlay}]} />
      {sidebar}
    </View>}
  </View>;
}

const s = StyleSheet.create({
  shell: {flex: 1, flexDirection: 'row', minHeight: 0},
  sidebar: {borderRightWidth: 1, flexShrink: 0, minHeight: 0, alignSelf: 'stretch'}, drawer: {height: '100%'},
  // Keep elevated catalog descendants below the mobile drawer on Android.
  drawerOverlay: {zIndex: 100, elevation: 24},
  brand: {flexShrink: 0, padding: 12}, compactBrand: {paddingHorizontal: 8},
  close: {alignSelf: 'flex-end', marginRight: 12, padding: 8}, menu: {flex: 1, minHeight: 0}, group: {marginTop: 22},
  caption: {fontSize: 10, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase', margin: 12},
  navItem: {minHeight: 42, paddingVertical: 10, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 10, borderLeftWidth: 3, marginBottom: 3},
  navText: {fontSize: 12, fontWeight: '600', flexShrink: 1}, center: {justifyContent: 'center', paddingHorizontal: 0},
  account: {flexShrink: 0, margin: 12, padding: 12, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10},
  main: {flex: 1, minWidth: 0},
  topbar: {minHeight: 74, paddingHorizontal: 28, paddingVertical: 10, flexDirection: 'row', alignItems: 'center'},
  mobileTop: {paddingHorizontal: 12, minHeight: 64},
  headerSide: {flex: 1, minWidth: 0}, headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 14}, headerRight: {alignItems: 'flex-end'},
  headerControls: {flexDirection:'row',alignItems:'center',justifyContent:'flex-end',gap:16},
  headerDetails: {paddingHorizontal: 28, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 16},
  mobileDetails: {paddingHorizontal: 12, justifyContent: 'flex-end'},
  breadcrumb: {flex: 1, minWidth: 0},
  iconButton: {width: 38, height: 38, flexShrink: 0, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  homeButton: {minWidth: 96, maxWidth: 168, minHeight: 56, flexShrink: 0, alignItems: 'center', justifyContent: 'center'},
  content: {flex: 1, minHeight: 0, minWidth: 0},
});
