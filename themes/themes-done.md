
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

### ui-contracts

- `modules/controleonline/ui-contracts/src/react/theme/contractsTheme.js`
  `linhas: 1-120`
  `antes: cada tela resolvia cores e status localmente com valores hardcoded ou aliases locais`
  `depois: palette e cores de status centralizadas em helper baseado somente em themeStore.getters.colors`

- `modules/controleonline/ui-contracts/src/react/components/contracts.js`
  `linhas: 18-179`
  `antes: status, icones, spinner e estados vazios com cores literais`
  `depois: tela lendo palette do tema ativo e consumindo somente tokens semanticos`

- `modules/controleonline/ui-contracts/src/react/components/contracts.styles.js`
  `linhas: 1-169`
  `antes: StyleSheet estatico com backgrounds, bordas, textos e botao hardcoded`
  `depois: createStyles(palette) usando apenas tokens do tema`

- `modules/controleonline/ui-contracts/src/react/components/CreateContractModal.js`
  `linhas: 50-601`
  `antes: modal, selects, placeholders, icones, estados vazios e loading com cores literais`
  `depois: modal ligado ao themeStore com palette semantica e sem hardcoded`

- `modules/controleonline/ui-contracts/src/react/components/CreateContractModal.styles.js`
  `linhas: 1-253`
  `antes: estrutura visual do modal dependia de cores fixas`
  `depois: createStyles(palette) com tokens de modal, select, button e text`

- `modules/controleonline/ui-contracts/src/react/pages/ContractsPage.js`
  `linhas: 29-652`
  `antes: colors.js, status hardcoded, chips com cores locais e inputs com placeholder literal`
  `depois: palette do tema ativo, status via helper central e chips/input usando tokens canonicos`

- `modules/controleonline/ui-contracts/src/react/pages/ContractsPage.styles.js`
  `linhas: 1-219`
  `antes: pagina com cards, filtros, skeleton e CTA em cores fixas`
  `depois: createStyles(palette) sem dependencia de alias local`

- `modules/controleonline/ui-contracts/src/react/pages/ContractDetails.js`
  `linhas: 19-608`
  `antes: detalhes, tabs, assinatura, picker e visualizacao de PDF com cores literais e status vindo de cor local`
  `depois: detalhes usando palette do tema ativo e status mapeado por tokens do tema`

- `modules/controleonline/ui-contracts/src/react/pages/ContractDetails.styles.js`
  `linhas: 1-321`
  `antes: topo, tabs, listas, formularios e skeleton com cores hardcoded`
  `depois: createStyles(palette) com tokens semanticos para page, navigation, listItem e section`


### ui-people

### ui-manager

- `modules/controleonline/ui-manager/src/react/pages/FinancialHubPage.js`
  `linhas: 36-179`
  `antes: resolveThemePalette(themeTokens, colors), currentCompany.theme, fallbacks locais e cor hardcoded`
  `depois: palette montada somente de themeStore.getters.colors com tokens canônicos e sem fallback`

- `modules/controleonline/ui-manager/src/react/pages/FinancialHubPage.styles.js`
  `linhas: 1-64`
  `antes: createStyles recebendo colors como base e chip com fallback visual`
  `depois: createStyles usando somente palette local vinda do tema ativo`

- `modules/controleonline/ui-manager/src/react/pages/ThemeManagerPage.js`
  `linhas: 280-323, 1410-1495, 1922-2038, 2620-2800`
  `antes: listItem sem tokens dedicados para linhas pares e impares, sem rgba no editor e sem ajuda ampliada no HEX`
  `depois: listItem com listItemOddRow e listItemEvenRow fixos no editor e no grupo de referencia, editor aceitando rgba e tooltip ampliada no campo HEX`

### ui-default

- `modules/controleonline/ui-default/src/react/components/table/DefaultTable.js`
  `linhas: 475-476, 1356`
  `antes: zebra da tabela dependia apenas de bg-odd-light e bg-even-light`
  `depois: zebra prioriza listItemOddRow e listItemEvenRow, mantendo os tokens antigos como compatibilidade`
