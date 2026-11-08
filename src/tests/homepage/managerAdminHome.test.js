import React from 'react';
import renderer,{act} from 'react-test-renderer';
import AdminHome from '../../components/manager-preview/ManagerAdminHome';
let mockMenus=[];
jest.mock('react-native',()=>({Platform:{OS:'web'},Pressable:'Pressable',ScrollView:'ScrollView',View:'View',Text:'Text',StyleSheet:{create:x=>x},useWindowDimensions:()=>({width:400})}));
jest.mock('@appType',()=>({app_type:'ADMIN'}));
jest.mock('../../components/HomeIcon',()=> 'Icon');
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>({colors:{}})}));
jest.mock('@store',()=>({useStore:name=>({getters:name==='theme'?{menus:mockMenus}:{user:{name:'Leandro'}}})}));
const originalTranslations=global.t;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;global.t={t:(_context,_type,key)=>key==='waiting_menus'?'Aguardando os menus':undefined};mockMenus=[{label:'Administração',menus:[{route:'UsersPage',label:'Usuários',menuType:'home',routeParams:{scope:8}},{route:'NotRegistered',label:'Unavailable',menuType:'home'}]}];});
afterEach(()=>{global.t=originalTranslations;});
it('uses only registered runtime menu destinations and preserves their parameters',()=>{
 const n={navigate:jest.fn(),getState:()=>({routeNames:['UsersPage']})};let tree;
 act(()=>{tree=renderer.create(<AdminHome navigation={n}/>);});
 expect(tree.root.findAllByProps({accessibilityLabel:'Unavailable'})).toHaveLength(0);
 act(()=>tree.root.findByProps({accessibilityLabel:'Usuários'}).props.onPress());
 expect(n.navigate).toHaveBeenCalledWith('UsersPage',{scope:8});
 expect(JSON.stringify(tree.toJSON())).not.toContain('Vendas concluídas');
 act(()=>tree.unmount());
});
it('waits for the actual menus instead of inventing admin capabilities',()=>{
 mockMenus=[];let tree;act(()=>{tree=renderer.create(<AdminHome navigation={{getState:()=>({routeNames:[]})}}/>);});
 expect(JSON.stringify(tree.toJSON())).toContain('Aguardando os menus');act(()=>tree.unmount());
});
