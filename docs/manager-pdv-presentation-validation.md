# PDV — apresentação local de 16/10/2026

## Inventário e particularidades

ManagerPdvPage já reutiliza PdvPage de ui-orders. PdvPage monta AddProductScreen,
que resolve catálogo por categoria/produto, retomada, rascunho, caixa e modo
operacional. Usa dispositivo e Device Config reais para sessão e regras de
mesa/comanda. Parte dessa inicialização pode escrever pedidos: não foi executada
com vendas reais nesta rodada.

A tela de categorias já usa DefaultTable, busca e ações de toolbar de ui-default,
e CategoryCard de ui-products. Categorias possuem nome, cor e capa opcional;
o cartão inclui edição/sincronização administrativa quando o módulo permite.
MarketplaceSyncIndicators e a identificação de mesa/comanda continuam em seus
componentes originais. Não foi encontrado motivo para substituir esses elementos
por um modal/cartão de outra função em ui-common.

## Alteração

Somente DefaultTable de categories sob PdvPage na prévia local recebe o adaptador
ManagerPdvCatalog. Reutiliza a tabela e o próprio CategoryCard. Cartões de 116px,
nomes sobre superfície do tema e cor cadastrada como faixa de identificação;
capa existente continua usando a mesma resolução de arquivo. Grid 2/3/5 colunas
por largura. Busca com rótulo Buscar categoria. Tokens do modo ativo fornecidos
pelo contexto de tema da tabela.

Opções administrativas e controles ficam recolhidos em Mais opções do catálogo.
Ao expandir, reaparecem importação/exportação/ações que a própria tabela recebeu,
edição e indicadores de sincronização autorizados pelo módulo. Não foram criadas
permissões novas. Props de query, ações, dados, onOpen, onEdit, onSync e parâmetros
de pedido permanecem os mesmos. Não há consulta/gravação nova no adaptador.

A apresentação opcional de CategoryCard é registrada como overlay local de
ui-products 1.0.36, com versão e hashes exatos e aplicação idempotente no comando
web:manager-preview. Fora dessa prop, o cartão anterior é preservado.

Não alterados: Device Config, resolvers de tipo de pedido, gestão de raízes,
mesa/comanda/TABLE_TAB, caixa, carrinho, modal de identificação, persistência,
API, stores, filtros de negócio, rotas de liquidação/histórico. Categorias fora
de PdvPage e a tela de produtos permanecem sem essa adaptação. Este é o primeiro
recorte visual do PDV; não equivale à homologação de todo o checkout.

## Evidências

- 170 testes / 43 suítes do Manager aprovados.
- 48 testes / 4 suítes dos módulos: Device Config, ensureActiveOrder, modo de
  catálogo e contexto de pedido aprovados.
- Testes do adaptador verificam callbacks e consultas preservados, clique na
  categoria, opções administrativas recolhidas/expandidas, grid e caminho legado.
- Compilação web aprovada em /tmp/on-manager-pdv-build.
- Overlay reaplicado e git diff --check aprovados.

Limites: host nativo substituído nos testes; sem homologação visual no navegador,
sem pedido, pagamento ou mudança de configuração real. Revisão visual da 8081
pendente. Nenhuma alteração de banco, commit, push ou publicação de código.

## Correção das imagens e proporções — 16/10/2026

Falha reportada pelo usuário após revisão visual: espaços de imagem vazios e
última linha esticada. A apresentação anterior não estava homologada visualmente.

Investigação real, somente leitura: GET categories para a empresa autorizada
retornou 17 categorias, 13 com categoryFiles.file e quatro sem arquivo. Logo, a
resposta da coleção já contém as referências necessárias; não é necessário buscar
uma segunda coleção por cartão. O CategoryCard usava Image com URL direta, que
não envia a sessão no img web. Download sem sessão foi recusado (403 na rota com
domínio e 401 na rota simples). Com autenticação, dois arquivos retornaram HTTP
200, image/png e assinatura PNG válida (aproximadamente 2,9 e 3,1 MB). Não foram
salvos arquivos de imagem ou respostas com dados pessoais como evidência.

Reuso adequado: DefaultFile de ui-default já faz fetch autenticado, usa os dados
de empresa da store people e a sessão, apresenta blob no web e libera no unmount.
O cartão recebe esse componente somente na apresentação do PDV. Usa o objeto
file associado à capa selecionada (ou primeiro arquivo) vindo de categoryFiles;
fora da apresentação, preserva o Image original. Não foi criado downloader paralelo,
nova store nem autorização pública de arquivo. Os binários não passaram a ser
persistidos offline; não confundir referências no cache de categorias com imagens
baixadas para uso offline permanente.

Cartão passa a ter 88px e miniatura de 60px ao lado do nome. Sem capa, não reserva
uma coluna de imagem. Largura máxima por coluna evita esticar os dois últimos
itens. Cores cadastrais e callbacks de venda/edição/sync preservados.

Validação: 172 testes / 44 suítes aprovados. Novo teste usa DefaultFile real com
host nativo e fetch substituídos: confirma API-TOKEN, domínio, blob e revogação.
Teste de integração do cartão confirma que o objeto file da categoria é entregue
ao componente compartilhado; testes de consulta e callbacks continuam passando.
Exportação web aprovada em /tmp/on-manager-pdv-images-build; overlay reaplicado e
git diff --check aprovados. Falta nova revisão visual na 8081. Os arquivos reais
são grandes: esta rodada corrige autenticação/apresentação, não reduz os binários
nem comprova rapidez de todas as capas. Sem banco, pedido, commit ou push.

## Cor suave e conferência de hierarquia/ordem — 16/10/2026

Autorizado alterar apenas o fundo: mistura visual de 6% da cor da categoria com
94% da superfície configurada do tema. Borda conserva a cor original, texto mantém
textPrimary, imagem e clique preservados. Categoria sem cor válida conserva a
superfície do tema. Não muda tokens, banco, payloads ou regras de negócio.
173 testes / 44 suítes e compilação web aprovados em
/tmp/on-manager-pdv-tint-build. Revisão visual ainda pendente.

Leitura real da coleção da empresa autorizada confirmou parent e sortOrder:
Bebidas (posição 6) é pai de Águas (1), Cervejas (2), Chás (3), Refrigerantes (4)
e Sucos (5). Principais: Combos (0), Lanches (1), Gratinados (2), Batatas Fritas (3),
Molhos e Extras (4), Sobremesas (5), Bebidas (6). Pratos Executivos e categorias
de homologação retornaram sem sortOrder. Esses números se repetem entre níveis,
portanto não são posições únicas de toda a coleção.

Código atual: Categories solicita order[sortOrder]=ASC e order[name]=ASC; API
possui filtro para sortOrder, name e id, com posições nulas ao final. A grade atual
mistura níveis porque a consulta não restringe parent. A composição/precedência
real dos parâmetros de ordenação na tabela ainda precisa de diagnóstico antes de
prometer sequência visual correta. Hierarquia, sequência, filtro de parent e
botão para ordenar não foram alterados, conforme pedido explícito do usuário.

## Vídeo 15:07 — modo tabela e reutilização das imagens

Vídeo do usuário inspecionado em quadro temporário (apagado após análise).
Causa do desalinhamento: rowStyle.maxWidth de 19%/32%/48%, destinado à grade de
cartões, era também aplicado às linhas da tabela. Cabeçalho conservava largura
integral, e as células do corpo ficavam comprimidas. Correção: limite somente
quando effectiveViewMode/viewMode é cards. A tabela usa suas larguras nativas.
Nomes locais das colunas: Código, Categoria, Ordem de exibição, Cor, Ícone,
Imagem, Categoria principal; metadados inputType/format/saveFormat preservados.
Nenhuma mudança de hierarquia ou ordenação foi feita.

A implementação anterior de DefaultFile refazia fetch após cada remount, pois
revogava o blob URL no unmount e não mantinha o binário. Referências na store de
categorias não são o próprio arquivo. Adicionado contexto opcional de cache ao
DefaultFile compartilhado, ativado somente sob a tabela de categorias de PdvPage.
Isso cobre tanto cartões quanto células de arquivo da tabela.

Cache binário OnManagerImageCache via idb (dependência existente): memória LRU e
IndexedDB, 32 imagens/64 MB, validade lógica 24h, deduplicação de requisições em
andamento. Chave inclui empresa, URI e headers de sessão, persistida somente como
SHA-256; tokens/URLs não são armazenados em texto no registro. Falha de disco não
impede rede; falha de download não é guardada. Logout/saída do runtime ativo limpa
o cache, e geração impede que download pendente regrave após a limpeza. Cada
DefaultFile continua gerenciando e liberando seu próprio blob URL. Ao trocar
empresa/sessão, chaves são separadas. Outros consumidores sem contexto continuam
com o carregamento original.

Verificação: 178 testes / 45 suítes. Casos novos cobrem tabela sem largura de
cartão, tipos de colunas preservados, um fetch em dois remounts do DefaultFile
real, deduplicação, restauração por adaptador persistente de teste, isolamento,
expiração, limites, limpeza, falha de rede e indisponibilidade de armazenamento.
São testes Node com host nativo e IndexedDB substituídos; não se afirma que o
IndexedDB real do navegador foi homologado após recarga completa. Revisão visual
do modo tabela e recarga no navegador permanece pendente. Sem banco, commit ou push.

Exportação web aprovada em /tmp/on-manager-pdv-cache-build; reaplicação do overlay e git diff --check aprovados.

## Hierarquia visual das categorias — 2026-10-16

Escopo autorizado: agrupar visualmente os subníveis no catálogo de categorias do
PDV, mantendo a apresentação aprovada, os destinos e as regras existentes.

Leitura real da API local retornou 17 categorias. Bebidas (276) não tem pai;
Águas (281), Cervejas (282), Chás (279), Refrigerantes (277) e Sucos (280) apontam
para Bebidas, com sortOrder 1 a 5. O agrupamento usa esses vínculos, sem deduzir
parentesco pelo nome. A ordem relativa recebida é preservada entre as raízes e
entre as filhas.

Cada categoria principal forma um grupo de cartões; filhas aparecem abaixo,
com recuo de 12 px, espaçamento e linha lateral da paleta. Subníveis adicionais
usam o mesmo padrão. A foto, cor, cache e CategoryCard originais são reutilizados;
os handlers recebem o registro original de cada categoria.

DefaultTableCards recebeu um transformador opcional nos cardListProps, aplicado
somente à lista visual. Queries, store, snapshots e contagem continuam contendo
as 17 categorias. Nenhum outro consumidor recebe esse transformador. A seleção
ativa de busca é respeitada: quando o pai não vem na resposta, a filha continua
visível, sem inserir categorias fora do filtro. Vínculos cíclicos inválidos não
escondem registros nem provocam recursão infinita. Payload e hashes da alteração
estão no overlay manager-pdv, com aplicação idempotente.

Validação: 202 testes / 51 suítes APP passaram, incluindo o DefaultTableCards
real, árvore multinível, pai ausente, ciclos e navegação individual de pai/filha.
Regressão de layout do componente compartilhado: 3 testes / 1 suíte passaram.
Compilação web passou. Revisão visual nova na 8081 continua pendente; a evidência
real desta rodada é a leitura dos vínculos, não uma homologação de pintura.
Tudo local, sem commit, push, gravação no banco ou operação de pedido.

## Catálogo horizontal integrado — retomada de 16/10/2026

Substitui, na prévia Manager em modo PDV, a árvore vertical de cartões descrita
na rodada anterior. A adaptação reutiliza Categories, PdvCategoryTabs,
ProductItem e buildProductCatalogRequestParams de ui-products, com DefaultTable
original e as ações de quantidade/personalização de ui-orders.

- Principais em uma faixa horizontal, com numeração visual seguindo a ordem
  recebida, seleção destacada e alvos de toque de 56 px.
- Filhas da principal selecionada em outra faixa abaixo; níveis mais profundos
  seguem o mesmo padrão. “Todos” consulta a principal com suas descendentes.
- Produtos exibidos abaixo sem navegar para ProductsPage: foto, preço, fila e
  ações originais permanecem no contexto do pedido recebido por AddProductScreen.
- “Todos os produtos” remove o filtro de categoria sem retirar os filtros
  canônicos de empresa, produto ativo e tipos disponíveis para venda.
- A primeira principal é selecionada ao abrir o catálogo. Busca, filtro e troca
  cartões/tabela continuam no componente compartilhado.
- Cadastro de categorias, outros tipos de aplicativo e fluxo POS/garçom original
  não ativam esta adaptação. Não substitui a configuração de Device Config.

HierarchicalCategoryTabs e categoryHierarchy ficam no módulo ui-products,
sem importar componentes do Manager. São capacidades opcionais reutilizáveis;
PdvCategoryTabs mantém sua implementação plana quando hierarchical não é usado.
Os arquivos e versões/hashes estão guardados no overlay manager-pdv. A API não
foi alterada nesta rodada. A tela do Manager fornece somente adaptação de tema
para a tabela, título da categoria e apresentação dos produtos.

### Contagens

useCategoryProductCounts usa o total da própria coleção de produtos com o mesmo
filtro da lista. ProductCategoryTreeFilter existente na API resolve descendentes
e aplica DISTINCT: não se somam totais de filhas. Inclui os produtos diretamente
vinculados à principal, além dos das filhas, sem repetição de produto.

Leitura real anterior à interrupção: Bebidas retornou 17 produtos distintos;
Águas 2, Cervejas 2, Chás 2, Refrigerantes 8 e Sucos 1. A união das filhas continha
15 produtos, todos dentro de Bebidas. Portanto, mostrar 15 na principal omitiria
dois produtos diretamente ligados a ela. O teste autenticado do carregador novo
confirmou o total 17 e que os dois de Águas pertencem ao conjunto da principal.

As quantidades carregam em segundo plano, com duas requisições simultâneas,
um item de página por consulta e o total informado pela API. Falha não vira zero;
a tela oferece recarregar quantidades. Ao sair, as requisições são canceladas.
Não há cache persistente novo nem sincronização de contagens offline; o catálogo
e as mídias continuam usando os mecanismos existentes.

### Verificações da retomada

- APP: 208 testes / 54 suítes passaram em execução nova.
- ui-products: 24 testes / 4 suítes passaram, cobrindo o fluxo anterior do garçom,
  navegação plana e parâmetros canônicos da consulta de produtos.
- Teste autenticado somente leitura: carregador de contagem e comparação de IDs
  distintos pai/filha passaram. Nenhuma gravação de pedido, produto ou pagamento.
- Exportação web da prévia passou; 8081 reiniciada após a interrupção e HTTP 200.
- Overlays reaplicados sem alterações; git diff --check sem erros.

Não houve nova homologação visual pelo navegador da ferramenta nem venda real.
Os testes de clique da tela usam o Categories real com adaptadores de plataforma,
store e tabela; confirmam seleção no mesmo espaço, ausência de navegação e a
preservação de orderId, interactionMode e showBottomCart. A conferência visual
na 8081 continua necessária. Tudo local, sem commit, push ou publicação.

A ampliação do teste autenticado para todas as categorias encontrou uma falha
transitória do banco remoto usado pela API local: MySQL server has gone away.
A primeira execução pai/filha já havia passado. A rodada ampliada deve ser
considerada separadamente e seu resultado final está registrado abaixo.

Resultado final da repetição autenticada: PASS, 17 categorias contadas;
Bebidas 17 produtos distintos, Águas 2, todos os produtos de Águas contidos
em Bebidas. Uma suíte / um teste passou em 16,7 s (rodada completa). Isso é
evidência das leituras autenticadas, não tempo de interação/pintura da tela.
A primeira falha MySQL permanece registrada; não houve ajuste de banco ou API.

## PDV compacto e composição compartilhada de card — 16/10/2026

Ajuste autorizado após as capturas desktop/mobile do catálogo horizontal.
Somente apresentação; consultas, contagens, configurações e ações de pedido
permanecem nos módulos anteriores.

No mobile (até 760 px): mantém “Ponto de venda” e atalhos de mesas/comandas e
histórico, retira a frase explicativa, esconde o sucesso rotineiro “Dados
atualizados” e remove o cabeçalho repetido da categoria no catálogo inline.
Estados de atualização, leitura salva, offline e erro permanecem visíveis.
Cadastro e cabeçalho desktop continuam com suas orientações.

Nos cards de venda: imagem quadrada 76 × 76, nome e descrição breve com fila na
área de identificação; rodapé ocupa toda a largura com preço e ação alinhados.
O selo Custom foi retirado somente da apresentação compacta de venda; o botão
Personalizar mantém a rota e os parâmetros originais. Outros tipos especiais,
relações reais de categoria, descrição e fila continuam preservados. Itens simples
continuam usando ProductQuantity, e single-item mantém o componente original.
Cache e carregador de mídia não foram alterados nesta rodada.

### O que é compartilhado

Varredura dos arquivos de cards nos módulos instalados e leitura dos componentes
DefaultTableCards (ui-default), SoftMenuCard (ui-layout), MarketplaceProductCard
(ui-common), ShopProductCard (ui-shop) e OrderHistoryCard (ui-orders) confirmaram
as duas camadas: listagem compartilhada e conteúdo especializado por domínio.
Não havia uma composição genérica de mídia, conteúdo e rodapé nesse conjunto.

DefaultEntityCard foi acrescentado localmente em ui-default com espaços opcionais
para media, children e footer, recebendo a paleta e estilos. Não conhece produto,
preço, fila, clique, navegação ou pedido. ProductItem de ui-products fornece esse
conteúdo e continua dono das ações. O Manager opta pela composição somente nos
cards de venda por presentation.CardComponent. Sem essa opção, o ProductItem
mantém a estrutura anterior. Nenhum outro card foi migrado nesta rodada.

Os overlays guardam os novos arquivos, versões e hashes. O aplicador verifica
arquivos novos e existentes antes de gravar e aceita reaplicação idempotente.
Isso torna a composição reutilizável localmente, sem publicação NPM.

### Verificação

Novos testes reproduziram a falta da composição e o cabeçalho repetido antes do
ajuste. A rodada final do APP passou com 213 testes / 56 suítes. Cobrem rodapé,
ação de personalização e contexto do pedido, remoção seletiva de informações,
status de leitura e preservação dos atalhos. Exportação web passou; 8081 HTTP 200;
overlays reaplicados e git diff --check sem erros.

Teste de componente e compilação não substituem revisão visual: não houve nova
homologação no navegador nem transação de venda. Nenhuma escrita na API/banco,
commit, push ou publicação. As próximas telas poderão adotar a base compartilhada
individualmente após conferir suas particularidades.

## Personalização — reaproveitamento das leituras no Manager/PDV

Ajuste local autorizado em 16/10/2026 após conferência do fluxo POS/garçom.
CustomizeScreen já era compartilhada, mas ativava useCachedCatalogActions apenas
no POS em modo garçom. A prévia Manager em interactionMode=pdv passa a habilitar
as mesmas ações de leitura para products, product_groups e product_group_products.
A condição isWaiterPosMode continua exclusiva do garçom e não foi ampliada.

A mudança adiciona uma condição independente useCustomizationCache; não altera
useCustomizationSubmission, finishCustomization, confirmação de produtos, pedidos,
pagamento, produção ou Device Config. As ações recebidas por useCustomizeScreenData
e NestedCustomizationModal são as mesmas wrappers do cache. Cadastro/gerenciamento,
outros apps e Manager fora da prévia mantêm o comportamento anterior.

O mesmo CustomizationImageProvider agora controla imagens no Manager/PDV:
adiamento por visibilidade, fila e pausa durante gravação. O single-item conserva
sua exceção original. Isso reutiliza a implementação existente; não cria um segundo
cache ou mecanismo de download e não equivale ao cache binário dos cards do catálogo.

O cache existente separa API, domínio, resumo da sessão, empresa, device efetivo e
contexto. Sem escopo válido, consulta pelas ações normais. Usa memória e armazenamento
local existentes, com atualização em segundo plano após 60 s; não garante rapidez
na primeira visita. Grupos/opções usam publishStore=false para não sobrescrever
as coleções visíveis de outros consumidores. O item de produto segue o comportamento
original do cache.

Testes novos: condição de ativação na CustomizeScreen real falhou antes do ajuste
e passou depois; checa três stores, imagens, modo de cadastro, prévia desabilitada
e POS/garçom preservado. Testes com cache real e adaptadores descartáveis repetem
produto, grupos, opções e segundo nível após recriar os wrappers: cinco leituras
iniciais e nenhuma leitura adicional na reabertura; sessões separadas e escopo
indisponível conferidos. Estes são testes de mecanismo, não tempos de pintura.

Validação APP: 219 testes / 58 suítes passaram. Regressões publicadas de
CustomizeScreenRecovery, NestedCustomizationModal, CustomizationImage e rota de
personalização: 27 testes / 4 suítes passaram. Overlay local reproduzível em
ui-products 1.0.36 com hashes, aplicado no comando existente da prévia.

Sem homologação visual nova, teste de venda ou escrita de negócio. Tudo local,
sem commit, push ou publicação; o banco de staging não foi alterado.

Leitura autenticada somente GET (login POST) do cache com produto real e
persistência/escopo descartáveis do teste: 8 grupos, 5 opções no primeiro grupo;
3 leituras na primeira abertura e 0 adicionais na reabertura. Leituras frias
2.187 ms; quentes 1 ms, em uma amostra. Esses números são do mecanismo de leitura,
não de interface, e não homologam IndexedDB no navegador. Segundo nível tem
cobertura de mecanismo com dados sintéticos e regressão do modal existente.
Exportação web passou, reexecução dos overlays e git diff --check sem erros.


## PDV nativo com categorias horizontais — 18/10/2026

Escopo local aprovado após comparação com o fluxo do garçom. Reutilizados Categories, PdvCategoryTabs/HierarchicalCategoryTabs, DefaultSearch, hooks useCachedCatalogActions/useCachedCatalogView e ProductItem existentes. Ativação somente quando EXPO_PUBLIC_MANAGER_NATIVE_PREVIEW=1, aplicativo MANAGER e interactionMode=pdv. Fluxos POS/garçom e prévia web mantêm seus critérios anteriores.

Na primeira entrada nativa, nenhuma categoria é selecionada automaticamente. Busca de produtos no topo, categorias principais em faixa horizontal, filhos em faixa abaixo do pai, produtos no mesmo PDV. Todos os produtos permanece uma seleção explícita. A seleção do pai usa o filtro canônico de categoria, preservando o comportamento de descendentes da API. Não há contagens novas nessa variante nativa: evita buscar um total por categoria antes dessa etapa ser definida. Categorias usam mínimo de toque 44dp no modo compacto; a variante existente conserva seu padrão.

A grade de cadastro e seu botão grande Mais opções do catálogo deixam de ser utilizados nessa entrada de venda; não foram removidos do default. Filtros e troca de visualização continuam acessíveis na lista de produtos. ManagerProductsTable recebe externalCatalogSearch para não duplicar a busca quando Categories já a apresenta. Cadastro, importação, outras listas e permissões não foram alterados. Nenhuma mudança nas regras de device, produção ou pagamento.

Persistência dos ajustes compartilhados no overlay patches/manager-pdv.json e payloads; aplicação com scripts/apply-manager-pdv-patch.cjs, com validação de versões/hashes e conferência idempotente. Node 20, 237 testes/60 suítes passaram; regressão adicionada e inicialmente vermelha para entrada nativa sem seleção, navegação de categorias/subcategorias e busca mantendo a mesma rota. A asserção de busca usa o parâmetro canônico product. diff --check passou.

AVD API 25, APK debug localpreview existente, mudanças JS servidas pelo Metro: entrada sem seleção confirmada; Combos mostra Combo Delta Gyros e demais produtos via rolagem; Filtros presente; Bebidas mostra Águas/Cervejas/Chás; Águas carrega Água Mineral Buonavita; busca agua retorna produtos e limpar restaura o convite de seleção. Não foram acionados adicionar, personalizar, pagamento ou produção. Leitura dos erros ReactNativeJS/AndroidRuntime no processo 5235 sem novas entradas. Aviso Firebase do pacote local continua conhecido.

Capturas em .codex/qa-native-manager-api25/pdv-inline-20261018/ na raiz do workspace: before.png, after-entry.png, after-products.png, after-subcategories.png, after-water.png, after-search.png, comparison.png e final.png. before.png registra o estado em que as opções da grade estavam abertas. Algumas capturas intermediárias do segundo nível incluem a busca da lista ainda em andamento; after-water.png registra o produto carregado. Não foi comprovada melhoria de tempo de carregamento nem validação em pinpad físico. Sem novo APK, commit, push ou publicação.

Roteiro: menu lateral → PDV; conferir nenhuma seleção; Combos → rolar produtos; deslizar faixa até Bebidas → Águas; buscar um produto; conferir Filtros e visualizações; limpar busca e confirmar retorno à seleção. Conteúdo e controles podem ser comparados com barra de atalhos visível/oculta pelo avatar.


## Entrada colorida e busca compacta — 18/10/2026

Revisão autorizada pelo usuário: entrada volta a mostrar cards coloridos das categorias principais, junto da faixa horizontal. Os filhos aparecem na faixa de subcategorias após escolher o pai, sem colunas cada vez mais estreitas na grade inicial. Produto continua na mesma tela ao selecionar card ou aba. Nova ação Ver categorias retorna à entrada. Todos os produtos permanece explícito.

Busca grande removida apenas da variante Manager nativa. Reutilizados DefaultTable, DefaultToolbarAction, DefaultSearchModal e DefaultSearch; lupa ao lado dos filtros abre a busca, com filtros controlados pelo catálogo. DefaultSearchModal recebeu props opcionais para filtros/value/onSearch/title; consumidores não controlados preservam o caminho anterior. Não houve remoção de filtros do default nem das outras listas.

Durante a validação foi reproduzida sobreposição do teclado ao campo do modal compartilhado. KeyboardAvoidingView agora ajusta sua área no Android/iOS; web mantém comportamento sem ajuste de teclado. AVD API 25 confirmou campo visível acima do teclado, envio da pesquisa agua, resultado Buonavita, filtros disponíveis e retorno aos cards por Ver categorias. Também conferidos clique no card Combos sem sair da rota e rolagem da grade. Nenhuma ação de adicionar/personalizar/pagar/produzir foi acionada.

Extracts PdvProductSearch e NativePdvCategoryEntry mantêm Categories.js em 500 linhas. Overlay manager-pdv inclui os novos arquivos e o modal, com versões/hashes e reaplicação idempotente. 240 testes/61 suítes passaram; cobertos entrada colorida, navegação inline, busca controlada e consumidor default não controlado. diff --check passou. Ajustes JS no APK debug local existente, sem recompilação binária.

Evidências em .codex/qa-native-manager-api25/pdv-entry-compact-20261018/: entry.png, products.png, search-modal-before-keyboard-fix.png, search-modal.png, search-results.png, final.png e tests.log. Erro anterior Maximum update depth permanece investigação separada, não declarado corrigido por esta alteração. Sem novo erro ReactNativeJS/AndroidRuntime observado nesta conferência, processo final 7805. Sem publicação ou alteração das regras de device/negócio; não validado pinpad físico.


## Sobreposição do menu e entrada fixa em cards — 18/10/2026

Escopo local aprovado: corrigir sobreposição do menu e manter cards coloridos na entrada do Manager nativo. Categorias.styles usa zIndex 5 na faixa; a camada do drawer não tinha prioridade explícita. ManagerShell agora mantém um contêiner nativo para o conteúdo (collapsable=false) e coloca o drawer em uma camada acima (zIndex 100/elevation 24). Menu cobre categorias, subcategorias e controles; clique na área coberta não selecionou a aba subjacente no AVD.

Entrada NativePdvCategoryEntry continua usando DefaultTable/CategoryCard e não oferece os controles de tabela/colunas do cadastro. DefaultTable ganhou prop opcional viewMode para apresentação controlada: cards no catálogo, sem persistir outra preferência nem substituir configs.viewMode da lista. Demais consumidores continuam com a escolha salva. ManagerPdvCatalog aplica larguras de cards mesmo se a configuração anterior era table. A ação default Ver categorias recebeu texto Categorias e retorna da lista de produtos à grade sem passar pela Home. A memória da categoria selecionada ao retornar à rota foi preservada.

Validação: 242 testes em 62 suítes passaram; 21 testes focados passaram; suíte inline passou novamente após limpeza de imports não usados. Teste novo cobre cards com preferência table salva, resize, nova montagem normal e liberação do modo controlado. git diff --check passou. Lint padrão acusou limitações já presentes: JSX não conta como uso e globals Jest ausentes. Lint dos arquivos tocados/payloads passou com configuração temporária adicionando apenas uso de JSX e globals Jest, sem desligar regras; duas importações não usadas no teste inline foram removidas. DefaultTable compartilhado ficou em 500 linhas. Overlays manager-products-default e manager-pdv sincronizados com payloads/hashes e reaplicação idempotente.

AVD Pixel_2_API_25 / Android 7.1.1: entrada convertida da tabela previamente salva para cards, Combos → produtos, Categorias → cards, menu sobre cards e sobre Bebidas/subcategorias, fechamento do menu e nova seleção de PDV. Produtos mantiveram os controles default e a visualização salva. Nenhuma ação de adicionar, personalizar, pagamento ou produção foi executada. API local e Metro existentes preservados. Alterações JS no APK debug localpreview, sem recompilar APK. Lentidão e erro anterior Maximum update depth permanecem fora desta correção. Não validado pinpad físico. Sem commit/push/publicação.

Evidências: .codex/qa-native-manager-api25/pdv-entry-overlap-20261018/ na raiz do workspace. before.png mostra tabela salva; drawer-after.png e drawer-subcategories.png mostram cobertura correta; products-after.png mostra produtos; return-cards.png e final.png mostram a grade. subcategories.png capturou a transição antes da seleção assentar; subcategories-settled.png é a captura válida do segundo nível. Logs de testes/lint e XMLs acompanham as imagens.

Roteiro: menu → PDV; se retomar produtos, Categorias; confirmar cards coloridos sem colunas editáveis; escolher Combos; abrir/fechar menu; voltar por Categorias; rolar até Bebidas e abrir o menu com segundo nível visível.


### Retorno contextual Categorias

Após apontamento do usuário, o botão de retorno foi ocultado apenas na entrada, onde já estavam os cards. NativePdvCategoryEntry filtra a ação catalog-categories; lupa permanece e a ação continua nos produtos/resultados da busca. Teste inline cobre ausência na entrada, presença após seleção e ausência ao retornar; 2 testes passaram. AVD confirmou cards, lupa e ausência do retorno redundante. Overlay sincronizado, diff --check e lint contextual passaram.


## Cabeçalho compacto do PDV no celular — 19/10/2026

Solicitação aprovada: retirar os atalhos do topo móvel, deixar título PDV com lupa ao lado e eliminar a linha reservada à busca na entrada. ManagerPdvPage preserva o cabeçalho anterior fora da variante nativa compacta (até 760). PdvProductSearch renderiza título compacto e DefaultToolbarAction da busca junto ao DefaultSearchModal já existente; callbacks, filtros e consulta não foram duplicados. A ação de busca deixa de ser repetida na toolbar do catálogo compacto. NativePdvCategoryEntry oculta a toolbar quando não há ações; produtos mantêm filtros e retorno Categorias. A barra de atalhos inferior permanece configurável no avatar. Não houve alteração de device, pedido, mesa/comanda, checkout ou API.

Validação: 242 testes/62 suítes passaram. Testes do wrapper conferem ausência de título/atalhos repetidos e preservação da rota/pedido; teste inline abre a busca pelo cabeçalho e retorna aos cards sem toolbar vazia. Lint dos arquivos e payloads tocados passou usando o contexto JSX/Jest documentado na etapa anterior; diff --check passou. Overlay manager-pdv sincronizado e reaplicado sem mudanças. Categories.js continua em 500 linhas; helper de busca 38, entrada 11 e wrapper 57.

AVD API 25 confirmado: sessão LEANDRO/GYROS recuperada após reinício completo do app; entrada com oito cards principais visíveis com barra inferior oculta, lupa única no cabeçalho; busca agua retornou Buonavita; Categorias voltou à grade; menu cobre conteúdo e mantém Mesas e comandas disponível; deixado na entrada compacta. O Fast Refresh exibiu erro de ordem de hooks ao atualizar o helper já montado com hook novo; reinício completo sem limpar dados carregou a nova estrutura. Conferência de ReactNativeJS/AndroidRuntime no novo processo 7635 sem novos erros. Alteração JS no APK local existente, sem nova compilação binária. Nenhuma ação de adicionar, personalizar ou pagamento executada.

Evidências na raiz do workspace: .codex/qa-native-manager-api25/pdv-mobile-header-20261019/entry.png, search-modal.png, search-results.png, drawer.png, final.png, XMLs, tests.log, lint-context.log e runtime-errors.log. Lentidão de carregamento permanece fora desta etapa visual; não houve validação em aparelho/pinpad físico nem publicação.

Teste manual: conferir PDV + lupa na mesma linha; tocar Combos e voltar por Categorias; abrir lupa e pesquisar; abrir menu sobre o catálogo. Os atalhos de mesa/comanda e histórico continuam acessíveis pelo menu quando permitidos.


## Cache nativo, latência e contratos do core — 19/10/2026

Revisão detalhada: [manager-pdv-core-review-20261019.md](manager-pdv-core-review-20261019.md). Cache do garçom adaptado ao armazenamento/criptografia disponíveis no Android; escopo de sessão/empresa/device/app preservado, invalidação conectada ao comando existente e às alterações de catálogo. Mesma consulta autenticada de cinco produtos: 3255 → 878 ms, payload idêntico; leitura persistida após reabrir app: 83 ms. Não são medidas de pintura completa. API evita binário de imagem na pré-carga somente no grupo product:read. 255 testes do app, 37 do catálogo/garçom e suítes API passaram. 39 menus configurados resolvem rotas; realce de vendas/compras considera parâmetros. Homologação integral por perfil e operações financeiras/produção continua pendente. Evidências sanitizadas na pasta pdv-performance-core-20261019. Sem publicação.
