const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const {EventEmitter} = require('node:events');
const React = require('react');
const renderer = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(process.env.CONTROLEONLINE_MODULES_ROOT || path.join(__dirname, '../node_modules/@controleonline'));
function load(file, deps = {}) {
 const exports = {};
 const filename = path.join(root, file);
 const {code} = babel.transformSync(fs.readFileSync(filename,'utf8'), {filename,babelrc:false,configFile:false,presets:[require.resolve('@babel/preset-env'),require.resolve('@babel/preset-react')]});
 vm.runInNewContext(code,{exports,console,global:{},require:id=>{assert.ok(Object.hasOwn(deps,id),id);return deps[id];}});
 return exports;
}
const state = load('ui-orders/src/utils/orderState.js');
const session = load('ui-orders/src/react/utils/addProductSession.js');
const eventBus = new EventEmitter();
const confirmation = load('ui-orders/src/react/utils/confirmPendingProducts.js',{
 '@controleonline/ui-common/src/react/components/EventBus':eventBus,
 './addProductSession':session,'../../utils/orderState':state,
});
let nextId = 700;
const select = (id,quantity=1) => session.setPendingAddProductQuantity({id,product:`Produto ${id}`,price:5},quantity);
function fixture() {
 session.clearPendingAddProducts();
 const order = {id:++nextId,price:5,orderProducts:[{id:1,product:{id:9},price:5,total:5,quantity:1}]};
 const server = {...order,orderProducts:[...order.orderProducts]};
 const calls = [],sync = [];
 const ordersActions = {
  addProducts:async(id,payload,options)=>{
   calls.push({id,payload,options});
   const p=payload[0];
   server.orderProducts.push({id:100+calls.length,product:{id:p.product},price:5,total:5*p.quantity,quantity:p.quantity});
   server.price+=5*p.quantity;
   return {...server};
  },
  get:async()=>({...server}),syncOrder:item=>sync.push(item),
 };
 return {order,server,calls,sync,ordersActions,orderProductsActions:{getItems:async()=>[...server.orderProducts]}};
}
test('confirmed additions preserve existing items and clear provisional selection',async()=>{
 const f=fixture();select(2,2);
 const result=await confirmation.confirmPendingProducts(f);
 assert.equal(result.price,15);assert.equal(result.orderProducts.length,2);
 assert.equal(session.listPendingAddProducts().length,0);assert.equal(f.calls.length,1);
 assert.equal(f.calls[0].options.silentError,true);
});
test('a stock refusal removes provisional tea, preserves accepted water and is never retried',async()=>{
 const f=fixture();select(2,2);select(3);select(4);
 const add=f.ordersActions.addProducts;
 let refused=0;
 f.ordersActions.addProducts=async(id,payload,options)=>{
  if(payload[0].product==='3'){refused++;throw {message:'Estoque insuficiente para Chá na vitrine POS.',status:400};}
  return add(id,payload,options);
 };
 await assert.rejects(confirmation.confirmPendingProducts(f),/Estoque insuficiente/);
 assert.equal(refused,1);assert.equal(f.sync.at(-1).price,20);
 assert.equal(f.sync.at(-1).orderProducts.length,3);
 assert.equal(session.listPendingAddProducts().length,0);
 await confirmation.confirmPendingProducts({...f,order:f.sync.at(-1)});
 assert.equal(refused,1);assert.equal(f.calls.length,2);
});
test('catalog exit and review share a single pending request and notification',async()=>{
 const f=fixture();select(2);
 let release;const wait=new Promise(resolve=>release=resolve);
 f.ordersActions.addProducts=async()=>{await wait;throw new Error('Estoque insuficiente');};
 const first=confirmation.confirmPendingProducts(f),second=confirmation.confirmPendingProducts(f);
 assert.equal(first,second);assert.equal(confirmation.isConfirmingProducts(f.order.id),true);
 const messages=[];
 const catchError=p=>p.catch(error=>confirmation.reportProductConfirmationError(error,message=>messages.push(message)));
 const handled=[catchError(first),catchError(second)];
 release();await Promise.all(handled);
 assert.equal(messages.length,1);assert.equal(confirmation.isConfirmingProducts(f.order.id),false);
 assert.equal(f.sync.at(-1).price,5);
});
test('an uncertain write reads back the server without repeating additive requests',async()=>{
 const f=fixture();select(2);select(3);
 const add=f.ordersActions.addProducts;
 f.ordersActions.addProducts=async(...args)=>{await add(...args);throw new Error('Conexão interrompida');};
 await assert.rejects(confirmation.confirmPendingProducts(f),/Conexão/);
 assert.equal(f.calls.length,1);assert.equal(f.sync.at(-1).price,10);
 assert.equal(f.sync.at(-1).orderProducts.length,2);
});
test('failed readback prevents production until the server can be read and the order reviewed',async()=>{
 const f=fixture();select(2);
 const add=f.ordersActions.addProducts;
 f.ordersActions.addProducts=async(...args)=>{await add(...args);return {id:f.order.id};};
 f.ordersActions.get=async()=>{throw new Error('offline');};
 await assert.rejects(confirmation.confirmPendingProducts(f),/conferir o pedido/);
 assert.equal(confirmation.hasUnresolvedProductConfirmation(f.order.id),true);
 await assert.rejects(confirmation.confirmPendingProducts(f),/offline/);
 assert.equal(f.calls.length,1);
 f.ordersActions.get=async()=>f.server;
 await assert.rejects(confirmation.confirmPendingProducts(f),/Confira os itens/);
 assert.equal(confirmation.hasUnresolvedProductConfirmation(f.order.id),false);
 await confirmation.confirmPendingProducts({...f,order:f.sync.at(-1)});
 assert.equal(f.calls.length,1);
});
test('production waits for confirmation and stays in review after stock refusal',async()=>{
 const f=fixture();select(2);
 let release;const wait=new Promise(resolve=>release=resolve);
 f.ordersActions.addProducts=async()=>{await wait;throw new Error('Estoque insuficiente');};
 const stores={orders:{actions:f.ordersActions},order_products:{actions:f.orderProductsActions}};
 const posts=[],errors=[],navigations=[];
 const useActions=load('ui-orders/src/react/pages/orders/sales/orderDetails/useOrderDetailsPrimaryActions.js',{
  react:React,'@store':{useStore:key=>stores[key]},
  '../../../../utils/confirmPendingProducts':confirmation,
  '../../../../hooks/posCartSession/useCompleteWaiterLaunch':()=>()=>assert.fail('A refused launch cannot be completed'),
  '../../../../hooks/posCartSession/activePosOrderContext':load('ui-orders/src/react/hooks/posCartSession/activePosOrderContext.js'),
  '../../../../utils/orderProductsFetchPolicy':load('ui-orders/src/react/utils/orderProductsFetchPolicy.js', {'../../utils/orderState': state}),
  '@controleonline/ui-common/src/api':{api:{post:async(...args)=>{posts.push(args);return {errno:0};}}},
  '@controleonline/ui-orders/src/react/utils/orderRoute':{},
  '@controleonline/ui-orders/src/react/pages/orders/sales/orderDetailsPaymentBar':{
   resolveOrderDetailsPrimaryActionMode:()=> 'produce',resolveOrderDetailsPrimaryActionLabel:()=> 'Enviar',resolveOrderDetailsPrimaryActionIcon:()=> 'send',
  },'@appType':{app_type:'POS'},'./helpers':{getEntityId:o=>o.id,formatApiError:e=>e.message},
 }).default;
 let actions,tree;
 const Probe=()=>{actions=useActions({item:f.order,ordersGetters:{},route:{params:{}},isWaiterMode:true,flushPendingOrderProductChanges:async()=>{},refreshCurrentOrder:async()=>{},showError:e=>errors.push(e),showSuccess:()=>{},navigation:{navigate:(...a)=>navigations.push(a)}});return null;};
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe));});
 const confirming=confirmation.confirmPendingProducts(f);
 confirming.catch(() => {});
 let sending;
 await renderer.act(async()=>{sending=actions.handlePrimaryAction();await Promise.resolve();});
 assert.equal(posts.length,0);assert.equal(confirmation.isConfirmingProducts(f.order.id),true);
 await renderer.act(async()=>{release();await sending;});
 assert.equal(posts.length,0);assert.equal(navigations.length,0);assert.equal(errors.length,1);
 await renderer.act(async()=>tree.unmount());
});

test('explicit product search additions are retained and merged with catalog selection', async () => {
 const f=fixture();select(2);
 const result=await confirmation.confirmPendingProducts({...f,products:[{product:2,quantity:2},{product:3,quantity:1}]});
 assert.equal(f.calls.length,2);assert.equal(f.calls[0].payload[0].quantity,3);
 assert.equal(result.price,25);
});

test('silent product refusal leaves notification to the caller; default callers keep the store error', async () => {
 const custom=load('ui-orders/src/store/orders/customActions.js',{
  '@controleonline/ui-common/src/api':{api:{fetch:async()=>{throw new Error('Estoque insuficiente');}}},
  '@controleonline/ui-common/src/utils/formatter':{normalizeText:value=>String(value||'')},
  '@controleonline/ui-default/src/store/default/mutation_types':{SET_ERROR:'SET_ERROR',SET_ISSAVING:'SET_ISSAVING'},
  '@controleonline/ui-orders/src/utils/orderState':state,'@assets/ppc/channels':{getOrderChannelLogo:()=>null},
 });
 for(const silentError of [true,false]) {
  const commits=[];
  await assert.rejects(custom.addProducts({getters:{resourceEndpoint:'orders'},commit:(...args)=>commits.push(args)},123,[{product:2,quantity:1}],{silentError}),/Estoque/);
  const refused=commits.find(([type,message])=>type==='SET_ERROR'&&message==='Estoque insuficiente');
  assert.equal(refused[2].skipSystemError,silentError);
  assert.equal(commits.at(-1)[1],false);
 }
});

test('cart materialization uses awaited waiter confirmation and retains the legacy path for counter', async () => {
 for(const mode of ['waiter','counter']) {
  const f=fixture();select(2);
  let release;const wait=new Promise(resolve=>release=resolve);
  const add=f.ordersActions.addProducts;
  f.ordersActions.addProducts=async(...args)=>{await wait;return add(...args);};
  const stores={orders:{actions:f.ordersActions,getters:{item:f.order}},order_products:{actions:f.orderProductsActions},people:{getters:{currentCompany:{id:3},mainCompany:{configs:{}}}},device:{getters:{item:{id:403}}},device_config:{getters:{item:{configs:{mode}}}}};
  const useMaterialization=load('ui-orders/src/react/hooks/usePosOrderMaterialization.js',{
   react:React,'@appType':{app_type:'POS'},'@store':{useStore:key=>stores[key]},
   '../utils/confirmPendingProducts':confirmation,
   '@controleonline/ui-common/src/react/config/deviceConfigBootstrap':{resolvePosOperationMode:c=>c.mode,POS_OPERATION_MODE_WAITER:'waiter',isPosSingleItemMode:()=>false},
   '@controleonline/ui-orders/src/react/hooks/usePosCartSession':()=>({ensureActiveOrder:async()=>f.order}),
   '@controleonline/ui-orders/src/react/utils/addProductSession':session,
   '@controleonline/ui-orders/src/react/utils/orderRoute':{},
   '@controleonline/ui-orders/src/react/utils/linkedOrderContext':{},
  }).default;
  let hook,tree;
  const Probe=()=>{hook=useMaterialization();return null;};
  await renderer.act(async()=>{tree=renderer.create(React.createElement(Probe));});
  const request=hook.materializeOrderWithProducts();let done=false;request.then(()=>done=true);
  await Promise.resolve();assert.equal(done,false);
  release();await request;
  assert.equal(f.calls.length,1);
  assert.equal(f.calls[0].options?.silentError,mode==='waiter'?true:undefined);
  await renderer.act(async()=>tree.unmount());
 }
});

test('simple quantity supports repeated additions and locks during server confirmation', async () => {
 const f=fixture();let release;const wait=new Promise(resolve=>release=resolve);
 const add=f.ordersActions.addProducts;
 f.ordersActions.addProducts=async(...args)=>{await wait;return add(...args);};
 const Quantity=load('ui-orders/src/react/components/cart/ProductQuantity.js',{
  react:React,'react-native':{View:'View',Text:'Text',TouchableOpacity:'TouchableOpacity'},
  'react-native-vector-icons/MaterialIcons':'Icon',
  '@controleonline/ui-common/src/react/components/EventBus':eventBus,
  '@controleonline/ui-orders/src/react/utils/addProductSession':session,
  '../../utils/confirmPendingProducts':confirmation,
  '@store':{useStore:key=>({getters:{item:key==='device_config'?{configs:{'pos-operation-mode':'waiter'}}:f.order}})},
  '@react-navigation/native':{useNavigation:()=>({navigate:()=>assert.fail('Pending units do not navigate to the cart')})},
  '@appType':{app_type:'POS'},
  '@controleonline/ui-common/src/react/config/deviceConfigBootstrap':{POS_OPERATION_MODE_WAITER:'waiter',resolvePosOperationMode:configs=>configs['pos-operation-mode']},
  '../../utils/catalogProductQuantity':load('ui-orders/src/react/utils/catalogProductQuantity.js',{'../../utils/orderState':state}),
  '../../utils/orderRoute':load('ui-orders/src/react/utils/orderRoute.js',{'@controleonline/ui-orders/src/utils/orderState':state}),
 }).default;
 let tree;
 await renderer.act(async()=>{tree=renderer.create(React.createElement(Quantity,{product:{id:2,price:5}}));});
 for(let i=0;i<2;i++) await renderer.act(async()=>tree.root.findAllByType('TouchableOpacity')[1].props.onPress());
 assert.equal(tree.root.findByType('Text').props.children,2);
 assert.equal(session.getPendingAddProductQuantity(2),2);
 let request;
 await renderer.act(async()=>{request=confirmation.confirmPendingProducts(f);await Promise.resolve();});
 assert.equal(tree.root.findAllByType('TouchableOpacity')[1].props.disabled,true);
 await renderer.act(async()=>{release();await request;});
 assert.equal(f.calls[0].payload[0].quantity,2);
 assert.equal(tree.root.findAllByType('TouchableOpacity')[1].props.disabled,false);
 assert.equal(tree.root.findByType('Text').props.children,'0');
 await renderer.act(async()=>tree.unmount());
});

test('a complete acknowledgment updates the stores without rereading or discarding totals',async()=>{
 const f=fixture();select(2,2);
 f.ordersActions.get=async()=>{throw new Error('unexpected order read');};
 f.orderProductsActions.getItems=async()=>{throw new Error('unexpected item read');};
 let saved;f.orderProductsActions.setItems=items=>saved=items;
 const result=await confirmation.confirmPendingProducts(f);
 assert.equal(result.price,15);assert.equal(saved.length,2);
 assert.equal(f.sync.at(-1),result);
});
test('an incomplete acknowledgment uses readback without repeating the write',async()=>{
 const f=fixture();select(2);const add=f.ordersActions.addProducts;let reads=0;
 f.ordersActions.addProducts=async(...args)=>{await add(...args);return {id:f.order.id};};
 f.ordersActions.get=async()=>{reads++;return f.server;};
 const result=await confirmation.confirmPendingProducts(f);
 assert.equal(reads,1);assert.equal(f.calls.length,1);assert.equal(result.price,10);
});
