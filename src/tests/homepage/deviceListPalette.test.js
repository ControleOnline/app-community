import React from 'react';
import renderer,{act} from 'react-test-renderer';
import Devices from '@controleonline/ui-common/src/react/pages/Devices';
const mockNavigate=jest.fn();
jest.mock('react-native',()=>({Text:'Text',TouchableOpacity:'TouchableOpacity',View:'View',Platform:{select:()=>({})},StyleSheet:{create:x=>x}}));
jest.mock('react-native-safe-area-context',()=>({SafeAreaView:'SafeAreaView'}));
jest.mock('@react-navigation/native',()=>({useNavigation:()=>({navigate:mockNavigate})}));
jest.mock('react-native-vector-icons/Feather',()=> 'Icon');
jest.mock('@store',()=>({useStore:name=>({getters:name==='theme'?{colors:{background:'#eeeeee'}}:{currentCompany:{id:3,theme:{colors:{background:'#ff0000'}}}}})}));
jest.mock('@controleonline/ui-default/src/react/components/filters/CompactFilterSelector',()=> 'DefaultFilter');
jest.mock('@controleonline/ui-common/src/react/pages/Devices/deviceTypes',()=>({
 ALL_DEVICE_FILTER:'ALL',getDeviceCreationAction:()=>null,getDeviceFilterAccent:()=> 'accent',getDeviceFilterIcon:()=> 'cpu',
 getDeviceFilterOptions:()=>[{key:'ALL',label:'Todos'},{key:'PDV',label:'PDV'}],getPdvSubfilterOptions:()=>[],
 getDeviceFilterDefinition:()=>({TabComponent:'DeviceGroups'}),isPdvSubfilter:()=>false,hasRegisteredDeviceFilter:()=>true,
}));
it('keeps active-mode domain colors through default filters and grouped-list transitions',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 const themePalette={background:'#101621',text:'#edf1f9',cardBackground:'#141b27',cardBorder:'#273140'};
 let tree;act(()=>{tree=renderer.create(<Devices themePalette={themePalette}/>);});
 expect(tree.root.findByType('SafeAreaView').props.style[1].backgroundColor).toBe('#101621');
 expect(tree.root.findByType('DeviceGroups').props.themePalette).toBe(themePalette);
 act(()=>tree.root.findByType('DefaultFilter').props.onSelect('PDV'));
 expect(tree.root.findByType('DeviceGroups').props.themePalette).toBe(themePalette);
 expect(mockNavigate).not.toHaveBeenCalled();
});
it('preserves the existing palette selection outside the Manager adapter',()=>{
 let tree;act(()=>{tree=renderer.create(<Devices/>);});
 expect(tree.root.findByType('SafeAreaView').props.style[1].backgroundColor).toBe('#ff0000');
 expect(tree.root.findByType('DeviceGroups').props.themePalette).toBeNull();
});
