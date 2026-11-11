import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {CONTROL_HEIGHT} from './controlHeight';
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
import ManagerStartup from './ManagerStartup';
import AppTypeSwitcher from '@controleonline/ui-common/src/react/components/AppTypeSwitcher';
import {app_type, app_type_base} from '@appType';
import {managerMenu, selectedManagerMenuItem} from './model';
import {moduleListAppearance, resolveModuleAccent, moduleAccentSource, modulePropertyColor, modulePropertySource} from './moduleAccent';
import {useManagerPreview} from './ManagerPreviewProvider';
import ManagerGuide from './ManagerGuide';
import ManagerAccountMenu from './ManagerAccountMenu';
import {useThemeTools} from '../theme-editor/ThemeToolsProvider';
import {refreshDomainTheme} from '../../styles/themeRuntime';
import ManagerBottomNavigation from './ManagerBottomNavigation';
import useJourneyReadiness from './useJourneyReadiness';
import ManagerBrand from './ManagerBrand';
import {ManagementPageTitleContext} from './ManagementPageTitleContext';
import ManagerScreenNavigation, {goBackFromManagement} from './ManagerScreenNavigation';
import ScreenThemeBoundary from '../theme-editor/ScreenThemeBoundary';
import {identifyThemeScreen} from '../../styles/screenThemeKeys';
import {resolveManagementPageTitle} from './managementPageTitle';

export default function ManagerShell({navigation, route, options, children}) {
  const {width} = useWindowDimensions();
  const focused = useIsFocused();
  const {colors: c, themeIssues = [], themeStatus, themeError, mode, toggleMode, experience, setGuideOpen, avatarEnabled, bottomBar, mobileMenu, sidebar: sidebarPreference, moduleAccent, moduleAccentPalette} = useManagerPreview();
  const themeTools=useThemeTools();
  const sidebarVisible = sidebarPreference?.visible !== false;
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
  const avatar = size => <HomeAvatar imageUrl={resolveHomeAvatar(user, currentCompany)} name={getAvatarDisplayName(user)} size={size} backgroundColor={c.navigationAvatarBackground} borderColor={c.navigationAvatarBorder} textColor={c.navigationAvatarText} />;
  const [open, setOpen] = useState(false);
  const catalogEntrySequence = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const mobile = width <= 760;
  const [mobileHeaderHeight, setMobileHeaderHeight] = useState(64);
  const [leftHeaderWidth, setLeftHeaderWidth] = useState(0);
  const [rightHeaderWidth, setRightHeaderWidth] = useState(0);
  // Side measurements only limit the caption width. Equal insets keep the logo
  // centered even before either side reports its size.
  const companyInset = 14 + Math.max(leftHeaderWidth, rightHeaderWidth);
  const [localRail, setLocalRail] = useState(false);
  const longMenuPress = useRef(false);
  const railVisible = mobileMenu ? mobileMenu.visible : localRail;
  const toggleMobileRail = () => {
    longMenuPress.current = true;
    setOpen(false);
    if (mobileMenu) mobileMenu.toggle();
    else setLocalRail(value => !value);
  };
  const compact = !mobile && (width <= 1060 || collapsed);
  const groups = managerMenu(menus, navigation.getState().routeNames, global.t?.t);
  const toolbar = managerMenu(menus, navigation.getState().routeNames, global.t?.t, 'toolbar')
    .flatMap(group => group.items).filter(item => item.name !== 'HomePage' && !groups.some(group => group.items.some(home => home.name === item.name)));
  if (toolbar.length) groups.push({id: 'toolbar', title: 'Mais acessos', items: toolbar});
  const items = groups.flatMap(group => group.items);
  const selected = selectedManagerMenuItem(items, route);
  const themeScreen=identifyThemeScreen(route,app_type,selected?.title || resolveManagementPageTitle(route,options));
  const section = groups.find(group => group.items.includes(selected));
  const name = getAvatarDisplayName(user) || 'Minha conta';
  useEffect(() => {
    if (!focused || !mobile || !sidebarVisible) setOpen(false);
    closeAccount();
  }, [focused, mobile, route.name, sidebarVisible]);
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
  const icon = (value, size = 18, color = c.navigationIcon, source) => <HomeIcon dataSet={source ? {coThemeSource: source} : undefined} name={value || 'grid'} size={size} color={color} />;
  const navItem = (item, key, iconsOnly = compact) => {
    const active = item === selected || item.name === 'HomePage' && route.name === 'HomePage';
    const accent = moduleAccent?.value
      ? resolveModuleAccent(item.color, moduleAccentPalette) : undefined;
    const appearance = moduleListAppearance({accent, colors: c, sidebar: true, active, record: item, enabled: !!moduleAccent?.value, palette: moduleAccentPalette});
    return <Pressable key={key} accessibilityRole="button" accessibilityLabel={item.title}
      dataSet={{coThemeSource: moduleAccentSource(accent, 'routes.color', item.name, item.color)}}
      accessibilityState={{selected: active}} title={iconsOnly ? item.title : undefined}
      onHoverIn={() => experience?.anticipate(item.name)} onHoverOut={() => experience?.cancelAnticipation()}
      onFocus={() => experience?.anticipate(item.name)} onBlur={() => experience?.cancelAnticipation()}
      onPress={() => go(item)} style={({hovered, pressed}) => {
        const highlighted = active || hovered || pressed;
        return [s.navItem, {
          backgroundColor: moduleListAppearance({accent, colors: c, sidebar: true, active, highlighted, record: item, enabled: !!moduleAccent?.value, palette: moduleAccentPalette}).backgroundColor,
          borderLeftColor: active ? c.navigationActiveBorder : c.containerTransparentBackground,
        }, iconsOnly && s.center];
      }}>
      {icon(item.icon, 18, appearance.iconColor, modulePropertySource(item, 'iconColor', {enabled: !!moduleAccent?.value, palette: moduleAccentPalette, id: item.name}))}
      {!iconsOnly && <Text dataSet={{coThemeSource: modulePropertySource(item, 'textColor', {enabled: !!moduleAccent?.value, palette: moduleAccentPalette, id: item.name})}} numberOfLines={2} style={[s.navText, {color: appearance.textColor}]}>{item.title}</Text>}
    </Pressable>;
  };
  const sidebar = <View testID="manager-sidebar" style={[s.sidebar, {backgroundColor: c.navigationBackground, borderRightColor: c.navigationBorder,
    width: compact ? 76 : 254}, mobile && s.drawer]}>
    {mobile && <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={() => setOpen(false)} style={s.close}>{icon('x')}</Pressable>}
    <View style={[s.brand, compact && s.compactBrand, s.sidebarToggleRow]}>
      {!mobile && (
        <Pressable
          testID="manager-sidebar-toggle"
          accessibilityRole="button"
          accessibilityLabel={compact ? 'Expandir menu' : 'Recolher menu'}
          onPress={() => setCollapsed(!collapsed)}
          style={[s.sidebarToggle, {borderColor: c.navigationBorder}]}>
          {icon(compact ? 'chevrons-right' : 'chevrons-left', 18, c.navigationIcon)}
        </Pressable>
      )}
    </View>
    <ScrollView style={s.menu} contentContainerStyle={{padding: compact ? 10 : 12}}>
      {!compact && <Text style={[s.caption, {color: c.navigationCaptionText}]}>INÍCIO</Text>}
      {navItem({name: 'HomePage', title: 'Início', icon: 'grid'}, 'home')}
      {groups.map((group, i) => <View key={group.id || i} style={s.group}>
        {!compact && <Text style={[s.caption, {color: (moduleAccent?.value ? modulePropertyColor(group.textColor, moduleAccentPalette) : undefined) ?? c.navigationCaptionText}]} dataSet={{coThemeSource: modulePropertySource(group, 'textColor', {enabled: !!moduleAccent?.value, palette: moduleAccentPalette, table: 'category', id: group.id})}}>{group.title}</Text>}
        {group.items.map((item, j) => navItem(item, item.id || `${item.name}-${j}`))}
      </View>)}
      {!groups.length && !compact && <Text style={[s.navText, {color: c.navigationCaptionText}]}>Aguardando os menus disponíveis para seu perfil.</Text>}
    </ScrollView>
    <Pressable accessibilityRole="button" accessibilityLabel="Abrir opções do usuário" accessibilityState={{expanded: accountAnchor === 'sidebar'}} onPress={() => openAccount('sidebar')} style={[s.account, {borderColor: c.navigationAccountBorder, backgroundColor: c.navigationAccountBackground}, compact && s.center]}>{avatar(34)}
      {!compact && <View style={{flexShrink: 1, minWidth: 0}}><Text numberOfLines={1} style={[s.navText, {color: c.navigationAccountText}]}>{String(name)}</Text>
        <Text style={{fontSize: 11, color: c.navigationAccountSecondaryText}}>Minha conta</Text></View>}
    </Pressable>
  </View>;
  // Keep module instances mounted during appearance refreshes: forms and local
  // module state must survive a company/theme loading presentation.
  const preparingTheme=themeStatus==='idle' || themeStatus==='loading';
  const failedTheme=themeStatus==='error';
  const missingCompany=themeStatus==='ready' && !currentCompany?.id;
  const themeSettings = route.name === 'ThemeManagerPage';
  const canOpenThemeSettings = navigation.getState().routeNames.includes('ThemeManagerPage');
  const preparing = !themeSettings && (preparingTheme || failedTheme || missingCompany);
  const startup=preparingTheme
    ? <ManagerStartup accessibilityLabel="Preparando aparência do sistema" message="Carregando a aparência do sistema…"/>
    : failedTheme
      ? <ManagerStartup accessibilityLabel="Falha ao carregar aparência" message="Não foi possível carregar a aparência do sistema." busy={false} error={themeError} onRetry={refreshDomainTheme}
          onOpenThemeSettings={canOpenThemeSettings ? () => go({name:'ThemeManagerPage'}) : undefined}/>
      : missingCompany
        ? <ManagerStartup accessibilityLabel="Preparando empresa" message={recovering?'Carregando empresa e acessos…':'A empresa ainda não está disponível.'} busy={recovering} error={recoveryError} onRetry={retryContext}/>
        : null;
  return <ScreenThemeBoundary screen={themeScreen}>
    {preparing && startup}
    <View testID="manager-shell-presentation" style={[s.shell, {backgroundColor: c.pageBackground}, preparing && {display:'none'}]}>
    {sidebarVisible && !mobile && sidebar}
    <View collapsable={false} style={s.main}>
      <View testID="manager-header" onLayout={event => {if (mobile) setMobileHeaderHeight(Math.round(event.nativeEvent.layout.height));}}
        style={{backgroundColor: c.headerBackground, borderBottomColor: c.headerBorder, borderBottomWidth: 1}}>
      <View testID="manager-topbar" style={[s.topbar, mobile && s.mobileTop]}>
        <View style={[s.headerSide, s.headerLeft, mobile && s.mobileHeaderLeft]}
          onLayout={mobile ? event => setLeftHeaderWidth(event.nativeEvent.layout.width) : undefined}>
          {sidebarVisible && mobile && <Pressable testID="manager-mobile-menu-toggle" accessibilityRole="button"
            accessibilityLabel="Abrir menu" accessibilityHint="Segure para mostrar ou ocultar os atalhos laterais"
            delayLongPress={500}
            onPressIn={() => {longMenuPress.current = false;}}
            onLongPress={toggleMobileRail}
            onPress={() => {
              if (longMenuPress.current) return;
              setOpen(true);
            }}
            style={[s.mobileMenuButton, {borderColor: c.headerBorder}]}>
            {icon('menu', 18, c.headerIcon)}
          </Pressable>}
          {navigation.canGoBack?.() ? (
            <Pressable
              testID="manager-header-back"
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={() => goBackFromManagement(navigation, route, options?.headerBackFallback)}
              style={[s.headerIconOnly,mobile && {width:28}]}>
              {icon('arrow-left', 18, c.headerIcon)}
            </Pressable>
          ) : null}
          {!mobile && <View testID="manager-breadcrumb" style={s.breadcrumb}><Text numberOfLines={1} style={{color: c.headerText, fontSize: 12}}>
            {app_type}  /  {section?.title || 'Início'}  /  <Text style={{color: c.headerText, fontWeight: '600'}}>{selected?.title || (route.name === 'HomePage' ? 'Início' : 'Detalhes')}</Text>
          </Text></View>}
        </View>
        <View testID="manager-header-company" pointerEvents={mobile ? 'box-none' : undefined}
          style={[!mobile && s.homeButton, mobile && s.mobileCompany,
            mobile && {left: companyInset, right: companyInset}]}>
          <ManagerCompanySelector colors={c} mode="header" />
        </View>
        <View style={[s.headerSide, s.headerRight, mobile ? s.mobileHeaderRight : s.headerControls,
          mobile && width <= 420 && !sidebarVisible && app_type_base === 'ADMIN' && s.mobileHeaderRightStack]}
          onLayout={mobile ? event => setRightHeaderWidth(event.nativeEvent.layout.width) : undefined}>
          {app_type_base === 'ADMIN' && <AppTypeSwitcher colors={c} compact={mobile} />}
          {!sidebarVisible && <Pressable accessibilityRole="button" accessibilityLabel="Abrir opções do usuário" accessibilityState={{expanded: accountAnchor === 'header'}} onPress={() => openAccount('header')} style={s.headerIconOnly}>{avatar(28)}</Pressable>}
        </View>
      </View>
      </View>
      <ManagerScreenNavigation navigation={navigation} route={route} options={options} colors={c} />
      {!themeSettings && themeIssues.length > 0 && <View accessibilityRole="alert" style={{padding:12,borderBottomWidth:1,borderColor:c.cardBorder,flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:8}}>
        <Text style={{color:c.textPrimary}}>Tema incompleto.</Text>
        {canOpenThemeSettings && <Pressable accessibilityRole="button" onPress={() => go({name:'ThemeManagerPage'})}>
          <Text style={{color:c.textPrimary,textDecorationLine:'underline'}}>Abrir Configurador de Temas</Text>
        </Pressable>}
      </View>}
      {(!currentCompany?.id || !items.length) && <View accessibilityRole="alert" style={{padding:12,gap:8,borderBottomWidth:1,borderColor:c.cardBorder,backgroundColor:c.cardBackground}}>
        <Text style={{color:c.textPrimary}}>{recoveryError || (!currentCompany?.id ? 'A empresa ainda não foi carregada.' : 'Nenhum menu foi carregado para este contexto.')}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Tentar carregar empresa e menus" disabled={recovering} onPress={retryContext} style={{minHeight:CONTROL_HEIGHT,justifyContent:'center'}}><Text style={{color:c.textPrimary,fontWeight:'600'}}>{recovering ? 'Carregando contexto…' : 'Tentar novamente'}</Text></Pressable>
      </View>}
      <View style={s.mobileBody}>
        {sidebarVisible && mobile && railVisible && <View testID="manager-mobile-rail" style={[s.mobileRail, {backgroundColor:c.navigationBackground, borderRightColor:c.navigationBorder}]}>
          <ScrollView style={s.menu} contentContainerStyle={{paddingHorizontal:2,paddingVertical:4}}>
            {navItem({name:'HomePage',title:'Início',icon:'grid'},'rail-home',true)}
            {items.filter(item=>item.name!=='HomePage').map((item,index)=>navItem(item,`rail-${item.id || item.name}-${index}`,true))}
          </ScrollView>
        </View>}
        <View style={s.content}><DefaultTableThemeContext.Provider value={tableTheme}><ManagementPageTitleContext.Provider value={route.name !== 'HomePage' && !(route.name === 'DisplayDetails' && options?.headerShown === false)}>{children}</ManagementPageTitleContext.Provider></DefaultTableThemeContext.Provider></View>
      </View>
      {mobile && focused && bottomBar?.visible && <ManagerBottomNavigation navigation={navigation} route={route} colors={c} />}
    </View>
    {focused && !open && !accountAnchor && <ManagerGuide navigation={navigation} route={route} items={items} />}
    {focused && <ManagerAccountMenu screen={themeScreen} anchor={accountAnchor} mobile={mobile} colors={c} name={name} mode={mode}
      canOpenProfile={canOpenProfile} onClose={closeAccount}
      sidebarPreference={sidebarPreference}
      bottomBar={mobile ? bottomBar : undefined}
      onBarSession={accountAction(() => bottomBar.setSessionVisible(!bottomBar.visible))}
      onBarRemember={async () => {if (await bottomBar.setRememberedVisible(!bottomBar.rememberedVisible)) closeAccount();}}
      onProfile={accountAction(() => go({name: 'ProfilePage'}))}
      onHelp={avatarEnabled ? accountAction(() => setGuideOpen(true)) : undefined}
      onTheme={accountAction(toggleMode)}
      onThemeEditor={themeTools.available ? accountAction(themeTools.openEditor) : undefined}
      onLogout={auth.actions?.logOut ? accountAction(() => auth.actions.logOut()) : undefined} />}
    {sidebarVisible && mobile && open && <View accessibilityViewIsModal style={[StyleSheet.absoluteFill, s.drawerOverlay, {top: mobileHeaderHeight}]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={() => setOpen(false)} style={[StyleSheet.absoluteFill, {backgroundColor: c.modalOverlay}]} />
      {sidebar}
    </View>}
  </View></ScreenThemeBoundary>;
}

const s = StyleSheet.create({
  shell: {flex: 1, flexDirection: 'row', minHeight: 0},
  sidebar: {borderRightWidth: 1, flexShrink: 0, minHeight: 0, alignSelf: 'stretch'}, drawer: {height: '100%'},
  // Keep elevated catalog descendants below the mobile drawer on Android.
  drawerOverlay: {zIndex: 100, elevation: 24},
  brand: {flexShrink: 0, padding: 12}, compactBrand: {paddingHorizontal: 8},
  close: {alignSelf: 'flex-end', marginRight: 12, padding: 8}, menu: {flex: 1, minHeight: 0}, group: {marginTop: 22},
  caption: {fontSize: 10, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase', margin: 12},
  navItem: {minHeight: CONTROL_HEIGHT, paddingVertical: 4, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 10, borderLeftWidth: 3, marginBottom: 3},
  navText: {fontSize: 12, fontWeight: '600', flexShrink: 1}, center: {justifyContent: 'center', paddingHorizontal: 0},
  account: {flexShrink: 0, margin: 12, padding: 12, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10},
  main: {flex: 1, minWidth: 0},
  topbar: {minHeight: 74, paddingHorizontal: 28, paddingVertical: 10, flexDirection: 'row', alignItems: 'center'},
  mobileTop: {paddingHorizontal:8,paddingVertical:5,minHeight:64,gap:6,justifyContent:'space-between'},
  headerSide: {flex: 1, minWidth: 0}, headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 14}, headerRight: {alignItems: 'flex-end'},
  mobileHeaderLeft: {flexGrow: 0, flexShrink: 0, flexBasis: 'auto', gap: 4},
  mobileHeaderRight: {flexGrow: 0, flexShrink: 0, flexBasis: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6},
  mobileHeaderRightStack: {flexDirection: 'column', alignItems: 'flex-end', gap: 0},
  headerControls: {flexDirection:'row',alignItems:'center',justifyContent:'flex-end',gap:16},
  headerDetails: {paddingHorizontal: 28, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 16},
  mobileDetails: {paddingHorizontal: 12, justifyContent: 'flex-end'},
  breadcrumb: {flex: 1, minWidth: 0},
  iconButton: {width: 38, height: 38, flexShrink: 0, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  headerIconOnly: {width: 36, height: 36, flexShrink: 0, alignItems: 'center', justifyContent: 'center', opacity: 0.75},
  sidebarToggleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'},
  sidebarToggle: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 0},
  mobileRail: {width: 48, borderRightWidth: 1, flexShrink: 0, minHeight:0},
  mobileBody: {flex:1,minHeight:0,flexDirection:'row'},
  mobileMenuButton: {width:36,height:36,flexShrink:0,borderWidth:1,borderRadius:10,alignItems:'center',justifyContent:'center'},
  homeButton: {width:240,maxWidth:240,minWidth:0,minHeight:34,flexShrink:1,alignItems:'stretch',justifyContent:'center'},
  mobileCompany: {position:'absolute',top:0,bottom:0,alignItems:'center',justifyContent:'center'},
  content: {flex: 1, minHeight: 0, minWidth: 0},
});
