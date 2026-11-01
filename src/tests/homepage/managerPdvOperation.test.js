import {isManagerPdvRoute,selectManagerPdvConfig,createManagerPdvNavigation,managerPdvConfigQuery,managerPdvTabParams} from '../../components/manager-preview/managerPdvOperation';
const row=(id,type='PDV',company=3,device='web-10')=>({id,type,people:`/people/${company}`,device:{id:403,device},configs:{'pos-operation-mode':'single-item'}});
it('selects the newest PDV record only for the current company and device',()=>{
 const company={id:3},device={id:'web-10'};
 expect(selectManagerPdvConfig([row(1),row(2),row(9,'MANAGER'),row(10,'PDV',4),row(11,'PDV',3,'web-99')],company,device).id).toBe(2);
 expect(selectManagerPdvConfig([row(9,'MANAGER')],company,device)).toBeNull();
});
it('distinguishes hardware identifiers from persisted device ids and rejects malformed responses',()=>{
 expect(managerPdvConfigQuery({id:3},{id:403,device:'web-10'})).toMatchObject({'device.device':'web-10'});
 expect(managerPdvConfigQuery({id:3},{id:403})).toMatchObject({device:'/devices/403'});
 expect(()=>selectManagerPdvConfig({error:'invalid'},{id:3},{id:'web-10'})).toThrow('inválida');
});
it('limits the context to the Manager PDV and its marked operational screens',()=>{
 expect(isManagerPdvRoute('MANAGER',{name:'PdvPage'})).toBe(true);
 expect(isManagerPdvRoute('MANAGER',{name:'Checkout',params:{managerPdv:true}})).toBe(true);
 expect(isManagerPdvRoute('MANAGER',{name:'Checkout'})).toBe(false);
 expect(isManagerPdvRoute('POS',{name:'PdvPage'})).toBe(false);
 expect(isManagerPdvRoute('MANAGER',{name:'DeviceDetail',params:{managerPdv:true}})).toBe(false);
});
it('retains order identity during operational navigation without marking unrelated Manager destinations',()=>{
 const n={navigate:jest.fn(),reset:jest.fn()};
 const p=createManagerPdvNavigation(n,{singleItem:true});
 p.navigate('Checkout',{id:70});
 expect(n.navigate).toHaveBeenLastCalledWith('Checkout',expect.objectContaining({id:70,managerPdv:true,singleItemMode:true}));
 p.navigate('ClientsIndex',{id:2});expect(n.navigate).toHaveBeenLastCalledWith('ClientsIndex',{id:2});
 p.reset({index:0,routes:[{name:'OrderHistoryPage'}]});
 expect(n.reset).toHaveBeenCalledWith({index:0,routes:[{name:'PdvPage',params:expect.objectContaining({pdvView:'orders',managerPdv:true})}]});
});
it('clears stale identity when starting a new sale and preserves non-single completion',()=>{
 const n={navigate:jest.fn(),reset:jest.fn()};
 createManagerPdvNavigation(n,{singleItem:true}).navigate('PdvPage',{startNewOrder:true});
 expect(n.navigate).toHaveBeenCalledWith('PdvPage',expect.objectContaining({orderId:null,id:null,pdvView:'catalog',startNewOrder:true}));
 createManagerPdvNavigation(n).reset({index:0,routes:[{name:'OrderHistoryPage'}]});
 expect(n.reset.mock.calls.at(-1)[0].routes[0].name).toBe('OrderHistoryPage');
});
it('marks completion without exposing history or automatically creating a sale for restricted profiles',()=>{
 const n={reset:jest.fn()};
 createManagerPdvNavigation(n,{singleItem:true,canViewHistory:false}).reset({index:0,routes:[{name:'OrderHistoryPage'}]});
 expect(n.reset.mock.calls[0][0].routes[0]).toMatchObject({name:'PdvPage',params:{pdvCompleted:true,pdvView:'orders'}});
});
it('keeps the existing order when switching between operational tabs, without requesting a new sale',()=>{
 const order={id:70,provider:'/people/3',status:{realStatus:'open',status:'open'}};
 expect(managerPdvTabParams('catalog',{company:{id:3},order})).toMatchObject({orderId:70,resumeExistingOrder:true,startNewOrder:false});
 expect(managerPdvTabParams('orders',{company:{id:3},order})).toMatchObject({orderId:null,id:null,pdvView:'orders'});
 expect(managerPdvTabParams('catalog',{company:{id:4},order}).orderId).toBeNull();
});
