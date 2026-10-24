import React from 'react';
import renderer,{act} from 'react-test-renderer';
import useCheckoutNavigation from '@controleonline/ui-orders/src/react/pages/checkout/useCheckoutNavigation';
jest.mock('@appType',()=>({app_type:'POS'}));
jest.mock('react-native',()=>({TouchableOpacity:'TouchableOpacity'}));
jest.mock('react-native-vector-icons/MaterialIcons',()=> 'Icon');
let tree,result;
afterEach(()=>{if(tree)act(()=>tree.unmount());tree=null;});
it.each([true,false])('resets to the catalog only in Single Item: %s',async single=>{
 const navigation={reset:jest.fn(),setOptions:jest.fn()};
 function Probe(){result=useCheckoutNavigation({checkoutOrderId:73016,isSingleItemMode:single,isPdvInteractionMode:true,navigation});return null;}
 await act(async()=>{tree=renderer.create(<Probe/>);});
 act(()=>result.resetToOrderHistory());
 expect(navigation.reset).toHaveBeenCalledWith({index:0,routes:[single?{name:'HomePage',params:{startNewOrder:true}}:{name:'OrderHistoryPage'}]});
});
