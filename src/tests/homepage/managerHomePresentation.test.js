import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ManagerOverview from '../../components/manager-preview/ManagerOverview';
import {resolveManagerTheme} from '../../styles/managerTheme';
import {initializeGlobalChromeColors} from '../../styles/globalChromeTheme';
let mockWidth=393,mockTexts=true,mockModuleIcons=false,mockModuleAccent=false;
let mockIndicatorColors={},mockIndicatorPalette={},mockRouteAppearance={},mockCategoryAppearance={};
const mockFetch=jest.fn(async()=>({totalItems:0,summary:{sales:{totals:{revenue:0,orders:0,averageTicket:0},daily:[]}}}));
jest.mock('react-native',()=>({processColor:require('../theme-system/nativeMock.cjs').processColor,Platform:{OS:'web'},View:'View',Text:'Text',ScrollView:'ScrollView',Pressable:'Pressable',StyleSheet:{create:x=>x},useWindowDimensions:()=>({width:mockWidth})}));
jest.mock('@react-navigation/native',()=>({useIsFocused:()=>true}));
jest.mock('@appType',()=>({app_type:'MANAGER'}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockFetch(...args)}}));
jest.mock('../../components/HomeIcon',()=> 'Icon');
jest.mock('../../components/manager-preview/ManagerStartup',()=> 'ManagerStartup');
jest.mock('../../components/manager-preview/ManagerOrdersTrend',()=> 'Trend');
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>({
  colors:{cardText:'#123456',listItemText:'#654321',textMuted:'#345678',listItemIcon:'#876543',listItemBackground:'#F1F1F1',...mockIndicatorColors},
  moduleIcons:{value:mockModuleIcons},
  moduleAccent:{value:mockModuleAccent},
  moduleAccentPalette:{primary:'#147568',...mockIndicatorPalette},
})}));
jest.mock('@store',()=>({useStore:name=>({getters:name==='people'?{currentCompany:{id:3}}:name==='theme'?{menus:[
  {id:1,label:'Menu',color:'$primary',...mockCategoryAppearance,menus:[{id:1,route:'OrderHistoryPage',label:'Pedidos',color:'#0284c7',...mockRouteAppearance,menuType:'home',routeParams:{orderTypeFilter:'sale'}}]},
  {id:2,label:'Comercial',menus:[{id:2,route:'ClientsIndex',label:'Clientes',menuType:'home'}]},
]}:{messages:{}}})}));
const navigation={getState:()=>({routeNames:['OrderHistoryPage','ClientsIndex']}),navigate:jest.fn()};
const view=()=> <ManagerOverview navigation={navigation}/>;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockWidth=393;mockTexts=true;mockModuleIcons=false;mockModuleAccent=false;mockFetch.mockClear();global.t={t:(_s,type,key)=>mockTexts?`${type}:${key}`:undefined,scheduleQueuedTranslateResolution:jest.fn(async()=>{})};});
afterEach(()=>{delete global.t;mockIndicatorColors={};mockIndicatorPalette={};mockRouteAppearance={};mockCategoryAppearance={};});
it('renders independent Home indicator appearances while preserving original glyphs and stable identities',async()=>{
 const raw=initializeGlobalChromeColors({'indicatorCardBackground-light':'#ffffff','indicatorCardBackground-dark':'#112233',
   'homeMetricPrimaryBackground-light':'#00ff00','homeMetricPrimaryBackground-dark':'#006600',
   homeMetricClosedSalesAppearance:'primary',homeMetricPrimaryGlyph:'star',indicatorCardGlyph:'star',
   'homeMetricPrimaryIconColor-light':'#123abc','homeMetricPrimaryIconBackground-light':'#fedcba',
   homeMetricClientsAppearance:'specific','homeMetricClientsBackground-light':'#abcdef'});
 mockIndicatorColors=resolveManagerTheme(raw,'light');mockIndicatorPalette=mockIndicatorColors;
 let tree;await act(async()=>{tree=renderer.create(view());});
 const card=id=>tree.root.findByProps({testID:`manager-metric-${id}`}).findByType('Pressable');
 expect(card('closed-sales').props.style.at(-1).backgroundColor).toBe('#00ff00');
 expect(card('closed-sales').findByType('Icon').props.name).toBe('credit-card');
 expect(card('closed-sales').findByType('Icon').props.color).toBe('#123abc');
 expect(card('closed-sales').findByType('Icon').parent.props.style.at(-1).backgroundColor).toBe('#fedcba');
 expect(card('clients').props.style.at(-1).backgroundColor).toBe('#abcdef');
 expect(card('period-orders').props.style.at(-1).backgroundColor).toBe('#ffffff');
 expect(card('open-orders').props.style.at(-1).backgroundColor).toBe('#ffffff');
 expect(card('closed-sales').props.dataSet.coHomeMetric).toBe('closed-sales');
 mockIndicatorColors=resolveManagerTheme(raw,'dark');mockIndicatorPalette=mockIndicatorColors;
 await act(async()=>tree.update(view()));
 expect(card('closed-sales').props.style.at(-1).backgroundColor).toBe('#006600');
 expect(card('clients').props.style.at(-1).backgroundColor).toBe('#112233');
 await act(async()=>tree.unmount());
});
it('keeps four semantic card identities across text and period changes',async()=>{
 let tree;await act(async()=>{tree=renderer.create(view());});
 const ids=()=>tree.root.findAll(node=>node.props.testID?.startsWith('manager-metric-')).map(node=>node.props.testID);
 expect(ids()).toEqual(['manager-metric-closed-sales','manager-metric-period-orders','manager-metric-open-orders','manager-metric-clients']);
 global.t.t=(_s,type,key)=>`Outro idioma ${type}:${key}`;
 await act(async()=>tree.update(view()));expect(ids()).toHaveLength(4);
 await act(async()=>tree.root.findAllByProps({accessibilityRole:'radio'})[1].props.onPress());expect(ids()).toHaveLength(4);
 await act(async()=>tree.unmount());
});
it.each([393,900,1060])('allows stacked panels to grow without compression at %s px',async width=>{
 mockWidth=width;let tree;await act(async()=>{tree=renderer.create(view());});
 const panel=tree.root.findByProps({testID:'manager-quick-access'});
 expect(Object.assign({},...panel.props.style.filter(Boolean))).toMatchObject({flexGrow:0,flexShrink:0,flexBasis:'auto'});
 await act(async()=>tree.unmount());
});
it('keeps the desktop panels sharing the available row',async()=>{
 mockWidth=1440;let tree;await act(async()=>{tree=renderer.create(view());});
 expect(Object.assign({},...tree.root.findByProps({testID:'manager-quick-access'}).props.style.filter(Boolean)).flex).toBe(1);
 await act(async()=>tree.unmount());
});
it('warms the existing translation resolver while hiding incomplete cards, then reveals the Home',async()=>{
 mockTexts=false;let tree;await act(async()=>{tree=renderer.create(view());});
 expect(tree.root.findAll(node=>node.props.testID?.startsWith('manager-metric-'))).toHaveLength(0);
 expect(tree.root.findByType('ManagerStartup').props.message).toContain('textos');
 expect(global.t.scheduleQueuedTranslateResolution).toHaveBeenCalled();
 const reads=mockFetch.mock.calls.length;mockTexts=true;await act(async()=>tree.update(view()));
 expect(tree.root.findAll(node=>node.props.testID?.startsWith('manager-metric-'))).toHaveLength(4);
 expect(mockFetch.mock.calls.length).toBe(reads);
 await act(async()=>tree.unmount());
});

it('offers the existing translation retry after a failed resolution without faking labels',async()=>{
 mockTexts=false;global.t.scheduleQueuedTranslateResolution.mockRejectedValue(new Error('network'));let tree;
 await act(async()=>{tree=renderer.create(view());});
 const state=()=>tree.root.findByType('ManagerStartup');expect(state().props.busy).toBe(false);expect(typeof state().props.onRetry).toBe('function');
 expect(tree.root.findAll(node=>node.props.testID?.startsWith('manager-metric-'))).toHaveLength(0);
 await act(async()=>state().props.onRetry());expect(global.t.scheduleQueuedTranslateResolution).toHaveBeenCalledTimes(2);
 await act(async()=>tree.unmount());
});

it('switches Explore Modules to icons and back with the same groups and route parameters', async () => {
  let tree; await act(async () => {tree=renderer.create(view());});
  const modules = () => tree.root.findByProps({testID:'manager-explore-modules'});
  const shortcuts = () => modules().findAllByType('Pressable');
  const labels = shortcuts().map(node => node.props.accessibilityLabel);
  expect(labels).toHaveLength(2);
  expect(modules().findAllByType('View').filter(node=>node.props.testID==='manager-module-icon-grid')).toHaveLength(0);

  mockModuleIcons=true;
  await act(async () => tree.update(view()));
  expect(modules().findAllByType('View').filter(node=>node.props.testID==='manager-module-icon-grid')).toHaveLength(2);
  expect(shortcuts().map(node => node.props.accessibilityLabel)).toEqual(labels);
  expect(shortcuts()[0].findAllByType('Icon')).toHaveLength(1);
  expect(shortcuts()[0].findByType('Text').props.style[1].color).toBe('#654321');
  await act(async () => shortcuts()[0].props.onPress());
  expect(navigation.navigate).toHaveBeenLastCalledWith('OrderHistoryPage',{orderTypeFilter:'sale'});

  mockModuleIcons=false;
  await act(async () => tree.update(view()));
  expect(modules().findAllByType('View').filter(node=>node.props.testID==='manager-module-icon-grid')).toHaveLength(0);
  expect(shortcuts()[0].findAllByType('Icon')).toHaveLength(2);
  await act(async () => tree.unmount());
});

it.each([[false, '#345678'], [true, '#876543']])(
  'uses route backgrounds and independent theme icons, restoring the theme when disabled (grid: %s)',
  async (grid, themeColor) => {
    mockModuleIcons = grid;
    let tree;
    await act(async () => {tree = renderer.create(view());});
    const shortcuts = () => tree.root.findByProps({testID:'manager-explore-modules'}).findAllByType('Pressable');
    const iconColors = () => shortcuts().map(item => item.findAllByType('Icon')[0].props.color);
    const backgrounds = () => shortcuts().map(item => {
      const style = grid ? item.props.style({}) : item.props.style;
      return Array.isArray(style) ? Object.assign({}, ...style).backgroundColor : style?.backgroundColor;
    });
    const themeBackground = grid ? '#F1F1F1' : undefined;
    try {
      expect(iconColors()).toEqual([themeColor, themeColor]);
      expect(backgrounds()).toEqual([themeBackground, themeBackground]);
      mockModuleAccent = true;
      await act(async () => tree.update(view()));
      expect(iconColors()).toEqual([themeColor, themeColor]);
      expect(backgrounds()).toEqual(['#0284c7', themeBackground]);
      mockModuleAccent = false;
      await act(async () => tree.update(view()));
      expect(iconColors()).toEqual([themeColor, themeColor]);
      expect(backgrounds()).toEqual([themeBackground, themeBackground]);
    } finally {
      await act(async () => tree.unmount());
    }
  },
);

it.each([false,true])('applies registered route foregrounds and category text, keeping the theme when disabled (grid %s)',async grid=>{
 mockModuleIcons=grid;mockModuleAccent=true;
 mockRouteAppearance={textColor:'#ffffff',iconColor:'$primary',iconBackgroundColor:'transparent'};
 mockCategoryAppearance={textColor:'#ffff00'};
 let tree;await act(async()=>{tree=renderer.create(view());});
 const first=()=>tree.root.findByProps({testID:'manager-explore-modules'}).findAllByType('Pressable')[0];
 const itemTextColor=()=>{const style=first().findByType('Text').props.style;return (Array.isArray(style)?Object.assign({},...style):style).color;};
 expect(first().findAllByType('Icon')[0].props.color).toBe('#147568');
 expect(itemTextColor()).toBe('#ffffff');
 const category=()=>tree.root.findAllByType('Text').find(n=>n.props.dataSet?.coThemeSource?.includes('category.text_color'));
 expect(category().props.style.at(-1).color).toBe('#ffff00');
 if(grid)expect(first().findByType('Icon').parent.props.style.at(-1).backgroundColor).toBe('transparent');
 mockModuleAccent=false;await act(async()=>tree.update(view()));
 expect(first().findAllByType('Icon')[0].props.color).toBe(grid?'#876543':'#345678');
 expect(itemTextColor()).toBe(grid?'#654321':'#123456');
 expect(first().findAllByType('Icon')[0].props.dataSet).toBeUndefined();
 await act(async()=>tree.unmount());
});
