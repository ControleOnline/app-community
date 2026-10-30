jest.mock('@controleonline/ui-common/src/api', () => ({api: {getToken: async () => null}}));
const React = require('react');
const renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const mockNavigation = {navigate: jest.fn(), setParams: jest.fn()};
const mockFocusCallbacks = [];
let mockAppType = 'POS';
let mockWidth = 390;
let mockConfig = {'pos-operation-mode': 'waiter'};
const mockStores = {};
const mockGetItems = jest.fn();
const mockSync = {getCategoryStatuses:()=>[],loadCatalogStatus:()=>Promise.resolve(),syncAllEligible:()=>Promise.resolve()};
const mockNode = name => props => React.createElement(name, props, props.children);
jest.mock('@appType', () => ({get app_type() {return mockAppType;}}));
jest.mock('react-native', () => ({SafeAreaView:mockNode('SafeAreaView'), View:mockNode('View'), Text:mockNode('Text'), ScrollView:mockNode('ScrollView'), TouchableOpacity:mockNode('TouchableOpacity'), Platform:{select:v=>v.web || v.default}, StyleSheet:{create:v=>v}, useWindowDimensions:()=>({width:mockWidth, height:844})}));
jest.mock('@react-navigation/native', () => ({useNavigation:()=>mockNavigation, useFocusEffect:callback=>{require("react").useEffect(callback,[callback]); mockFocusCallbacks.push(callback);}}));
jest.mock('@controleonline/ui-common/src/react/components/MessageService', () => ({useMessage: () => ({showError: jest.fn()})}));
jest.mock('@store', () => ({useStore:name=>mockStores[name]}));
jest.mock('@controleonline/ui-orders/src/react/css/orders', () => () => ({styles:{}}));
jest.mock('@controleonline/ui-common/src/react/components/StateStore', () => mockNode('StateStore'));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultSearchModal', () => mockNode('DefaultSearchModal'));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultToolbarAction', () => mockNode('DefaultToolbarAction'));
jest.mock('@controleonline/ui-default/src/react/components/filters/DefaultSearch', () => mockNode('DefaultSearch'));
jest.mock('@controleonline/ui-default/src/react/components/table/DefaultTable', () => mockNode('DefaultTable'));
jest.mock('@controleonline/ui-products/src/react/hooks/useMarketplaceCatalogSync', () => () => mockSync);
jest.mock('@controleonline/ui-layout/src/styles/colors', () => ({colors:{}}));
jest.mock('@controleonline/../../src/styles/branding', () => ({resolveThemePalette:()=>({})}));
jest.mock('@controleonline/ui-products/src/react/pages/CategoriesPage/CategoryCard', () => mockNode('CategoryCard'));
jest.mock('@controleonline/ui-products/src/react/pages/CategoriesPage/CategoryEditorModal', () => mockNode('CategoryEditorModal'));
jest.mock('@controleonline/ui-products/src/react/pages/CategoriesPage/MenuModelPickerModal', () => mockNode('MenuModelPickerModal'));
jest.mock('@controleonline/ui-products/src/react/components/products/ProductItem', () => mockNode('ProductItem'));
jest.mock('@controleonline/ui-products/src/react/utils/categoryCache', () => ({writeCachedCategories:jest.fn()}));
jest.mock('@controleonline/ui-common/src/react/utils/fileUrl', () => ({resolveFileImageUrl:()=>null}));
jest.mock('@controleonline/ui-products/src/react/pages/CategoriesPage/categoryCatalogDownloads', () => ({loadMenuModelsForCompany:()=>Promise.resolve([])}));
jest.mock('react-native-vector-icons/Feather', () => mockNode('Icon'));
jest.mock('@controleonline/ui-default/src/react/components/table/useDefaultTableTheme', () => ({__esModule:true,default:()=>({tableActionColors:{}}),DefaultTableThemeContext:require('react').createContext(null)}));
jest.mock('@controleonline/ui-products/src/react/pages/CategoriesPage/useCategoryProductCounts',()=>()=>({counts:{276:12,281:2},failed:false}));
const Categories = require('@controleonline/ui-products/src/react/pages/Categories').default;
const {clearPendingAddProducts} = require('@controleonline/ui-orders/src/react/utils/addProductSession');
let tree;
const render = async (params = {orderId:'70', showBottomCart:false}) => {
 await renderer.act(async () => {tree=renderer.create(React.createElement(Categories,{route:{params}}));});
};
beforeEach(() => {
 mockAppType='MANAGER'; mockWidth=1280; mockConfig={'pos-operation-mode':'waiter'};
 mockNavigation.navigate.mockClear(); mockFocusCallbacks.length=0; clearPendingAddProducts();
 mockGetItems.mockReset().mockResolvedValue([{id:10,name:'Lanches'}]);
 const actions = {getItems:mockGetItems,setItem:jest.fn(),setFilters:jest.fn(), syncOrder:jest.fn(),addToQueue:jest.fn(),initQueue:jest.fn()};
 Object.assign(mockStores,{order_products:{actions:{}},categories:{getters:{items:[{id:10,name:'Lanches'}],isLoading:false},actions},products:{getters:{},actions},device_config:{getters:{get item(){return {configs:mockConfig};}},actions},models:{getters:{},actions},people:{getters:{currentCompany:{id:3}},actions},theme:{getters:{colors:{}},actions},orders:{getters:{item:{id:70,orderProducts:[]}},actions}});
});
afterEach(async () => {if(tree) await renderer.act(async()=>tree.unmount()); tree=null;});

it('opens native Manager without selecting products, then keeps category, descendants and search inline',async()=>{
 const previous=process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW;
 process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW='1';mockWidth=390;
 mockStores.categories.getters.items=[{id:276,name:'Bebidas'},{id:281,name:'Águas',parent:'/categories/276'}];
 try{
  await render({orderId:'70',interactionMode:'pdv',categoriesPrefetched:true});
  expect(tree.root.findByType('DefaultTable').props.storeName).toBe('categories');
  expect(tree.root.findByType('DefaultTable').props.nativeCatalogEntry).toBe(true);
  expect(tree.root.findByType('DefaultTable').props.toolbarActions).toEqual([]);
  expect(tree.root.findByType('DefaultTable').props.showToolbar).toBe(false);
  const headerSearch=()=>tree.root.findByType('DefaultToolbarAction').props.action;
  expect(headerSearch().accessibilityLabel).toBe('Buscar produto');
  expect(tree.root.findByType('DefaultTable').props).toMatchObject({viewMode:'cards',showToolbarControls:false});
  expect(tree.root.findAllByType('DefaultSearch')).toHaveLength(0);
  const tabs=()=>tree.root.findAllByType('TouchableOpacity');
  await renderer.act(async()=>tabs().find(n=>n.props.accessibilityLabel==='Bebidas').props.onPress());
  expect(tree.root.findByType('DefaultTable').props.requestParams['productCategory.category']).toBe('/categories/276');
  expect(tree.root.findByType('DefaultTable').props.toolbarActions.some(action=>action.key==='catalog-categories')).toBe(true);
  expect(tree.root.findByType('DefaultTable').props.externalCatalogSearch).toBe(true);
  await renderer.act(async()=>tabs().find(n=>n.props.accessibilityLabel==='Águas').props.onPress());
  expect(tree.root.findByType('DefaultTable').props.requestParams['productCategory.category']).toBe('/categories/281');
  await renderer.act(async()=>headerSearch().onPress());
  expect(tree.root.findByType('DefaultSearchModal').props.visible).toBe(true);
  await renderer.act(async()=>tree.root.findByType('DefaultSearchModal').props.onSearch('água'));
  expect(tree.root.findByType('DefaultTable').props.requestParams.product).toBe('água');
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  await renderer.act(async()=>tree.root.findByType('DefaultTable').props.toolbarActions.find(a=>a.key==='catalog-categories').onPress());
  expect(tree.root.findByType('DefaultTable').props.storeName).toBe('categories');
  expect(tree.root.findByType('DefaultTable').props.viewMode).toBe('cards');
  expect(tree.root.findByType('DefaultTable').props.toolbarActions).toEqual([]);
 }finally{if(previous===undefined)delete process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW;else process.env.EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW=previous;}
});

it('selects categories and displays canonical sale products without navigating away or losing order context',async()=>{
 const previous=process.env.EXPO_PUBLIC_MANAGER_PREVIEW;process.env.EXPO_PUBLIC_MANAGER_PREVIEW='1';
 const drinks={id:276,name:'Bebidas'},water={id:281,name:'Águas',parent:'/categories/276'};
 mockStores.categories.getters.items=[drinks,water];
 try{
  await render({orderId:'70',interactionMode:'pdv',showBottomCart:true,categoriesPrefetched:true});
  let table=tree.root.findByType('DefaultTable');expect(table.props.storeName).toBe('products');expect(table.props.requestParams['productCategory.category']).toBe('/categories/276');expect(table.props.catalogTitle).toBe('Bebidas');
  await renderer.act(async()=>tree.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel==='Águas, 2 produtos').props.onPress());
  table=tree.root.findByType('DefaultTable');expect(table.props.requestParams['productCategory.category']).toBe('/categories/281');expect(table.props.catalogTitle).toBe('Águas');expect(mockNavigation.navigate).not.toHaveBeenCalled();
  let card;renderer.act(()=>{card=renderer.create(table.props.renderCard({item:{id:1147,type:'product'}}));});
  expect(card.root.findByType('ProductItem').props).toMatchObject({orderId:'70',interactionMode:'pdv',showBottomCart:true});renderer.act(()=>card.unmount());
 }finally{if(previous===undefined)delete process.env.EXPO_PUBLIC_MANAGER_PREVIEW;else process.env.EXPO_PUBLIC_MANAGER_PREVIEW=previous;}
});
