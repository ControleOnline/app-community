const PRODUCT_DETAILS_TAB_PATH_REGEX =
  /^\/?product-details\/([^/?#]+)\/(?:Dados|Fornecedores|Insumos|Grupos|Estoque|Vendas)([?#].*)?$/i
const LEGACY_SHOP_PRODUCT_PATH_REGEX =
  /^\/?product\/([^/?#]+)\/details([?#].*)?$/i

export const normalizeProductDetailsTabPath = path => {
  const normalizedPath = String(path || '')
  const productDetailsTabMatch = normalizedPath.match(PRODUCT_DETAILS_TAB_PATH_REGEX)

  if (productDetailsTabMatch?.[1]) {
    return `product-details/${productDetailsTabMatch[1]}${productDetailsTabMatch[2] || ''}`
  }

  const legacyShopProductMatch = normalizedPath.match(LEGACY_SHOP_PRODUCT_PATH_REGEX)

  if (legacyShopProductMatch?.[1]) {
    return `shop/product/${legacyShopProductMatch[1]}${legacyShopProductMatch[2] || ''}`
  }

  return normalizedPath
}

export const getCurrentBrowserPath = currentWindow => {
  const location = currentWindow?.location

  if (!location || typeof location.pathname !== 'string') {
    return null
  }

  return `${location.pathname}${location.search || ''}${location.hash || ''}`
}

export const normalizeInitialBrowserPath = currentWindow => {
  const currentPath = getCurrentBrowserPath(currentWindow)

  if (!currentPath) {
    return false
  }

  const normalizedPath = normalizeProductDetailsTabPath(currentPath)
  const nextPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`

  if (nextPath === currentPath) {
    return false
  }

  const history = currentWindow?.history

  if (typeof history?.replaceState !== 'function') {
    return false
  }

  // Native runtimes may expose window without browser navigation primitives.
  history.replaceState(history.state, '', nextPath)
  return true
}
