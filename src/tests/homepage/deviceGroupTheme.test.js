import React from 'react';
import renderer,{act} from 'react-test-renderer';
import DeviceGroupCard from '@controleonline/ui-common/src/react/pages/Devices/deviceTypes/DeviceGroupCard';
import {createStyles} from '@controleonline/ui-common/src/react/pages/Devices.styles';
jest.mock('react-native',()=>({Text:'Text',TouchableOpacity:'TouchableOpacity',View:'View',Platform:{select:v=>v.web},StyleSheet:{create:v=>v}}));
jest.mock('react-native-vector-icons/Feather',()=> 'Icon');
it('uses active-mode card styles and keeps each configuration action attached to its original record',()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 const device={id:10,device:'terminal',alias:'Terminal'},config={id:7,type:'MANAGER',device};
 const palette={text:'#edf1f9',textSecondary:'#a3afc2',cardBackground:'#141b27',cardBorder:'#273140',cardText:'#edf1f9',deviceAccent:'#a3afc2'};
 const styles=createStyles(palette),goToDetail=jest.fn();
 let tree;act(()=>{tree=renderer.create(<DeviceGroupCard item={{key:'device:10',device,deviceConfigs:[config]}} brandColors={palette} themedStyles={styles} goToDetail={goToDetail} runtimeDeviceIdentifier="other"/>);});
 const card=tree.root.findByProps({testID:'device-group-device:10'});
 expect(card.props.style[0].backgroundColor).toBe('#141b27');
 act(()=>tree.root.findByProps({testID:'device-config-7'}).props.onPress());
 expect(goToDetail).toHaveBeenCalledWith(config);
});
