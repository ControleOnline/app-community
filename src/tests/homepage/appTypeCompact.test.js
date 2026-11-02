import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Switcher from '@controleonline/ui-common/src/react/components/AppTypeSwitcher';
const mockClear=jest.fn(),mockSet=jest.fn(),mockReload=jest.fn();
jest.mock('react-native',()=>({Modal:'Modal',Platform:{OS:'web'},ScrollView:'ScrollView',Text:'Text',TextInput:'TextInput',TouchableOpacity:'TouchableOpacity',View:'View',StyleSheet:{create:x=>x}}));
jest.mock('react-native-vector-icons/Feather',()=> 'Icon');
jest.mock('@appType',()=>({app_type:'MANAGER',app_type_base:'ADMIN',app_type_options:['ADMIN','MANAGER','DELIVERY'],normalize_app_type:x=>x,clear_app_type:()=>mockClear(),set_app_type:x=>mockSet(x)}));
const button=(tree,label)=>tree.root.findAllByType('TouchableOpacity').filter(x=>x.props.accessibilityLabel===label);
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;global.window={location:{reload:mockReload}};jest.clearAllMocks();});
afterEach(()=>{delete global.window;});
it('keeps desktop labels and direct reset unchanged',()=>{
 let tree;act(()=>{tree=renderer.create(<Switcher colors={{}}/>);});
 expect(tree.root.findAllByType('Text').some(x=>x.props.children==='Tipo de app')).toBe(true);
 expect(button(tree,'Voltar para ADMIN')).toHaveLength(1);
 act(()=>tree.unmount());
});
it('offers a compact touch control and returns to ADMIN from its options',()=>{
 let tree;act(()=>{tree=renderer.create(<Switcher colors={{}} compact/>);});
 expect(tree.root.findAllByType('Text').some(x=>x.props.children==='Tipo de app')).toBe(false);
 expect(button(tree,'Voltar para ADMIN')).toHaveLength(0);
 const trigger=button(tree,'Selecionar tipo de app')[0];
 expect(trigger.props.style.at(-1).minHeight).toBeGreaterThanOrEqual(44);
 act(()=>trigger.props.onPress());
 expect(button(tree,'Voltar para ADMIN')).toHaveLength(1);
 act(()=>button(tree,'Voltar para ADMIN')[0].props.onPress());
 expect(mockClear).toHaveBeenCalledTimes(1);expect(mockSet).not.toHaveBeenCalled();expect(mockReload).toHaveBeenCalledTimes(1);
 act(()=>tree.unmount());
});
