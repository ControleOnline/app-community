

### ### ### MÓDULOS / ARQUIVOS HARDCODED ### ### ###

### ui-accountig

### ui-carrier

### ui-login

### ui-shop

- `src/react/components/ShopToolbar.styles.js`
- linhas `4-26`: toolbar usa `backgroundColor`, `borderTopColor`, `buttonText.color` hardcoded e `activeText.color` com `colors?.primary || '#28B34B'`
- `src/react/pages/home/index.js`
- linha `26`: `ActivityIndicator.color` usa `colors?.primary || '#28B34B'`
- `src/react/pages/home/index.styles.js`
- linhas `24-41`: textos de loading usam `#fff` e `#333`
- `src/react/components/storefront/ShopShell.styles.js`
- linhas `64-241`, `390-459`: header, menu, busca, overlays e sombras usam `rgba(...)`, `#fff`, `#000`, `#2B3A4A`, `#d7dee8`
- `src/react/components/storefront/ShopShell.js`
- linhas `380-408`: icones e placeholder da busca usam `#fff` e `rgba(255,255,255,...)`
- `src/react/components/storefront/ShopHomeEntryControls.js`
- linhas `55-103`, `188-280`: controle de entrada usa overlays brancos com alpha, `#FFFFFF`, `#F0FDFA`, `#99F6E4`, `#0F766E`, `#D7E1EC` e sombra fixa
- `src/react/components/storefront/ShopPaymentBar.styles.js`
- linhas `18-127`: barra de pagamento usa varios fallbacks hardcoded em `theme?.* || '#...'` e `shadowColor: '#0F172A'`
- `src/react/components/storefront/ShopNativeMap.styles.js`
- linhas `4-120`: mapa nativo usa hardcodes de fundo, overlay, callout, textos, bordas e CTA
- `src/react/components/storefront/ShopGoogleMap.styles.js`
- linha `7`: fundo do mapa usa `#E5EEF5`
- `src/react/components/storefront/ShopMobileCategorySelector.styles.js`
- linha `34`: overlay do seletor usa `rgba(15, 23, 42, 0.38)`
- `src/react/components/storefront/ShopMobileStoreHeader.styles.js`
- linha `36`: `shadowColor` fixo em `#0F172A`
- `src/react/components/storefront/ShopBottomCart.styles.js`
- linhas `21`, `64`: `shadowColor` e fundo com alpha fixos
- `src/react/components/storefront/ShopCartAside.styles.js`
- linhas `16`, `95`: bordas transparentes fixas em `#00000000`
- `src/react/components/storefront/ShopProductCard.styles.js`
- linhas `16`, `76`: `shadowColor` fixo em `#0F172A` e `#000`
- `src/react/components/storefront/ShopFeatureState.js`
- linhas `26-29`: `iconWrap` usa `#EFF6FF` e `#BFDBFE`
- `src/react/components/storefront/ShopQuantityControl.js`
- linhas `43`, `251-273`: controle usa `iconColor = '#1f95c6'`, `#FFFFFF`, `#fff` e transparencia fixa no icone
- `src/react/pages/ShopLoyaltyPage.js`
- linhas `425-431`: hero usa `#FFFFFF` e `rgba(255,255,255,0.78)`
- `src/react/pages/ShopDownloadPage.js`
- linha `292`: `primaryButtonText.color` usa `#ffffff`
- `src/react/pages/ShopFranchiseLocatorPage.js`
- linha `464`: `mapViewport.backgroundColor` usa `#E5EEF5`
- `src/react/pages/CardsPage.styles.js`
- linha `307`: texto usa `#fff`
- `src/react/pages/CardsPage.js`
- linhas `463`, `634`: chip e spinner usam `#fff`
- `src/react/pages/CartPage.styles.js`
- linhas `90`, `148`, `413`: textos usam `#fff`
- `src/react/pages/CheckoutPage.styles.js`
- linhas `53-580`: modal, inputs, cards e botoes usam `rgba(...)`, `#F8FAFC`, `#EFF6FF`, `#FFFFFF`, `#fff`
- `src/react/pages/CheckoutPage.js`
- linhas `1729`, `1745`, `1886`, `2415`: textos de CTA usam `#FFFFFF`
- `src/react/pages/OrdersPage.styles.js`
- linhas `103`, `187`: textos usam `#fff`

### ### ### MÓDULOS / ARQUIVOS PENDENTES ### ### ###

### ui-accountig

### ui-carrier

### ui-login

- `src/react/pages/sign-in/index.js`
- linha `504`: prop `transparent` do `Modal` continua fixa; precisa validar se este caso sai do fluxo por ser estrutural do componente ou se deve permanecer rastreado separadamente

### ui-shop

- `src/react/components/storefront/ShopShell.js`
- linha `432`: prop `transparent` do `Modal` continua fixa; validar se segue o mesmo tratamento estrutural do `ui-login`
- `src/react/components/storefront/ShopMobileCategorySelector.js`
- linha `133`: prop `transparent` do `Modal` continua fixa; validar se segue o mesmo tratamento estrutural do `ui-login`
- `src/react/pages/CheckoutPage.js`
- linhas `2249`, `2328`: props `transparent={true}` dos `Modal` continuam fixas; validar se seguem o mesmo tratamento estrutural do `ui-login`


### ### ### MÓDULOS / ARQUIVOS PAI/FILHO ### ### ###

### ui-accountig

### ui-carrier

### ui-login

### ui-shop
