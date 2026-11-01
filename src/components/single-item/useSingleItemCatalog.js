import {useEffect, useMemo, useRef, useState} from 'react';
import {api} from '@controleonline/ui-common/src/api';
import {createCachedCatalogActions} from '@controleonline/ui-products/src/react/utils/cachedCatalogActions';
import {createSingleItemCatalogFetch, createSingleItemCatalogStore, describeCatalogSource} from './singleItemCatalogSource';

export default function useSingleItemCatalog({enabled, store, companyId, deviceConfig, context}) {
  // A separate namespace prevents general-product pages from masquerading as showcase pages.
  const scope=JSON.stringify([companyId,deviceConfig?.id,deviceConfig?.configs,context]);
  const scopeRef=useRef(scope);
  scopeRef.current=scope;
  const [origin,setOrigin]=useState(null);
  const [failure,setFailure]=useState(null);
  const [attempt,setAttempt]=useState(0);
  const resolvedOrigin=origin?.scope===scope ? origin : null;
  const catalogScope=`single-item-showcase:${scope}:${resolvedOrigin?.source || 'pending'}:${resolvedOrigin?.showcase?.id || ''}`;
  const fetchCatalog=useMemo(()=>createSingleItemCatalogFetch({
    fetch:async (...args)=>{
      const response=await api.fetch(...args);
      if(scopeRef.current!==scope) throw new Error('O contexto do catálogo mudou.');
      return response;
    },companyId,
    ...(deviceConfig?.operationalType === 'PDV' ? {
      device:deviceConfig.device?.device || deviceConfig.device?.id || deviceConfig.device,
      deviceType:'PDV',
    } : {}),
    onSource:source=>{if(scopeRef.current===scope) {setOrigin({scope,...source});setFailure(null);}},
  }),[companyId,scope]);
  const actions=useMemo(()=>enabled ? createCachedCatalogActions(createSingleItemCatalogStore(store,fetchCatalog),companyId,
    catalogScope,{fetch:fetchCatalog}) : null,
  [enabled,store.actions,store.getters.resourceEndpoint,companyId,catalogScope,fetchCatalog]);
  useEffect(()=>{
    if (!enabled || !companyId) return undefined;
    let active=true;
    // Metadata is read even when a previously loaded product page comes from cache.
    fetchCatalog('products',{itemsPerPage:1}).catch(()=>{
      if(active && scopeRef.current===scope) setFailure(scope);
    });
    return ()=>{active=false;};
  },[enabled,companyId,scope,fetchCatalog,attempt]);
  return {actions,scopeKey:catalogScope,ready:!!resolvedOrigin && failure!==scope,
    failed:failure===scope,retry:()=>{setFailure(null);setAttempt(value=>value+1);},
    sourceLabel:failure===scope ? 'Origem do catálogo indisponível' : describeCatalogSource(resolvedOrigin)};
}
