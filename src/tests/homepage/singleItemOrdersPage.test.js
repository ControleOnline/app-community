import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Orders from '../../components/single-item/SingleItemOrdersPage';
import OperationalStoreContext from '../../store/OperationalStoreContext';
jest.mock('react-native',()=>({View:'View',Text:'Text',Pressable:'Pressable',StyleSheet:{create:v=>v},Platform:{OS:'web'}}));
let mockConfigs={'pos-operation-mode':'single-item'};
let mockApp='POS';
let mockMenus=[{menus:[{route:'OrderHistoryPage'}]}];
jest.mock('@appType',()=>({get app_type(){return mockApp;}}));
jest.mock('@store',()=>({useStore:name=>({getters:name==='device_config'?{item:{configs:mockConfigs}}:{menus:mockMenus,colors:{}}})}));
jest.mock('@controleonline/ui-orders/src/react/pages/orders/OrderHistoryPage',()=> 'History');
jest.mock('../../components/single-item/SingleItemHistoryHeader',()=> 'Header');
const navigation={getState:()=>({routeNames:['HomePage','PdvPage','OrderHistoryPage']})};
let tree;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockApp='POS';mockConfigs={'pos-operation-mode':'single-item'};});
afterEach(()=>act(()=>tree?.unmount()));
it.each([[undefined,true],['company',true],['device',false]])('uses company by default, preserving explicit visibility %s', (visibility,expected)=>{
 mockConfigs['pos-order-visibility']=visibility;
 act(()=>{tree=renderer.create(<Orders navigation={navigation} route={{name:'OrderHistoryPage'}}/>);});
 expect(tree.root.findByType('History').props.operationalCompanyOrders).toBe(expected);
});
it('does not change other app contexts',()=>{
 mockApp='MANAGER';act(()=>{tree=renderer.create(<Orders navigation={navigation} route={{name:'OrderHistoryPage'}}/>);});
 expect(tree.root.findByType('History').props.operationalCompanyOrders).toBeUndefined();
 expect(tree.root.findByType('History').props.renderOperationalHeader).toBeUndefined();
});
it('reuses the operational header and cards only inside the configured Manager PDV',()=>{
 mockApp='MANAGER';
 act(()=>{tree=renderer.create(<OperationalStoreContext.Provider value={{pdv:{manager:true,singleItem:true}}}>
   <Orders navigation={navigation} route={{name:'OrderHistoryPage'}}/>
 </OperationalStoreContext.Provider>);});
 expect(tree.root.findByType('History').props.operationalCompanyOrders).toBe(true);
 expect(typeof tree.root.findByType('History').props.renderOperationalHeader).toBe('function');
 expect(typeof tree.root.findByType('History').props.renderOperationalCard).toBe('function');
});

it('does not render the history for a sales-only profile',()=>{
 mockMenus=[{menus:[{route:'PdvPage'}]}];
 act(()=>{tree=renderer.create(<Orders navigation={navigation} route={{name:'OrderHistoryPage'}}/>);});
 expect(tree.root.findAllByType('History')).toHaveLength(0);
 mockMenus=[{menus:[{route:'OrderHistoryPage'}]}];
});
