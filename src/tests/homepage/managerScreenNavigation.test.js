import React from 'react';
import {Text,View} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import ScreenNavigation, {goBackFromManagement} from '../../components/manager-preview/ManagerScreenNavigation';
jest.mock('react-native',()=>({Pressable:'Pressable',View:'View',Text:'Text',StyleSheet:{create:x=>x}}));
const route={name:'LinkedOrderSettlementPage'};
const navigation=()=>({canGoBack:()=>false,goBack:jest.fn(),navigate:jest.fn(),reset:jest.fn()});
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
it('returns through history first, then the configured reset, named destination or home',()=>{
 const n=navigation();n.canGoBack=()=>true;goBackFromManagement(n,route,{name:'Parent'});expect(n.goBack).toHaveBeenCalledTimes(1);expect(n.navigate).not.toHaveBeenCalled();
 n.canGoBack=()=>false;const routes=[{name:'CategoriesPage',params:{context:'products'}},{name:'ProductsPage',params:{categoryId:8}}];
 goBackFromManagement(n,route,()=>({resetRoutes:routes}));expect(n.reset).toHaveBeenCalledWith({index:1,routes});
 goBackFromManagement(n,route,{name:'MenuCostsPage',params:{id:4}});expect(n.navigate).toHaveBeenLastCalledWith('MenuCostsPage',{id:4});
 goBackFromManagement(n,route);expect(n.navigate).toHaveBeenLastCalledWith('HomePage');
});
it('offers compact back with no history and preserves custom help and title',()=>{
 const n=navigation();let tree;act(()=>{tree=renderer.create(<ScreenNavigation navigation={n} route={route} colors={{}} options={{headerTitle:()=> <page-title/>,headerRight:()=> <help/>}}/>);});
 expect(tree.root.findAllByType('help')).toHaveLength(1);expect(tree.root.findAllByType('page-title')).toHaveLength(1);
 act(()=>tree.root.findByProps({accessibilityLabel:'Voltar'}).props.onPress());expect(n.navigate).toHaveBeenCalledWith('HomePage');
 act(()=>tree.unmount());
});
it('keeps custom left controls and respects explicit navigation locks',()=>{
 let tree;act(()=>{tree=renderer.create(<ScreenNavigation navigation={navigation()} route={route} colors={{}} options={{headerLeft:()=> <special-back/>}}/>);});
 expect(tree.root.findAllByProps({accessibilityLabel:'Voltar'})).toHaveLength(0);expect(tree.root.findAllByType('special-back')).toHaveLength(1);
 act(()=>tree.update(<ScreenNavigation navigation={navigation()} route={route} colors={{}} options={{headerShown:false,headerBackVisible:false}}/>));expect(tree.toJSON()).toBeNull();
 act(()=>tree.unmount());
});
it('does not add back on the home page',()=>{
 let tree;act(()=>{tree=renderer.create(<ScreenNavigation navigation={navigation()} route={{name:'HomePage'}} colors={{}}/>);});expect(tree.toJSON()).toBeNull();act(()=>tree.unmount());
});

it.each([{title:'Contratos'},{title:'Financeiro',headerTitle:'Contas a pagar'}])('preserves string or default title %j',options=>{
 let tree;act(()=>{tree=renderer.create(<ScreenNavigation navigation={navigation()} route={{name:'FinancialHubPage'}} colors={{}} options={options}/>);});
 expect(JSON.stringify(tree.toJSON())).toContain(options.headerTitle || options.title);act(()=>tree.unmount());
});
it('preserves a TV display request to hide navigation',()=>{
 let tree;act(()=>{tree=renderer.create(<ScreenNavigation navigation={navigation()} route={{name:'DisplayDetails'}} colors={{}} options={{headerShown:false,headerBackVisible:true}}/>);});
 expect(tree.toJSON()).toBeNull();act(()=>tree.unmount());
});
it('uses Colaboradores instead of the legacy All filter title and centers the heading',()=>{
 let tree;act(()=>{tree=renderer.create(<ScreenNavigation navigation={navigation()} route={{name:'EmployeesIndex'}} colors={{}} options={{headerTitle:'All'}}/>);});
 expect(JSON.stringify(tree.toJSON())).not.toContain('All');
 expect(tree.root.findAllByProps({accessibilityRole:'header'})).toHaveLength(1);
 expect(JSON.stringify(tree.toJSON())).toContain('Colaboradores');act(()=>tree.unmount());
});

it('preserves a display header with a separate count badge instead of flattening it',()=>{
 let tree;act(()=>{tree=renderer.create(<ScreenNavigation navigation={navigation()} route={{name:'DisplayDetails'}} colors={{}} options={{title:'Produção',headerTitle:()=> <View><Text>Cozinha</Text><Text testID="order-count">12</Text></View>}}/>);});
 expect(tree.root.findByProps({testID:'order-count'}).props.children).toBe('12');
 const heading=tree.root.findByProps({accessibilityRole:'header'});
 expect(heading.props.children).toBe('Produção');
 expect(JSON.stringify(tree.toJSON())).not.toContain('Cozinha12');act(()=>tree.unmount());
});
