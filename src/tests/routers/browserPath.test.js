const {jest} = require('@jest/globals')

const {describe, expect, it} = global

const {
  getCurrentBrowserPath,
  normalizeInitialBrowserPath,
  normalizeProductDetailsTabPath,
} = require('../../routers/browserPath')

describe('browserPath', () => {
  it('normalizes product detail tab paths to the canonical product route', () => {
    expect(
      normalizeProductDetailsTabPath('/product-details/123/Dados?foo=1#bar'),
    ).toBe('product-details/123?foo=1#bar')

    expect(
      normalizeProductDetailsTabPath('/product-details/123/Vendas?foo=1#bar'),
    ).toBe('product-details/123?foo=1#bar')
  })

  it('normalizes legacy shop product paths to the shop route', () => {
    expect(
      normalizeProductDetailsTabPath('/product/381/details?companyId=1#info'),
    ).toBe('shop/product/381?companyId=1#info')
  })

  it('does not touch history when browser location is unavailable', () => {
    const replaceState = jest.fn()

    expect(getCurrentBrowserPath({})).toBeNull()
    expect(
      normalizeInitialBrowserPath({
        history: {
          replaceState,
          state: {key: 'state'},
        },
      }),
    ).toBe(false)
    expect(replaceState).not.toHaveBeenCalled()
  })

  it('replaces browser history with the normalized path when location exists', () => {
    const replaceState = jest.fn()

    expect(
      normalizeInitialBrowserPath({
        location: {
          pathname: '/product-details/123/Dados',
          search: '?foo=1',
          hash: '#bar',
        },
        history: {
          replaceState,
          state: {key: 'state'},
        },
      }),
    ).toBe(true)
    expect(replaceState).toHaveBeenCalledWith(
      {key: 'state'},
      '',
      '/product-details/123?foo=1#bar',
    )
  })
})
