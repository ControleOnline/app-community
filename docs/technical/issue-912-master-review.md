# #912 — recuperação da entrega npm sobre master (30/09/2026)

Estado atual: os três pacotes estáveis da recuperação foram publicados e seus
artefatos conferidos. O app mantém base `origin/master`
`4e10c1fdc758a2e5502ce29b1cc2249a70a47f6c` e pins exatos para a entrega
revisável em `task-912`. Não houve publicação em Staging, geração de RC ou nova
issue GitHub. A issue permanece aberta/Working; isto não é aceite de Security
nem conclusão de publicação do aplicativo em produção.

## Entrega dos módulos

| Pacote | task-912 publicada | Merge atual em dev / gitHead npm | Integração |
| --- | --- | --- | --- |
| ui-orders 1.3.38 | `f9d960be523672daabf46922ab1d32002e421813` | `62ced4dc17b23dce587b8dc51ef2511eb2ce63eb` | [PR #40](https://github.com/ControleOnline/ui-orders/pull/40) |
| ui-products 1.0.34 | `2ef10c3fe9926705954207a8bd6d85368692e6ba` | `e07d361af821cd560a4b3c90a1834867ff60b7f1` | [PR #23](https://github.com/ControleOnline/ui-products/pull/23) |
| ui-default 1.0.274 | `ea622e7237efdaca1925a84abe3ac737c519b5a3` | `5579256972acb1b37befeb26af6ed41193e2327c` | [PR #41](https://github.com/ControleOnline/ui-default/pull/41) |

Os três masters permanecem os do histórico abaixo. Cada master remoto é
ancestral da respectiva task; nenhuma branch antiga foi apagada/substituída.
Na entrada, as árvores de dev e do merge-base da task coincidiam. O merge local
sem commit não produziu conflitos e sua árvore final coincidiu exatamente com
a task revisada. O resultado remoto de cada merge também foi comparado a essa
árvore. Proteções exigiram PR + source-policy: esta foi a exceção canônica ao
fluxo normal sem PR. Os três checks source-policy e as publicações npm por OIDC
passaram; nenhuma proteção ou workflow foi alterado.

Prova detalhada com bases, árvores, SHAs, integridade SHA-512, provenance e runs:
[issue-912-package-proof.json](issue-912-package-proof.json). Todos os arquivos
baixados do registry coincidem byte a byte com os pacotes locais revisados:
orders326, products239, default143. Uma leitura inicial em cache retornou404;
a verificação atual sem cache confirmou versões/gitHeads e integridade.

## Comportamento revisado

- Device em operação Garçom governa os controles simplificados. Na lista de
  pedidos, ficam a ação de adicionar e os pedidos permitidos pelo escopo
  existente; toolbar administrativa, motivos de cancelamento e total são
  ocultados também quando o Device pode consultar pedidos da empresa.
- Catálogo usa busca compacta do Garçom, preserva company + activeOrderId e
  limpa busca/categoria após inclusão/retorno. Abas inline mantêm o breakpoint
  móvel existente; Garçom desktop também oculta controles genéricos.
- Só resposta de categorias que seja um array vazio válido abre Products.
  Erro ou coleção malformada permanece visível com retry.
- ProductItem/customização propagam orderId, singleItemMode, contexto e override
  de showBottomCart, inclusive edição de customização aninhada. O Garçom retorna
  ao lançamento depois de salvar; os demais modos mantêm seus destinos anteriores.
- Enviar para produção aguarda flush dos itens, confirmação explícita errno0
  do servidor e refresh; só depois retorna para Orders. Respostas nulas/vazias,
  malformadas ou erro não navegam. Não se força status no cliente.
- Os gates de pagamento/resumo do pedido e de modificação/pagamento do produto
  existentes foram preservados. Counter, cashier, totem, single-item e SHOP
  conservam os comportamentos fora da operação Garçom.

Componentes/fontes tocados foram modularizados até500 linhas. DefaultTable
mantém defaults genéricos; sua apresentação foi extraída sem mudar a lógica.
Revisão independente não deixou Critical/Important pendente no código.

## Aplicativo e resolução npm

Pins exatos: ui-orders1.3.38, ui-products1.0.34, ui-default1.0.274. Os demais
pins de UI do time foram mantidos; não se restauraram submódulos de UI.
`ui-common1.2.88` ainda importa o escopo antigo de Cielo/Infinitepay. Dois aliases
Metro direcionam esses nomes aos pacotes atuais já instalados, sem mudar
código de pagamento. Reanimated exige semver^7.7.2, enquanto a resolução
produção sem busca hierárquica encontrava semver6: dependência direta exata
semver7.8.5 corrigiu essa resolução. Os dois erros de build foram observados e
corrigidos antes de publicar a entrega do app.

O lock local permanece ignorado segundo a convenção atual do repositório e
não integra esta entrega. A prova dos módulos UI é feita pelos pins exatos + artefatos npm
imutáveis conferidos. A configuração local de build é ignorada e usa APP_TYPE
POS; não entra na branch.

## Validação e limites

Node20.20.0. `npm run test:waiter -- --silent`:87 testes focados passaram em
fontes, tarballs instalados e árvore pós-merge. O runner versionado resolve os
pacotes npm por padrão; CONTROLEONLINE_MODULES_ROOT permite repetir sobre clones
locais. Inclui testes renderizados de Device/permissões, erro/empty/retry,
contexto/override, retorno de customização, persistência e confirmação de produção.

- Contrato dos módulos:2 testes passaram; validação --mode=production passou.
- Lint oficial com reconhecimento JSX local:33 fontes tocadas passaram; parser
  e limite de linhas passaram. Não se alterou a configuração global de lint.
- Export web POS e bundle Android POS passaram com resolução npm. O bundle
  Android não é APK e não comprova funcionamento físico da impressão/pagamento.
- Smoke local do web export abriu login sem pageerror. Requests de APIs/serviços
  externos foram interceptados, com apenas o asset estático jsQR permitido.
  Não representa jornada autenticada POS→PPC ou teste de hardware.
- Suítes amplas NÃO são integralmente verdes: a revisão independente reproduziu
  exatamente15 falhas anteriores de fixtures DefaultTable,2 de OrderHistory
  (ícone legado e período salvo) e2 de menu-costs. A suite MenuCostsPage.viewModel
  inalterada consumiu CPU e reproduziu timeout15s. Essas fontes de menu-costs
  não foram alteradas. Suites amplas/falhas não foram declaradas aprovadas.

Comandos reproduzíveis: `npm run test:waiter`,
`node scripts/validate-module-contract.cjs --mode=production`,
`npx expo export --platform web --output-dir /tmp/912-web`,
`npx expo export --platform android --output-dir /tmp/912-android`,
`npm run test:waiter:bundle -- http://127.0.0.1:4173/` após servir o export local.

## Gate semântico da integração do aplicativo em dev

A prévia `git merge-tree` de dev `e0d27d010ca5a7b05c3b22947c7922837562005e`
com a entrega do app não teve conflitos textuais (árvore inicial
`e64b4587c1f0ff409d13d64b9dbc7d66d525d838`). O diff completo revelou delta
operacional fora da recuperação de produto:

- substituiria `.release/rc-manifest.json` existente de dev, RC1 congelada com
  quatro tasks/pins, pelo manifesto histórico RC4 de master com somente942;
- reintroduziria o workflow manual `ops-reset-task-branches.yml` vindo de master,
  cujo conteúdo hardcoded reseta912/384 para38a33646 e apaga branches*-reset.

Nenhum merge/PR do app→dev foi feito, nenhuma RC foi modificada/gerada e nenhum
workflow de reset/deploy foi executado. A branch task-912 continua derivada do
master remoto atual, com as mudanças do time preservadas. Dev e todas as
branches antigas ficam preservadas. A ausência de conflitos não autoriza esse
merge automaticamente.

Recuperação correta: Manager deve revisar a origem/destino e os dois artefatos
operacionais com os responsáveis, preparar um resultado de integração que
preserve os metadados necessários do time e não reative o reset destrutivo,
revisar novamente o diff inteiro e validar a mesma composição npm. Se precisar
reconstruir uma origem, preservar primeiro a branch/remotos e demonstrar esse
resultado antes de substituir qualquer branch. Não escolher ours/theirs
cegamente, não fazer force/reset e não montar nova RC para contornar a revisão.
Security revalida os novos SHAs depois da integração segura em dev. Até lá,
a entrega fica revisável na branch publicada, com pacote/module dev comprovado.

## Coordenação e próxima etapa

Task Paperclip existente CON-726 foi reutilizada, sem nova task duplicada.
A credencial automática exigia contexto heartbeat; a retomada manual do board
usou a credencial de board existente autorizada pelo usuário. Não se alteraram
grants, agent/runtime ou secrets. O antigo erro HTTP402/deactivated_workspace
permanece responsabilidade operacional do Manager/CTO, sem impedir os commits
publicados nesta rodada.

NEXT_ACTION: Manager deve resolver o gate semântico acima antes da integração
app task-912→dev, preservando os artefatos operacionais do time; Security deve revalidar
os novos SHAs/pacotes e a jornada autenticada POS→PPC. A issue permanece
Working. Não criar RC, não promover Staging e não fechar a #912 nesta rodada.

## Histórico da auditoria inicial (antes desta recuperação)

O texto abaixo registra o estado anterior e não descreve os pins atuais.

# #912 — revisão da retomada sobre master (30/09/2026)

Resultado: base sincronizada; entrega funcional incompleta. Não promover esta
composição. Nenhuma RC, publicação npm, integração em dev ou alteração de
Staging foi feita nesta rodada.

## Base e preservação

- master remoto: `4e10c1fdc758a2e5502ce29b1cc2249a70a47f6c`.
- task-912 remota no início: `38a336469c6db1c9d5e8f0b39fc6d7679d07f934`.
- merge-base: o mesmo `38a33646`; atualização possível por fast-forward.
- Revisados integralmente os dois arquivos do avanço: workflow operacional de
  reset e manifesto histórico. Foram preservados como vieram do master; nenhum
  workflow foi executado e nenhum manifesto novo foi gerado.
- Checkout local antigo preservado na branch
  `task-912-local-preserved-20260930`, SHA
  `e51d7cda71d97479b0f063232158d67b520a3949`; backup anterior
  `task-912-legacy-20260928`, SHA `8043bffb8395a14127f0f0929855786fcefb059b`.
- Nenhuma branch foi apagada ou sobrescrita por force-push. Os módulos locais
  antigos foram preservados. Trabalho novo separado em worktree.
- A árvore atual usa pacotes npm; o único gitlink é `docs/wiki`. Restaurar pins
  dos submódulos antigos não recupera a funcionalidade nesta arquitetura.

## GitHub confirmado

A issue está aberta, `agent:developer`, assignee GitLeandroHub, Project #1
`Working`. A PR #941 não está associada ao Project #1; essa pendência pertence
ao Manager. Não foram alterados labels, coluna ou aceites.

| Repositório / PR | Estado | Head revisado | Merge |
| --- | --- | --- | --- |
| app-community #941 | merged em dev | `6065eb39f92952c92f74387f16768a7d13ae4396` | `d9b913fe931cbc0beb6408dd79efa22dc6275204` |
| ui-orders #39 | merged em dev | `589271732cb5c1e38cab79b83771babf26b304f9` | `1f0bb4a5e8b266385357c56e72c667406a4efb14` |
| ui-products #22 | merged em dev | `8b5cfc33ecec2e66354a1e2dd9cfe37e5ebc0377` | `12af2c1158f7e88eed3a12775c6940affdbbac10` |
| ui-default #40 | merged em dev | `e1efc6caa1f2a9b8c17d3eb8fdd318b4273490b3` | `7a5db09d3890c61ce4a74e325837a4dcc99280fa` |
| ui-manager #23 | closed, não merged | `3ec486e8c4ae61dee18392f927f6f57243de33cc` | — |

app-community/dev atual: `e0d27d010ca5a7b05c3b22947c7922837562005e`.
O merge histórico de #941 não prova entrega no master/npm atual.

| Módulo | master remoto | dev remoto |
| --- | --- | --- |
| ui-orders | `c2ea50ac43fd5dede1bc76157883003c1446d079` | `1f0bb4a5e8b266385357c56e72c667406a4efb14` |
| ui-products | `31f621157b38c1083674ddd4d3818927e1e0dc83` | `12af2c1158f7e88eed3a12775c6940affdbbac10` |
| ui-default | `ac8c0ecc9aca008ab4fd70142374d58eff408135` | `7a5db09d3890c61ce4a74e325837a4dcc99280fa` |
| ui-manager | `4ccf18c436619b9e13c8cd68430ff72f7cd61444` | `1e9f844538b558a5e3b7d68c69ff0303a947f85c` |

## Bloqueio de composição npm

Metadados do registry e tarballs conferidos com integridade SHA-512. Os arquivos
inspecionados correspondem ao gitHead publicado, anterior aos merges da #912.

| Pin atual | gitHead npm | Ausência confirmada |
| --- | --- | --- |
| ui-orders 1.3.37 | `99ed235c637d4d4cfb0de2a3695c899c33256232` | helper activePosOrderContext e propagação explícita orderId, distinção de erro de categorias, barra waiter-order, retorno produção → Orders |
| ui-products 1.0.33 | `f902907ebcf852f7bda70c2d9598bf6b485832af` | customizationOrderContext, shouldUseInlinePdvCategories, resolveShowBottomCart |
| ui-default 1.0.273 | `692b719d3fd9f03ba6b23f9d5b3fd5177fcd2e93` | flags de ocultação de ações/controles da toolbar |

Comparações completas npm gitHead → dev: orders 26 arquivos (+695/-331),
products 19 (+779/-70), default 3 (+77/-8). Comparações master → task incluem
mudanças de outras tasks (45/38/43 arquivos respectivamente); não reaplicar
esses históricos inteiros. merge-tree não mostrou conflito textual nos três
módulos; isso não aprova a composição semanticamente.

## Achados para a recuperação

1. Categories habilita busca/resultados compactos por `!isManagerApp`; as abas
   usam o gate waiter, mas os outros caminhos também afetam POS não waiter/SHOP.
2. CustomizeScreen muda o retorno por `interactionMode === 'pdv'`, sem gate de
   Device waiter, alterando também caixa/balcão/totem. Preservar saída single item.
3. Categories converte resposta não-array em lista vazia e silencia rejeição;
   validar erro/retry e não tratar erro como catálogo vazio.
4. Products mudou o filtro de busca de `search` para `product`; confirmar o
   contrato real da API e a regressão dos outros modos.
5. ProductItem → customização não propaga o override showBottomCart; o fallback
   de CustomizeScreen assume true. Preservar false explícito em toda navegação.
6. O foco limpa categoria selecionada, mas não activeProductSearch; comprovar
   retorno às categorias depois de inclusão por busca.
7. Vários arquivos alterados permanecem acima do limite canônico de 500 linhas,
   incluindo Categories, ProductItem, OrderItemsTab e DefaultTable. Modularização
   continua pendente de classificação/correção, não foi aprovada nesta revisão.

Preservar vínculo do pedido, customização aninhada, sessão por empresa/device,
total do lançamento sem pagamento, produção → Orders somente após sucesso,
fluxos single item/totem/caixa e alterações independentes do time.

## Validação executada

- Node 20.20.0: contrato de versões/resolução, 2/2 testes passaram.
- Catálogo browser: 11 fluxos validados; isso não é execução de E2E.
- Snapshots dos SHAs dev acima: 7 suítes Jest / 28 testes passaram (modo de
  catálogo, vínculo do pedido, sessão por device, contexto de customização,
  gate das abas waiter, override e parâmetros de busca). Runner isolado usando
  dependências existentes; não equivale a teste do bundle npm atual.
- Parser Babel: 48 arquivos JS alterados parseados sem erro.
- git diff --check: app e os três deltas npm → dev passaram.
- Regressão reproduzida no tarball ui-orders@1.3.37: categoriesFetchError=true,
  categoriesFetched=true e lista vazia retornam fallback=true; esperado false.
  O mesmo caso no snapshot dev passa. A composição npm não preserva a #912.
- npm ci padrão (tentativa sob Node 22/npm 10) falhou por peers ausentes no lockfile. O CI usa legacy-peer-deps;
  a tentativa com essa opção não concluiu a instalação após vários minutos e
  foi interrompida. Nenhum lockfile foi regenerado.
- Contrato development falha no worktree npm sem fontes locais (27 módulos
  ausentes); é limitação de setup, não validação do fluxo Garçom.
- Build, lint completo e E2E POS/PPC não concluídos. Não há aceite funcional,
  de Security, nem prova de preservação do comportamento na composição atual.

## NEXT_ACTION

Manager: manter #912 em Working, associar #941 ao Project #1, coordenar a
recuperação usando a issue e o handoff existentes (CON-726), sem criar issue
nova, RC ou Staging. Developer: corrigir os gates acima e recuperar somente o
delta de #912 sobre as bases atuais, aproveitando refactors já publicados nos
pacotes npm. Se isso exigir reconstruir uma task, preservar a ref antiga e
confirmar sua descartabilidade antes de qualquer substituição; não copiar
gitlinks antigos nem fazer reset/force-push cego. Manager/DevOps: revisar a
integração e publicar versões npm novas e imutáveis que contenham o delta
validado; atualizar pins exatos e lockfile do app somente depois de verificar
os tarballs novos. Developer: executar build npm e jornada POS/PPC com regressão
de outros modos. Security: revalidar os novos SHAs, artefatos e evidências.

Fonte: Developer e referências atuais em
`ControleOnline/agents-mcp/agents/skills/controleonline/*/SKILL.md`; links
históricos de shared/by-role foram resolvidos no índice atual do repositório.
QA/Design/UX estão suspensos no fluxo atual; não solicitar aceites desses papéis.


## Retomada para RC autorizada em 2026-09-30

O usuário autorizou criar RC após a entrega npm. Antes da integração, a task remove o workflow one-shot `ops-reset-task-branches.yml` herdado de master, já ausente em dev, para preservar as branches e impedir sua reintrodução. O manifesto congelado existente de dev é mantido byte a byte nesta integração; esta recuperação não altera a RC anterior. A nova RC será criada do master remoto atual e receberá exclusivamente a task 912 com seus pins npm exatos, nova identidade/manifesto e nova homologação em staging. Security e revalidação Manager continuam obrigatórios antes do freeze. Produção depende da etapa humana Deploy.


### Preflight de RC: pendência confirmada de Security

A auditoria somente leitura no servidor confirmou que nginx serve `s.controleonline.com` por `/home/staging/api-community/public`. O checkout `staging` é `264a2a679b7e5e7f96a7e6df5f059e4e37ba3746`; o lock instalado de products aponta para `521b20e70eb7f79218be91a84f17076ade2182fc`. O filtro equivalente de `ProductService` está vazio/comentado e não foi encontrada proteção equivalente para leitura de Product nos dispatchers examinados. A versão Composer publicada `controleonline/products@1.0.2` também não oferece a comprovação necessária. A mudança existente `46b40f0` não pode ser promovida como correção suficiente: faltam evidência da chamada efetiva nas leituras, testes negativos entre empresas e definição de permissão para manutenção de catálogo.

A correção não pode presumir que qualquer funcionário possa administrar produtos, nem remover o cardápio público do Shop. Foi solicitada ao usuário a definição dos perfis autorizados. Manager/Developer do backend devem implementar e comprovar a proteção das leituras/mutações preservando os contratos públicos; Security deve revalidar os SHAs integrados antes do freeze. Nenhuma alteração no servidor da API foi realizada.

O preflight também encontrou o gitlink documental `docs/wiki` em master, com branches dev/staging distintas e subwikis internas. O alinhamento recursivo exigido pelo fluxo deve ser inspecionado e integrado sem descartar conteúdo documental antes de promover o app. As RC anteriores permanecem imutáveis. A tag estável `v1.10.38` já existe; a nova composição deve usar uma nova versão estável livre (candidata `1.10.39`, branch `rc/1.10.39-rc.1`), não sobrescrever a tag publicada. Sem Security aceito e integração segura em dev, nenhuma nova branch RC congelada, tag RC, promoção de staging ou produção é realizada nesta rodada.

### Preparação de runtime publicada na própria task

`ui-orders@1.3.39` remove apenas o alias interno legado `defaultCompany` em favor de `mainCompany`, mantendo o fallback `currentCompany || mainCompany`. PR ui-orders#41, task `32c1cba89f7849fc480bc2ba093e0b86d150b179`, merge dev/npm gitHead `8e479b21323827963732a89085ffeb70d3a82462`; publicação npm OIDC run `36744943525`. Os 326 arquivos do tarball foram comparados integralmente com a fonte revisada e SHA-512 verificado. A publicação anterior 1.3.38 permanece preservada no registry e na prova histórica.

Os validadores e harness de CI passaram a usar os mesmos módulos npm do aplicativo. A instalação antecede a validação; `expo install --fix` deixa de recalcular a composição durante build. Playwright resolve fixtures dos pacotes instalados, conserva os testes de contrato e exige uma API explícita de homologação, alinhando temporariamente API/socket no export de testes e restaurando a configuração original depois. A proibição de nomes legados continua ativa e os testes de regressão incluem ausência de pacotes e impedem fallback silencioso para fontes.

Validação da preparação (Node 20, pacotes reais npm instalados): 87 testes focados do Garçom passaram; 10 regressões novas de CI/fixtures/ambiente mais 2 testes de contrato de módulos passaram (12/12). Contratos de módulos em produção e mainCompany/currentCompany passaram. Catálogo de 11 fluxos de smoke validado; descoberta oficial encontrou Manager29/Admin17/Delivery25/POS14, e descoberta adicional do Garçom25 (descoberta não equivale a execução). Export web POS usando API explícita de homologação passou; a configuração original foi restaurada após o export. O novo smoke de bootstrap é local, com APIs remotas interceptadas, e não constitui validação autenticada POS→PPC.
