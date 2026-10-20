import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerPreviewProvider, {useManagerPreview} from '../../components/manager-preview/ManagerPreviewProvider';
import ManagerSignIn from '../../components/manager-preview/ManagerSignIn.web';
import ManagerAccountMenu from '../../components/manager-preview/ManagerAccountMenu';

jest.mock('@experimental-avatar', () => jest.requireActual('../../components/manager-preview/DisabledAvatar'));
jest.mock('react-native', () => ({Platform:{OS:'web'},View:'View',ScrollView:'ScrollView',Modal:'Modal',Pressable:'Pressable',Text:'Text',StyleSheet:{create:x=>x,absoluteFill:{}}}));
jest.mock('react-native-safe-area-context',()=>({SafeAreaProvider:'SafeAreaProvider',useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0}),useSafeAreaFrame:()=>({width:1280,height:800})}));
jest.mock('../../components/HomeIcon',()=> 'Icon');
jest.mock('@controleonline/ui-login/src/react/pages/sign-in',()=> 'ExistingSignIn');
jest.mock('../../components/manager-preview/model',()=>({...jest.requireActual('../../components/manager-preview/model'),managerPreviewEnabled:true}));
jest.mock('../../components/manager-preview/useExperienceRuntime',()=>({__esModule:true,default:()=>({retainedErpReadRuntime:true})}));
const mockThemeAction=jest.fn();
jest.mock('@store',()=>({useStore:name=> name==='auth'?{getters:{isLogged:false}}:name==='people'?{getters:{currentCompany:{id:3}}}:{getters:{colors:{}},actions:{setColors:mockThemeAction}}}));

it('keeps public login, ERP runtime and themes without mounting the disabled experiment',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 let context,tree;
 function Probe(){context=useManagerPreview();return <ManagerSignIn/>;}
 act(()=>{tree=renderer.create(<ManagerPreviewProvider><Probe/></ManagerPreviewProvider>);});
 expect(context.avatarEnabled).toBe(false);
 expect(context.experience.retainedErpReadRuntime).toBe(true);
 expect(context.colors).toBeTruthy();
 expect(tree.root.findByType('ExistingSignIn').props.identifierLabel).toBe('Usuário');
 expect(tree.root.findAllByType('canvas')).toHaveLength(0);
 expect(tree.root.findAllByProps({className:'on-guide'})).toHaveLength(0);
 act(()=>{context.setGuideOpen(true);context.recordGuideEvent({type:'open'});});
 expect(context.guideOpen).toBe(false);expect(context.guideEvents).toEqual([]);
 act(()=>tree.unmount());
});
it('does not leave a dead avatar help action in the disabled account menu',()=>{
 let tree;act(()=>{tree=renderer.create(<ManagerAccountMenu anchor="header" colors={{}} name="Conta" mode="light" onTheme={()=>{}}/>);});
 expect(tree.root.findAllByProps({accessibilityLabel:'Ajuda do On Manager'})).toHaveLength(0);
 expect(tree.root.findByProps({accessibilityLabel:'Usar tema escuro'})).toBeTruthy();
 act(()=>tree.unmount());
});
