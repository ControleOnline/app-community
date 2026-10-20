> Estado atual: ver [Ciclos de leitura — 16/10](manager-read-cycle-validation.md).
> As rodadas datadas abaixo são histórico, não o aceite atual.

# Experiência compartilhada — marco local de 15/10/2026

Implementação experimental no preview do On Manager. Reutiliza o cliente API, menus, rotas,
permissões e resumos de domínio existentes. A instalação é reversível e restrita ao preview web local.
Não é uma nova API, um serviço de IA ou uma simulação de fenômenos quânticos: os acontecimentos
observados são interações, navegações e leituras reais de software; a linguagem de nós/ecossistemas
orienta a organização, sem alegação de acesso ao RAW universal ou a emoções inferidas.

## Contratos

- journey.js: createJourney({now,maxEvents,maxAgeMs}), begin(route,source), present(route), finish(route),
  record(type,metadata), setContext(context), snapshot(), subscribe(listener), reset().
- reads.js: createReadCoordinator({fetch,getScope,journal,now,policy,maxEntries,maxBytes}),
  read(uri,options), prefetch(uri,options), invalidate(), stats(), dispose().
- erpAdapter.js: createErpExperience({api,getContext,now,cacheTtlMs}), install(), begin(), present(),
  dataCommitted(), setCapabilities(routeNames), anticipate(), cancelAnticipation(), prefetchRoute(), reset(), dispose().
- collections.js: readCollection(api,endpoint,query), projeção sem mutação de stores globais.
- shenlong/renderer.js: startShenlong(canvas,{signal,onMode,onStats,...}), retorna destroy().

Eventos co.experience.v1 têm sequência, relógio monotônico, aplicativo, geração e journeyId.
Metadados permitidos: rota, recurso normalizado, duração, origem, resultado, requestId e origem do cache.
Tipos principais: navigation.requested, screen.committed, view.data-committed, journey.interrupted,
interaction.observed, read.started, read.returned, read.failed, read.cache-hit, read.deduplicated,
read.shared-returned e read.shared-failed. Requisições compartilhadas preservam requestId e recebem
journeyId do consumidor. Receber resposta não comprova a renderização de qualquer tela.

O contexto privado identifica aplicativo/empresa/usuário/sessão/papéis/dispositivo. Não é serializado
nos eventos. Mudanças descartam cache/receitas/diário; respostas pendentes de contexto anterior são
rejeitadas. Eventos limitados a 160 / 10 minutos; expiração ocorre na próxima observação ou evento.
Não são preservados entre reinícios. O diário não contém respostas, credenciais ou textos do usuário.

## Leituras e antecipação

Reuso em memória somente para GET people e people/id elegíveis, por até 30 segundos;
contagens do dashboard, opções especiais e outros endpoints continuam consultando o transporte.
Até 40 entradas / estimativa de 2 MB de JSON UTF-16. Respostas são copiadas por consumidor.
Falhas não aquecem cache. Escritas invalidam antes e depois, sem antecipar ou alterar a escrita.
Uma atualização repetida no mesmo percurso volta ao transporte; novo percurso pode reutilizar.

A antecipação só aprende uma receita após acesso real a uma rota permitida. Foco/hover de 250 ms
pode prepará-la, com no máximo uma preparação simultânea. Não conhece intenção futura com certeza.
Reusos, acertos e desperdícios são contados. Ainda não há algoritmo adaptativo nem cancelamento
físico de todas as requisições: o resultado obsoleto é descartado, o transporte pode concluir.

O cache não é a store, o diário não é cache e nenhum dos dois substitui o banco do ERP.
Persistência offline genérica não foi habilitada: saveOffline existente é inoperante e os caches
especializados já existentes exigem avaliação por domínio. Não se promete offline total.

## Shenlong

Malha procedural própria de dragão chinês: corpo curvo, ventre, espinhos, cabeça, chifres,
bigodes, olhos e membros. WGSL com iluminação e profundidade. Sem biblioteca 3D nova ou assets remotos.
Canvas de até 192 pixels, até 24 desenhos/s, pausa com página oculta, desenho estático para movimento
reduzido e liberação de recursos ao desmontar. Não funciona sobre WebGPU nativo do POS neste marco.
WebGPU indisponível ou perdido mantém alternativa SVG no aplicativo. O guia não bloqueia navegação.
Modelo/conversa/voz/agente autônomo e gravação seletiva de memórias pessoais são trabalho futuro.

## Extração futura dos módulos NPM

Proposta, sem publicação ou alteração de versões nesta etapa:

| Responsabilidade | Destino a confirmar na governança |
| --- | --- |
| Diário, coordenação de leituras e contratos sem React | ui-common ou pacote compartilhado dedicado |
| Sinais de carregamento/commit e transporte das listas | ui-default |
| Semântica de pedidos, receita, clientes e sincronização | ui-orders, people e packages API respectivos |
| Apresentação do guia e canvas web | camada visual compartilhada com adaptadores por aplicativo |
| Contexto/permissões e instalação | adaptador de SHOP/PDV/PCP/MANAGER/etc. |

Evoluir contratos aditivamente; mudança de significado de evento exige nova versão de schema e
compatibilidade explícita. O teste SHOP usa fixture: não comprova integração do aplicativo SHOP.
Reaproveitar primeiro não significa publicar imediatamente estes arquivos em um novo pacote.

## Evidências e próximo gate

- 84 testes em 19 suítes passaram localmente; nenhum teste marcado skip nessa execução.
- Exportação web final concluiu com código 0 (5.527 módulos); git diff --check também retornou 0.
- Revisão de código com duas falhas reproduzidas e corrigidas: opções mutadas pelo cliente API
  impediam antecipação; deduplicação perdia o sinal de conclusão da nova jornada.
- Fixture no navegador: consulta 635.0 ms, retorno por reuso 0.6 ms, por antecipação 0.3 ms.
  Não é benchmark do ERP nem demonstra que uma tela de 20 segundos foi corrigida.
- Troca sintética de empresa e aplicativo limpou os eventos anteriores.
- Navegador de teste não disponibilizou WebGPU. Fallback visível validado; execução GPU real,
  compilação WGSL pelo driver, beleza do modelo e consumo em hardware permanecem pendentes.
- 8081 é a prévia e 8082 é a referência atual. Após o usuário autenticar, ambas mostraram
  LEANDRO e GYROS. O dashboard da prévia e a entrada em Clientes na referência retornaram
  Failed to fetch no navegador de teste; não há comparação válida de desempenho concluída.
  Preflight OPTIONS de people na API local respondeu 200 com origem 8081 permitida. Isso
  comprova resposta local/preflight, não sucesso de GET autenticado pelo navegador. A raiz
  da API carregou posteriormente no navegador (toolbar informou 42.834 ms); a primeira espera
  de navegação havia expirado. GET sem credencial retornou 401 com CORS para 8081. Isso não
  isola a causa das falhas nas consultas autenticadas.
  Medição de dados reais, troca de empresa, logout/login e estabilidade do perfil permanecem pendentes.

Iniciar a prévia com npm run web:manager-preview usando Node 20. No guia, abrir Jornada local
para acompanhar os eventos. O probe scripts/experience-preview.cjs é isolado e não usa API/sessão do ERP.
Antes de generalizar o cache, medir uma jornada real e verificar frescor, autorização e custo por domínio.

## Ajustes de entrada e conta

Avatar padrão Sheng-Long configurável na sessão, 40px por padrão, disponível antes do login.
Convite baseado em interação e tempo editável, com modo manual, adiado durante digitação e sem
abertura automática do painel. Cópia de login Eu sou / Usuário / Nova conta no adaptador local;
props opcionais no ui-login aplicadas por patch local guardado no repositório, defaults preservados.
O menu compartilhado dos dois avatares reutiliza perfil, ajuda, tema e logout existentes.
Checagem visual da entrada e edição 30s -> 60s -> 30s realizada no navegador. Menu autenticado
validado por testes; a falha de consulta/sessão ainda impede concluir sua validação visual real.


## Rodada local de consolidação — 15/10/2026

- EmployeesIndex/people_link incluído no adaptador do DefaultTable; 10 itens mobile e 20 desktop, preservando filtros e ações. Preferências iniciais de colunas usam o mecanismo oficial sem sobrescrever escolhas existentes. Tema usa DefaultTableThemeContext.
- ManagerPdvPage envolve o componente original; atalhos dependem dos menus autorizados. Mesa/comanda usa a configuração e os módulos existentes; nenhuma venda/pagamento foi executada. Conteúdo interno ainda requer validação visual.
- Cabeçalho nativo oculto apenas em rotas explicitamente adaptadas, preservado nas demais. Menus distinguem pedidos de venda/compra e Colaboradores.
- Contexto: tentativa manual de recuperação com myCompanies e menus-people. Não inventa empresa/menu; descarta resposta de menu de empresa/identidade anterior. Não comprova correção da falha de transporte.
- API: overlay local documentado em ../api-community/docs/patches/manager-read-batch/README.md, com checksums, aplicação e reversão guardadas. Batching mantém raízes selecionadas pelo provider; não constitui release de pacote.
- Validação: 113 testes APP/25 suítes; 24 testes API/1.917 asserções (17 deprecações, 2 notices). Na sessão lateral empresa GYROS/menus/indicadores foram observados; novas consultas de período/listas falharam. Não aprovar desempenho/cache/isolamento runtime com esses resultados.
- Avatar: sem interrogação; toque na figura abre ajuda, somente o nome abre a carta. Arte preservada.


### 2026-10-15 — 21:28 video and activation repair

The new video still fails end-to-end acceptance: employee names now render, but My Companies/mobile Clients can remain loading and layout consistency is incomplete. The API batching activation was repaired in the Composer overlay (explicit service wiring plus Symfony supported-type dispatch). Identical authorized client-page read: 20 rows, total 648, 5687 ms / 212 SQL before versus 1035 ms / 25 SQL after. Isolated browser reads returned clients20, employee links2, companies3 and categories17; concurrent isolated reads also succeeded. These are API/transport measurements, not click-to-render timings. The full application still aborted requests (Failed to fetch / XHR Request aborted); cause unresolved. Temporary transport experiments were removed. Current checks: APP119/26 suites; API25/1927 assertions with pre-existing deprecations/notices; web export success. Roadmap current-validation keeps the journey unapproved. No commit, push, business-data write or permanent screenshot evidence.
