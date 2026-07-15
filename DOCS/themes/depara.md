### ### ### DE PARA ### ### ###

Formato:
- `módulo / arquivo / linha`
- `antigo: variável, cor`
- `novo: variável, cor`

- `ui-login / src/react/pages/sign-in/index.styles.js / 1-41`
- `antigo: resolveThemePalette(themeColors, colors) + fallbacks locais, varios conteudos hardcoded`
- `novo: resolveThemePalette(themeColors, {}) + tokens vindos somente de themeColors`

- `ui-login / src/react/pages/sign-in/index.js / 234, 371-390`
- `antigo: fallbackLogo local + background visual com brandCompany?.theme?.background || brandCompany?.background`
- `novo: logo remota somente via brandCompany.logo e sem background por imagem`

- `ui-login / src/react/pages/reset-password/index.js / 77, 144-166`
- `antigo: fallbackLogo local + background visual com brandCompany?.theme?.background || brandCompany?.background`
- `novo: logo remota somente via brandCompany.logo e sem background por imagem`

- `ui-login / src/react/pages/confirm-account/index.js / 72, 144-164`
- `antigo: fallbackLogo local + background visual com brandCompany?.theme?.background || brandCompany?.background`
- `novo: logo remota somente via brandCompany.logo e sem background por imagem`

- `ui-manager / src/react/pages/FinancialHubPage.js / 36-179`
- `antigo: resolveThemePalette(themeTokens, colors), currentCompany.theme e fallbacks locais`
- `novo: palette vinda diretamente de themeStore.getters.colors com tokens canônicos e sem fallback`

- `ui-manager / src/react/pages/FinancialHubPage.styles.js / 1-64`
- `antigo: createStyles baseado em colors e chip com base visual padrão`
- `novo: createStyles baseado em palette do tema ativo, sem cores hardcoded`

- `ui-manager / src/react/pages/ThemeManagerPage.js / 280-323, 1410-1495`
- `antigo: listItem sem campos próprios para linhas pares e impares`
- `novo: listItemOddRow e listItemEvenRow adicionados ao mapa do tema e ao editor fixo`

- `ui-manager / src/react/pages/ThemeManagerPage.js / 1922-2038, 2620-2800`
- `antigo: editor de cor mostrava apenas HEX e listagem sem rgba`
- `novo: editor aceita rgb/rgba no paste, mostra rgba nos cards e traz tooltip ampliada no HEX`

- `ui-default / src/react/components/table/DefaultTable.js / 475-476, 1356`
- `antigo: zebra da tabela dependia apenas de bg-odd-light e bg-even-light`
- `novo: zebra da tabela prioriza listItemOddRow e listItemEvenRow`

- `ui-contracts / src/react/theme/contractsTheme.js / 1-120`
- `antigo: status aberto=#3B82F6, ativo=#4CAF50, inativo=#F44336, pendente=#FF9800, fechado=#64748B espalhados no modulo`
- `novo: getContractsStatusColor(palette, status) usando info, success, error, warning e textMuted do tema`

- `ui-contracts / src/react/components/contracts.js / 18-179`
- `antigo: Icon color="#666", ActivityIndicator color="#2529a1", empty/error com "#CCCCCC" e "#F44336"`
- `novo: icones, loading e estados vazios usando palette.listItemIcon, palette.loadingSpinner, palette.iconDisabled e palette.iconDanger`

- `ui-contracts / src/react/components/contracts.styles.js / 1-169`
- `antigo: backgroundColor '#F8F9FA', '#FFFFFF', border '#E9ECEF', botao '#2529a1', textos '#212529' e '#6C757D'`
- `novo: createStyles(palette) com pageBackground, cardBackground, headerBorder, buttonBackground, cardText e textMuted`

- `ui-contracts / src/react/components/CreateContractModal.js / 50-601`
- `antigo: close '#666666', destaque '#2529a1', sucesso '#4CAF50', vazio '#CCCCCC', placeholder '#999999'`
- `novo: modal consumindo palette.modalCloseIcon, palette.iconInfo, palette.iconSuccess, palette.iconDisabled e palette.selectPlaceholderText`

- `ui-contracts / src/react/components/CreateContractModal.styles.js / 1-253`
- `antigo: modal '#FFFFFF', overlay 'rgba(0,0,0,0.5)', bordas '#E9ECEF', CTA '#007BFF', disabled '#94A3B8'`
- `novo: createStyles(palette) com modalBackground, modalOverlay, modalBorder, buttonBackground e buttonDisabledBackground`

- `ui-contracts / src/react/pages/ContractsPage.js / 29-652`
- `antigo: colors.js, chips '#DCE3EC/#F8FAFC/#E7F3FF', placeholder '#94A3B8', vazio '#bdc3c7', erro '#e74c3c'`
- `novo: palette do tema ativo com chipBorder, chipBackground, chipSelectedBackground, inputPlaceholderText, iconDisabled e iconDanger`

- `ui-contracts / src/react/pages/ContractsPage.styles.js / 1-219`
- `antigo: cards '#fff', shadow '#0F172A', skeleton '#E2E8F0', textos '#212529/#94A3B8'`
- `novo: createStyles(palette) com cardBackground, cardShadow, loadingBorder, cardText e textDisabled`

- `ui-contracts / src/react/pages/ContractDetails.js / 19-608`
- `antigo: back/acoes usando colors.primary e '#fff', picker '#64748b', status baseado em contract.status.color`
- `novo: detalhes usando palette.navigationActiveIcon, palette.buttonIcon, palette.selectIcon e status resolvido por getContractsStatusColor`

- `ui-contracts / src/react/pages/ContractDetails.styles.js / 1-321`
- `antigo: page '#f8fafc', header '#fff', tabs '#64748b', listagem '#e2e8f0', disabled '#cbd5e1'`
- `novo: createStyles(palette) com pageBackground, headerBackground, navigationText, listItemBorder e buttonDisabledBackground`

- `app-community / src/styles/branding.js / 142-155`
- `antigo: resolveThemePalette derivava footerBackground, footerBorder, footerIcon, footerLink e footerText a partir de background, border, primary e accent`
- `novo: resolveThemePalette nao deriva tokens de footer e deixa o componente depender apenas do token presente no tema`

- `ui-common / src/react/components/BottomNavigationBar.js / 21-29, 49-85, 117-156`
- `antigo: navegacao inferior usava footer* e herdava azul por footerLink vindo da palette`
- `novo: navegacao inferior usa navigationBackground, navigationBorder, navigationIcon, navigationText, navigationActiveBackground, navigationActiveBorder, navigationActiveIcon e navigationActiveText sem fallback`

- `ui-common / src/react/components/BottomNavigationBar.styles.js / 3-83`
- `antigo: withAlpha calculava o destaque localmente e a sombra herdava cor local`
- `novo: estilo usa navigationBackground, navigationBorder, navigationShadow, navigationActiveBackground e navigationActiveBorder sem derivacao local`

- `ui-common / src/react/components/RuntimeInfoFooter.js / 112-166`
- `antigo: backgroundColor=colors?.background || runtimeColors.background, borderColor=colors?.border || runtimeColors.border, textColor=colors?.textSecondary || runtimeColors.textSecondary, loadingColor=colors?.primary || runtimeColors.primary || textColor e socketEntry.indicatorColor hardcoded`
- `novo: backgroundColor=colors?.footerBackground, borderColor=colors?.footerBorder, textColor=colors?.footerText, loadingColor=colors?.footerLink e socketEntry.indicatorTone resolvido por colors.success / colors.warning / colors.error`

- `ui-common / src/react/utils/socketRuntimePipeline.js / 107-127`
- `antigo: indicatorColor '#10b981' / '#e67e22' / '#c10015'`
- `novo: indicatorTone 'success' / 'warning' / 'error'`

- `ui-common / src/react/components/WebsocketListener.native.js / 77-93`
- `antigo: indicatorColor '#10b981' / '#e67e22' / '#c10015'`
- `novo: indicatorTone 'success' / 'warning' / 'error'`

- `ui-common / src/react/components/DefaultProvider.web.js / 887-892`
- `antigo: colors={resolveThemePalette(colors, runtimeColors)}`
- `novo: colors={colors}`

- `ui-common / src/react/components/DefaultProvider.native.js / 820-825`
- `antigo: colors={resolveThemePalette(colors, runtimeColors)}`
- `novo: colors={colors}`

- `ui-orders / src/react/components/OrderHeader.js / 4-24, 64-108, 154-360`
- `antigo: WAITING_RULES '#10b981/#FACC15/#c10015', truck '#D97706', repeat '#7C3AED', trending-down '#DC2626', calendar '#475569' e badge preso a status.color`
- `novo: palette do tema ativo com textSuccess, textWarning, textDanger, textMuted, iconInfo, iconWarning, iconDanger e chipText para waiting chip, icones e badge semantico`

- `ui-orders / src/react/components/OrderHeader.styles.js / 1-257`
- `antigo: backgroundColor '#F8FAFC', border '#E2E8F0/#CBD5E1', textos '#0F172A/#475569/#64748B' e preco '#16A34A/#D97706/#7C3AED/#DC2626'`
- `novo: createStyles(palette, isKds) com chipBackground, chipBorder, chipSelectedBackground, chipSelectedBorder, chipSelectedText, cardText, textMuted, textSuccess, textWarning e textDanger`

- `ui-orders / src/react/pages/orders/OrderHistoryPage.js / 91-99, 173-177, 637-666`
- `antigo: styles importavam objeto estatico e o contexto visual do card nao lia tokens semanticos do themeStore`
- `novo: buildOrderHistoryPalette(themeColors) e createStyles(orderHistoryPalette) para o card renderer e fundo da tela`

- `ui-orders / src/react/pages/orders/OrderHistoryPage.styles.js / 1-69`
- `antigo: orderCard '#fff', shadow '#0F172A', cardMetaRow '#F1F5F9' e channelText '#475569'`
- `novo: createStyles(palette) com cardBackground, cardBorder, cardShadow, dividerBorder e textSecondary`

- `ui-people / src/react/pages/People.js / 36-154, 238-261`
- `antigo: renderClientCard usava '#CBD5E1' no chevron e dependia de styles com card/avatar/textos fora dos tokens canonicos`
- `novo: palette vinda de themeStore.getters.colors com cardBackground, cardBorder, cardShadow, cardIcon, iconInverse, listItemText, listItemSubtitleText e listItemIcon aplicada no renderClientCard`

- `ui-people / src/react/pages/People.styles.js / 76-114, 144`
- `antigo: card, avatar e textos do renderClientCard traziam '#fff', '#F1F5F9', '#64748B', '#1E293B' e '#94A3B8' no style estatico`
- `novo: styles preservam apenas layout/espacamento do card e deixam as cores do renderClientCard entrarem pela palette do tema ativo`
