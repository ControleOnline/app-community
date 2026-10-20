import React from 'react';
import renderer, {act} from 'react-test-renderer';
import ManagerDevicesPage, {managerDevicePalette} from '../../components/manager-preview/ManagerDevicesPage';
let mockPreview = {colors: {pageBackground:'page',textPrimary:'text',textMuted:'muted',cardBackground:'surface',cardBorder:'border',cardIconColor:'icon',navigationActiveBackground:'selected',navigationActiveBorder:'accent',navigationActiveText:'selectedText',buttonBackground:'button',buttonText:'buttonText'}};
jest.mock('react-native',()=>({View:'View',Text:'Text',Pressable:'Pressable'}));
jest.mock('../../components/manager-preview/ManagerPreviewProvider',()=>({useManagerPreview:()=>mockPreview}));
jest.mock('@controleonline/ui-common/src/react/pages/Devices',()=> 'ExistingDevices');
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;});
const mount=props=>{let tree;act(()=>{tree=renderer.create(<ManagerDevicesPage {...props}/>);});return tree;};
it('passes the domain palette to the existing device filters and groups without changing route params',()=>{
 const route={name:'DevicesIndex',params:{store:'device_config',opaque:'retained'}};
 const navigation={canGoBack:()=>true,goBack:jest.fn()};
 const tree=mount({route,navigation});const page=tree.root.findByType('ExistingDevices');
 expect(page.props.route).toBe(route);expect(page.props.themePalette.background).toBe('page');
 act(()=>tree.root.findByProps({accessibilityLabel:'Voltar'}).props.onPress());
 expect(navigation.goBack).toHaveBeenCalledTimes(1);
});
it('does not invent back navigation on a directly opened list',()=>{
 const tree=mount({navigation:{canGoBack:()=>false,goBack:jest.fn()}});
 expect(tree.root.findAllByProps({accessibilityLabel:'Voltar'})).toHaveLength(0);
});
it('maps device aliases to the exact active mode tokens without substitute colors',()=>{
 const colors=mockPreview.colors,palette=managerDevicePalette(colors);
 expect(palette).toMatchObject({text:'text',cardText:'text',background:'page',cardSelectedBackground:'selected',deviceAccent:'icon'});
 expect(Object.values(palette).every(v=>Object.values(colors).includes(v))).toBe(true);
 expect(managerDevicePalette({}).background).toBeUndefined();
});
