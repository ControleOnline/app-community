import {orderMovementEndpoint,resolveOrderMovement,orderValueMetric,resolvePaidOrderValue} from '../../components/manager-preview/orderMovement';
it('validates exact collection coverage without using paginated rows or sales totals',()=>{
 const s={movement:{totals:{orders:3593,undatedOrders:0},monthly:[{key:'2026-01',label:'01/2026',orders:3593}],daily:[]}};
 expect(resolveOrderMovement(s,'all',3593).series).toEqual(s.movement.monthly);
 expect(resolveOrderMovement(s,'today',3593)).toBeNull();
 expect(resolveOrderMovement({sales:{daily:[]}},'all',3593)).toBeNull();
 expect(resolveOrderMovement({...s,movement:{...s.movement,totals:{orders:3593,undatedOrders:1}}},'all',3593)).toBeNull();
});
it('routes only explicitly matched local development reads, never another API or published domain',()=>{
 const config={API_ENTRYPOINT:'https://api.example',DOMAIN:'https://app.example',LOCAL_ORDER_REPORTS:{sourceApi:'https://api.example',domain:'https://app.example',endpoint:'http://localhost:8000'}};
 expect(orderMovementEndpoint(config,{hostname:'localhost'})).toBe('http://localhost:8000/orders');
 expect(orderMovementEndpoint({...config,API_ENTRYPOINT:'https://staging.example'},{hostname:'localhost'})).toBe('orders');
 expect(orderMovementEndpoint(config,{hostname:'app.example'})).toBe('orders');
});

it('selects paid-order value only by explicit local API/domain configuration',()=>{
 const config={API_ENTRYPOINT:'https://api.example',DOMAIN:'https://app.example',LOCAL_ORDER_REPORTS:{sourceApi:'https://api.example',domain:'https://app.example',endpoint:'http://localhost:8000',valueMetric:'paidOrders'}};
 expect(orderValueMetric(config,{hostname:'localhost'})).toBe('paidOrders');
 expect(orderValueMetric({...config,DOMAIN:'https://other.example'},{hostname:'localhost'})).toBe('sales');
 expect(orderValueMetric({...config,API_ENTRYPOINT:'https://staging.example'},{hostname:'localhost'})).toBe('sales');
 expect(orderValueMetric(config,{hostname:'app.example'})).toBe('sales');
 expect(orderValueMetric({...config,LOCAL_ORDER_REPORTS:{...config.LOCAL_ORDER_REPORTS,valueMetric:undefined}},{hostname:'localhost'})).toBe('sales');
});
it('rejects receipts, closed sales, incomplete prices and invalid amounts instead of returning zero',()=>{
 const paid={basis:'order-price',status:'paid',realStatus:'open',totals:{orders:370,amount:16095,unpricedOrders:0}};
 expect(resolvePaidOrderValue({paidOrders:paid})).toBe(16095);
 expect(resolvePaidOrderValue({paidOrders:{...paid,totals:{orders:0,amount:0,unpricedOrders:0}}})).toBe(0);
 expect(resolvePaidOrderValue({sales:{totals:{revenue:100}}})).toBeNull();
 expect(resolvePaidOrderValue({paidOrders:{...paid,realStatus:'closed'}})).toBeNull();
 expect(resolvePaidOrderValue({paidOrders:{...paid,totals:{...paid.totals,unpricedOrders:1}}})).toBeNull();
 expect(resolvePaidOrderValue({paidOrders:{...paid,totals:{...paid.totals,amount:NaN}}})).toBeNull();
});

it('keeps sales on the standard API and explicitly assigns paid orders to the service domain',()=>{
 expect(orderValueMetric({DOMAIN:'https://app.lave-go.com',API_ENTRYPOINT:'https://apinew.lave-go.com'},{hostname:'app.lave-go.com'})).toBe('paidOrders');
 expect(orderValueMetric({DOMAIN:'https://staging.controleonline.com',API_ENTRYPOINT:'https://s.controleonline.com'},{hostname:'staging.controleonline.com'})).toBe('sales');
 expect(orderValueMetric({DOMAIN:'https://app.lave-go.com',API_ENTRYPOINT:'https://api.other.test'},{hostname:'app.lave-go.com'})).toBe('sales');
});
