import React from 'react';
import renderer,{act} from 'react-test-renderer';
import ManagerScreen from '../../components/manager-preview/ManagerScreen';
let mockContext;
jest.mock('@react-navigation/native',()=>({NavigationContext:require('react').createContext(null)}));
const {NavigationContext}=require('@react-navigation/native');
function Page({navigation}){mockContext=React.useContext(NavigationContext);return <page navigation={navigation}/>;}
const Layout=props=><layout {...props}/>;
const route={name:'OrderDetails'};
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
it('captures dynamic header callbacks while preventing the legacy strip from returning',()=>{
 const n={setOptions:jest.fn()};let tree;
 act(()=>{tree=renderer.create(<ManagerScreen enabled navigation={n} route={route} options={{title:'Initial'}} Layout={Layout} Component={Page}/>);});
 const proxy=tree.root.findByType('page').props.navigation;expect(mockContext).toBe(proxy);
 const print=()=> <print/>;
 act(()=>proxy.setOptions({headerShown:true,headerRight:print,title:'Loaded'}));
 expect(n.setOptions).toHaveBeenLastCalledWith({headerShown:false,headerRight:print,title:'Loaded'});
 expect(tree.root.findByType('layout').props.options).toMatchObject({headerShown:true,headerRight:print,title:'Loaded'});
 expect(tree.root.findByType('page').props.navigation).toBe(proxy);
 act(()=>proxy.setOptions({headerRight:undefined}));expect(tree.root.findByType('layout').props.options.headerRight).toBeUndefined();
 act(()=>tree.unmount());
});
it('leaves non-management navigation untouched',()=>{
 const n={setOptions:jest.fn()};let tree;act(()=>{tree=renderer.create(<ManagerScreen enabled={false} navigation={n} route={route} options={{}} Layout={Layout} Component={Page}/>);});
 expect(tree.root.findByType('page').props.navigation).toBe(n);expect(n.setOptions).not.toHaveBeenCalled();act(()=>tree.unmount());
});

it('does not rerender a page when its effect publishes fresh header callbacks',()=>{
 let renders=0;
 function UpdatingPage({navigation}) {
  renders++;
  React.useLayoutEffect(()=>{navigation.setOptions({headerShown:true,headerRight:()=> <help/>});});
  return <page/>;
 }
 const n={setOptions:jest.fn()};let tree;
 act(()=>{tree=renderer.create(<ManagerScreen enabled navigation={n} route={route} options={{}} Layout={Layout} Component={UpdatingPage}/>);});
 expect(renders).toBe(1);expect(n.setOptions).toHaveBeenCalledTimes(1);
 expect(typeof tree.root.findByType('layout').props.options.headerRight).toBe('function');
 act(()=>tree.unmount());
});
