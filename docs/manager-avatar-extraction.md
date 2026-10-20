# Extração experimental do Shenlong — 16/10/2026

Solicitação: preservar a prévia ERP, retirar o experimento do app, guardar como pacote independente na `.codex/experiments/shenlong` e desligar por padrão. Sem publicação NPM, repositório externo, commit ou push.

`ManagerPreviewProvider` mantém tema e `useExperienceRuntime`; somente o estado experimental passou para a interface opcional `@experimental-avatar`. A chave no Metro decide entre implementação inerte dentro do app ou pacote externo. A versão normal não exige que o pacote exista. Integração experimental na 8083; execução normal 8081 explicitamente desligada. Nenhuma mudança em cache, stores, API, Device Config ou regras de venda.

Fonte extraída: view, arte, canvas, renderer/geometria/shader, convite e preferências. Três arquivos de testes foram movidos junto; estados genéricos e demo adicionados no pacote. `guideModel` e `JourneyPanel` continuam adaptadores do ERP. A antiga prova de jornada deixou de carregar o renderer extraído e usa 8098; a demo independente usa 8099.

O pacote é privado. Sua separação foi aprovada nesta conversa; não representa aprovação do avatar como produto do ERP. Use o README do experimento para testar, reativar ou restaurar. Cache e diagnósticos do ERP não dependem dele.

## Evidência

- Resultado dos testes, compilação nos dois modos e leitura dos source maps registrados ao final da execução.
- Não interpretar compilação ou HTTP 200 como homologação visual/autenticada.

### Verificações executadas

- Manager padrão: 209 testes / 56 suítes passaram, incluindo login sem avatar, menu sem ação inativa, tema, contexto e runtime de leituras.
- Integração experimental explícita (`SHENLONG_TESTS=1`): 209 testes / 56 suítes passaram.
- Pacote independente: 13 testes / 4 suítes passaram (view, convite, renderer e troca de escopo). Avisos já existentes de depreciação do react-test-renderer permanecem.
- Resolução opcional: 3 testes Node passaram, incluindo app sem diretório experimental disponível.
- Export web padrão com source maps: 5.556 fontes, zero fontes de `.codex/experiments/shenlong`; implementação inerte, `useExperienceRuntime`, `collectionCache` e `pdvImageCache` presentes.
- Demo compilou, serviu HTML e JavaScript com HTTP 200 na 8099; JavaScript passou na verificação de sintaxe e não contém marcadores de módulos/API do ERP. Servidor de demonstração desligado após a prova.
- Prévia 8081 reiniciada pelo script normal com a chave explicitamente em zero; HTTP 200 e bundle web compilado. Sem inspeção visual autenticada nesta execução, nem nova prova WebGPU real.
- `git diff --check` passou. Arquivos preexistentes preservados; nenhum commit, push ou publicação.

As execuções iniciais feitas a partir do diretório pai falharam na resolução de plugins Babel em uma suíte que usa caminhos relativos. A repetição a partir de `app-community` passou. Isso foi corrigido na invocação, sem alterar as regras do produto. O comando genérico Jest do repositório já apresentava incompatibilidades de configuração e arquivos ausentes antes desta extração; não foi usado como prova de aprovação global.

- Export web experimental explícito (sem minificação) passou: 5.566 fontes, 11 do pacote externo. O verificador de inclusão passou nos dois modos.
- Snapshot local: `.codex/experiments/_backups/shenlong-20261017T020250Z.tar.gz`; 24 arquivos comparados byte a byte com a origem, SHA-256 em arquivo adjacente. Não é backup remoto.
