import React,{useContext} from 'react';
import renderer,{act} from 'react-test-renderer';
import Provider from '../../components/manager-preview/ManagerPdvOperationProvider';
import OperationalStoreContext from '../../store/OperationalStoreContext';
import {useStore as useScopedStore} from '../../store';
jest.mock('../../components/single-item/SingleItemOperationInfo',()=> 'OperationInfo');
const mockFetch=jest.fn();
let mockStores,tree,latest,nav;
jest.mock('react-native',()=>({View:'View',Text:'Text',Pressable:'Pressable',Platform:{OS:'web'}}));
jest.mock('@appType',()=>({app_type:'MANAGER'}));
jest.mock('@react-navigation/native',()=>({NavigationContext:require('react').createContext(null),
 useFocusEffect:callback=>require('react').useEffect(callback,[callback])}));
jest.mock('@controleonline/ui-common/src/react/stores',()=>({useStore:name=>mockStores[name]}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockFetch(...args)}}));
function Page({navigation,route}){latest={context:useContext(OperationalStoreContext),navigation,route,
  deviceStore:useScopedStore('device_config'),orders:useScopedStore('orders')};return <page/>;}
const config={id:510,type:'PDV',people:'/people/3',device:{id:403,device:'web-10'},configs:{'pos-operation-mode':'single-item','pos-product-showcase-id':8}};
beforeEach(()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;mockFetch.mockReset();latest=null;
 nav={navigate:jest.fn(),reset:jest.fn()};
 mockStores={device_config:{getters:{item:{id:507,type:'MANAGER',configs:{}}},actions:{setItem:jest.fn()}},
 device:{getters:{item:{id:'web-10'}}},people:{getters:{currentCompany:{id:3}}},
 theme:{getters:{menus:[{menus:[{route:'OrderHistoryPage'},{route:'PdvPage'}]}],colors:{}}},
 orders:{getters:{},actions:{replaceProducts:jest.fn(),addProducts:jest.fn()}}};
});
afterEach(()=>{if(tree)act(()=>tree.unmount());tree=null;});
const mount=()=>act(async()=>{tree=renderer.create(<Provider navigation={nav} route={{name:'PdvPage'}} Component={Page}/>);});
it('scopes PDV settings without overwriting the global Manager config or granting terminal identity',async()=>{
 mockFetch.mockResolvedValue({member:[config]});await mount();
 expect(mockFetch).toHaveBeenCalledWith('device_configs',{params:{people:'/people/3','device.device':'web-10',type:'PDV'}});
 expect(latest.context.pdv.singleItem).toBe(true);
 expect(latest.context.stores.device_config.getters.item).toMatchObject({id:510,type:'MANAGER',operationalType:'PDV'});
 expect(latest.deviceStore.getters.item.id).toBe(510);
 expect(mockStores.device_config.actions.setItem).not.toHaveBeenCalled();
 expect(mockStores.device_config.getters.item.id).toBe(507);
 expect(tree.root.findAllByProps({accessibilityRole:'tab'})).toHaveLength(2);
 latest.context.stores.orders.actions.replaceProducts(70,[{product:10,quantity:1}]);
 expect(mockStores.orders.actions.replaceProducts).toHaveBeenCalledWith(70,[{product:10,quantity:1,device:'web-10',deviceType:'PDV'}]);
});
it('does not leak the scoped stores into ordinary Manager pages',async()=>{
 await act(async()=>{tree=renderer.create(<Provider navigation={nav} route={{name:'ClientsIndex'}} Component={Page}/>);});
 expect(latest.context).toBeNull();expect(latest.deviceStore.getters.item.id).toBe(507);
 expect(mockFetch).not.toHaveBeenCalled();
});
it('falls back to counter only on a successful empty response',async()=>{
 mockFetch.mockResolvedValue({member:[]});await mount();
 expect(latest.context.pdv.singleItem).toBe(false);
 expect(latest.context.stores.device_config.getters.item.configs['pos-operation-mode']).toBe('counter');
});
it('does not turn a failed configuration request into an unconfigured counter',async()=>{
 mockFetch.mockRejectedValue(new Error('offline'));await mount();
 expect(tree.root.findAllByType('page')).toHaveLength(0);
 expect(tree.root.findAllByType('Text').some(n=>n.props.children==='Não foi possível carregar a configuração PDV.')).toBe(true);
});
it('refreshes company scope and never reuses another company configuration',async()=>{
 mockFetch.mockResolvedValue({member:[config]});await mount();
 mockStores.people.getters.currentCompany={id:4};mockFetch.mockResolvedValue({member:[config]});
 await act(async()=>tree.update(<Provider navigation={nav} route={{name:'PdvPage'}} Component={Page}/>));
 expect(latest.context.pdv.configured).toBe(false);
 expect(latest.context.stores.device_config.getters.item.people).toBe('/people/4');
});
it('ignores configuration loaded by an editor for a different machine',async()=>{
 mockFetch.mockResolvedValue({member:[config]});await mount();
 mockStores.device_config={getters:{item:{id:999,type:'PDV',people:'/people/9',device:{device:'another-machine'},configs:{'pos-operation-mode':'waiter'}}},actions:{setItem:jest.fn()}};
 await act(async()=>tree.update(<Provider navigation={nav} route={{name:'PdvPage'}} Component={Page}/>));
 expect(latest.deviceStore.getters.item.id).toBe(510);
 expect(latest.context.pdv.singleItem).toBe(true);
 expect(mockStores.device_config.getters.item.id).toBe(999);
});
