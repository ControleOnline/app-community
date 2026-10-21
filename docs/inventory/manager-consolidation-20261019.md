# Consolidar a nova experiência Manager nos módulos compartilhados, preservando o core e os dois layouts

## Pedido e limites

Inventário da experiência desenvolvida localmente com Leandro e plano de consolidação em uma única tarefa de trabalho. Substitui o acompanhamento local de app-community#1099 e api-community#268, preservando o histórico por referência. Não é uma RC nem declaração de entrega/publicação.

Nesta rodada: inventariar, comparar código e trabalho do time, criar a tarefa e desativar as duas anteriores. **Não incorporar mudanças, instalar novas versões, alterar regras/dados de negócio, publicar pacotes, fazer push/merge/deploy, alterar devices ou executar migrations.**

Objetivo de produto: dar personalidade e uma UX/UI moderna e consistente ao Manager, usando os defaults, commons, stores, permissões, configuração de empresa/domínio/device e mecanismos de cache existentes. Preservar o modelo comercial. O trabalho inclui correções técnicas de leitura, navegação e renderização; não descrevê-lo incorretamente como alteração somente de CSS.

## Fotografia verificada em 19/10/2026

- APP master: `a22cf68a1c795ce77efacb8c29a000bace7c8b67`, 1.10.72; staging `befcd10440005affbf7d3a7623309d834567d0b7`; dev `26e12bcb79b009c5f2f2bec47a1d1be636bc5faa`.
- Checkout de trabalho continua `task-1099`, HEAD `b30349fa3c853e85f8c2a8f24ef4ecded9a6a56e` (1.10.68), com conciliação local da 1.10.72, arquivos novos e alterações não commitadas. Não confundir pacote local .72 com merge remoto concluído.
- API master: `8e047ccc9413b3e254a7694a971a56c995379942`; trabalho em `task-268` com modificações locais.
- As refs foram atualizadas para inspeção, sem merge/rebase/reset/cherry-pick e sem alterar a composição instalada.
- Inventário de arquivos e hashes: `docs/inventory/manager-consolidation-20261019.json`. São 61 destinos de overlays npm em 10 módulos ControleOnline e um backport externo react-native-screens; além do código do app e 12 entradas em manifests Composer (11 destinos distintos, incluindo testes).

## Inventário por proprietário

| Módulo / base instalada | Ajustes locais a consolidar/revisar no destino correto |
| --- | --- |
| app-community 1.10.72 local | Shell e roteamento Manager; Home/indicadores/período; cabeçalho, menu, conta, login; wrappers de PDV, produtos, dispositivos, configurador e resultados; superfícies claro/escuro; runtime de experiência/leitura; inicialização local e proxy loopback; runners, documentação e testes. Separar protótipos, diagnóstico opcional e experimentos de avatar da entrega oficial. |
| ui-manager 1.0.21 | Não há overlay direto neste inventário. Avaliar nele o destino dos componentes específicos do Manager hoje no app, reaproveitando a Home e contratos já existentes, sem criar novo core. |
| ui-default 1.0.280 | DefaultTable/linhas/controles/toolbar/colunas/busca modal; base DefaultEntityCard; compactação e densidade; chave de grade responsiva; ownership e refresh de consultas; paginação de dados controlados; sincronização de configs sem loops; DefaultFile e DefaultInput; temas compartilhados. |
| ui-common 1.2.97 | Navegação inferior configurável e runtime; preferências; Devices/lista/grupos; ConfiguratorPage; AnimatedModal; UserAvatar e extração compartilhada do token; API/transporte; invalidação de catálogo. |
| ui-layout 1.0.19 | Integração do DefaultLayout e preferência da navegação inferior, mantendo composição do core. |
| ui-products 1.0.37 | Categorias/cards coloridos e hierarquia; abas, busca e entrada nativa; produtos e foto autenticada; ProductItem/CustomizeScreen; cache contextual web/native e invalidação; tokens de superfícies e testes. |
| ui-orders 1.3.47 | AddProductScreen reutilizando catálogo/cache; cards e rodapé do histórico com densidade/resumo; manter PdvPage, checkout, criação/retomada e pagamentos compartilhados. |
| ui-people 1.0.97 | Cards de clientes com base visual compartilhada, superfícies e avatar por tokens; preservar campos, permissões, seleção e ações. |
| ui-financial 1.1.42 | IncomeStatement/Resultados usando inputs e modal compartilhados; preservar cálculo e filtros. |
| ui-config 1.0.24 | Adaptação de layout em GeneralSettings, preservando configuração e operações existentes. |
| ui-translate 1.1.65 | Contrato de filtros/opções e overview; paginação controlada; separar herança da principal e revisão pendente; não rotular a própria principal como fallback; manter ações/conteúdo de traduções. |
| ui-login 1.0.115 | Props opcionais para identificação/intro da apresentação Manager, sem alterar autenticação nem os defaults dos demais apps. |
| react-native-screens 4.16.0 | Backport local de dispatch na UI thread em NativeProxy.kt, referenciado à implementação upstream 4.18.0. Revisar necessidade, versão e distribuição oficial; não tratar patch em node_modules como entrega final. |
| api-platform-common / controleonline/common v1.0.5 | Hidratação de coleções/metadata em lote e normalizadores; leitura do status/lista de catálogo; serviços e regressões, preservando permissões, resultados e isolamento por requisição. |
| api-platform-people / controleonline/people v1.0.3 | PeopleLink e contrato/normalização de leitura; verificar origem do delta local antes de portar. |
| api-community | Precedência das rotas explícitas de módulos e `/translates/overview`; configuração CSRF presente; testes de metadata e helper de servidor local com workers. `config/reference.php` tem deriva gerada, e `.env.dev` existe: revisar origem/necessidade, não incluir automaticamente nem publicar configuração/credencial local. |

## Telas e superfícies atingidas

Home e indicadores; login/conta; shell/menu/cabeçalho/navegação inferior/rodapé; PDV e catálogo; produtos/categorias/customização; clientes e listas de pessoas; pedidos/histórico e seu resumo/ações; dispositivos; configurador/GeneralSettings; financeiro/Resultados; Traduções. Outros consumidores do DefaultTable herdam alterações do componente e devem entrar na regressão global: colaboradores, empresas, integrações, vitrines e cadastros pertinentes. Isso é mapa de impacto, **não prova de homologação de todas as telas**.

## Comparação com o time: o que preservar e o que ainda conciliar

1. Mudanças de Alexandre/Kim em DefaultTable compacto e histórico responsivo (#1047/#1092): bases já consumidas ui-default 1.0.280, ui-orders 1.3.47, ui-financial 1.1.42. Não reimplementar o piloto antigo por cima dos defaults atuais.
2. Novo produto em branco (#1100): ui-products 1.0.37, correção em ProductForm/ProductFormFields já conciliada localmente. Preservar ordem de hooks e import; não regredir para .36 da dev apenas porque está naquela branch.
3. Lavego #1101/#1108: fontes no export e workflow com ADMIN próprio, remoção do destino POS, default ADMIN+SHOP; APP é alvo explícito. O conteúdo local desses workflows coincide com master nesta inspeção. Não restaurar o pedido antigo #1063 de APP+POS+SHOP sobre o resultado mais recente, nem interpretar o nome do destino como modo de device.
4. **Novo delta ainda não incorporado:** ui-common 1.2.98 em master/staging do módulo e app/dev via #1114; nosso app usa .97. A comparação dos tarballs publicados mostrou mudanças também em UserAvatar, BottomNavigationBar, RuntimeBottomNavigationBar, DefaultProvider e estilos/rodapé, não só truncamento do identificador (#88). Há sobreposição com nossos ajustes; reconciliar arquivo a arquivo preservando autenticação de imagens e preferências/tema.
5. **Outro delta ainda não incorporado:** app/dev usa ui-people 1.0.99; nosso app/master usa .97. Tarballs diferem em people/customActions e people_domains columns/formatters. Relacionado a #1075 (appType por people_domain/defaultCompany, domínio como fonte runtime). Preparar ativação deve respeitar esse contrato e seu estágio real de backend/consumidores; não forçar APP_TYPE=MANAGER globalmente.
6. Várias masters de módulos declaram versões anteriores às já publicadas e consumidas pelo app: ui-default master 1.0.272/dev .280, ui-orders 1.3.36/dev .47, ui-products 1.0.32/dev .37, ui-layout 1.0.15/dev .19, ui-people 1.0.91/dev .99, ui-financial 1.1.38/dev .42. O JSON registra SHAs, versões e gitHead dos pacotes. **Não copiar master cegamente nem presumir que a maior versão prova ancestry/compatibilidade.** Resolver a composição a partir dos commits de origem, referências publicadas e diferenças semânticas.
7. ui-config/ui-translate publicados não fornecem gitHead e ainda apontam repository legado conline-quasar-ui nos metadados npm; confirmar proveniência antes de portar/publicar nos repositórios atuais.

## Lavego / PDV SINGLE_ITEM: comparação e limite

- Tarefas existentes: app-community#787 (simplificar UX SINGLE_ITEM POS/Manager) e #788 (entrada/navegação do PDV Manager), com antecedente #706 Devices. Mantê-las como referências/dependências; não encerrá-las nesta consolidação. Não atribuir autoria do código específico a uma pessoa só pelo título de tarefa.
- Fluxo atual rastreado: ManagerPdvPage delega a ui-orders/PdvPage → AddProductScreen. `isPosSingleItemMode(runtimeDeviceConfig.configs)` ou parâmetro singleItemMode alimenta `resolveShouldListProductsDirectly`; quando verdadeiro, renderiza ProductsPage com sentinela de todos os produtos, em vez da entrada por categorias. Checkout continua compartilhado, lendo a mesma configuração. Não há justificativa para forçar o fluxo de garçom na Lavego.
- O preview acrescenta apresentação, cache e parâmetros ao redor desse core. Há diferenças de composição entre web estreita e Android, ligadas à flag nativa; revisar deliberadamente sem redesenho não solicitado.
- **Não validado nesta rodada:** domínio/tenant Lavego autenticado, device ativo real em SINGLE_ITEM e ciclo comercial completo. Não transformar o smoke GYROS/categorias em prova de SINGLE_ITEM. Não mudar a configuração do device para simular resultado, criar pedido, cobrar, cancelar, imprimir ou sincronizar plataformas nesta investigação.
- Matriz obrigatória antes da entrega: layouts antigo/novo × web larga/estreita/Android × SINGLE_ITEM, balcão, garçom/mesa/comanda; preservação de produto único, pedido ativo, preço/total, caixa, retorno, checkout, autorização e ausência de criação duplicada. Fluxos comerciais exigem ambiente/dados de teste apropriados e autorização própria.

## Coexistência e ativação

- `npm run web:manager-preview`: executa aplicadores locais e ativa o novo Manager por flag; `npx expo start --web`: apresentação anterior, mesmo projeto/dependências. O segundo comando não desfaz patches já aplicados, logo não equivale a uma instalação limpa dos pacotes. Validar também a apresentação anterior com os módulos compartilhados finais.
- Novo visual web está atualmente limitado a localhost em `shouldPreview`; Android depende de flag específica. Preparar ativação explícita por produto/domínio/configuração compatível com #1075, reversível e sem mudar ADMIN/POS/SHOP por acidente; não ligar globalmente nesta tarefa de inventário.
- Destino definitivo: fontes dos módulos, versões numéricas estáveis publicadas antes dos pins do app/API. Não entregar dependências locais/Git/branch ou node_modules editado como pacote oficial. Não publicar versões nesta rodada.
- Manter o visual aprovado, tokens de tema claro/escuro e modo antigo disponível; nenhuma nova rodada de redesign autorizada.

## Evidência existente e pendências de publicação

- Manager: 74 suítes / 297 testes passaram. Compartilhados: 23 suítes / 138 Jest + 2 Node passaram nas rodadas documentadas. Não foram repetidos testes nesta rodada de inventário.
- Web larga/393px e AVD API25: composição, tema, cards e Traduções conferidos; novo APK .72 com login GYROS e paginação 1–20 → 21–40; web até 1081–1081 e retorno. A travessia nativa completa das 55 páginas pertence ao APK .68, não à .72.
- API: comparação isolada mostrou zero novas regressões e os mesmos 66 problemas anteriores. A suíte continua vermelha; não declarar aprovação global. Teste legado de workflow com arquivo ausente também continua registrado.
- Tempos locais amostrais, sem promessa para produção: status catálogo 675→106 SQL e 25,150→8,014s; integrações 222→87 SQL e 6,059→2,980s; coleção de 20 clientes 212→25 SQL e aproximadamente 5,7→1,0s. Ver relatórios API para contexto e limites.
- Pacotes locais .72 gerados com hashes; APK é localpreview/x86/Debug, **não pacote Android oficial**. Não houve publicação. ZIP web sozinho não ativa o novo visual em domínio oficial.
- Antes de publicar: consolidar fontes/proveniência/dependências e deltas do time; resolver ou registrar tratamento das falhas anteriores; validar CI/segurança, composição e SINGLE_ITEM em ambiente adequado; gerar configuração e assinatura/arquiteturas oficiais; smoke da composição exata em staging; plano de reversão; autorização humana de publicação.

## Critérios de aceite da futura consolidação

- [ ] Mapear cada destino do inventário para seu repositório/componente canônico e separar ferramentas/protótipos/configurações locais da entrega.
- [ ] Conciliar .98/.99 e mudanças novas do time sem perda do trabalho aprovado nem reintrodução de versões antigas.
- [ ] Preservar regras comerciais, stores, autorização, empresa/domínio/device, preferências, cache e todos os modos operacionais.
- [ ] Reaproveitar defaults/commons, sem core paralelo ou layouts de tela duplicando regras.
- [ ] Provar coexistência antigo/novo e ativação reversível por contexto; web/Android claro/escuro, cards/lista, busca/filtros/ordenação/paginação/ações.
- [ ] Cobrir SINGLE_ITEM Lavego pelo fluxo e configuração reais de teste, separadamente de GYROS/garçom.
- [ ] Documentar versões/SHAs/hashes, testes passados/falhos/ignorados, limites e evidência da composição final.
- [ ] Submeter entrega/publicação posterior ao fluxo canônico e à autorização humana; esta tarefa não concede autorização automática de deploy.

Referências históricas: app-community#1099, api-community#268, app-community#1047, #1092, #1100, #1101, #1108, #1114, #1075, #787, #788, #706 e ui-common#88. Somente #1099 e api-community#268 serão desativadas a pedido do usuário, como substituídas, sem alegar implementação/publicação concluída.

## Anexo: destinos exatos dos overlays npm locais


**@controleonline/ui-common**

- `src/api/index.js`
- `src/react/components/AnimatedModal.js`
- `src/react/components/BottomNavigationBar.js`
- `src/react/components/BottomNavigationBar.soft.styles.js`
- `src/react/components/ProductCatalogCacheService.js`
- `src/react/components/RuntimeBottomNavigationBar.js`
- `src/react/components/UserAvatar.js`
- `src/react/hooks/useBottomNavigationPreference.js`
- `src/react/pages/Devices.js`
- `src/react/pages/Devices/deviceTypes/DeviceGroupCard.js`
- `src/react/pages/Devices/deviceTypes/shared.js`
- `src/react/utils/productCatalogCacheRevision.js`
- `src/tests/react/utils/storedSessionToken.test.js`
- `src/utils/storedSessionToken.js`

**@controleonline/ui-config**

- `src/react/pages/ConfiguratorPage.js`

**@controleonline/ui-default**

- `src/react/components/cards/DefaultEntityCard.js`
- `src/react/components/files/DefaultFile.js`
- `src/react/components/inputs/DefaultInput.js`
- `src/react/components/table/DefaultColumnMenu.js`
- `src/react/components/table/DefaultSearchModal.js`
- `src/react/components/table/DefaultTable.js`
- `src/react/components/table/DefaultTable.layoutUtils.js`
- `src/react/components/table/DefaultTableCards.js`
- `src/react/components/table/DefaultTableControls.js`
- `src/react/components/table/DefaultTableInput.js`
- `src/react/components/table/DefaultTableRows.js`
- `src/react/components/table/DefaultTableToolbar.js`
- `src/react/components/table/useDefaultTablePagination.js`
- `src/react/components/table/useDefaultTableStoreSync.js`
- `src/store/default/actions.js`
- `src/tests/react/components/table/defaultTableTestSetup.cjs`

**@controleonline/ui-financial**

- `src/react/pages/reports/IncomeStatement.js`

**@controleonline/ui-layout**

- `src/react/layouts/DefaultLayout.js`

**@controleonline/ui-login**

- `src/react/pages/sign-in/index.js`

**@controleonline/ui-orders**

- `src/react/pages/checkout/AddProductScreen.js`
- `src/react/pages/orders/OrderHistoryCard.js`
- `src/react/pages/orders/OrderHistoryCompactFooter.js`

**@controleonline/ui-people**

- `src/react/pages/People.js`

**@controleonline/ui-products**

- `package.json`
- `src/react/components/products/ProductItem.js`
- `src/react/pages/Categories.js`
- `src/react/pages/CategoriesPage/CategoryCard.js`
- `src/react/pages/CategoriesPage/HierarchicalCategoryTabs.js`
- `src/react/pages/CategoriesPage/NativePdvCategoryEntry.js`
- `src/react/pages/CategoriesPage/PdvCategoryTabs.js`
- `src/react/pages/CategoriesPage/PdvProductSearch.js`
- `src/react/pages/CategoriesPage/categoryPresentationPalette.js`
- `src/react/pages/CategoriesPage/useCategoryProductCounts.js`
- `src/react/pages/CustomizeScreen.js`
- `src/react/pages/Products.js`
- `src/react/utils/cachedCatalogActions.js`
- `src/react/utils/catalogCacheScope.js`
- `src/react/utils/catalogCacheStorage.js`
- `src/react/utils/catalogCacheStorage.native.js`
- `src/react/utils/catalogSessionFingerprint.js`
- `src/react/utils/categoryHierarchy.js`
- `src/tests/react/components/ProductItemCustomizationRoute.test.js`
- `src/tests/react/pages/CategoriesPage/waiterCatalogRecovery.test.js`

**@controleonline/ui-translate**

- `src/react/pages/TranslationReviewRow.js`
- `src/react/pages/TranslationsReviewPage.js`

**react-native-screens**

- `android/src/fabric/java/com/swmansion/rnscreens/NativeProxy.kt`

## Resultado administrativo desta rodada

Tarefa única: https://github.com/ControleOnline/app-community/issues/1117, aberta, assignee GitLeandroHub, Project #1 / Ready. app-community#1099 e api-community#268 encerradas como substituídas (not_planned), com link e corpo original preservados; seus itens foram retirados do quadro ativo. Não foram apagadas permanentemente nem marcadas como entrega concluída. As tarefas #787/#788 e as demais referências do time permanecem independentes.

Verificação final: os 61 hashes dos destinos instalados continuam iguais ao início do inventário; o único novo item no status Git do app é `docs/inventory/`. Sem integração, mudança de versão instalada ou publicação. A próxima ação é revisar/autorizar a consolidação descrita nesta tarefa.
