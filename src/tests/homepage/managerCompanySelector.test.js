import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerCompanySelector from '../../components/manager-preview/ManagerCompanySelector';
let mockCompanies;
let mockWidth = 400;
const mockSelect = jest.fn();
jest.mock('react-native', () => ({Modal:'Modal',Pressable:'Pressable',ScrollView:'ScrollView',Text:'Text',View:'View',StyleSheet:{create:x=>x,absoluteFill:{}},useWindowDimensions:()=>({width:mockWidth,height:875})}));
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:24})}));
jest.mock('../../components/HomeIcon',()=> 'Icon');
jest.mock('../../components/manager-preview/ManagerBrand',()=> ({__esModule:true,default:'Brand',CompanyName:'CompanyName'}));
jest.mock('../../components/manager-preview/ManagerCompanyLogo',()=> 'Avatar');
jest.mock('@store',()=>({useStore:()=>({getters:{companies:mockCompanies,currentCompany:mockCompanies[0]},actions:{setCurrentCompany:mockSelect}})}));
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;mockWidth=400;mockSelect.mockClear();mockCompanies=[{id:1,alias:'GYROS'},{id:2,alias:'Empresa com nome muito comprido — unidade centro'},{id:3,name:'Indisponível',enabled:false}];});
const render=props=>{let tree;act(()=>{tree=renderer.create(<ManagerCompanySelector colors={{}} {...props}/>);});return tree;};
const trigger=tree=>tree.root.findByProps({testID:'manager-company-trigger'});
const option=(tree,id)=>tree.root.findByProps({testID:`manager-company-option-${id}`});
it('opens selection, persists the chosen company and closes the modal',()=>{
 const tree=render();
 act(()=>trigger(tree).props.onPress());
 expect(tree.root.findByType('Modal').props.visible).toBe(true);
 expect(option(tree,1).props.accessibilityState.selected).toBe(true);
 act(()=>option(tree,2).props.onPress());
 expect(mockSelect).toHaveBeenCalledWith(mockCompanies[1]);
 expect(tree.root.findByType('Modal').props.visible).toBe(false);
 act(()=>tree.unmount());
});
it('disables inaccessible companies without changing the current company',()=>{
 const tree=render();
 expect(option(tree,3).props.disabled).toBe(true);
 act(()=>option(tree,3).props.onPress());
 expect(mockSelect).not.toHaveBeenCalled();
 act(()=>tree.unmount());
});
it('keeps the compact selector accessible and closes on a dismiss request',()=>{
 mockWidth=900;const tree=render({compact:true});
 expect(trigger(tree).props.accessibilityLabel).toBe('Selecionar empresa. Atual: GYROS');
 act(()=>trigger(tree).props.onPress());
 act(()=>tree.root.findByType('Modal').props.onRequestClose());
 expect(tree.root.findByType('Modal').props.visible).toBe(false);
 act(()=>tree.unmount());
});
it('shows a static identity when there is only one company',()=>{
 mockCompanies=mockCompanies.slice(0,1);const tree=render();
 expect(tree.root.findAllByProps({testID:'manager-company-trigger'})).toHaveLength(0);
 expect(tree.root.findByType('Brand').props).toMatchObject({subtitle:false});
 act(()=>tree.unmount());
});

it('centers the borderless logo above the single-line name and its arrow',()=>{
 const tree=render({mode:'header'});
 expect(tree.root.findAllByProps({testID:'manager-company-name-border'})).toHaveLength(0);
 expect(tree.root.findByType('Brand').parent.props.style).toMatchObject({flexDirection:'column',gap:1});
 expect(tree.root.findByType('CompanyName').props).toMatchObject({label:'GYROS',dense:true,small:true,complete:true,lines:1});
 const arrow=tree.root.findByProps({testID:'manager-company-chevron'});
 expect(arrow.parent).toBe(tree.root.findByType('CompanyName').parent);
 expect(arrow.parent.parent).toBe(tree.root.findByType('Brand').parent);
 expect(arrow.parent.props.style[0].alignItems).toBe('center');
 expect(tree.root.findByType('Brand').props).toMatchObject({homeSize:40,homeWidth:64});
 expect(arrow.parent.findAllByType('CompanyName')).toHaveLength(1);
 act(()=>trigger(tree).props.onPress());
 expect(tree.root.findByType('Modal').props.visible).toBe(true);
 act(()=>tree.unmount());
});
it('keeps the desktop logo legible and hides the arrow for a single company',()=>{
 mockWidth=1200;mockCompanies=mockCompanies.slice(0,1);
 const tree=render({mode:'header'});
 expect(tree.root.findByType('Brand').props.homeSize).toBe(40);
 expect(tree.root.findAllByProps({testID:'manager-company-chevron'})).toHaveLength(0);
 act(()=>tree.unmount());
});
