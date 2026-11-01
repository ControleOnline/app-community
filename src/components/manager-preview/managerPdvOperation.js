const id = value => String(value?.id || value?.['@id'] || value || '').split('/').pop();
export const MANAGER_PDV_ROUTES = new Set(['PdvPage','AddProductScreen','ProductsPage','CategoriesPage','Checkout','CustomizeScreen','OrderHistoryPage','OrderDetails','LinkedOrderSettlementPage','CloseCashRegister']);
export const isManagerPdvRoute = (appType,route) => appType === 'MANAGER' && MANAGER_PDV_ROUTES.has(route?.name)
  && (route.name === 'PdvPage' || route.params?.managerPdv === true || route.params?.managerPdv === 'true');

export function selectManagerPdvConfig(items, company, device) {
  const identities=new Set([device?.id,device?.device,device?.['@id']].filter(Boolean).map(id));
  const rows=Array.isArray(items) ? items : items?.member || items?.['hydra:member'];
  if(!Array.isArray(rows)) throw new Error('Resposta inválida de configuração PDV.');
  return rows
    .filter(row=>String(row.type || '').toUpperCase()==='PDV' && id(row.people)===id(company)
      && [row.device?.id,row.device?.device,row.device?.['@id'],typeof row.device==='string' ? row.device : null]
        .filter(Boolean).some(value=>identities.has(id(value))))
    .sort((a,b)=>Number(b.id)-Number(a.id))[0] || null;
}

export const managerPdvConfigQuery = (company,device) => ({
  people:`/people/${company.id}`,type:'PDV',
  ...(typeof device?.id==='number' && !device?.device ? {device:`/devices/${device.id}`}
    : {'device.device':device?.device || device?.id}),
});

export function managerPdvTabParams(view,{route,order,company}={}) {
  const base={pdvView:view,pdvCompleted:false,orderId:null,id:null,order:null,startNewOrder:false,
    resumeExistingOrder:false,singleItemCatalog:view==='catalog'};
  if(view!=='catalog') return base;
  const provider=id(order?.provider);
  const orderCanResume=provider===id(company) && String(order?.status?.realStatus || '').toLowerCase()==='open'
    && !['paid','pago','settled','liquidado'].includes(String(order?.status?.status || '').toLowerCase());
  const orderId=route?.params?.orderId || route?.params?.id || (orderCanResume ? order?.id : null);
  return orderId ? {...base,orderId,id:orderId,resumeExistingOrder:true} : base;
}

export function createManagerPdvNavigation(navigation,{singleItem=false,canViewHistory=true}={}) {
  const paramsFor = (name,params={}) => MANAGER_PDV_ROUTES.has(name)
    ? {...(name==='PdvPage' && params?.startNewOrder===true ? {orderId:null,id:null,order:null,pdvView:'catalog',resumeExistingOrder:false} : {}),
      ...params,managerPdv:true,interactionMode:'pdv',...(singleItem ? {singleItemMode:true} : {})} : params;
  const proxy={...navigation};
  for(const method of ['navigate','replace','popTo','push']) if(typeof navigation[method]==='function') {
    proxy[method]=(name,params,...rest)=>typeof name==='object'
      ? navigation[method]({...name,params:paramsFor(name.name,name.params)},params,...rest)
      : navigation[method](name,paramsFor(name,params),...rest);
  }
  if(navigation.reset) proxy.reset=state=>navigation.reset({...state,routes:state.routes.map(route=>{
    if(singleItem && route.name==='OrderHistoryPage') return {name:'PdvPage',params:paramsFor('PdvPage',{pdvView:'orders',...(!canViewHistory ? {pdvCompleted:true} : {})})};
    return {...route,params:paramsFor(route.name,route.params)};
  })});
  return proxy;
}
