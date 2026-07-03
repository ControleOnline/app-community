
### ### ### MÓDULOS / ARQUIVOS CORRIGIDOS ### ### ###

### ui-accountig

### ui-carrier

### ui-login

- `src/react/pages/sign-in/index.styles.js`
- linhas `1-235`: arquivo base normalizado para usar `createStyles(resolveSignInTheme(theme.colors))`
- trocas aplicadas com tokens oficiais e novos: `background`, `textSecondary`, `inputBackground`, `inputFilledBorder`, `inputErrorBorder`, `inputErrorBackground`, `inputText`, `buttonBackground`, `buttonShadow`, `buttonText`, `dividerBackground`, `dividerText`, `buttonBackgroundSecondary`, `buttonBorderSecondary`, `buttonDisabledOpacity`, `buttonIconSecondary`, `buttonTextSecondary`, `linkText`, `modalOverlay`, `modalBackground`, `modalHeaderText`, `inputBorder`, `overlayBackground`, `containerTransparentBackground`
- `src/react/pages/sign-in/index.js`
- linhas `377-543`: arquivo normalizado para usar `theme` derivado de `resolveSignInTheme(theme.colors)`
- trocas aplicadas com tokens oficiais e novos: `background`, `inputIcon`, `inputPlaceholderText`, `buttonText`, `buttonTextSecondary`, `modalCloseIcon`
- `src/react/pages/reset-password/index.js`
- linhas `145-303`: arquivo normalizado para usar `signInTheme` e `createPageStyles(signInTheme)`
- trocas aplicadas com tokens oficiais e novos: `background`, `inputIcon`, `inputPlaceholderText`, `buttonText`, `headerText`, `error`
- `src/react/pages/confirm-account/index.js`
- linhas `145-237`: arquivo normalizado para usar `signInTheme` e `createPageStyles(signInTheme)`
- trocas aplicadas com tokens oficiais e novos: `background`, `loadingSpinner`, `headerText`, `textSecondary`
- `src/react/pages/create-account/index.styles.js`
- linhas `1-93`: arquivo normalizado para usar `createStyles(resolveSignInTheme(theme.colors))`
- trocas aplicadas com tokens oficiais e novos: `inputBackground`, `inputBorder`, `buttonBackground`, `buttonDisabledText`, `buttonText`
- `src/react/pages/create-account/index.js`
- linha `381`: spinner de carregamento trocado para `buttonText`

### ui-shop

- `src/react/utils/shop.js`
- linhas `1-169`: tema base do shop normalizado para nascer de `themeStore.getters.colors` via `useShopTheme()` e `pickTheme(themeColors)`
- trocas aplicadas com tokens oficiais e novos: `primary`, `accent`, `success`, `danger`, `buttonBackgroundSecondary`, `buttonIcon`, `buttonText`, `background`, `surface`, `textPrimary`, `textSecondary`, `cardBorder`, `darkCard`, `darkBorder`
- `src/react/hooks/useShopCatalogState.js`
- linha `127`: hook passou a consumir `useShopTheme()` em vez de `pickTheme(defaultCompany)`
- `src/react/components/storefront/ShopCategorySidebar.js`
- linhas `1-140`: icone e spinner deixaram de usar `company?.theme?.colors?.primary` e passaram a usar `theme.primary` vindo do tema resolvido
- `src/react/pages/ProductPage.js`
- linhas `43-122`: removida a injecao local de `text-primary` e `text-secondary`; pagina passou a usar `useShopTheme()`
- `src/react/pages/ShopCatalogPage.js`
- linhas `20-82`: removida a injecao local de `text-primary` e `text-secondary`; pagina passou a usar o `theme` vindo de `useShopCatalogState()`
- `src/react/components/storefront/ShopShell.js`
- linha `145`: shell principal passou a usar `useShopTheme()` no lugar de `pickTheme(salesCompany || defaultCompany)`
- `src/react/components/storefront/ShopMobileCatalog.js`
- linhas `18-62`: catalogo mobile passou a usar `useShopTheme()` e skeletons ligados ao tema resolvido
- `src/react/components/storefront/ShopMobileCategorySelector.js`
- linha `53`: seletor mobile passou a usar `useShopTheme()`
- `src/react/components/storefront/ShopMobileStoreHeader.js`
- linha `75`: cabecalho mobile passou a usar `useShopTheme()`
- `src/react/components/storefront/ShopProductsSection.js`
- linhas `10-161`: secao de produtos passou a usar `useShopTheme()` e propagar o tema resolvido para estilos e skeletons
- `src/react/components/storefront/ShopCategoryHero.js`
- linhas `4-105`: hero de categoria passou a propagar o tema resolvido para os estilos
- `src/react/pages/ProfilePage.styles.js`
- linhas `5-204`: acoes principais da tela foram alinhadas ao padrao azul usando `buttonBackground` e `buttonText`, e o avatar fallback deixou de usar `#fff` fixo
- `src/react/pages/ProfilePage.js`
- linhas `134-145`: e-mail na area superior do perfil passou a exibir icone de carta usando `buttonIcon`
- `src/react/components/storefront/ShopQuantityControl.js`
- linhas `42-293`: controle de quantidade passou a receber azul semantico via `buttonIcon`, branco semantico via `buttonText` e fundo claro via `buttonBackgroundSecondary`
- `src/react/pages/ProductPage.js`
- linhas `438-444, 527-533`: `ShopQuantityControl` deixou de receber `theme.primary` e passou a receber `buttonIcon`, `buttonText` e `buttonBackgroundSecondary`
- `src/react/pages/CartPage.js`
- linhas `383-396`: `ShopQuantityControl` do carrinho deixou de receber `theme.primary` e passou a receber `buttonIcon`, `buttonText` e `buttonBackgroundSecondary`
- `src/react/components/storefront/ShopProductCard.js`
- linhas `158-166`: card desktop passou a propagar `buttonIcon`, `buttonText` e `buttonBackgroundSecondary` para o controle de quantidade
- `src/react/components/storefront/ShopMobileProductCard.js`
- linhas `121-127`: card mobile passou a propagar `buttonIcon`, `buttonText` e `buttonBackgroundSecondary` para o controle de quantidade
- `src/react/components/storefront/ShopSalesCompanySelector.js`
- linha `107`: icone de telefone passou de `theme.primary` para `theme.buttonIcon`

### ui-people

- `src/react/pages/Profile.js`
- linhas `464-1184`: tela de perfil passou a resolver `iconColor` e `iconText` a partir de `themeStore.getters.colors` para os icones `+`, telefone e carta
- `src/react/css/people.js`
- linha `148`: botao `+` passou de `buttonBackground` para `iconText`
- `src/react/pages/Profile.js`
- linhas `489-1162`: telefone e carta passaram a usar `iconColor`, enquanto o `+` voltou a usar `buttonBackground` e `buttonText`
- `src/react/css/people.js`
- linha `148`: botao `+` voltou a usar `buttonBackground`
- `src/react/pages/Profile.js`
- linhas `489-1227`: telefone e carta passaram a ser tratados como `cardIcon`, com fallback para `iconColor` enquanto o token novo nao estiver no banco
- `src/react/pages/Profile.js`
- linhas `489-1237`: `X` da lista passou a ser tratado como `iconColor` e `iconText`, sem criar `iconDanger`
- `src/react/pages/Profile.js`
- linhas `1318-1327`: icone de lapis/check do perfil passou a seguir o padrao dos outros icones da tela usando `cardIcon`
- `src/react/css/people.js`
- linhas `76-121` e `179-184`: botoes auxiliares do lapis passaram a ter fundo transparente, e o `X` passou a ganhar fundo de `iconColor`
- `src/react/pages/Profile.js`
- linhas `1398-1410`: botao de sair passou a usar o mesmo tratamento de `buttonBackground` e `buttonText` dos botoes de configurar e sincronizar
- `src/react/css/people.js`
- linhas `209-265`: estilos dedicados de logout em vermelho foram removidos para reutilizar `profileActionButton` e `profileActionButtonText`
- `src/react/pages/Profile.js`
- linhas `467-1148`: seletor de fuso horario passou a tratar `dropdown` como `select` e a consumir `selectBackground`, `selectBorder`, `selectIcon` e `selectText`
- `../ui-default/src/react/components/filters/CompactFilterSelector.js`
- linhas `1-214`: componente passou a aceitar `themeColors` semantico para normalizar o visual de `select`
