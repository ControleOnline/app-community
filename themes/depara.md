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
