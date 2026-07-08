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
