### ### ### MAPA DE TEMA ### ### ###

Objetivo:
- centralizar os nomes canônicos dos tokens de cor
- evitar prefixos por modulo ou tela
- servir como referencia para o codigo, `themes-new.md` e `themes-todo.md`

Regras:
- usar apenas nomes semanticos globais
- nao usar `colors.js` como origem final
- nao usar `defaultCompany.theme`
- nao usar `currentCompany.theme`
- se um token nao existir no tema oficial, registrar em `themes-new.md` ate ele existir de fato

### OBSERVACAO

- quando existir duvida sobre o nome, preferir o nome que descreve o papel visual e nao o arquivo onde ele nasceu
- se o mesmo papel visual aparecer em varios modulos, o token deve continuar sendo o mesmo
- se o papel visual for diferente, criar outro token semantico, sem prefixo de modulo

### TOKENS BASE

- `background`
- `border`
- `googleLoading`
- `placeholderText`
- `shadow`
- `surface`
- `textPrimary`
- `textSecondary`

### MAPA DE OBJETOS

Usar os mesmos nomes em qualquer objeto quando o papel visual for o mesmo.

### estrutura da tela

- `appBackground`
- `containerBackground`
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

### barra

- `footerBackground`
- `footerBorder`
- `headerBackground`
- `headerBorder`
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
- `buttonBorder`
- `buttonDisabledBackground`
- `buttonDisabledText`
- `buttonFocusBorder`
- `buttonHoverBackground`
- `buttonIcon`
- `buttonPressedBackground`
- `buttonShadow`
- `buttonText`

### card

- `cardBackground`
- `cardBorder`
- `cardDisabledBackground`
- `cardDisabledText`
- `cardHeaderBackground`
- `cardHeaderText`
- `cardIcon`
- `cardSelectedBackground`
- `cardSelectedBorder`
- `cardSelectedText`
- `cardShadow`
- `cardText`

### checkbox

- `checkboxBackground`
- `checkboxBorder`
- `checkboxDisabledBackground`
- `checkboxDisabledBorder`
- `checkboxDisabledMark`
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
- `iconDanger`
- `iconDisabled`
- `iconInfo`
- `iconInverse`
- `iconMuted`
- `iconSuccess`
- `iconWarning`

### input

- `inputBackground`
- `inputBorder`
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
- `listItemIcon`
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

- `switchBorder`
- `switchDisabledThumb`
- `switchDisabledTrack`
- `switchFocusBorder`
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
