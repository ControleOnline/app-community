import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Home from '../../components/single-item/SingleItemHome';
jest.mock('react-native',()=>({Text:'Text',View:'View',Pressable:'Pressable',Platform:{OS:'web'}}));
jest.mock('@appType',()=>({app_type:'POS'}));
let mockMenus=[{menus:[{route:'OrderHistoryPage'}]}];
jest.mock('@store',()=>({useStore:name=>({getters:name==='device_config'?{item:{configs:{'pos-operation-mode':'single-item'}}}:{menus:mockMenus,colors:{}}})}));
jest.mock('@controleonline/ui-orders/src/react/pages/checkout/AddProductScreen',()=> 'Catalog');
jest.mock('@controleonline/ui-orders/src/react/pages/home/index',()=> 'LegacyHome');
jest.mock('../../components/single-item/SingleItemOrdersPage',()=> 'Orders');
const navigation={getState:()=>({routeNames:['HomePage','PdvPage','OrderHistoryPage']})};
let tree;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockMenus=[{menus:[{route:'OrderHistoryPage'}]}];});
afterEach(()=>act(()=>tree?.unmount()));
it('opens orders on initial entry without creating a cart',()=>{
 act(()=>{tree=renderer.create(<Home navigation={navigation} route={{name:'HomePage'}}/>);});
 expect(tree.root.findAllByType('Orders')).toHaveLength(1);
 expect(tree.root.findAllByType('Catalog')).toHaveLength(0);
});
it('keeps an explicit catalog tab available',()=>{
 act(()=>{tree=renderer.create(<Home navigation={navigation} route={{name:'HomePage',params:{singleItemCatalog:true}}}/>);});
 expect(tree.root.findByType('Catalog').props.route.params.singleItemMode).toBe(true);
});
it('does not grant history access to a sales-only profile',()=>{
 mockMenus=[{menus:[{route:'PdvPage'}]}];
 act(()=>{tree=renderer.create(<Home navigation={navigation} route={{name:'HomePage'}}/>);});
 expect(tree.root.findAllByType('Orders')).toHaveLength(0);
});

it('does not create a new cart on the sales-only completion screen',()=>{
 mockMenus=[{menus:[{route:'PdvPage'}]}];
 act(()=>{tree=renderer.create(<Home navigation={navigation} route={{name:'HomePage',params:{singleItemCompleted:true}}}/>);});
 expect(tree.root.findAllByType('Catalog')).toHaveLength(0);
});
