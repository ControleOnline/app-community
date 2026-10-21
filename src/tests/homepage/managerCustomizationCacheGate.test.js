const React = require('react');
const renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const mockNode = name => props => React.createElement(name,props,props.children);
let mockAppType = 'POS';
let mockRoute;
const mockNavigation = {canGoBack:()=>false,goBack:jest.fn(),navigate:jest.fn(),replace:jest.fn(),pop:jest.fn()};
const mockStores = {};
const mockProduct = {id:134,'@id':'/products/134',product:'Gyros',type:'custom',price:5};
const mockAddProducts = jest.fn();
const mockAwaitConfirmation = jest.fn();
const mockIsConfirming = jest.fn();
const mockSetActiveContext = jest.fn();
const mockReplaceProducts = jest.fn();
const mockAlert = jest.fn();
const mockCatalogFetch = jest.fn();
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:(...args)=>mockCatalogFetch(...args)}}));
jest.mock('react-native',()=>({View:mockNode('View'),Text:mockNode('Text'),TouchableOpacity:mockNode('TouchableOpacity'),Image:mockNode('Image'),ScrollView:mockNode('ScrollView'),Modal:mockNode('Modal'),ActivityIndicator:mockNode('ActivityIndicator'),Alert:{alert:mockAlert},Platform:{OS:'web',select:v=>v.web||v.default},StyleSheet:{create:v=>v},useWindowDimensions:()=>({width:390,height:844})}));
jest.mock('@react-navigation/native',()=>({useNavigation:()=>mockNavigation,useRoute:()=>mockRoute,useFocusEffect:callback=>require('react').useEffect(callback,[callback])}));
jest.mock('@appType',()=>({get app_type(){return mockAppType;}}));
jest.mock('@store',()=>({useStore:name=>mockStores[name]}));
jest.mock('@expo/vector-icons',()=>({MaterialCommunityIcons:mockNode('Icon')}));
jest.mock('@controleonline/ui-common/src/react/utils/fileUrl',()=>({resolveFileImageUrl:()=>null}));
jest.mock('@controleonline/ui-orders/src/react/hooks/usePosCartSession',()=>()=>({ensureActiveOrder:()=>Promise.resolve({id:70,'@id':'/orders/70'})}));
jest.mock('@controleonline/ui-orders/src/react/hooks/posCartSession/activePosOrderContext',()=>({getActivePosOrderContext:()=>null,setActivePosOrderContext:(...args)=>mockSetActiveContext(...args)}));
jest.mock('@controleonline/ui-orders/src/react/utils/confirmPendingProducts', () => ({isConfirmingProducts: (...args) => mockIsConfirming(...args), awaitProductConfirmation: (...args) => mockAwaitConfirmation(...args), reportProductConfirmationError: (error, show) => {if (!error.productConfirmationReported) show(error.message)}}));
const mockCacheCalls=[];
jest.mock('@controleonline/ui-products/src/react/hooks/useCachedCatalogActions',()=>({__esModule:true,default:(store,enabled,companyId,context,publishStore)=>{mockCacheCalls.push({store,enabled,companyId,context,publishStore});return {...store.actions,catalogCache:enabled};}}));
jest.mock('@controleonline/ui-products/src/react/components/NestedCustomizationModal',()=>mockNode('NestedEditor'));
const {CustomizationImageProvider}=require('@controleonline/ui-products/src/react/components/CustomizationImage');
const Screen = require('@controleonline/ui-products/src/react/pages/CustomizeScreen').default;
let tree;
beforeEach(()=>{
 mockCacheCalls.length=0;
 mockAwaitConfirmation.mockReset().mockResolvedValue();
 mockIsConfirming.mockReset().mockReturnValue(false);
 mockSetActiveContext.mockClear();
 mockCatalogFetch.mockReset().mockResolvedValue({member:[{...mockProduct,productGroups:[],customizationGroupsLoaded:true}]});
 mockAppType='POS'; mockRoute={params:{product:mockProduct,orderId:'70',interactionMode:'pdv',showBottomCart:false,context:'supplies'}};
 Object.values(mockNavigation).forEach(v=>v.mockClear?.()); mockAlert.mockClear();mockAddProducts.mockReset().mockResolvedValue({});mockReplaceProducts.mockReset().mockResolvedValue({});
 const actions={getItems:()=>Promise.resolve([]),get:()=>Promise.resolve(mockProduct),syncOrderProducts:jest.fn(),setItem:jest.fn(),addProducts:mockAddProducts,replaceProducts:mockReplaceProducts};
 ['orders','order_products','cart','product_group','product_group_product','products','people','device','device_config','theme'].forEach(name=>mockStores[name]={actions,getters:{}});
 mockStores.orders.getters={item:{id:70,'@id':'/orders/70',orderProducts:[]}};
 mockStores.products.getters={item:mockProduct};
 mockStores.people.getters={currentCompany:{id:3},mainCompany:{id:3}};
 mockStores.device.getters={item:{id:12,configs:{'pos-operation-mode':'counter'}}};
 mockStores.device_config.getters={item:{configs:{'pos-operation-mode':'waiter'}}};
});
afterEach(async()=>{if(tree)await renderer.act(async()=>tree.unmount());tree=null;});
const save = async()=>{
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Screen));});
 const button=tree.root.findByProps({accessibilityLabel:'ADICIONAR Gyros'});
 expect(button.props.disabled).toBe(false);
 await renderer.act(async()=>button.props.onPress());
};

it.each([['MANAGER','pdv',true,true],['MANAGER','manager',true,false],['MANAGER','pdv',false,false],['POS','pdv',false,true]])('limits shared read optimizations for %s / %s / preview %s',async(appType,interactionMode,preview,expected)=>{
 const previous=process.env.EXPO_PUBLIC_MANAGER_PREVIEW;process.env.EXPO_PUBLIC_MANAGER_PREVIEW=preview?'1':'0';
 mockAppType=appType;mockRoute.params.interactionMode=interactionMode;
 // SHOP has its own source; this test only checks the shared cache gate.
 try{
  await renderer.act(async()=>{tree=renderer.create(React.createElement(Screen));});
  const calls=mockCacheCalls.slice(-3);expect(calls).toHaveLength(3);
  expect(calls.every(c=>c.enabled===expected&&c.companyId===3&&c.publishStore===false)).toBe(true);
  expect(tree.root.findByType(CustomizationImageProvider).props.enabled).toBe(expected);
  expect(mockAddProducts).not.toHaveBeenCalled();expect(mockNavigation.navigate).not.toHaveBeenCalled();expect(mockNavigation.replace).not.toHaveBeenCalled();
 }finally{if(previous===undefined)delete process.env.EXPO_PUBLIC_MANAGER_PREVIEW;else process.env.EXPO_PUBLIC_MANAGER_PREVIEW=previous;}
});
