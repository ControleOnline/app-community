jest.mock('@store', () => ({useStore: name => ({getters: name === 'auth' ? mockAuth : {}})}));
/* global jest, beforeEach, it, expect */
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import useCounts, {fetchCategoryProductCount} from '@controleonline/ui-products/src/react/pages/CategoriesPage/useCategoryProductCounts';
import eventBus from '@controleonline/ui-common/src/react/components/EventBus';

const mockFetch = jest.fn();
let mockScope;
let mockAuth;
jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: (...args) => mockFetch(...args)}}));
jest.mock('@controleonline/ui-products/src/react/utils/catalogCacheScope', () => ({
  getCatalogCacheScope: async () => mockScope,
}));
jest.mock('@controleonline/ui-products/src/react/utils/catalogCacheStorage', () => ({
  readCatalogStorage: async () => null, writeCatalogStorage: async () => {}, clearCatalogStorage: async () => {},
}));
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockAuth = {user: {id: 1}, isLogged: true};
  mockScope = 'principal1:session1:device1:revision1';
  mockFetch.mockReset().mockResolvedValue({totalItems: 9});
  eventBus.emit('product-catalog-cache:cleared');
});
it('reuses authoritative category totals for identical reads within freshness', async () => {
  expect(await fetchCategoryProductCount(276, 3, 'products')).toBe(9);
  mockFetch.mockResolvedValue({totalItems: 12});
  expect(await fetchCategoryProductCount(276, 3, 'products')).toBe(9);
  expect(mockFetch).toHaveBeenCalledTimes(1);
});
it('isolates category, company, context, security identity and catalog revision', async () => {
  await fetchCategoryProductCount(276, 3, 'products');
  await fetchCategoryProductCount(281, 3, 'products');
  await fetchCategoryProductCount(276, 4, 'products');
  await fetchCategoryProductCount(276, 3, 'supplies');
  mockScope = 'principal2:session2:device2:revision1';
  await fetchCategoryProductCount(276, 3, 'products');
  mockScope = 'principal2:session2:device2:revision2';
  await fetchCategoryProductCount(276, 3, 'products');
  expect(mockFetch).toHaveBeenCalledTimes(6);
});
it('expires totals and respects explicit catalog invalidation', async () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(100000);
  try {
    await fetchCategoryProductCount(276, 3, 'products');
    now.mockReturnValue(160001);
    await fetchCategoryProductCount(276, 3, 'products');
    eventBus.emit('product-catalog-cache:cleared');
    await fetchCategoryProductCount(276, 3, 'products');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  } finally { now.mockRestore(); }
});
it('does not reuse unscoped reads or publish a response after the identity changes', async () => {
  mockScope = null;
  await fetchCategoryProductCount(276, 3, 'products');
  await fetchCategoryProductCount(276, 3, 'products');
  expect(mockFetch).toHaveBeenCalledTimes(2);
  mockScope = 'principal1';
  mockFetch.mockImplementationOnce(async () => {mockScope = 'principal2'; return {totalItems: 99};});
  await expect(fetchCategoryProductCount(276, 3, 'products')).rejects.toThrow();
  mockFetch.mockResolvedValue({totalItems: 12});
  expect(await fetchCategoryProductCount(276, 3, 'products')).toBe(12);
});
it('rejects an aborted caller even when a matching total is already cached', async () => {
  await fetchCategoryProductCount(276, 3, 'products');
  const controller = new AbortController(); controller.abort();
  await expect(fetchCategoryProductCount(276, 3, 'products', controller.signal)).rejects.toMatchObject({name: 'AbortError'});
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

it('never caches failed or cancelled network responses and allows explicit retry', async () => {
  mockFetch.mockRejectedValueOnce(new Error('offline'));
  await expect(fetchCategoryProductCount(276, 3, 'products')).rejects.toThrow('offline');
  const controller = new AbortController();
  mockFetch.mockImplementationOnce(async () => {controller.abort(); return {totalItems: 99};});
  await expect(fetchCategoryProductCount(276, 3, 'products', controller.signal)).rejects.toMatchObject({name: 'AbortError'});
  expect(await fetchCategoryProductCount(276, 3, 'products')).toBe(9);
  mockFetch.mockResolvedValue({totalItems: 12});
  expect(await fetchCategoryProductCount(276, 3, 'products', undefined, true)).toBe(12);
  expect(await fetchCategoryProductCount(276, 3, 'products')).toBe(12);
  expect(mockFetch).toHaveBeenCalledTimes(4);
});

it.each(['principal', 'session', 'device', 'revision'])('isolates a changed %s inside the canonical security scope', async dimension => {
  await fetchCategoryProductCount(276, 3, 'products');
  mockScope = `principal1:session1:device1:revision1:${dimension}-changed`;
  mockFetch.mockResolvedValue({totalItems: 12});
  expect(await fetchCategoryProductCount(276, 3, 'products')).toBe(12);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
it('restores counts after remount and discards visible counts on a same-company account switch', async () => {
  let result, tree;
  function Probe() {
    result = useCounts({categories: [{id: 276}], companyId: 3, context: 'products', enabled: true});
    return null;
  }
  try {
    await act(async () => {tree = renderer.create(React.createElement(Probe));});
    expect(result.counts).toEqual({__all_products__: 9, 276: 9});
    act(() => tree.unmount()); tree = null;
    await act(async () => {tree = renderer.create(React.createElement(Probe));});
    expect(mockFetch).toHaveBeenCalledTimes(2);
    mockAuth = {user: {id: 2}, isLogged: true}; mockScope = 'principal2';
    mockFetch.mockResolvedValue({totalItems: 12});
    await act(async () => {tree.update(React.createElement(Probe));});
    expect(result.counts).toEqual({__all_products__: 12, 276: 12});
    expect(mockFetch).toHaveBeenCalledTimes(4);
  } finally { if (tree) act(() => tree.unmount()); }
});
