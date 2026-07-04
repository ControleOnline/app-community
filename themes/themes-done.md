
### ### ### MÓDULOS / ARQUIVOS CORRIGIDOS ### ### ###

### ui-accountig

### ui-carrier

### ui-login

- `modules/controleonline/ui-login/src/react/pages/sign-in/index.styles.js`
  `linhas: 1-41`
  `antes: resolveThemePalette(themeColors, colors) + fallbacks literais`
  `depois: resolveThemePalette(themeColors, {}) + tokens lidos somente de themeColors`

- `modules/controleonline/ui-login/src/react/pages/sign-in/index.js`
  `linhas: 234, 371-390`
  `antes: fallbackLogo local + background visual com fallback fora de theme.colors`
  `depois: logo somente via brandCompany.logo e tela sem background por imagem`

- `modules/controleonline/ui-login/src/react/pages/reset-password/index.js`
  `linhas: 77, 144-166`
  `antes: fallbackLogo local + background visual com fallback fora de theme.colors`
  `depois: logo somente via brandCompany.logo e tela sem background por imagem`

- `modules/controleonline/ui-login/src/react/pages/confirm-account/index.js`
  `linhas: 72, 144-164`
  `antes: fallbackLogo local + background visual com fallback fora de theme.colors`
  `depois: logo somente via brandCompany.logo e tela sem background por imagem`


### ui-people
