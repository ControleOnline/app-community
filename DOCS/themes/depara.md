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

- `ui-customers / src/react/components/tabs/GeneralTab.js / 14-25, 138-142, 340-479`
- `antigo: aba geral de cadastro usava colors.js, placeholders hardcoded, switch nativo com track/thumb locais e botao salvar com hex locais`
- `novo: aba usa somente themeStore.getters.colors com inputBackground, inputBorder, inputText, inputPlaceholderText, inputIcon, textSecondary, switchOnTrack, switchOffTrack, switchOnThumb, switchOffThumb, buttonBackground, buttonDisabledBackground, buttonText e buttonDisabledText`

- `ui-customers / src/react/components/tabs/GeneralTab.styles.js / 1-84`
- `antigo: estilos inline com '#fff', '#334155', '#E2E8F0', '#0F172A', '#F8FAFC', '#475569', '#CBD5E1' e dependencia de colors.primary`
- `novo: createGeneralTabStyles(themeColors) usando apenas pageBackground, textSecondary, inputBorder, inputText, inputBackground, buttonBackground, buttonDisabledBackground, buttonText e buttonDisabledText`

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

- `ui-crm / src/react/pages/settings/GeneralSettings.js / header de abas`
- `antigo: header do general-settings usava colorToken por aba, navigationActiveBackground/navigationText e borderBottomColor por contexto`
- `novo: header do general-settings usa buttonBackground/buttonBorder/buttonIcon/buttonText na aba selecionada e buttonBackgroundSecondary/buttonBorderSecondary/buttonIconSecondary/buttonTextSecondary nas demais`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js / tabBarContent/tabItem/tabLabel e palette`
- `antigo: estilos das abas fixavam underline de selecao e palette nao expunha buttonBorder/buttonIconSecondary`
- `novo: abas preservam layout de botao com borda/raio/gap, palette expoe buttonBorder/buttonIconSecondary e as cores entram pelo JSX`

- `ui-crm / src/react/pages/settings/sections/CrmSection.js / 241-244`
- `antigo: icone delete do crm usava themePalette.error`
- `novo: icone delete do crm usa themePalette.iconDanger`

- `ui-crm / src/react/pages/settings/sections/CrmSection.js / 245-260`
- `antigo: botao Add Profile dependia apenas de globalStyles.button/local primaryButton e nao aplicava explicitamente buttonBackground/buttonIcon no padrao`
- `novo: botao Add Profile usa themePalette.buttonBackground, themePalette.buttonIcon e themePalette.buttonText`

- `ui-crm / src/react/pages/settings/sections/CrmSection.js / 236-247`
- `antigo: botao delete dos perfis CRM usava removeProfileButton simples e icone themePalette.iconDanger`
- `novo: botao delete dos perfis CRM segue o padrao dos botoes de acao da carteira com buttonBackground/buttonIcon e icone Feather trash-2`

- `ui-crm / src/react/pages/settings/GeneralSettings.styles.js / removeProfileButton`
- `antigo: removeProfileButton tinha apenas marginLeft e padding local`
- `novo: removeProfileButton preserva layout de botao iconico 34x34 com borda/raio/alinhamento; cores entram por themePalette no JSX`

- `ui-crm / src/react/pages/settings/sections/ShopSection.js / 1568-1576`
- `antigo: checkbox do catalogo do shop usava themePalette.primary quando marcado`
- `novo: checkbox do catalogo do shop usa iconActive quando marcado e iconDisabled quando desmarcado`

- `ui-default / src/react/components/table/DefaultTable.styles.js / 531-537`
- `antigo: footerCountPill mantinha backgroundColor '#EFF6FF' como fallback local no contador do rodape`
- `novo: footerCountPill preserva apenas layout; a cor final do contador vem somente de themeColors.badgeBackground em DefaultTable.js`

- `ui-orders / src/react/pages/orders/OrderHistoryPage.js / 166-198, 280-287, 708-760, 907-954`
- `antigo: palette e accentColor misturavam themeStore + currentCompany.theme + colors.js via resolveThemePalette, e acoes de cancelamento/details dependiam de fallbacks locais fora do tema canonico`
- `novo: OrderHistoryPage monta palette apenas com themeStore.getters.colors usando tokens canonicos como primary, iconInfo, iconDanger, modalBackground, modalBorder, inputText e buttonTextSecondary, e repassa accentColor/acoes sem currentCompany.theme nem colors.js`

- `ui-orders / src/react/pages/orders/OrderHistoryPage.styles.js / 3-24, 47-58, 96-261`
- `antigo: estilos do modal e dos cards usavam pickColor com fallbacks locais como '#FFFFFF', '#E2E8F0', '#0F172A', '#64748B', '#DC2626', 'rgba(15, 23, 42, 0.42)' e opacity fixa 0.55`
- `novo: createStyles/createModalStyles usam somente tokens canonicos do tema ativo como pageBackground, cardBackground, cardBorder, cardText, modalOverlay, modalBackground, modalBorder, modalHeaderText, modalText, inputBackground, inputBorder, buttonBackgroundSecondary, buttonTextSecondary e buttonDisabledOpacity`

- `ui-customers / src/react/styles/details.js / 5-37, 119-157`
- `antigo: details expunha apenas o conjunto base da pagina e os icones auxiliares da aba geral acabavam usando estilos secundarios fora do padrao visual da tela de perfil`
- `novo: details expõe tokens canonicos cardIcon, buttonBorder, buttonBackground e buttonText para compor os tres padroes da tela de perfil: addButton, botao circular com borda e editNameButton`

- `ui-customers / src/react/components/tabs/ContactTab.js / 482-490, 503-520, 537-545, 556-573`
- `antigo: botoes de adicionar/editar e icones de telefone/email estavam usando o estilo secundario anterior da client-details`
- `novo: ContactTab segue o padrao da tela de perfil com addButton para "+" , editNameButton para o lapis e cardIcon para os icones dos cards`

- `ui-customers / src/react/components/tabs/DocumentsTab.js / 370-378, 389-413`
- `antigo: "+" e lapis usavam colors.primary, e o icone de descricao tambem ficava preso ao legado fora do theme map`
- `novo: DocumentsTab usa addButton para "+", editNameButton para o lapis e cardIcon para o icone do documento, todos vindos do themeStore sem fallback`

- `ui-customers / src/react/components/tabs/AddressesTab.js / 475-481, 492-501, 523-529`
- `antigo: "+", pin e lapis usavam colors.primary sem respeitar o padrao visual da tela de perfil`
- `novo: AddressesTab usa addButton para "+", botao circular com borda para o pin e editNameButton para o lapis, todos mapeados pelos tokens canonicos do tema ativo`

- `ui-customers / src/react/styles/details.js / 14-25, 254-291`
- `antigo: a base compartilhada de client-details nao expunha avatar, chevron e loader no mesmo padrao visual da tela de perfil`
- `novo: details passa a expor loadingSpinner, listAvatarBrand, listAvatarText e itemChevronIcon para que vendedores e contatos usem avatar inicial, seta e loader derivados apenas do tema ativo`

- `ui-customers / src/react/components/tabs/SalesmanTab.js / 75-119`
- `antigo: vendedores usavam loader com colors.primary, icone MaterialIcons simple e chevron com cor legada`
- `novo: SalesmanTab usa loadingSpinner do tema, UserAvatar no padrao da tela de perfil e chevron vindo de listItemSubtitleText`

- `ui-customers / src/react/components/tabs/EmployeesTab.js / 284-343`
- `antigo: contatos usavam "+" com colors.primary, loader legado, icone person simples e chevron hardcoded`
- `novo: EmployeesTab usa addButton para "+", loadingSpinner do tema, UserAvatar no padrao da tela de perfil e chevron derivado do map compartilhado`

- `ui-customers / src/react/components/tabs/SalesmanTab.js, EmployeesTab.js, src/react/styles/details.js / cards de vendedores e contatos com botao olho`
- `antigo: vendedor usava chevron-right simples e contato/vendedor mantinham paddingRight 16, deixando a acao recuada em relacao ao +`
- `novo: vendedor e contato usam Feather eye no iconButtonGhost e listItemWithEndAction com paddingRight 0 para alinhar ao limite direito do +`

- `ui-customers / src/react/components/tabs/DocumentsTab.js, DocumentsTab.styles.js / botao Salvar do modal de documentos`
- `antigo: Salvar usava inlineStyle_353_14/inlineStyle_360_20 com '#007bff' e '#fff'`
- `novo: Salvar usa customStyles.saveButton/saveButtonText e icone buttonIcon, seguindo o padrao do client-details`

- `ui-customers / src/react/pages/details.js / 380-389`
- `antigo: o cabecalho de client-details montava o avatar manualmente com inicial em um circulo separado do componente canonico de perfil`
- `novo: client-details usa UserAvatar no cabecalho com buttonBackground e buttonText, seguindo o mesmo padrao visual da tela de perfil`

- `ui-contracts / src/react/components/contracts.js / 17-99`
- `antigo: contratos ainda tinha fallback local para themeStore e mostrava o beneficiario com icone person simples`
- `novo: contracts usa somente themeStore.getters.colors e renderiza o beneficiario com UserAvatar no padrao da tela de perfil`

- `ui-contracts / src/react/components/contracts.styles.js / 58-72`
- `antigo: a linha de beneficiario do card de contrato era estruturada para um icone simples inline`
- `novo: contracts.styles passa a suportar avatar e bloco textual alinhado na linha de beneficiario`

- `ui-default / src/react/components/inputs/DefaultInput.js / 44-66, 177-216`
- `antigo: DefaultInput usava estilo estatico com cores hardcoded para label, borda, texto, placeholder, icone de editar e botao de fechar`
- `novo: DefaultInput passa a montar palette via themeStore.getters.colors e aplica tokens canonicos como inputBackground, inputBorder, inputFocusBorder, inputText, inputPlaceholderText, inputIcon, buttonBackgroundSecondary, buttonBorderSecondary e buttonIconSecondary`

- `ui-default / src/react/components/inputs/DefaultDateInput.js / 46-68, 130-170`
- `antigo: DefaultDateInput usava o mesmo pacote de cores hardcoded do input base, inclusive calendario, placeholder e botao de fechar`
- `novo: DefaultDateInput passa a usar os tokens canonicos inputBackground, inputBorder, inputFocusBorder, inputText, inputPlaceholderText, inputIcon, inputErrorText, buttonBackgroundSecondary, buttonBorderSecondary e buttonIconSecondary`

- `ui-default / src/react/components/inputs/DefaultInput.styles.js / 1-101`
- `antigo: os estilos compartilhados de inputs do ui-default fixavam #CBD5E1, #FFFFFF, #0F172A, #94A3B8, #64748B e #DC2626`
- `novo: DefaultInput.styles exporta createStyles com tokens canonicos do tema ativo para campos, labels, placeholders, acoes secundarias e mensagens de erro`

- `ui-default / src/react/components/inputs/DefaultSelect.js / 117-148, 325-374`
- `antigo: DefaultSelect usava modal, busca, chevron, close e estado de selecao com cores hardcoded e fallback visual local`
- `novo: DefaultSelect passa a usar themeStore.getters.colors com tokens modalOverlay, modalBackground, modalBorder, modalCloseIcon, modalHeaderText, dividerBorder, inputBackground, inputBorder, inputText, inputPlaceholderText e inputIcon`

- `ui-default / src/react/components/inputs/DefaultSelect.styles.js / 1-69`
- `antigo: os estilos do seletor generico fixavam rgba(15,23,42,0.38), #FFFFFF, #E2E8F0, #F1F5F9, #0F172A e #64748B`
- `novo: DefaultSelect.styles exporta createStyles com tokens canonicos do tema ativo para overlay, card modal, header, divisores e textos`

- `ui-orders / src/react/pages/orders/OrderHistoryPage.styles.js / 83-314`
- `antigo: createModalStyles do order-history-page ainda misturava fallback local e literais para background, border, texto, danger, placeholder e overlay`
- `novo: createModalStyles passa a usar somente tokens canonicos do tema ativo como modalOverlay, modalBackground, modalBorder, modalHeaderText, modalText, modalShadow, buttonBackground, buttonBorder, buttonText, buttonBackgroundSecondary, buttonBorderSecondary, buttonTextSecondary, buttonDisabledBackground, buttonDisabledText, inputPlaceholderText e textDanger`

- `ui-orders / src/react/pages/orders/OrderCancellationModals.js / 110-116, 157-164, 193-219, 286-293, 420-427`
- `antigo: a tela Order Cancellation Reasons e os modais relacionados ainda instanciavam estilos com fallback e o botao "+ Add Cancel Reason" dependia de accentColor local`
- `novo: OrderCancellationModals usa somente themeStore.getters.colors para createModalStyles, e o botao "+ Add Cancel Reason" segue diretamente buttonBackground, buttonBorder, buttonText e os estados disabled do tema ativo`

- `ui-financial / src/react/pages/InvoiceCategoriesPage.js / 213-215`
- `antigo: botao "Nova categoria" usava backgroundColor palette.primary, icon color '#fff' e texto herdando '#fff' do style estatico`
- `novo: botao "Nova categoria" usa themeStore.getters.colors.buttonBackground, buttonIcon e buttonText`

- `ui-financial / src/react/pages/InvoiceCategoriesPage.styles.js / 17`
- `antigo: addBtnText fixava color '#fff'`
- `novo: addBtnText preserva apenas tipografia; a cor vem de themeStore.getters.colors.buttonText no JSX`

- `ui-financial / src/react/pages/WalletsPage.js / 308-317`
- `antigo: botao "Nova carteira" usava withOpacity(palette.primary), icon color palette.primary e texto em palette.primary`
- `novo: botao "Nova carteira" usa themeStore.getters.colors.buttonBackground, buttonIcon e buttonText`

- `ui-financial / src/react/pages/WalletsPage.styles.js / 22-30`
- `antigo: addBtn tinha borderWidth/backgroundColor '#FFFFFF'/borderRadius 999 e addBtnText fixava color '#64748B'`
- `novo: addBtn usa o mesmo formato do "Nova categoria" e addBtnText preserva apenas tipografia`

- `ui-financial / src/react/pages/WalletsPage.js / 344-378`
- `antigo: botoes link/editar/trash usavam icon color '#64748B'/'#c10015' e trash com borderColor '#FCA5A5'`
- `novo: botoes link/editar/trash usam themeStore.getters.colors.buttonBackground e buttonIcon`

- `ui-financial / src/react/pages/WalletsPage.styles.js / 52-55`
- `antigo: iconBtn fixava borderColor '#E2E8F0' e backgroundColor '#F8FAFC'`
- `novo: iconBtn preserva apenas layout; as cores vem de themeStore.getters.colors no JSX`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 1808-1845`
- `antigo: abas PDV usavam withOpacity(brandColors.primary), brandColors.primary e '#64748B' para diferenciar ativo/inativo`
- `novo: aba ativa usa themeStore.getters.colors.buttonBackground/buttonBorder/buttonIcon/buttonText; abas inativas usam buttonBackgroundSecondary/buttonBorderSecondary/buttonIconSecondary/buttonTextSecondary`

- `ui-manager / src/react/pages/DeviceDetailPage.styles.js / 72-87`
- `antigo: tabButton fixava borderColor 'transparent', backgroundColor '#F8FAFC' e tabButtonText fixava color '#64748B'`
- `novo: tabButton/tabButtonText preservam apenas layout e tipografia; as cores vem de themeStore.getters.colors no JSX`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 1918-1931`
- `antigo: botoes Comanda/Garçom/Totem/Single Item Sale/Caixa herdavam optionButton com cores hardcoded para ativo e inativo`
- `novo: botoes Comanda/Garçom/Totem/Single Item Sale/Caixa passam optionColors; selecionado usa buttonBackground/buttonBorder/buttonText e demais usam buttonBackgroundSecondary/buttonBorderSecondary/buttonTextSecondary`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 196-240, 1722-1750, 1990-2021`
- `antigo: botoes None/Tab/Table/Stamp herdavam optionButton com cores hardcoded para ativo e inativo`
- `novo: botoes None/Tab/Table/Stamp passam optionColors; selecionado usa buttonBackground/buttonBorder/buttonText e demais usam buttonBackgroundSecondary/buttonBorderSecondary/buttonTextSecondary`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 2116-2130`
- `antigo: botoes Pedido/Fichas herdavam optionButton com cores hardcoded para ativo e inativo`
- `novo: botoes Pedido/Fichas passam optionColors; selecionado usa buttonBackground/buttonBorder/buttonText e demais usam buttonBackgroundSecondary/buttonBorderSecondary/buttonTextSecondary`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 2141-2160`
- `antigo: botoes Abertura e fechamento de caixa/Fechamento diario herdavam optionButton com cores hardcoded para ativo e inativo`
- `novo: botoes Abertura e fechamento de caixa/Fechamento diario passam optionColors; selecionado usa buttonBackground/buttonBorder/buttonText e demais usam buttonBackgroundSecondary/buttonBorderSecondary/buttonTextSecondary`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 2244-2258`
- `antigo: botoes Nenhum/Infinite Pay/Cielo herdavam optionButton com cores hardcoded para ativo e inativo`
- `novo: botoes Nenhum/Infinite Pay/Cielo passam optionColors; selecionado usa buttonBackground/buttonBorder/buttonText e demais usam buttonBackgroundSecondary/buttonBorderSecondary/buttonTextSecondary`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 2330-2355`
- `antigo: botoes Somente deste device/Todos da empresa herdavam optionButton com cores hardcoded para ativo e inativo`
- `novo: botoes Somente deste device/Todos da empresa passam optionColors; selecionado usa buttonBackground/buttonBorder/buttonText e demais usam buttonBackgroundSecondary/buttonBorderSecondary/buttonTextSecondary`

- `ui-manager / src/react/pages/DeviceDetailPage.js / switches do device-detail`
- `antigo: switches da tela eram TouchableOpacity com icones toggle-left/toggle-right e cores hex/brandColors para ligado/desligado`
- `novo: switches usam o componente Switch nativo com switchOnTrack, switchOffTrack, switchOnThumb, switchOffThumb, switchDisabledTrack e switchDisabledThumb`

- `ui-manager / src/react/pages/DeviceDetailPage.styles.js / toggleRow/toggleRowLabel/toggleRowValue`
- `antigo: estilos dos switches fixavam borderColor/backgroundColor/textos e estado ativo com sucesso hardcoded`
- `novo: estilos preservam apenas layout; cores de linha e textos entram por listItemBackground, listItemBorder, listItemText e listItemSubtitleText no JSX`

- `ui-manager / src/react/pages/DeviceDetailPage.js / 2618-2633`
- `antigo: botao Limpar cache de produtos usava background '#0EA5E9', icone trash-2 tamanho 14 e cor '#fff'`
- `novo: botao usa o padrao de cor/icone dos botoes de acao da carteira com buttonBackground, buttonIcon, buttonText e icone Feather trash-2 tamanho 16`

- `ui-manager / src/react/pages/DeviceDetailPage.styles.js / configButton/configButtonText`
- `antigo: configButton/configButtonText fixavam backgroundColor '#0EA5E9' e texto '#fff'`
- `novo: estilos preservam apenas layout; cores entram por themeStore.getters.colors no JSX`

- `ui-manager / src/react/pages/DeviceDetailPage.styles.js / editAliasBtn`
- `antigo: botao de edicao do alias usava 26x26, borderRadius 13 e backgroundColor '#E2E8F0'`
- `novo: botao de edicao do alias usa o mesmo formato dos botoes de acao da carteira: 34x34, borderRadius 8, borderWidth 1; cores e icone edit-2 vem do JSX com buttonBackground/buttonIcon`

- `ui-manager / src/react/pages/DeviceDetailPage.js / renderHelpButton`
- `antigo: botoes de ajuda "?" usavam accentColor brandColors.primary e formato padrao pequeno do DefaultTooltip`
- `novo: botoes de ajuda "?" usam o mesmo formato dos botoes de acao da carteira: 34x34, borderRadius 8, buttonBackground e buttonIcon`
