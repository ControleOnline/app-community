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

- `app-community / DOCS/themes/themes-map.md / 88-102, 151-163`
- `antigo: mapa canônico sem tokens específicos para fundo de wrapper de ícone dentro e fora de card`
- `novo: mapa canônico com cardIconBackground e iconBackground`

- `app-community / DOCS/themes/themes-new.md / 75-83, 121-129`
- `antigo: proposta consolidada ainda nao trazia cardIconBackground e iconBackground`
- `novo: proposta consolidada passa a registrar cardIconBackground e iconBackground`

- `app-community / src/styles/colors.js / 6-19`
- `antigo: defaults locais nao expunham iconBackground e cardIconBackground e liam CSS vars com nome diferente do runtime`
- `novo: defaults locais passam a expor iconBackground e cardIconBackground usando os mesmos nomes de CSS var aplicados pelo runtime`

- `app-community / src/styles/branding.js / 142-164`
- `antigo: resolveThemePalette nao promovia iconBackground e cardIconBackground vindos do tema ativo`
- `novo: resolveThemePalette promove iconBackground/icon-background e cardIconBackground/card-icon-background do tema ativo para a palette final`

- `ui-default / src/react/components/errors/DefaultErrors.js / 36-107, 185-334`
- `antigo: modal de erro usava pickThemeColor com fallback '#DC2626', '#FFFFFF', 'rgba(15, 23, 42, 0.55)', '#B91C1C', '#334155' e botao retry com fundo transparente local`
- `novo: modal usa somente inputErrorBorder, inputErrorText, modalBackground, modalBorder, modalOverlay, modalText, modalCloseIcon, buttonBackground, buttonBorder e buttonText vindos de themeStore.getters.colors`

- `ui-default / src/react/components/form/DefaultForm.js / 57-84, 162-209`
- `antigo: form dependia de accentColor='#2563EB' e aplicava o botao primario por prop local, sem palette canônica do tema`
- `novo: form monta palette com buttonBackground, buttonBackgroundSecondary, buttonBorderSecondary, buttonDisabledBackground, buttonDisabledText, buttonText, buttonTextSecondary, dividerBorder e textSecondary vindos de themeStore.getters.colors`

- `ui-default / src/react/components/form/DefaultForm.styles.js / 3-75`
- `antigo: emptyText '#64748B', actions '#E2E8F0', secondaryButton '#CBD5E1/#FFFFFF/#334155', primaryButtonText '#FFFFFF' e disabled opacity 0.62`
- `novo: styles usam textSecondary, dividerBorder, buttonBorderSecondary, buttonBackgroundSecondary, buttonTextSecondary, buttonDisabledBackground, buttonDisabledText e buttonText`

- `ui-manager / src/react/pages/PdvPage.js / 12-87`
- `antigo: headerRight da liquidacao com borderColor '#BFDBFE', backgroundColor '#EFF6FF' e icon/text '#0369A1'`
- `novo: headerRight da liquidacao com buttonBackgroundSecondary, buttonBorderSecondary, buttonIconSecondary e buttonTextSecondary vindos de themeStore.getters.colors`

- `ui-manager / src/react/pages/ConfiguratorPage.js / 12-169`
- `antigo: hero e cards do configurador dependiam de style estatico com palette local baseada em colors.js, usando primary/text/white como fonte final e icones sem seguir o mapa cardIcon/iconColor`
- `novo: configurador resolve a palette da empresa ativa e aplica cardIconBackground no fundo do wrapper interno e iconColor na cor do icone, preservando cardBackground, cardBorder, cardText e mutedText`

- `ui-manager / src/react/pages/ConfiguratorPage.styles.js / 1-119`
- `antigo: hero, cards e textos usavam colors.js e opacidades locais como cor final do componente`
- `novo: createStyles(palette) recebe a palette resolvida pela tela e usa apenas tokens semanticos como actionBackground, actionText, cardBackground, cardBorder, cardIconBackground, cardText e mutedText`

- `ui-layout / src/react/components/AppMenuGrid.js / 15-136`
- `antigo: grid de menus calculava cor/fundo do icone com variacao local por modulo e transparencia derivada por withAlpha`
- `novo: grid de menus usa iconBackground no wrapper fora de card, cardIconBackground no wrapper dentro de card e iconColor na cor do icone`

- `ui-layout / src/react/components/AppMenuGrid.styles.js / 3-116`
- `antigo: sectionIcon e cardIcon usavam withAlpha(actionText, ...) para gerar fundo translúcido local`
- `novo: sectionTone usa iconBackground e segmentTone usa cardIconBackground, sem transparencia local`

- `ui-manager / src/react/pages/home/index.js / 50-68`
- `antigo: mutedText vinha de withOpacity(text, 0.68), statIconBackground de withOpacity(actionText, 0.7) e os icones dos cards usavam actionBackground`
- `novo: mutedText vem de textMuted/textSecondary do tema, wrappers internos usam cardIconBackground e os icones usam iconColor`

- `ui-manager / src/react/pages/home/index.styles.js / 4-14, 70-107`
- `antigo: home usava withOpacity no boxShadow web, no actionSub e no fundo do icone estatistico`
- `novo: home usa cardShadow/buttonShadow do tema para sombra web e cardIconBackground no fundo dos wrappers de icone internos`

- `ui-manager / src/react/pages/ThemeManagerPage.js / 220-303`
- `antigo: editor de tema nao listava cardIconBackground e iconBackground`
- `novo: editor de tema lista cardIconBackground no grupo card e iconBackground no grupo icon`

- `ui-manager / src/react/pages/ThemePreviewPage.js / 74-94`
- `antigo: preview default nao tinha cardIconBackground e iconBackground`
- `novo: preview default registra cardIconBackground e iconBackground`

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

- `ui-products / src/react/components/products/ProductItem.js / 14-72, 128-223, 235-514`
- `antigo: PRODUCT_TYPE_CONFIG com color/bg hardcoded por tipo, preco verde local e acao do card dependente de seletor com vermelho/verde/cinza hardcoded`
- `novo: chips de tipo, preco e acao do card resolvidos por chipSelectedBackground, chipSelectedText, buttonBackgroundSecondary, buttonTextSecondary, chipBackground, textWarning, textSuccess, textMuted, iconDisabled e buttonBackground/buttonText`

- `ui-products / src/react/pages/Products.js / 1110-1133, 1191-1215`
- `antigo: atalhos e cabecalhos por tipo reutilizavam bg/color hardcoded do PRODUCT_TYPE_CONFIG e ainda aplicavam borda com opacidade local`
- `novo: atalhos e cabecalhos por tipo usam resolveProductTypeTheme com tokens canonicos do tema, sem hex e sem opacidade local`

- `ui-orders / src/react/components/cart/ProductTotem.js / 31-74, 202-221`
- `antigo: radio-button-unchecked vermelho, check-circle verde e label '#666'`
- `novo: seletor usa iconDisabled, iconSuccess e textMuted vindos da palette de tema recebida pelo card`

- `ui-orders / src/react/pages/CashRegister/index.js / 21-269`
- `antigo: retirada em vermelho hardcoded e botoes do rodape com icone/texto '#fff'`
- `novo: cash-register-index usa textDanger para retirada e buttonBackground/buttonIcon/buttonText para os botoes, com cardText e footerText nos blocos de resumo`

- `ui-orders / src/react/pages/CashRegister/index.styles.js / 1-10`
- `antigo: labels auxiliares dos botoes com color '#fff'`
- `novo: arquivo preserva apenas o deslocamento horizontal; a cor do label vem do tema na tela`

- `ui-orders / src/react/css/orders.js / 11-15, 37-39, 92-99, 332-352`
- `antigo: cash-register-index usava colors.background, wallet '#fff', footer '#f8f8f8/#ddd' e texto base '#000000/#333'`
- `novo: cash-register-index usa pageBackground, cardBackground, cardBorder, cardText, footerBackground, footerBorder e footerText`

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

- `ui-crm / src/react/pages/settings/GeneralSettings.js / 11-15, 138-155, 254-294`
- `antigo: tela resolvia palette com resolveThemePalette + defaultThemeColors + currentCompany.theme.colors e usava styles estaticos`
- `novo: tela usa buildGeneralSettingsPalette(themeStore.getters.colors) + useGeneralSettingsStyles(), sem currentCompany.theme e sem fallback local`

- `ui-crm / src/react/pages/settings/GeneralSettingsSection.js / 10-24, 26-45`
- `antigo: card da secao usava styles estaticos e tooltip com accentColor vindo de colors.js`
- `novo: secao usa useGeneralSettingsStyles() e tooltip com accentColor vindo de themeStore.getters.colors.info`

- `ui-crm / src/react/pages/settings/GeneralSettingsSection.js / 40-41`
- `antigo: botoes de ajuda (?) do general-settings usavam accentColor vindo de themeStore.getters.colors.info`
- `novo: botoes de ajuda (?) do general-settings usam accentColor vindo de themeStore.getters.colors.iconInfo`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js / 10-562`
- `antigo: pageTitle, tabBar, cards, inputs, listas, modal e chips do general-settings dependiam de #HEX e transparent locais`
- `novo: buildGeneralSettingsPalette/createGeneralSettingsStyles/useGeneralSettingsStyles leem apenas tokens canonicos como navigation*, card*, input*, listItem*, modal*, badge* e text*`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js, GeneralSettings.js, GeneralSettingsSection.js, sections/ShopSection.js / hooks e leituras de palette`
- `antigo: general-settings lia apenas themeStore.getters.colors, entao alguns icones da shop caiam no preto padrao quando a cor existia apenas em currentCompany.theme.colors no banco`
- `novo: general-settings passa a mesclar themeStore.getters.colors com currentCompany.theme.colors antes de montar a palette, refletindo iconActive e iconDisabled da empresa ativa`

- `ui-crm / src/react/pages/settings/sections/*.js / icones de secao, chips, seletores, loading e placeholders`
- `antigo: abas fora da shop ainda misturavam localStyles estatico, HEX hardcoded, wrappers de icone por cor local, chips verdes/vermelhos fixos, seletores azuis/roxos fixos e placeholder/loading fora do tema`
- `novo: demais abas do general-settings usam useGeneralSettingsStyles/useGeneralSettingsPalette com cardIconBackground/cardIconColor, badgeSelectedText/badgeDisabledText, iconActive/iconDisabled, loadingSpinner e inputPlaceholderText`

- `DOCS/themes/themes-patterns.md / arquivo novo`
- `antigo: nao existia documento global consolidando o map por papel visual`
- `novo: themes-patterns.md registra o padrao global de contador, card de secao, tooltip, icone de cabecalho, seletor, exclusao, loading, placeholder e chip de status`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js / 159-167`
- `antigo: sectionIconWrap dos cards internos do general-settings usava cardIconBackground sem borda`
- `novo: sectionIconWrap dos cards internos do general-settings usa cardIconBackground com cardIconBorder`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js, sections/LogSection.js, sections/MaintenanceSection.js / palette e switches`
- `antigo: switches de logs e rotinas usavam a cor nativa do React Native, sem map do tema`
- `novo: switches de logs e rotinas usam switchOnTrack, switchOffTrack, switchOnThumb, switchOffThumb, switchDisabledTrack e switchDisabledThumb`

- `DOCS/themes/themes-map.md, DOCS/themes/themes-new.md, ui-manager/src/react/pages/ThemeManagerPage.js, ui-manager/src/react/pages/ThemePreviewPage.js, ui-crm/src/react/pages/settings/GeneralSettings.styles.js / tokens de switch`
- `antigo: switchBorder e switchFocusBorder ainda existiam no mapa e nos previews, embora nao fossem usados pelo switch nativo real`
- `novo: switchBorder e switchFocusBorder sao removidos do mapa, do preview/manager de tema e da palette compartilhada do general-settings`

- `ui-manager / src/react/pages/ThemeManagerPage.js / 2270-2334`
- `antigo: preview de switch no theme manager era desenhado manualmente com View, thumb e track simulados`
- `novo: preview de switch no theme manager usa o componente Switch real do React Native com switchOnTrack, switchOffTrack, switchOnThumb, switchOffThumb, switchDisabledTrack e switchDisabledThumb`

- `ui-crm / src/react/pages/settings/sections/ShopSection.js / 194-515, 519-1958`
- `antigo: toggles, modais de selecao, placeholders, loaders, icones e secoes da aba shop usavam #166534, #991B1B, #0F766E, #94A3B8, #B45309, #FFFFFF e similares`
- `novo: aba shop usa palette do tema ativo com badgeSelectedText/badgeDisabledText, inputPlaceholderText, loadingSpinner, iconActive/iconDisabled/iconSuccess/iconWarning, buttonIcon, primary, success, warning e cardIconBackground`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js / 23-27, 579-583`
- `antigo: palette compartilhada do general-settings expunha cardIconBackground/cardIconBorder, mas nao cardIconColor`
- `novo: palette compartilhada passa a expor cardIconColor para os icones dos grupos de preferencias`

- `ui-crm / src/react/pages/settings/sections/ShopSection.js / 1158-1163, 1178-1183, 1542-1547, 1578-1583, 1645-1650`
- `antigo: icones dos grupos da aba shop misturavam cardIconBackground com success/info/primary/warning`
- `novo: icones dos grupos da aba shop usam exatamente cardIconBackground e cardIconColor`

- `ui-crm / src/react/pages/settings/sections/ShopSection.js / 1345-1349, 1394-1398, 1445-1447, 1757-1761, 1812-1816, 1886-1890, 1904-1908`
- `antigo: icones internos dos cards/listas da aba shop usavam iconSuccess e iconWarning fora do padrao visual da pagina`
- `novo: icones internos dos cards/listas da aba shop usam cardIconColor; apenas controles de estado continuam com iconActive/iconDisabled`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js / 10-61, 579-610`
- `antigo: buildGeneralSettingsPalette e o fallback local do general-settings nao expunham iconDanger, entao os icones de remocao da aba shop nao refletiam a cor configurada no banco`
- `novo: buildGeneralSettingsPalette e o fallback local do general-settings passam a expor iconDanger`

- `ui-crm / src/react/pages/settings/sections/CrmSection.js / 241-244`
- `antigo: icone delete do crm usava themePalette.error`
- `novo: icone delete do crm usa themePalette.iconDanger`

- `ui-crm / src/react/pages/settings/sections/ShopSection.js / 1568-1576`
- `antigo: checkbox do catalogo do shop usava themePalette.primary quando marcado`
- `novo: checkbox do catalogo do shop usa iconActive quando marcado e iconDisabled quando desmarcado`

- `ui-default / src/react/components/table/DefaultTable.styles.js / 531-537`
- `antigo: footerCountPill mantinha backgroundColor '#EFF6FF' como fallback local no contador do rodape`
- `novo: footerCountPill preserva apenas layout; a cor final do contador vem somente de themeColors.badgeBackground em DefaultTable.js`
