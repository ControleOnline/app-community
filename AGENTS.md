## Configuração local para testes

- app-community\config\key.local.js tem a informação da chave de API de um usuário de testes. Esse usuário pode ser utilizado para realizar chamadas à API e confirmar informações sobre o funcionamento. Use quando precisar.

## Regra transversal de categorias e filtros financeiros
- Consumidores internos carregam categorias por `company` e contexto; `people` nao e parametro valido de `Category`.
- O Shop anonimo le categorias somente pelas rotas `/shop/categories`, nunca pela colecao interna generica.
- Contas a receber usam categorias `receive` e contrapartes `client`/`provider`; contas a pagar usam categorias `payer` e todas as pessoas com vinculo ativo na empresa.
- Opcoes de listas compartilhadas devem permanecer isoladas por coluna, empresa e parametros da tela, inclusive durante respostas concorrentes.

## Qualidade

- Rodar lint e testes antes de concluir.
- Não introduzir breaking changes sem destacar.
- Preferir mudanças pequenas e isoladas.
- Tudo precisa ser reaproveitável, pequeno e organizado
- Não misturar responsabilidades entre componentes
- Componentes devem ser pequenos, o menor possível
- O CSS deve ficar separado em outro arquivo para facilitar a leitura do código
- Cada componente deve trabalhar com seus estados de forma separada, podendo ser adicionados em qualquer outro lugar com facilidade e poucos parâmetros, sendo auto-suficientes e desacoplados
- Leitura de dados em telas e tabs deve vir de stores/actions do modulo; não chamar `api.fetch` diretamente quando houver store correspondente.
- Normalização de coleção e montagem de payload não devem ficar na tela. Se o backend ou o store já expõem o contrato, a tela consome o contrato direto.
- Não usar cadeia de fallback com `||` para adivinhar campos de payload quando o contrato do backend já define o valor canônico. Use o campo certo e só mantenha fallback quando ele estiver documentado no contrato.
- Filtros de selecao curta nao devem usar fileiras longas de chips ocupando a largura da tela. O padrao do sistema agora e seletor compacto com valor atual visivel e modal/lista de opcoes.
- Sempre que um filtro desse tipo puder ser compartilhado, ele deve nascer em `ui-default` e ser reutilizado pelos apps, evitando recriar chips e modais locais por tela.
- Filtros de listagem devem seguir o contrato historico de `filters` e `externalFilters`: o estado aplicado fica no store em `filters`, e a exibicao dos campos deve ser decidida pelas configuracoes do store, especialmente `columns`.
- `configs.filters` habilita/desabilita filtros da listagem. `configs.externalFilters` controla o painel de filtros fora da tabela; quando for `false`, a tela nao deve renderizar esse painel.
- No Vue legado, `DefaultTable` renderiza `DefaultExternalFilters` apenas quando `configs.filters`, `configs.externalFilters != false`, `configs.headers != false` e a tela e desktop. Esse painel mostra somente colunas incluidas por `shouldIncludeColumn(column)` e marcadas com `column.externalFilter == true`, alem de `configs.components.customFilters`.
- Filtros inline/de cabecalho no Vue aparecem por coluna quando `configs.filters` esta ativo e `column.filter != false`. Portanto, em React, nao criar filtros fixos por tela quando o store ja descreve as colunas: a tela deve derivar quais filtros aparecem a partir de `columns`, respeitando `visible`, `filter`, `externalFilter`, `filterClass`, `inputType`, `list` e `formatFilter`.
- Filtros React de periodo/data devem reaproveitar `DateShortcutFilter`; filtros de status e selecoes curtas devem reaproveitar `CompactFilterSelector`. Esses componentes pertencem a `ui-default`, devem receber `store` e `field` e resolver internamente a coluna/label a partir das `columns` do store; a tela deve passar apenas contexto, valor e opcoes quando necessario.
- Busca textual padrao de listagens React deve ser configurada via `searchProps` do `DefaultTable`, renderizada pequena na toolbar usando `DefaultSearch` de `ui-default`; telas consumidoras nao devem recriar `TextInput` de busca local nem posicionar busca fora da toolbar default.
- Sempre que uma tela usar `DefaultTable`, o backend e o store tambem precisam sustentar o contrato completo da listagem: ordenacao, pesquisa, filtros e paginação. Ordenacao de campos data precisa respeitar o valor real da data no backend, e a pesquisa deve ser tratada no backend com `CustomOrFilter` ou um mecanismo equivalente para buscar nos campos corretos sem depender de filtro local no front.
- Em React, `DefaultExternalFilters` deve detectar largura compacta e renderizar apenas um botao de filtros que abre modal com os campos. Telas consumidoras nao devem criar accordion/header mobile paralelo para os filtros default.
- Resumos de listagens devem vir do mecanismo de `summary` do backend/store, nao de reduce/calculo local sobre a pagina carregada. Quando a tela usa `DefaultTable`, `totalItems` e `summary` pertencem ao rodape sticky interno do componente; telas consumidoras nao devem criar rodapes ou pilulas paralelas, exceto quando o store registrar `summary: false`.
- Nome da empresa nao deve ser repetido no corpo das paginas so para contextualizacao. Quando a rota usa seletor de empresa no header, a exibicao da empresa pertence ao `CompanyFilter`.

## Feedback visual centralizado

- Loadings de tela e seção devem sair de `StateStore`; erros inline/local de tela devem sair de `DefaultErrors`; erros globais e toasts do sistema continuam em `MessageService`/`SystemErrorToast`.
- Telas, cards, modais e tabs nao devem recriar `ActivityIndicator`, skeleton, banner, alert ou caixa de erro paralela quando o estado puder ser lido do store ou renderizado por um componente default compartilhado.
- `ActivityIndicator` direto e `showError` direto em tela são excecoes e precisam ser raros; quando a mensagem e inline/local, use `DefaultErrors`, e quando for loading de tela/seção use `StateStore`.
- O `mode` do `StateStore` e generico e pode representar presets como `compact`, `display`, `orders` ou outros modos reais de tela/seção; o contrato nao deve ficar preso a um unico fluxo.
- `StateStore` deve ler `isLoading`/`isSaving` e equivalentes diretamente dos stores.
- `DefaultErrors` deve ser usado para erro local/inline de tela; ele lê `error` dos stores informados, sobe como popup com fechamento manual por `x`, auto-fecha em 5 segundos e limpa o erro do store ao fechar; não misturar esse contrato dentro do `StateStore`.
- O footer de runtime deve exibir um loading discreto quando qualquer store apontar `isLoading` ou `isSaving`; isso complementa o `StateStore` e nao substitui o fluxo central.

## Regra obrigatoria de componentes default

- Todas as telas novas e todas as telas alteradas devem usar componentes default e stores como padrao, sem excecao. Tudo o que for possivel deve virar componente default em `ui-default`, para que as telas sejam reutilizaveis, pequenas, componentizadas e consistentes.
- Imagens e arquivos vindos do backend devem usar `DefaultFile` de `ui-default`. A URL de download precisa carregar `app-domain=<dominio configurado>` e, quando a plataforma suportar, esse valor tambem deve ir em `headers`.
- Listagens devem seguir o conceito do `DefaultTable`: desktop prioriza visao em tabela, edicao por coluna e botoes de acao no toolbar; mobile deve ser gerenciado pelo proprio `DefaultTable`, recebendo da tela apenas um renderer/componente de card customizado quando o visual precisar ser especifico. Nao criar uma listagem paralela com `FlatList`/cards na tela se ela ja usa `DefaultTable`.
- Toda edicao do `DefaultTable` React deve passar pelos componentes default de input/select em `ui-default`, tanto em celulas desktop quanto em cards compactos e modais fallback. A tela pode definir layout visual, mas nao deve criar inputs locais para editar campos da listagem.
- A coluna do store e a fonte da configuracao da listagem. Use `columns` para label, formatacao, visibilidade, filtros, tipo de input, `list`, `format`, `formatList`, `formatFilter`, `saveFormat` e regras de edicao. Nao duplicar essa configuracao dentro da tela.
- Acoes gerais de listagem, filtros compactos, atalhos de contexto, cadastros auxiliares e botoes como categorias/carteiras devem ficar no toolbar da listagem/default, na mesma linha sempre que houver espaco, em vez de ocupar linhas extras no corpo da tela.
- O contrato completo do `DefaultTable` vive em `modules/controleonline/ui-default/AGENTS.md`. Telas antigas devem migrar para esse contrato e parar de manter paginacao, busca, ordenacao, filtros, resumo ou contagem duplicados fora do componente.
- O `DefaultTable` pode receber componentes de composicao, como cards customizados, add customizado, toolbar extra e modais auxiliares, mas sem devolver para a tela a responsabilidade pela paginação, busca, ordenação ou carregamento da lista.
- Em tabelas React, `add: true` no store pertence ao `DefaultTable`: o botao fica na toolbar e, quando a tela nao passar um fluxo proprio por `onAdd`, o componente deve abrir o `DefaultForm` como fallback padrao.
- Explicacoes permanentes de tela sao proibidas. Quando houver contexto necessario, a tela deve usar o componente compartilhado `DefaultTooltip` em `ui-default` acionado por `?`, com o texto fora do corpo principal para nao poluir o layout.

## Estilo de implementação

- Seguir padrão dos módulos existentes.
- Reaproveitar utilitários antes de criar novos.
- Nomear arquivos e classes de forma consistente com os módulos atuais.
- Em modais e popups operacionais que reaproveitam telas canônicas, o cabeçalho e a barra de ações também devem ser reaproveitados dos arquivos-fonte do fluxo principal. Impressão e ações irmãs ficam sempre na mesma barra padronizada, nunca em botões soltos paralelos.
- Identificação visual de pedido não pode ser redesenhada por tela. Cards, modais e detalhes operacionais devem reaproveitar o componente canônico `OrderHeader`, normalizando o payload se preciso, mas sem recriar número, cliente, datas ou status manualmente.
- Quando um pedido estiver em `app=POS` e `externalCode` vier preenchido, esse valor representa o numero da mesa e deve ocupar o destaque principal no `OrderHeader`, mantendo o id tecnico do pedido como secundario.
- Quando o payload trouxer `mainOrder.external_code`, esse valor representa o numero da comanda e o `OrderHeader` deve escrever `Comanda: #...` antes do nome do cliente, sem depender de `otherInformations`.
- No POS, quando o pedido ja estiver pago e nao houver entrega nem fila de producao, ele deve ir direto para `closed` e nao permanecer em `paid`.
- No POS, se o pedido ja estiver pago e ainda houver entrega ou fila de producao, o proximo estado operacional deve ser `preparando`, nunca `paid`.
- Itens so podem entrar na fila de producao quando o pedido ja estiver `paid` ou, em entrega, quando `order-charge-on-delivery-enabled` estiver ativo.
- `order.created` so deve ser anunciado por pedidos `sale`; `cart` continua sendo apenas rascunho.
- Acoes de adicionar produto, alterar quantidade e remover item ficam liberadas apenas enquanto o pedido ainda for `cart`; depois da promocao para `sale` ou em qualquer estado terminal, a area de itens vira somente leitura.
- No front React, os dados operacionais devem vir somente de campos materializados do payload. Em logistica, motorista, telefone, rastreio e status devem sair de `deliveryPeople`, `deliveryPeopleId`, `delivery`, `currentIntegration` e campos equivalentes ja retornados pela API; `otherInformations` nao deve ser origem de exibicao.
- Fluxos de logística de pedidos pertencem ao `ui-logistic`. O `ui-orders` pode disparar a navegação, mas a tela canônica e os componentes da operação devem viver no módulo de logística.
- `OrderLogisticsPage` e uma tela compartilhada com dois modos. Sem `route.params.order` ela opera como manager/overview, mostra somente origem e destino e monta o bloco de lista abaixo do mapa; com `route.params.order` ela vira o detalhe da delivery, pode mostrar a posicao atual e a rota estimada do motoboy e nao monta a lista. No delivery, a jornada apos aceite fica presa em `aceito` -> `way`/`away` -> `closed`/`canceled`; `rejected` e a recusa de aceite e nao deve ser confundido com cancelamento. `preparando` nao pertence a esse fluxo.
- O lock global de delivery deve sempre abrir `OrderDetails` com `id` do pedido. Fallback de `order` em rota e apenas defesa contra caller legado; a navegacao principal nao pode depender dele.
- O bloco de lista e o bloco de aceite devem ser componentes separados e desacoplaveis; a tela principal decide apenas se monta ou nao cada um.
- Em ambos os modos, os dados visiveis da entrega devem vir do pedido corrente materializado (`id`, `displayId`, `addressOrigin`, `addressDestination`, `price`, `status`, `deliveryPeople`), sem fallback para `mainOrder` na UI.
- Enquanto a entrega estiver em `aguardando aceite`, a visao do motoboy deve esconder troca de cliente/endereco, esconder a barra inferior e manter aceite/recusa em card flutuante.
- CEP e complemento devem aparecer na linha de endereco visivel sempre que existirem no pedido corrente.
- Heros e blocos explicativos fixos sao proibidos em qualquer tela. Quando existir informacao contextual realmente necessaria, ela deve vir de um componente reutilizavel e parametrizado acionado por um icone `?`, sem texto longo permanente no corpo da pagina.
- O `RuntimeInfoFooter` deve manter o device/identificador visivel e acrescentar o modo de operacao traduzido quando existir; nunca substituir o device por um label de fallback.

## Convenções

- Não esqueça que as colunas dos stores representam as entidades da API. Isso vai ajudar muito no desenvolvimento.
- O código Vue é legado e pode ser usado como referência, mas o sistema é feito em React Native para Web e para Aplicações nativas.
- Vue está em fase de remoção. Quando um trabalho tocar um fluxo já coberto em React, remova o equivalente Vue em vez de duplicar a mudança. Se o módulo ainda não tiver equivalente React, apague `src/vue` mesmo assim e mantenha o pacote com um entrypoint neutro fora de `src/vue`, salvo quando o usuario pedir explicitamente para manter o legado.
- O projeto é misto: a mesma base atende Web e apps nativos. Toda mudança de UI, assets, navegação, fontes, gestos e comportamento visual precisa ser pensada e validada considerando browser e dispositivos nativos.
- O front-end é composto por vários aplicativos que compartilham módulos. O parâmetro APP_TYPE muda para outro aplicativo, portanto, outra visão do mesmo sistema mas para uma função diferente dentro da empresa. Isso é extramamente importante.
- O front deve ser `store-first`: use estado e ações de store como fonte de verdade sempre que existir contrato viável; `api.fetch` direto só em caso excepcionalíssimo e devidamente justificado no módulo.
- Evite passar objetos entre telas, rotas e componentes quando o mesmo dado puder ser resolvido por store; passe apenas IDs, IRIs ou chaves mínimas e hidrate o restante no destino.
- Explicações permanentes de tela devem sair do corpo principal e ir para `DefaultTooltip`, acionado por `?`, para não poluir o layout.
- `ActivityIndicator` direto em tela e exceção, não padrão; a tela deve preferir `StateStore` ou estado textual simples.
- Leia `MODOS_OPERACAO.md` antes de propor ou implementar qualquer fluxo no front. Esse arquivo define as visoes por `APP_TYPE`, os tipos operacionais de device e o planejamento atual do `POS`. Agents como Codex devem trata-lo como contexto obrigatorio.
- Em Android dedicado, a trava fisica do totem usa `Lock Task Mode` por `withKioskMode` e deve ser controlada pela chave de device `android-kiosk-enabled`; o modo operacional salvo do device usa `pos-operation-mode=totem` e nao herda essa chave. O comportamento launcher/home fica em `android-launcher-enabled` e nao deve ser acoplado ao totem.
- Ícones em telas compartilhadas precisam funcionar em Web e nativo. Em ambiente Expo, prefira `@expo/vector-icons` quando possível. Se um módulo usar `react-native-vector-icons`, garanta o registro explícito das fontes no bootstrap web e nunca assuma que o browser carregará essas fontes automaticamente.
- Quando o store de tradução não estiver claro, use `common` como store padrão para a chave traduzida, mantendo o tipo correto (`label`, `option`, etc.) e sem inventar texto de fallback.
- Não adicinhar ou criar métodos para pesquisar várias opções.
- Preferir estados de store a estados locais.
- A fila de traducoes faltantes vive no store `translate` e deve ser lida/escrita por esse estado. Nao usar `localStorage` como fila e nao sobrescrever traducoes fora da tela de traducoes ou de uma acao intencional.
- Não criar novos getters sem perguntar antes dentro dos stores
- Só usar a API em vez de stores em casos stritamente necessários
- Trabalhar preferencialmente com filas do store em vez de loopings ou chamadas asyncronas em lote.
- Preferir usar o getter reload no store em vez de criar funções de reload
- Usar o loading único do sistema e melhorá-lo se precisar, assim como o módulo de exibição de erros (state store)
- Todo erro visual do sistema deve usar o componente único de erro transitório centralizado no `MessageService` de `ui-common`, recebendo o erro, exibindo por alguns segundos e sumindo sozinho. Não criar banners/toasts/alerts paralelos para erro.
- O contrato canonico de erro HTTP do backend e o envelope do `HydratorService` com `@type: Error`, `hydra:title` e `hydra:description`; o frontend deve tratar esse formato como fonte principal de mensagem.
- Em máscaras, calculos e todos os tipos de helpers, usar um repositório do sistema e mentê-lo sempre organizado e em arquivos pequenos
- Manter as telas sempre componentizadas, reaproveitando tudo o que é possível, e mantendo tudo pequeno e organizado.
- Separar CSS dos arquivos de JS.
- Não passar objetos na URL. Na URL passamos tudo o que um refresh possa ler. Objetos passamos pelos stores e se ele tiver vazio, pega o ID da URL e preenche o objeto usando a store ou getItem.
- Preferir trabalhar com store ao invés de mandar parâmetros para componentes filhos
- Exemplo de módulo ideal: Orders.js que inclui orderHeader.js, orderInvoices.js, printOrder.js, orderPreparationQueue.js. Por sua vez um módulo chamado Invoice.js poderia incluir o orderInvoice.js e o módulo KDS poderia incluir orderHeader.js e printOrder.js, orderPreparationQueue.js. Sempre prefira modularizar assim.
- Sempre começe as telas por listagens e dentro delas, coloque botões para adicionar e editar, também para cancelar, nunca deletar.
- Atente-se que algumas ações não são pertinentes àquela visão, como no CRM que é feito para vendedores, não haverá cadastros de categorias ou modelos de contratos, isso é função do admin (`ADMIN`). Sempre tenha em mente as visões de cada aplicativo e quem os usa.
- Sempre verifique o backend pasa ser melhor direcionado em tudo.
- Ao verificar o backend, preencha sempre os stores correspondentes com as colunas da entidade, formatando elas da melhor maneira possível
- Comente todo o código
- Quando um modulo tiver React e Vue, materialize o contrato apenas nos arquivos React; Vue legado nao deve receber bloco de contrato importado.
- Sempre utilize a tradução atravéz da função tt presente no global do front para qualquer coisa que o cliente terá acesso, isso inclui preenchimento de objetos com label utilizados em listas por exemplo. Se encontrar algo não traduzido, traduzir.
- Tudo o que for comum, usar o módulo common em vez de criar helpers espalhados pelo sistema.
- Se encontrar algo fora desse padrão, favor corrigir, inclusive movendo e renomeando arquivos para os módulos corretos
- Tradução ausente nunca é problema, não use fallbacks pra isso.
- Os formatos de colunas dos objetos estão no store, em columns. Várias formatações importantes passam por lá. Sempre que possível, faça os helpers do sistema receber essas configurações de colunas.
- Diversas configurações que ligam o frontend aos dados do backend estão centralizadas nos stores. Use isso sempre que possível. E alimente o store com essas informações ao criar novas telas.
- Não há diversos nomes ou diversos jeitos de fazer alguma coisa. Se houver dois arquivos diferentes tratando a mesma coisa, pergunte qual deve manter e ejuste para que apenas um componente tenha a responsabilidade por aquela função.
- Se houver erros de grafia, ou diversos nomes para encontrar algo como um array de palavras por conta de dúvidas do que é o correto, simplesmente pergunte qual o correto. Exemplo: [order, orders] num campo de tipos provavelmente haverá uma grafia correta e outra que age como um fallback, porém isso não deve existir de forma alguma.
- Crie e mantenha atualizado de forma concisa, AGENTS.md em cada módulo. Eles devem ter regras claras sobre o funcionamento daquele módulo, principalmente regras de negócio pedidas em prompt. Se uma regra mudar, apague e reescreva.
- Quando a regra for transversal entre módulos, o `AGENTS.md` da raiz também deve ser atualizado.
- Crie testes automatizados sempre que possível e os mantenha atualizados. Crie os testes dentro dos módulos correspondententes e não na raiz. A pasta de testes é src/tests
- Testes de browser do web ficam em `src/tests/browser` e usam Playwright.
- Quando uma mudança tocar login, navegacao ou qualquer fluxo visivel no browser, atualize ou adicione um smoke test e valide com `npm run test:browser`.
- Toda mudança com efeito visivel no browser deve ganhar cobertura em `src/tests/browser`; teste unitario sozinho nao fecha o contrato visual.
- Prefira seletores semanticos (`role`, `placeholder` e texto visivel) nos testes de browser; evite CSS/XPath fragil.
- Tenha bom senso. Avisos do que cada ação faz é bem-vindo, mas lembr-se que são clientes que usam o sistema, ele não sabe o que é uma tabela device_config, então use uma linguagem mais adequada.
- Evite pai orquestrando filhos. Prefira que cada filho seja independente e o pai apenas organiza.
- Displays do tipo `products` consomem `order_product_queues`.
- Telas `tv` e `orders` consomem a arvore completa de `orderProducts`.
- `showInParentQueue` e regra visual de hierarquia; nao deve virar fila sintética nem persistencia extra.
- `ProductGroup.showInDisplay` controla apenas a visibilidade operacional do titulo do grupo. Quando falso, o grupo continua existindo para agrupamento e impressao dos itens, mas o titulo fica oculto em `orders`, `tv` e `products`.
- Toda lista deve ser paginada e ter carregamento infinito; `itemsPerPage` so deve ser usado quando o contrato externo exigir e com justificativa clara no modulo.
- Chamadas HTTP novas ou alteradas no front devem ser espelhadas na colecao Postman correspondente para documentacao e reproducao.
- Não usar caminhos relativos (../../../). Ao invés de caminhos relativos, use alias configurados no babel, como @controleonline por exemplo
- Para facilitar debugs, envie logs para a tabela de logs via API sempre que achar necessário, depois as leia no backend via API ou database.

## Regra transversal de seletor de empresa

- O frontend deve tratar `/people/companies/my` como a fonte de verdade do seletor de empresas.
- O seletor deve mostrar todas as empresas retornadas pela API; empresa fora do fluxo comercial do domínio atual deve aparecer desabilitada, nunca escondida.
- `company.enabled` significa apenas que a empresa está ativa no cadastro.
- `company.commercial_enabled` significa que a empresa tem cadeia comercial válida no domínio atual.
- `company.panel_enabled` é a flag que define se a empresa pode ser selecionada no painel atual.
- Componentes de troca de empresa, exploradores e escolhas de contexto devem usar `panel_enabled` para habilitar/desabilitar seleção.
- A escolha automática de empresa atual deve priorizar a primeira empresa com `panel_enabled = true`.
- `employee_enabled` e os demais `*_enabled` dentro de `company.user` representam o tipo de vínculo humano direto da pessoa com aquela empresa; eles não substituem `panel_enabled`.
- Você deve manter o redme.md do projeto e dos submódulos sempre atualizados e se não existir, deve criar.
- Você deve manter o funding.yml do projeto e dos submódulos sempre atualizados e se não existir, deve criar.
- Você deve manter o .scrutinizer.yml do projeto e dos submódulos sempre atualizados e se não existir, deve criar.

## Regra transversal de menu

- O menu da home deve vir do backend por `menus-people` com o `APP_TYPE` atual e ser salvo em `theme.menus`.
- Apps devem renderizar atalhos a partir de `theme.menus`; menus fixos por role so permanecem quando forem fluxos fora da home/bottom toolbar.
- A configuracao de menu e exclusiva de `ROLE_SUPER`; usuarios comuns nao devem ver a tela de configuracao.
- A tela de configuracao de menus por perfil agora vive no `APP_TYPE=ADMIN`; o `MANAGER` nao deve mais exibir `MenuAccessConfigPage` como atalho principal.
- A configuracao de menu por perfil usa apenas vinculos humanos; `client`, `provider` e `franchisee` sao vinculos comerciais e nao devem aparecer na matriz de perfis.

## Regra transversal de tema

- A fonte de verdade de cores e estilos de cliente e o tema salvo no banco e exposto em `themeStore.getters.colors` e `currentCompany.theme.colors`.
- Nao introduzir novas cores fixas no codigo-fonte de telas; qualquer ajuste visual por cliente deve nascer de `theme` no banco.
- Listagens e tabelas devem usar os tokens do tema para cabecalho, borda e zebra striping, com `bg-headers-light` e `bg-even-light` quando existirem.
- O financeiro legado da empresa 21 deve ser definido por tema no banco, sem hardcode de preto, amarelo ou cinza dentro da tela.
- Toda tela alterada a partir de agora deve ser revista junto com o tema ativo antes de considerar a tarefa concluida; ao tocar uma screen, use apenas as cores atravéz de variáveis e nunca cores diretamente do código.As variáveis de cor e classes vindas do store/tema do modulo e mantenha o visual aderente ao padrao atual devem estar presentes.

## Regra transversal de grupos compartilhados

- A criacao/importacao de `product_group` deve enviar `company` e depender de `product_group_parent` para o vinculo com o produto pai.
- O front nao deve ler nem escrever `parentProduct` legado em `product_group`; esse dado nao faz parte do contrato atual.
- Listagens e buscas de grupos compartilhados devem ser feitas por `company` e pelos vinculos de `product_group_parent`, sem fallback para o campo antigo.
- Na `MenuCostsPage`, `products` e os `components` de produto sao somente leitura; a persistencia desta tela fica restrita a `feedstock` e `package`, com os vínculos de custo criados via `product_group_product` sem criar produto de venda novo.
- As imagens exibidas pela `MenuCostsPage` devem vir apenas de `productFiles`, `categoryFiles` ou relacoes equivalentes do banco, resolvidas por `resolveFileImageUrl`; nao usar assets estaticos do `ui-manager` como fallback.

## Regra transversal de parâmetros da engenharia

- A tela de parâmetros da engenharia tem rota própria em `/menu-costs-page/parametros`.
- Essa rota deve ler e gravar apenas `configs` da empresa selecionada, com os keys `menu-costs-default-markup-pct`, `menu-costs-target-margin-pct`, `menu-costs-estimated-monthly-units` e `menu-costs-cost-engine-rules`.
- A chave `menu-costs-cost-engine-rules` é o contrato oficial inicial do Motor de custo da engenharia para regras por canal, margem, taxa, comissão, repasse e arredondamento.
- O carregamento desses dados deve acontecer ao exibir a rota; o botão `Parâmetros` da `MenuCostsPage` deve navegar para essa tela separada.

## Regra transversal de anexos de pedidos

- Anexos de pedido devem usar o mini gerenciador reaproveitado do upload de produtos, mas com escopo exclusivo de `order_file`.
- A barra do pedido deve expor o atalho de anexos fora do fluxo de debug; o modal precisa permitir subir, vincular, abrir e remover arquivos sem tocar em `products` ou `components`.
- O front nao deve criar nem editar produto de venda para resolver anexo de pedido; a biblioteca de arquivos fica separada da engenharia de produto.

## Regra transversal de fornecedores da engenharia

- A tela oficial de fornecedores da engenharia deve ficar em `/menu-costs-page/fornecedores`.
- Essa tela deve carregar os dados do `people` do ERP com `link.linkType=provider` apenas quando estiver em foco, sem persistir mutacao em `products` ou `components`.
- A normalizacao e unificacao de fornecedores deve ficar em `ui-people`; o lookup de ultimas compras deve ficar em `ui-products`; `ui-manager` deve apenas orquestrar a rota e a apresentacao.
- Telefone e e-mail do fornecedor devem continuar dentro de `contacts`, nunca no cadastro principal.
- Telefone e e-mail de fornecedor devem viver dentro de `contacts`, nunca como campos diretos do cadastro principal.
- Quando o seed trouxer fornecedor duplicado, a tela deve unificar o cadastro mais rico e enriquecer contatos, observacoes e movimentos, em vez de duplicar a listagem.

## Regra transversal de ingredientes da engenharia

- A tela oficial de ingredientes da engenharia deve ficar em `/menu-costs-page/ingredientes`.
- Essa tela e a sua listagem real vivem em `ui-products`, que carrega o recorte de `products` do tipo `feedstock` quando a rota ganha foco.
- O cadastro deve validar duplicidade por codigo/nome e bloquear ou sinalizar matches conflitantes antes de persistir.
- `products` e `components` continuam fora do escopo dessa tela; a escrita permitida aqui e apenas de insumos do tipo `feedstock`.

## Regra transversal de embalagens da engenharia

- A tela oficial de embalagens da engenharia deve ficar em `/menu-costs-page/embalagens`.
- Essa tela carrega o recorte apenas quando exibida e usa o fluxo de sincronizacao de insumos para criar `package` no ERP.
- O cadastro deve validar duplicidade por codigo/nome e bloquear ou sinalizar matches conflitantes antes de persistir.
- `products` e `components` continuam fora do escopo dessa tela; a escrita permitida aqui e apenas de insumos do tipo `package`.

## Regra transversal de revenda da engenharia

- A tela oficial de revenda da engenharia deve ficar em `/menu-costs-page/revenda`.
- Essa tela usa uma classificacao operacional local da `MenuCostsPage`: bebidas prontas compradas e revendidas podem entrar no recorte de revenda mesmo quando o ERP ainda as traz como `feedstock`.
- A classificacao local da engenharia deve ficar em `ui-manager/src/react/pages/MenuCostsPage/domain`, sem alterar o tipo gravado no banco nem virar regra global do ERP.
- `manufactured`, `component`, `package`, `preparation`, `custom` e `service` nao entram no recorte de revenda.
- A listagem de revenda deve usar carregamento infinito e paginação, igual as demais telas operacionais.

## Regra transversal de compras e evidencias da engenharia

- A tela oficial de compras e evidencias da engenharia deve ficar em `/menu-costs-page/compras-e-evidencias`.
- Essa tela carrega apenas pedidos do ERP com `orderType=purchase`, usando `orders` como fonte de verdade e `order_file`/`files` para as evidencias.
- A listagem deve ser paginada com carregamento infinito e o detalhe do pedido deve reaproveitar `OrderHeader` e o mini gerenciador de anexos do fluxo de pedidos.
- `ui-orders` deve concentrar a regra de negocio e o fluxo de anexos; `ui-manager` fica somente com a rota e a apresentacao.
- O seed JSON nao deve ser usado como fonte dessa tela.

## Regra transversal de dock operacional

- Em `POS` nos modos `PDV`, `GARCOM` e `BALCAO`, a dock inferior de navegacao deve continuar visivel durante a navegacao operacional, inclusive em catalogo e `OrderDetails`. O modo `kiosk` continua sendo a excecao sem dock operacional.
- O modo `single-item` segue o mesmo contrato de `PDV` para a dock, mas usa catalogo sem categoria, carrinho com um item principal por vez e volta para `OrderHistoryPage` ao concluir a venda.

## Regra transversal de checkout Cielo

- No browser/web, pagamento `Cielo` nunca pode acionar plugin nativo local. Nesse ambiente, a cobranca deve seguir pelo fluxo remoto via websocket para uma maquina Cielo configurada e o retorno vem por callback no store de `invoice`.
- O caminho local de `Cielo` continua permitido apenas em device nativo compatível com o gateway local.

## Regra transversal de runtime em background

- Em Android, os apps compilados com `APP_TYPE` e `packageName` diferentes devem compartilhar um unico runtime de background por dispositivo para websocket e impressao.

## Regra transversal de displays de pedidos

- Os displays `orders` e `tv` devem carregar `/orders` com a arvore completa de `orderProducts`; o endpoint de fila nao e a fonte desses paines.
- Quando o item tiver fila, o leitor de codigo de barras deve trabalhar com `order_product_queue.id`; quando nao tiver fila, o match deve cair para `SKU`.
- O leitor de conferencia deve contar localmente a quantidade de bips por linha e so chamar `POST /order_products/{id}/check` quando a quantidade prevista for atingida.
- `products` continua consumindo `order_product_queues`; `orders` e `tv` continuam consumindo `orderProducts` completos.
- O display `orders` trabalha pedido a pedido: o pedido em foco nao troca ate ficar totalmente conferido, o rodape mostra `conferidos/total` e o proximo pedido so assume foco depois do atual ficar pronto.
- O websocket do backend deve ser aberto pelo `BackgroundRuntimeService`; listeners nativos do React devem consumir o stream local do runtime em vez de abrir outro websocket direto.
- O runtime de background deve conseguir registrar e atender todos os APKs instalados no aparelho via `registrationId` que inclua o package/app atual, device e empresa, evitando colisao entre builds.
- O runtime de background deve poder religar sozinho no Android por `BOOT_COMPLETED` e `MY_PACKAGE_REPLACED`, reaproveitando as inscricoes persistidas para notificar mesmo sem tela aberta.
- Notificacoes humanas de novos pedidos e eventos financeiros (`store.opened`, `store.closed`, `cash.open`, `cash.closed`) no `MANAGER` Android sao push nativo FCM direto, sem Expo Push Service, com token salvo em `device.metadata.pushTokens.manager.android.deviceToken`.
- O click do push humano do `MANAGER` deve navegar para `OrderDetails` com `id` do pedido; nao enviar esse fluxo para KDS/LDS.
- O runner/local app nao deve emitir notificacao escrita desses eventos para `MANAGER` Android, para evitar duplicidade com FCM.
- KDS, PDV e displays continuam usando websocket/runtime local para som operacional e refresh com o app aberto, sem mensagem humana escrita.
- Som de pedido configurado no device vale para KDS, PDV e demais fluxos locais; quando a URL personalizada estiver vazia, o runtime deve cair para `src/assets/sound/caixa.m4a` empacotado no app.
- O canal FCM humano do `MANAGER` usa o som nativo `caixa.m4a` empacotado pelo plugin do `expo-notifications`; URL personalizada nao toca em push recebido com app fechado.
- A versao web do manager tambem usa um runtime compartilhado no browser para websocket, com owner unico por navegador/aba via BroadcastChannel e replicacao do stream para as demais abas. Nenhum componente web deve abrir websocket direto no backend.
