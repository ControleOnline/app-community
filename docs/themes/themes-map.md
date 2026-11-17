### ### ### MAPA DE TEMA ### ### ###

Objetivo:
- centralizar os nomes canônicos dos tokens de cor
- evitar prefixos por modulo ou tela
- servir como referencia para o codigo, `themes-new.md` e `themes-todo.md`

Regras:
- usar apenas nomes semanticos globais
- nao usar `colors.js` como origem final
- nao usar `mainCompany.theme`
- nao usar `currentCompany.theme`
- se um token nao existir no tema oficial, registrar em `themes-new.md` ate ele existir de fato

### OBSERVACAO

- este arquivo deve ser usado somente pelo mapa de objetos
- os nomes permitidos sao apenas os que estao listados nas secoes de objetos abaixo
- nao usar `tokens base`, nomes genericos, aliases locais ou nomes inventados fora desta listagem
- no codigo, a referencia de cor deve apontar para o token canonico do objeto visual correspondente
- quando existir dúvida sobre o nome, preferir o nome que descreve o papel visual e nao o arquivo onde ele nasceu
- se o mesmo papel visual aparecer em vários modulos, o token deve continuar sendo o mesmo
- se o papel visual for diferente, parar a execução e perguntar.

Variações por finalidade:
- variações continuam neste contrato e em `theme.colors`, sem vínculo novo no banco
- uma variação sem valor próprio herda o token base no mesmo modo; nenhum valor é gravado automaticamente
- editar uma variação afeta todos os componentes que usam essa finalidade, e não o padrão compartilhado
- os metadados `base`, `variant`, `label` e `usage` abaixo definem a herança e o alcance exibido pelo editor

Escopo por tela no navegador:
- o inspetor oferece “Só nesta tela” e “Em todas as telas” para os mesmos tokens canônicos
- “Só nesta tela” usa a identidade estável do tipo de app, nome da rota e store; não usa URL, idioma, ID de registro, filtros ou paginação
- as personalizações são chaves de transporte `screen_<identidade codificada>__<token>-light/dark` no mesmo `theme.colors`; não são novos tokens globais
- valor local vazio herda o global no mesmo modo; editar o global preserva cores locais explícitas
- as definições por tela não mudam permissões nem vínculos; apenas a interface local atualizada interpreta esse escopo

### MAPA DE OBJETOS

Usar os mesmos nomes em qualquer objeto quando o papel visual for o mesmo.

### estrutura da tela

- `appBackground`
- `containerBackground`
- `containerTransparentBackground`
- `containerBorder`
- `pageBackground`
- `pageBorder`
- `panelBackground`
- `panelBorder`
- `screenBackground`
- `sectionBackground`
- `sectionBorder`
- `sheetBackground`
- `sheetBorder`
- `surface`
- `scrollbarThumb` <!-- legacy: scrollbar-thumb -->
- `scrollbarTrack` <!-- legacy: scrollbar-track -->
- `scrollbarThumbHover` <!-- legacy: scrollbar-thumb-hover -->

As barras de rolagem web usam indicador e fundo do mesmo modo quando ambos têm valor.
A cor de hover é opcional e depende do suporte ao indicador do navegador.
As chaves legadas acima são lidas no mesmo modo até que haja uma cor canônica definida.

### barra

- `navbarBackground`
- `navbarBorder`
- `tabBarBackground`
- `tabBarBorder`
- `toolbarBackground`
- `toolbarBorder`

### badge

- `badgeBackground`
- `badgeBorder`
- `badgeDisabledBackground`
- `badgeDisabledText`
- `badgeIcon`
- `badgeSelectedBackground`
- `badgeSelectedBorder`
- `badgeSelectedText`
- `badgeShadow`
- `badgeText`

### button

- `buttonBackground`
- `buttonBackgroundSecondary`
- `buttonBorder`
- `buttonBorderSecondary`
- `buttonDisabledBackground`
- `buttonDisabledOpacity`
- `buttonDisabledText`
- `buttonFocusBorder`
- `buttonHoverBackground`
- `buttonIcon`
- `buttonIconSecondary`
- `buttonPressedBackground`
- `buttonPressedBorder`
- `buttonPressedIcon`
- `buttonPressedText`
- `buttonShadow`
- `buttonShadowSecondary`
- `buttonText`
- `buttonTextSecondary`

### card

- `cardBackground`
- `cardBorder`
- `cardDisabledBackground`
- `cardDisabledText`
- `cardHeaderBackground`
- `cardHeaderText`
- `cardIcon`
- `cardIconColor`
- `cardIconBackground`
- `cardIconBorder`
- `cardSelectedBackground`
- `cardSelectedBorder`
- `cardSelectedText`
- `cardShadow`
- `cardText`
- `indicatorCardBackground` <!-- base: cardBackground; variant: indicator; label: Cards de indicadores; usage: Indicadores e faixa de resultados da Home -->
- `indicatorCardBorder` <!-- base: cardBorder; variant: indicator; label: Cards de indicadores; usage: Indicadores e faixa de resultados da Home -->
- `indicatorCardText` <!-- base: cardText; variant: indicator; label: Cards de indicadores; usage: Indicadores e faixa de resultados da Home -->
- `indicatorCardSecondaryText` <!-- base: textSecondary; variant: indicator; label: Cards de indicadores; usage: Indicadores e faixa de resultados da Home -->
- `indicatorCardMutedText` <!-- base: textMuted; variant: indicator; label: Cards de indicadores; usage: Indicadores e faixa de resultados da Home -->
- `indicatorCardIconBackground` <!-- base: cardIconBackground; variant: indicator; label: Cards de indicadores; usage: Indicadores e faixa de resultados da Home -->
- `indicatorCardIconColor` <!-- base: cardIconColor; variant: indicator; label: Cards de indicadores; usage: Indicadores e faixa de resultados da Home -->
- `summaryCardBackground` <!-- base: cardBackground; variant: summary; label: Cards de resumo financeiro; usage: Cards mensais e caixas de métricas do relatório de resultados -->
- `summaryCardBorder` <!-- base: cardBorder; variant: summary; label: Cards de resumo financeiro; usage: Cards mensais e caixas de métricas do relatório de resultados -->
- `summaryCardText` <!-- base: textPrimary; variant: summary; label: Cards de resumo financeiro; usage: Cards mensais e caixas de métricas do relatório de resultados -->
- `summaryCardSecondaryText` <!-- base: textMuted; variant: summary; label: Cards de resumo financeiro; usage: Cards mensais e caixas de métricas do relatório de resultados -->
- `summaryCardSuccessText` <!-- base: textSuccess; variant: summary; label: Cards de resumo financeiro; usage: Cards mensais e caixas de métricas do relatório de resultados -->
- `summaryCardDangerText` <!-- base: textDanger; variant: summary; label: Cards de resumo financeiro; usage: Cards mensais e caixas de métricas do relatório de resultados -->

- `homeMetricPrimaryBackground`
- `homeMetricPrimaryBorder`
- `homeMetricPrimaryText`
- `homeMetricPrimarySecondaryText`
- `homeMetricPrimaryMutedText`
- `homeMetricPrimaryIconBackground`
- `homeMetricPrimaryIconColor`
- `homeMetricSecondaryBackground`
- `homeMetricSecondaryBorder`
- `homeMetricSecondaryText`
- `homeMetricSecondarySecondaryText`
- `homeMetricSecondaryMutedText`
- `homeMetricSecondaryIconBackground`
- `homeMetricSecondaryIconColor`
- `homeMetricClosedSalesBackground`
- `homeMetricClosedSalesBorder`
- `homeMetricClosedSalesText`
- `homeMetricClosedSalesSecondaryText`
- `homeMetricClosedSalesMutedText`
- `homeMetricClosedSalesIconBackground`
- `homeMetricClosedSalesIconColor`
- `homeMetricPeriodOrdersBackground`
- `homeMetricPeriodOrdersBorder`
- `homeMetricPeriodOrdersText`
- `homeMetricPeriodOrdersSecondaryText`
- `homeMetricPeriodOrdersMutedText`
- `homeMetricPeriodOrdersIconBackground`
- `homeMetricPeriodOrdersIconColor`
- `homeMetricOpenOrdersBackground`
- `homeMetricOpenOrdersBorder`
- `homeMetricOpenOrdersText`
- `homeMetricOpenOrdersSecondaryText`
- `homeMetricOpenOrdersMutedText`
- `homeMetricOpenOrdersIconBackground`
- `homeMetricOpenOrdersIconColor`
- `homeMetricClientsBackground`
- `homeMetricClientsBorder`
- `homeMetricClientsText`
- `homeMetricClientsSecondaryText`
- `homeMetricClientsMutedText`
- `homeMetricClientsIconBackground`
- `homeMetricClientsIconColor`
- `homeResultsBackground`
- `homeResultsBorder`
- `homeResultsText`
- `homeResultsSecondaryText`
- `homeResultsMutedText`
- `homeResultsIconBackground`
- `homeResultsIconColor`

### checkbox

- `checkboxBackground`
- `checkboxBorder`
- `checkboxDisabledBackground`
- `checkboxDisabledBorder`
- `checkboxDisabledMark`
- `checkboxDisabledText`
- `checkboxSelectedBackground`
- `checkboxSelectedBorder`
- `checkboxSelectedMark`
- `checkboxText`

### chip

- `chipBackground`
- `chipBorder`
- `chipDisabledBackground`
- `chipDisabledText`
- `chipIcon`
- `chipSelectedBackground`
- `chipSelectedBorder`
- `chipSelectedText`
- `chipShadow`
- `chipText`

### divider

- `dividerBackground`
- `dividerBorder`
- `dividerText`

### footer

- `footerBackground`
- `footerBorder`
- `footerIcon`
- `footerLink`
- `footerText`
- `footerCompanyText` <!-- base: footerText; variant: globalChrome; label: Áreas permanentes; usage: Texto de empresa e informações no rodapé -->

### header

- `headerBackground`
- `headerBorder`
- `headerIcon`
- `headerLink`
- `headerText`
- `headerCompanyText` <!-- base: selectText; variant: globalChrome; label: Áreas permanentes; usage: Nome da empresa no cabeçalho -->
- `headerCompanyIcon` <!-- base: selectIcon; variant: globalChrome; label: Áreas permanentes; usage: Seta da empresa no cabeçalho -->
- `headerAppTypeBackground` <!-- base: selectBackground; variant: globalChrome; label: Áreas permanentes; usage: Fundo do seletor de tipo de app -->
- `headerAppTypeBorder` <!-- base: selectBorder; variant: globalChrome; label: Áreas permanentes; usage: Borda do seletor de tipo de app -->
- `headerAppTypeText` <!-- base: selectText; variant: globalChrome; label: Áreas permanentes; usage: Texto do seletor de tipo de app -->
- `headerAppTypeIcon` <!-- base: selectIcon; variant: globalChrome; label: Áreas permanentes; usage: Seta do seletor de tipo de app -->
- `headerAppTypeLabelText` <!-- base: textMuted; variant: globalChrome; label: Áreas permanentes; usage: Legenda do seletor de tipo de app -->
- `headerAppTypeResetText` <!-- base: linkText; variant: globalChrome; label: Áreas permanentes; usage: Link para voltar ao ADMIN -->

### icon

- `iconActive`
- `iconBackground`
- `iconColor`
- `iconDanger`
- `iconDisabled`
- `iconInfo`
- `iconInverse`
- `iconMuted`
- `iconSuccess`
- `iconText`
- `iconWarning`

### input

- `inputBackground`
- `inputBorder`
- `inputFilledBorder`
- `inputDisabledBackground`
- `inputDisabledBorder`
- `inputDisabledText`
- `inputErrorBackground`
- `inputErrorBorder`
- `inputErrorText`
- `inputFocusBorder`
- `inputIcon`
- `inputPlaceholderText`
- `inputText`
- `loginInputBackground`
- `loginInputText`
- `loginInputPlaceholderText`
- `loginLabelCreateAccount`
- `loginLabelForgotPassword`
- `loginLabelWellcome`

### link

- `linkDisabledText`
- `linkHoverText`
- `linkText`
- `linkVisitedText`

### listItem

- `listItemActiveBackground`
- `listItemActiveBorder`
- `listItemBackground`
- `listItemBorder`
- `listItemDisabledText`
- `listItemEvenRow`
- `listItemIcon`
- `listItemOddRow`
- `listItemSelectedBackground`
- `listItemSelectedBorder`
- `listItemSubtitleText`
- `listItemText`

### loading

- `loadingBackground`
- `loadingBorder`
- `loadingDisabledBackground`
- `loadingDisabledText`
- `loadingIcon`
- `loadingOverlay`
- `loadingShadow`
- `loadingSpinner`
- `loadingText`

### menu

- `menuActiveBackground`
- `menuActiveBorder`
- `menuActiveIcon`
- `menuActiveText`
- `menuBackground`
- `menuBorder`
- `menuDisabledBackground`
- `menuDisabledBorder`
- `menuDisabledIcon`
- `menuDisabledText`
- `menuIcon`
- `menuSelectedBackground`
- `menuSelectedBorder`
- `menuSelectedText`
- `menuShadow`
- `menuText`
- `menuSectionText` <!-- base: textSecondary; variant: globalChrome; label: Áreas permanentes; usage: Título de seção do menu do usuário -->

### modal

- `modalBackground`
- `modalBorder`
- `modalCloseIcon`
- `modalHeaderText`
- `modalOverlay`
- `modalShadow`
- `modalText`

### table

- `tableActionBackground`
- `tableActionBorder`
- `tableActionIcon`
- `tableFilterBackground`
- `tableFilterBorder`
- `tableFilterText`
- `tableFooterBackground`
- `tableFooterBorder`
- `tableFooterText`
- `tableHeaderBackground`
- `tableHeaderBorder`
- `tableHeaderIcon`
- `tableHeaderText`
- `tableRowBackground`
- `tableRowBorder`
- `tableRowEvenBackground`
- `tableRowMutedText`
- `tableRowOddBackground`
- `tableRowSelectedBackground`
- `tableRowSelectedBorder`
- `tableRowText`
- `tableToolbarBackground`
- `tableToolbarBorder`
- `tableToolbarText`

### select

- `selectBackground`
- `selectBorder`
- `selectIcon`
- `selectOptionBackground`
- `selectOptionBorder`
- `selectOptionSelectedBackground`
- `selectOptionSelectedText`
- `selectPlaceholderText`
- `selectText`

### navigation

- `navigationActiveBackground`
- `navigationActiveBorder`
- `navigationActiveIcon`
- `navigationActiveText`
- `navigationBackground`
- `navigationBorder`
- `navigationDisabledBackground`
- `navigationDisabledBorder`
- `navigationDisabledIcon`
- `navigationDisabledText`
- `navigationIcon`
- `navigationShadow`
- `navigationText`
- `moduleListIcon` <!-- base: textMuted; variant: moduleList; label: Módulos em lista; usage: Cor dos ícones dos módulos na Home em lista e no menu lateral com cores de rota ligadas -->
- `moduleListText` <!-- base: cardText; variant: moduleList; label: Módulos em lista; usage: Cor do texto dos módulos na Home em lista e no menu lateral com cores de rota ligadas -->
- `navigationCaptionText` <!-- base: textMuted; variant: globalChrome; label: Áreas permanentes; usage: Títulos dos grupos do menu lateral -->
- `navigationAccountBackground` <!-- base: selectBackground; variant: globalChrome; label: Áreas permanentes; usage: Fundo da conta no menu lateral -->
- `navigationAccountBorder` <!-- base: selectBorder; variant: globalChrome; label: Áreas permanentes; usage: Borda da conta no menu lateral -->
- `navigationAccountText` <!-- base: selectText; variant: globalChrome; label: Áreas permanentes; usage: Nome do usuário no menu lateral -->
- `navigationAccountSecondaryText` <!-- base: textMuted; variant: globalChrome; label: Áreas permanentes; usage: Legenda da conta no menu lateral -->
- `navigationAvatarBackground` <!-- base: cardIconBackground; variant: globalChrome; label: Áreas permanentes; usage: Fundo do avatar nas áreas permanentes -->
- `navigationAvatarBorder` <!-- base: cardBorder; variant: globalChrome; label: Áreas permanentes; usage: Borda do avatar nas áreas permanentes -->
- `navigationAvatarText` <!-- base: textPrimary; variant: globalChrome; label: Áreas permanentes; usage: Texto do avatar nas áreas permanentes -->
- `navigationCompanyBackground` <!-- base: selectBackground; variant: globalChrome; label: Áreas permanentes; usage: Fundo do seletor de empresa no menu lateral -->
- `navigationCompanyBorder` <!-- base: selectBorder; variant: globalChrome; label: Áreas permanentes; usage: Borda do seletor de empresa no menu lateral -->
- `navigationCompanyText` <!-- base: selectText; variant: globalChrome; label: Áreas permanentes; usage: Nome da empresa no menu lateral -->
- `navigationCompanyIcon` <!-- base: selectIcon; variant: globalChrome; label: Áreas permanentes; usage: Seta do seletor de empresa no menu lateral -->
- `shortcutBarBackground` <!-- base: navigationBackground; variant: shortcutBar; label: Barra de atalhos; usage: Fundo da barra de atalhos inferior do Manager -->
- `shortcutBarBorder` <!-- base: navigationBorder; variant: shortcutBar; label: Barra de atalhos; usage: Borda da barra de atalhos inferior do Manager -->
- `shortcutBarIcon` <!-- base: navigationIcon; variant: shortcutBar; label: Barra de atalhos; usage: Ícone do atalho no estado normal -->
- `shortcutBarText` <!-- base: navigationText; variant: shortcutBar; label: Barra de atalhos; usage: Texto do atalho no estado normal -->
- `shortcutBarActiveBackground` <!-- base: navigationActiveBackground; variant: shortcutBar; label: Barra de atalhos; usage: Fundo do atalho selecionado -->
- `shortcutBarActiveIcon` <!-- base: navigationActiveIcon; variant: shortcutBar; label: Barra de atalhos; usage: Ícone do atalho selecionado -->
- `shortcutBarActiveText` <!-- base: navigationActiveText; variant: shortcutBar; label: Barra de atalhos; usage: Texto do atalho selecionado -->
- `shortcutBarActiveBorder` <!-- base: navigationActiveBorder; variant: shortcutBar; label: Barra de atalhos; usage: Borda do atalho selecionado -->
- `shortcutBarDisabledBackground` <!-- base: navigationDisabledBackground; variant: shortcutBar; label: Barra de atalhos; usage: Fundo do atalho desabilitado -->
- `shortcutBarDisabledBorder` <!-- base: navigationDisabledBorder; variant: shortcutBar; label: Barra de atalhos; usage: Borda do atalho desabilitado -->
- `shortcutBarDisabledIcon` <!-- base: navigationDisabledIcon; variant: shortcutBar; label: Barra de atalhos; usage: Ícone do atalho desabilitado -->
- `shortcutBarDisabledText` <!-- base: navigationDisabledText; variant: shortcutBar; label: Barra de atalhos; usage: Texto do atalho desabilitado -->
- `shortcutBarShadow` <!-- base: navigationShadow; variant: shortcutBar; label: Barra de atalhos; usage: Sombra da barra de atalhos -->

### overlay

- `overlayBackground`
- `overlayBorder`
- `overlayShadow`

### radio

- `radioBackground`
- `radioBorder`
- `radioDisabledBackground`
- `radioDisabledBorder`
- `radioDisabledDot`
- `radioSelectedBackground`
- `radioSelectedBorder`
- `radioSelectedDot`
- `radioText`

### switch

- `switchDisabledThumb`
- `switchDisabledTrack`
- `switchOffThumb`
- `switchOffTrack`
- `switchOnThumb`
- `switchOnTrack`

### text

- `textDanger`
- `textDisabled`
- `textInverse`
- `textLink`
- `textMuted`
- `textPlaceholder`
- `textPrimary`
- `textSecondary`
- `textSuccess`
- `textWarning`

### toast

- `toastBackground`
- `toastBorder`
- `toastDangerBackground`
- `toastDangerBorder`
- `toastDangerIcon`
- `toastDangerText`
- `toastIcon`
- `toastInfoBackground`
- `toastInfoBorder`
- `toastInfoIcon`
- `toastInfoText`
- `toastShadow`
- `toastSuccessBackground`
- `toastSuccessBorder`
- `toastSuccessIcon`
- `toastSuccessText`
- `toastText`
- `toastWarningBackground`
- `toastWarningBorder`
- `toastWarningIcon`
- `toastWarningText`

### tabela padrao (defaultTable)

- `defaultTable_badgeBackground` <!-- base: badgeBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - badgeBackground -->
- `defaultTable_badgeBorder` <!-- base: badgeBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - badgeBorder -->
- `defaultTable_badgeText` <!-- base: badgeText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - badgeText -->
- `defaultTable_buttonBackground` <!-- base: buttonBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonBackground -->
- `defaultTable_buttonBackgroundSecondary` <!-- base: buttonBackgroundSecondary; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonBackgroundSecondary -->
- `defaultTable_buttonBorder` <!-- base: buttonBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonBorder -->
- `defaultTable_buttonBorderSecondary` <!-- base: buttonBorderSecondary; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonBorderSecondary -->
- `defaultTable_buttonIcon` <!-- base: buttonIcon; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonIcon -->
- `defaultTable_buttonIconSecondary` <!-- base: buttonIconSecondary; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonIconSecondary -->
- `defaultTable_buttonPressedBackground` <!-- base: buttonPressedBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonPressedBackground -->
- `defaultTable_buttonPressedBorder` <!-- base: buttonPressedBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonPressedBorder -->
- `defaultTable_buttonPressedIcon` <!-- base: buttonPressedIcon; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonPressedIcon -->
- `defaultTable_buttonPressedText` <!-- base: buttonPressedText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonPressedText -->
- `defaultTable_buttonText` <!-- base: buttonText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonText -->
- `defaultTable_buttonTextSecondary` <!-- base: buttonTextSecondary; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - buttonTextSecondary -->
- `defaultTable_cardBackground` <!-- base: cardBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - cardBackground -->
- `defaultTable_cardBorder` <!-- base: cardBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - cardBorder -->
- `defaultTable_cardText` <!-- base: cardText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - cardText -->
- `defaultTable_checkboxBorder` <!-- base: checkboxBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - checkboxBorder -->
- `defaultTable_checkboxSelectedMark` <!-- base: checkboxSelectedMark; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - checkboxSelectedMark -->
- `defaultTable_dividerBackground` <!-- base: dividerBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - dividerBackground -->
- `defaultTable_dividerBorder` <!-- base: dividerBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - dividerBorder -->
- `defaultTable_inputBorder` <!-- base: inputBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - inputBorder -->
- `defaultTable_listItemBorder` <!-- base: listItemBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - listItemBorder -->
- `defaultTable_modalBackground` <!-- base: modalBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - modalBackground -->
- `defaultTable_modalBorder` <!-- base: modalBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - modalBorder -->
- `defaultTable_modalCloseIcon` <!-- base: modalCloseIcon; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - modalCloseIcon -->
- `defaultTable_modalHeaderText` <!-- base: modalHeaderText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - modalHeaderText -->
- `defaultTable_modalOverlay` <!-- base: modalOverlay; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - modalOverlay -->
- `defaultTable_modalText` <!-- base: modalText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - modalText -->
- `defaultTable_panelBackground` <!-- base: panelBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - panelBackground -->
- `defaultTable_panelBorder` <!-- base: panelBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - panelBorder -->
- `defaultTable_tableActionBackground` <!-- base: tableActionBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableActionBackground -->
- `defaultTable_tableActionBorder` <!-- base: tableActionBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableActionBorder -->
- `defaultTable_tableActionIcon` <!-- base: tableActionIcon; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableActionIcon -->
- `defaultTable_tableFooterBackground` <!-- base: tableFooterBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableFooterBackground -->
- `defaultTable_tableFooterBorder` <!-- base: tableFooterBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableFooterBorder -->
- `defaultTable_tableFooterText` <!-- base: tableFooterText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableFooterText -->
- `defaultTable_tableHeaderBorder` <!-- base: tableHeaderBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableHeaderBorder -->
- `defaultTable_tableHeaderText` <!-- base: tableHeaderText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableHeaderText -->
- `defaultTable_tableRowBorder` <!-- base: tableRowBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableRowBorder -->
- `defaultTable_tableRowEvenBackground` <!-- base: tableRowEvenBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableRowEvenBackground -->
- `defaultTable_tableRowMutedText` <!-- base: tableRowMutedText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableRowMutedText -->
- `defaultTable_tableRowOddBackground` <!-- base: tableRowOddBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableRowOddBackground -->
- `defaultTable_tableRowText` <!-- base: tableRowText; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableRowText -->
- `defaultTable_tableToolbarBorder` <!-- base: tableToolbarBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - tableToolbarBorder -->
- `defaultTable_textSecondary` <!-- base: textSecondary; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - textSecondary -->
- `defaultTable_toolbarBackground` <!-- base: toolbarBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - toolbarBackground -->
- `defaultTable_toolbarBorder` <!-- base: toolbarBorder; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - toolbarBorder -->
- `defaultTable_containerTransparentBackground` <!-- base: containerTransparentBackground; variant: defaultTable; label: Tabela padrão; usage: Tabela padrão - containerTransparentBackground -->

### filtro padrao (defaultFilter)

- `defaultFilter_badgeBackground` <!-- base: badgeBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - badgeBackground -->
- `defaultFilter_badgeText` <!-- base: badgeText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - badgeText -->
- `defaultFilter_buttonBackground` <!-- base: buttonBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonBackground -->
- `defaultFilter_buttonBackgroundSecondary` <!-- base: buttonBackgroundSecondary; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonBackgroundSecondary -->
- `defaultFilter_buttonBorder` <!-- base: buttonBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonBorder -->
- `defaultFilter_buttonBorderSecondary` <!-- base: buttonBorderSecondary; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonBorderSecondary -->
- `defaultFilter_buttonIcon` <!-- base: buttonIcon; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonIcon -->
- `defaultFilter_buttonIconSecondary` <!-- base: buttonIconSecondary; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonIconSecondary -->
- `defaultFilter_buttonPressedBackground` <!-- base: buttonPressedBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonPressedBackground -->
- `defaultFilter_buttonPressedBorder` <!-- base: buttonPressedBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonPressedBorder -->
- `defaultFilter_buttonPressedIcon` <!-- base: buttonPressedIcon; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonPressedIcon -->
- `defaultFilter_buttonPressedText` <!-- base: buttonPressedText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonPressedText -->
- `defaultFilter_buttonText` <!-- base: buttonText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonText -->
- `defaultFilter_buttonTextSecondary` <!-- base: buttonTextSecondary; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - buttonTextSecondary -->
- `defaultFilter_checkboxBorder` <!-- base: checkboxBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - checkboxBorder -->
- `defaultFilter_checkboxSelectedMark` <!-- base: checkboxSelectedMark; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - checkboxSelectedMark -->
- `defaultFilter_chipBackground` <!-- base: chipBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - chipBackground -->
- `defaultFilter_chipBorder` <!-- base: chipBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - chipBorder -->
- `defaultFilter_chipIcon` <!-- base: chipIcon; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - chipIcon -->
- `defaultFilter_chipSelectedBackground` <!-- base: chipSelectedBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - chipSelectedBackground -->
- `defaultFilter_chipText` <!-- base: chipText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - chipText -->
- `defaultFilter_iconWarning` <!-- base: iconWarning; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - iconWarning -->
- `defaultFilter_inputBackground` <!-- base: inputBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - inputBackground -->
- `defaultFilter_inputBorder` <!-- base: inputBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - inputBorder -->
- `defaultFilter_inputIcon` <!-- base: inputIcon; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - inputIcon -->
- `defaultFilter_inputPlaceholderText` <!-- base: inputPlaceholderText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - inputPlaceholderText -->
- `defaultFilter_inputText` <!-- base: inputText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - inputText -->
- `defaultFilter_modalBackground` <!-- base: modalBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - modalBackground -->
- `defaultFilter_modalBorder` <!-- base: modalBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - modalBorder -->
- `defaultFilter_modalCloseIcon` <!-- base: modalCloseIcon; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - modalCloseIcon -->
- `defaultFilter_modalHeaderText` <!-- base: modalHeaderText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - modalHeaderText -->
- `defaultFilter_modalOverlay` <!-- base: modalOverlay; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - modalOverlay -->
- `defaultFilter_modalText` <!-- base: modalText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - modalText -->
- `defaultFilter_tableFilterBackground` <!-- base: tableFilterBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - tableFilterBackground -->
- `defaultFilter_tableFilterBorder` <!-- base: tableFilterBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - tableFilterBorder -->
- `defaultFilter_tableFilterText` <!-- base: tableFilterText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - tableFilterText -->
- `defaultFilter_tableRowBorder` <!-- base: tableRowBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - tableRowBorder -->
- `defaultFilter_textPrimary` <!-- base: textPrimary; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - textPrimary -->
- `defaultFilter_textSecondary` <!-- base: textSecondary; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - textSecondary -->
- `defaultFilter_toolbarBackground` <!-- base: toolbarBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - toolbarBackground -->
- `defaultFilter_toolbarBorder` <!-- base: toolbarBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - toolbarBorder -->
- `defaultFilter_chipSelectedText` <!-- base: chipSelectedText; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - chipSelectedText -->
- `defaultFilter_listItemBackground` <!-- base: listItemBackground; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - listItemBackground -->
- `defaultFilter_listItemBorder` <!-- base: listItemBorder; variant: defaultFilter; label: Filtro padrão; usage: Filtro padrão - listItemBorder -->

### acoes da tabela de pedidos (custom)

- `buttonBackground_customOpen` <!-- base: buttonBackground; variant: customOpen; label: Botão Abrir (tabela de pedidos); usage: Botão Abrir (tabela de pedidos) - buttonBackground -->
- `buttonBorder_customOpen` <!-- base: buttonBorder; variant: customOpen; label: Botão Abrir (tabela de pedidos); usage: Botão Abrir (tabela de pedidos) - buttonBorder -->
- `buttonIcon_customOpen` <!-- base: buttonIcon; variant: customOpen; label: Botão Abrir (tabela de pedidos); usage: Botão Abrir (tabela de pedidos) - buttonIcon -->
- `buttonText_customOpen` <!-- base: buttonText; variant: customOpen; label: Botão Abrir (tabela de pedidos); usage: Botão Abrir (tabela de pedidos) - buttonText -->
- `buttonBackground_customPay` <!-- base: buttonBackground; variant: customPay; label: Botão Pagar (tabela de pedidos); usage: Botão Pagar (tabela de pedidos) - buttonBackground -->
- `buttonBorder_customPay` <!-- base: buttonBorder; variant: customPay; label: Botão Pagar (tabela de pedidos); usage: Botão Pagar (tabela de pedidos) - buttonBorder -->
- `buttonIcon_customPay` <!-- base: buttonIcon; variant: customPay; label: Botão Pagar (tabela de pedidos); usage: Botão Pagar (tabela de pedidos) - buttonIcon -->
- `buttonText_customPay` <!-- base: buttonText; variant: customPay; label: Botão Pagar (tabela de pedidos); usage: Botão Pagar (tabela de pedidos) - buttonText -->
- `buttonBackground_customInfo` <!-- base: buttonBackground; variant: customInfo; label: Botão i (tabela de pedidos); usage: Botão i (tabela de pedidos) - buttonBackground -->
- `buttonBorder_customInfo` <!-- base: buttonBorder; variant: customInfo; label: Botão i (tabela de pedidos); usage: Botão i (tabela de pedidos) - buttonBorder -->
- `buttonIcon_customInfo` <!-- base: buttonIcon; variant: customInfo; label: Botão i (tabela de pedidos); usage: Botão i (tabela de pedidos) - buttonIcon -->
- `buttonText_customInfo` <!-- base: buttonText; variant: customInfo; label: Botão i (tabela de pedidos); usage: Botão i (tabela de pedidos) - buttonText -->

### Transporte dos modos claro e escuro

Os nomes de objetos acima permanecem canônicos. No mapa plano entregue por
`/themes-colors.css`, os sufixos `-light` e `-dark` identificam o modo de cada
valor (exemplo: `cardBackground-light`, `cardBackground-dark`). O consumidor
remove o sufixo ao selecionar o modo; componentes continuam referenciando
`cardBackground`. Nenhum prefixo por empresa, módulo ou tela é necessário.
Temas legados sem entradas por modo conservam seu contrato de leitura existente.


### Contrato consumido pelo aplicativo

- `scripts/generate-theme-contract.cjs` deriva os grupos e nomes deste Markdown.
- `src/styles/themeContract.generated.js` é um resultado automático; não deve ser editado manualmente.
- Claro e escuro usam as variantes `-light` e `-dark`; primário e secundário descrevem o papel do objeto, não o modo.
- Rótulos de apresentação já existentes, incluindo Tokens Base e Google loading, permanecem no editor. Não são novos nomes canônicos de cor.
- O preview Google loading utiliza o papel oficial `loadingSpinner`. Valores legados existentes no banco são preservados.
- O editor, a validação e o inspetor consomem o mesmo contrato. Os valores permanecem no tema do banco.
