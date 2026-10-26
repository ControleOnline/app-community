/* global jest, beforeEach, it, expect */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {api} from '@controleonline/ui-common/src/api';
import useLoader from '../../../node_modules/@controleonline/ui-orders/src/react/pages/checkout/useCheckoutPaymentOptionsLoader';
jest.mock('react-native',()=>({Platform:{OS:'web'}}));
jest.mock('@react-navigation/native',()=>({useFocusEffect: callback=>require('react').useEffect(callback,[callback])}));
jest.mock('@controleonline/ui-common/src/api',()=>({api:{fetch:jest.fn()}}));
jest.mock('@controleonline/ui-common/src/react/utils/paymentDevices',()=>({
 filterDeviceConfigsByCompany:x=>x,filterWalletPaymentTypesByAllowedIds:x=>x,getPaymentGateway:()=> 'cielo',
 resolveDevicePaymentTypeIds:()=>[1],selectPosWalletPaymentTypes:({walletPaymentTypes})=>walletPaymentTypes,
}));
jest.mock('@controleonline/ui-common/src/react/utils/cashPayment',()=>({isGatewayFreePayment:()=>true}));
jest.mock('@controleonline/ui-common/src/react/utils/paymentOptions',()=>({isIntegratedPaymentOption:()=>true}));
jest.mock('@controleonline/ui-common/src/react/services/paymentGatewayExecution',()=>({normalizeGatewayPaymentError:e=>e.message}));
jest.mock('@controleonline/ui-common/src/react/config/deviceConfigBootstrap',()=>({isPosSingleItemMode:configs=>configs?.mode==='single'}));
const noop=()=>{};
/* eslint-disable no-unused-vars */
function Harness(props){useLoader(props);return null;}
let props;
beforeEach(()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;
 api.fetch.mockReset();api.fetch.mockImplementation(path=>Promise.resolve(path==='wallet_payment_types'?[]:{}));
 props={allPaymentOptions:[],currentCompany:{id:3,configs:{}},device:{id:5,configs:{mode:'single'}},
 deviceConfigActions:{ensureCompanyDeviceConfigsLoaded:jest.fn().mockResolvedValue([]),getItems:jest.fn().mockResolvedValue([])},
 canUseLocalOperationalPayment:true,remotePaymentDevices:[],selectedRemoteDevice:null,
 setCompanyDeviceConfigs:noop,setLoadingPaymentOptions:noop,setLocalPaymentOptions:noop,setPaymentOptionsError:noop,
 setRemotePaymentOptions:noop,setSelectedPaymentOption:noop,setSelectedRemoteDeviceId:noop};
});
it('does not rediscover the same company when the receiver becomes available',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<Harness {...props}/>);});
 await act(async()=>{tree.update(<Harness {...props} selectedRemoteDevice={{deviceId:9,alias:'Remote',config:{configs:{}}}}/>);});
 expect(api.fetch.mock.calls.map(c=>c[0])).toEqual(['configs/discovery-configs','wallet_payment_types']);
 expect(props.deviceConfigActions.ensureCompanyDeviceConfigsLoaded).toHaveBeenCalledWith({people:'/people/3'});
 expect(props.deviceConfigActions.getItems).not.toHaveBeenCalled();
 await act(async()=>tree.unmount());
});
it('reloads on company and device configuration changes',async()=>{
 let tree;await act(async()=>{tree=renderer.create(<Harness {...props}/>);});
 await act(async()=>{tree.update(<Harness {...props} device={{id:5,configs:{mode:'single',changed:true}}}/>);});
 await act(async()=>{tree.update(<Harness {...props} currentCompany={{id:4,configs:{}}}/>);});
 expect(api.fetch.mock.calls.filter(c=>c[0]==='configs/discovery-configs')).toHaveLength(3);
 expect(api.fetch.mock.calls.at(-1)[1].params.people).toBe('/people/4');
 await act(async()=>tree.unmount());
});
it('does not retain a failed discovery',async()=>{
 api.fetch.mockRejectedValueOnce(Error('offline'));
 let tree;await act(async()=>{tree=renderer.create(<Harness {...props}/>);});
 await act(async()=>{tree.update(<Harness {...props} selectedRemoteDevice={{deviceId:9,config:{configs:{}}}}/>);});
 expect(api.fetch.mock.calls.map(c=>c[0])).toEqual(['configs/discovery-configs','configs/discovery-configs','wallet_payment_types']);
 await act(async()=>tree.unmount());
});

it('shares discovery while the first request is still pending',async()=>{
 let resolveDiscovery;
 api.fetch.mockImplementation(path=>path==='configs/discovery-configs'?new Promise(resolve=>{resolveDiscovery=resolve;}):Promise.resolve([]));
 let tree;await act(async()=>{tree=renderer.create(<Harness {...props}/>);});
 await act(async()=>{tree.update(<Harness {...props} selectedRemoteDevice={{deviceId:9,config:{configs:{}}}}/>);});
 expect(api.fetch).toHaveBeenCalledTimes(1);
 await act(async()=>{resolveDiscovery({});});
 expect(api.fetch.mock.calls.map(c=>c[0])).toEqual(['configs/discovery-configs','wallet_payment_types']);
 await act(async()=>tree.unmount());
});
it('keeps the uncached path for other POS modes',async()=>{
 const device={id:5,configs:{mode:'waiter'}};
 let tree;await act(async()=>{tree=renderer.create(<Harness {...props} device={device}/>);});
 await act(async()=>{tree.update(<Harness {...props} device={device} selectedRemoteDevice={{deviceId:9,config:{configs:{}}}}/>);});
 expect(api.fetch.mock.calls.filter(c=>c[0]==='configs/discovery-configs')).toHaveLength(2);
 expect(props.deviceConfigActions.getItems).toHaveBeenCalled();
 await act(async()=>tree.unmount());
});
