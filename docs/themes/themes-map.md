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
- `buttonShadow`
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

### header

- `headerBackground`
- `headerBorder`
- `headerIcon`
- `headerLink`
- `headerText`

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
- `shortcutBarBackground` <!-- base: navigationBackground; variant: shortcutBar; label: Barra de atalhos; usage: Fundo da barra de atalhos inferior do Manager -->
- `shortcutBarBorder` <!-- base: navigationBorder; variant: shortcutBar; label: Barra de atalhos; usage: Borda da barra de atalhos inferior do Manager -->
- `shortcutBarIcon` <!-- base: navigationIcon; variant: shortcutBar; label: Barra de atalhos; usage: Ícone do atalho no estado normal -->
- `shortcutBarText` <!-- base: navigationText; variant: shortcutBar; label: Barra de atalhos; usage: Texto do atalho no estado normal -->
- `shortcutBarActiveBackground` <!-- base: navigationActiveBackground; variant: shortcutBar; label: Barra de atalhos; usage: Fundo do atalho selecionado -->
- `shortcutBarActiveIcon` <!-- base: navigationActiveIcon; variant: shortcutBar; label: Barra de atalhos; usage: Ícone do atalho selecionado -->
- `shortcutBarActiveText` <!-- base: navigationActiveText; variant: shortcutBar; label: Barra de atalhos; usage: Texto do atalho selecionado -->

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
