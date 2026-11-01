export const describeCatalogSource = source => {
  if (!source) return 'Carregando origem do catálogo…';
  if (source.source === 'product') return 'Catálogo geral';
  return `Vitrine: ${source.showcase?.name || `#${source.showcase?.id}`}`;
};

// The catalog API owns showcase precedence, publication, pricing and fallback.
// Never treat a failed request or an empty showcase as permission to list all products.
export const createSingleItemCatalogFetch = ({fetch, companyId, onSource, device, deviceType}) => async (endpoint, params = {}, options = {}) => {
  const detail = /^products\/(\d+)$/.exec(endpoint);
  if (endpoint !== 'products' && !detail) return fetch(endpoint,{...options,params});
  const response = await fetch('product-showcases/catalog',{
    ...options,
    params:{...params,company:`/people/${companyId}`,integration_key:'pos',...(device ? {device,deviceType} : {}),...(detail ? {id:detail[1],itemsPerPage:1} : {})},
  });
  if (!Array.isArray(response?.member) || !['product','showcase'].includes(response?.source)
      || (response.source === 'showcase' && !response.showcase?.id)
      || (response.source === 'product' && response.showcase)) {
    throw new Error('Resposta inválida da origem do catálogo.');
  }
  onSource?.({source:response.source,showcase:response.showcase || null});
  if (!detail) return response;
  const product=response.member.find(item=>String(item.id)===detail[1]);
  if (!product) throw new Error('Produto indisponível no catálogo deste PDV.');
  return product;
};

// The existing cache can delegate directly to store actions (native/no storage).
// Its fallback must still use the authoritative catalog, never the general store endpoint.
export const createSingleItemCatalogStore = (store, fetchCatalog) => ({
  ...store,
  actions:{
    ...store.actions,
    async get(id) {
      const normalized=String(id?.id || id).replace(/\D/g,'');
      const item=await fetchCatalog(`products/${normalized}`);
      store.actions.setItem?.(item);
      return item;
    },
    async getItems({append=false,__storeMeta,...params} = {}) {
      store.actions.setIsLoading?.(true);
      try {
        const response=await fetchCatalog('products',params);
        const previous=append ? store.getters.items || [] : [];
        const ids=new Set(previous.map(item=>String(item.id || item['@id'])));
        const items=[...previous,...response.member.filter(item=>!ids.has(String(item.id || item['@id'])))];
        store.actions.setItems?.(items);
        store.actions.setTotalItems?.(response.totalItems);
        return items;
      } finally {
        store.actions.setIsLoading?.(false);
        store.actions.setIsLoadingList?.(false);
      }
    },
  },
});
