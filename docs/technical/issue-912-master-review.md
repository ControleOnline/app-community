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
