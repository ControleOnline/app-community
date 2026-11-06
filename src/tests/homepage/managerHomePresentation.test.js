import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ManagerOverview from '../../components/manager-preview/ManagerOverview';
let mockWidth=393,mockTexts=true;
const mockFetch=jest.fn(async()=>({totalItems:0,summary:{sales:{totals:{revenue:0,orders:0,averageTicket:0},daily:[]}}}));
jest.mock('react-native',()=>({Platform:{OS:'web'},View:'View',Text:'Text',ScrollView:'ScrollView',Pressable:'Pressable',StyleSheet:{create:x=>x},useWindowDimensions:()=>({width:mockWidth})}));
jest.mock('@react-navigation/native',()=>({useIsFocused:()=>true}));
jest.mock('@appType',()=>({app_type:'MANAGER'}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockFetch(...args)}}));
jest.mock('../../components/HomeIcon',()=> 'Icon');
jest.mock('../../components/manager-preview/ManagerStartup',()=> 'ManagerStartup');
jest.mock('../../components/manager-preview/ManagerOrdersTrend',()=> 'Trend');
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>({colors:{cardText:'#123456'}})}));
jest.mock('@store',()=>({useStore:name=>({getters:name==='people'?{currentCompany:{id:3}}:name==='theme'?{menus:[{id:1,label:'Menu',menus:[{id:1,route:'OrderHistoryPage',label:'Pedidos',menuType:'home'},{id:2,route:'ClientsIndex',label:'Clientes',menuType:'home'}]}]}:{messages:{}}})}));
const navigation={getState:()=>({routeNames:['OrderHistoryPage','ClientsIndex']}),navigate:jest.fn()};
const view=()=> <ManagerOverview navigation={navigation}/>;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockWidth=393;mockTexts=true;mockFetch.mockClear();global.t={t:(_s,type,key)=>mockTexts?`${type}:${key}`:undefined,scheduleQueuedTranslateResolution:jest.fn(async()=>{})};});
afterEach(()=>delete global.t);
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
