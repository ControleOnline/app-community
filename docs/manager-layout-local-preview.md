> Estado atual: ver [Ciclos de leitura — 16/10](manager-read-cycle-validation.md).
> As rodadas datadas abaixo são histórico, não o aceite atual.

# Prévia local do MANAGER — etapas 1 e 2

Iniciar com Node 20: `npm run web:manager-preview`.
Abrir http://localhost:8081 e autenticar com o usuário do ambiente local.
A API continua sendo a configurada em `config/env.local.js`; nenhuma credencial é copiada pelo preview.

A prévia exige a opção `EXPO_PUBLIC_MANAGER_PREVIEW=1`, navegador em localhost e tipo de aplicativo MANAGER.
O comando normal `npm run web` mantém a interface existente. POS, PPC, DELIVERY, SHOP e compilações nativas mantêm o layout existente.

A navegação usa os menus da store theme e as rotas registradas do aplicativo; dispositivos e configurações não são substituídos por demonstrações.
A seleção de empresa reutiliza CompanyFilter e a store people. O tema é aplicado apenas em memória na store theme,
com preferência claro/escuro persistida na chave local controleonline.manager-preview.mode; não altera temas na API.
A estrutura permanece disponível nos destinos internos privados, com retorno à visão geral.

Os cartões operacionais e o gráfico usam consultas reais.
Não há vendas ou estatísticas fictícias.
Empresa ativa permanece no cabeçalho; dispositivos e configurações permanecem nos acessos reais.

Validação manual: claro/escuro; menu completo acima de 1060px, compacto entre 761–1060px e sobreposto até 760px;
fechar menu com Escape; navegar e voltar; alternar empresa; confirmar dispositivos e configurações conforme permissões.
As telas legadas usam a store de tema, mas a adaptação integral de cada formulário e tabela pertence às etapas seguintes.

O dashboard oferece Hoje (padrão), Últimos 7 dias e Todo o período para vendas e pedidos.
Em andamento é identificado como Situação atual, independentemente do período.
A seleção filtra as consultas reais de vendas e pedidos. Clientes mostra o total cadastrado na empresa.

## Conexão real dos cartões

Os cartões consultam o cliente API existente por readCollection, sem substituir as listas globais de orders ou people. Os filtros e formatadores permanecem compartilhados com os módulos de domínio.
Pedidos usa totalItems de todos os tipos, como a homepage existente; receita usa resolveHistorySalesTotals, compartilhado com o histórico,
com summary=sales (vendas fechadas, pela data do pedido, sem confundir com recebimentos).
Períodos usam buildDateRangeWindow e buildOperationalInsightsFilters dos relatórios existentes, com
as mesmas fronteiras de data locais do módulo de relatórios. Em andamento usa status.realStatus=open
sem filtro de data. O cartão de estoque foi retirado, conforme solicitado.
Todas as chamadas incluem a empresa selecionada; respostas antigas não atualizam os cartões após troca de empresa/período.
Falhas não são convertidas em zero. O gráfico reutiliza as séries do mesmo resumo de vendas.

Foi corrigida localmente a ordem de importação das rotas no Kernel da API: as rotas explícitas dos
módulos precisam preceder os detalhes genéricos da API Platform. Antes, /products/purchasing-suggestion
era interpretado como identificador de produto e retornava 404. Nenhum endpoint novo foi criado.

## Perfil e atalhos da homepage

O avatar reutiliza HomeAvatar e a imagem da sessão. O avatar do cabeçalho e o bloco do usuário
abrem o mesmo menu de conta: Meu perfil, Ajuda do On Manager, claro/escuro e Sair.
Meu perfil abre ProfilePage; Sair reutiliza auth.actions.logOut, preservando o fluxo de autenticação.
Clientes consulta people com link.company e link.linkType=client, exibindo totalItems sem alterar a lista global.
Resultados abre IncomeStatement conforme o menu permitido. Pedidos e vendas abrem OrderHistoryPage;
clientes abre ClientsIndex. Não foram criadas telas ou endpoints paralelos.

A diferença entre a contagem antiga e a primeira prévia era o filtro orderType=sale da prévia.
A contagem geral agora preserva o critério antigo, mantendo o filtro de vendas apenas na receita e nos pedidos de venda abertos.

## Composição atual dos indicadores

Para apresentação ao time, o dashboard mantém vendas, pedidos, em andamento e clientes.
O cartão de alertas de estoque e sua consulta foram retirados da homepage; os módulos de estoque continuam acessíveis.
A personalização por widgets fica para uma etapa posterior, sem botão de adicionar inativo nesta versão.

## Movimento de pedidos

O gráfico reutiliza o cartão, estilos e formatadores compartilhados dos relatórios, com disposição horizontal local em ManagerOrdersTrend, e as séries daily/monthly do summary=sales já solicitado pelo cliente API.
Hoje e Últimos 7 dias mostram a série diária; Todo o período mostra todos os meses retornados, com rolagem horizontal.
A métrica é pedidos de venda concluídos pela data do pedido, distinta do cartão de pedidos de todos os tipos.
Não é feita nova consulta nem agregação sobre uma página parcial de pedidos.
Carregamento, erro, série ausente e ausência de vendas têm mensagens distintas.

A adaptação local explicita a disposição das barras em linha e limita a altura da área rolável.
Todos os períodos são preservados e valores zero não desenham barras positivas.

## Guia contextual e jornada local

O guia permanece recolhido por padrão e usa sugestões contextuais por rota, conforme menus permitidos.
A apresentação tenta um Shenlong procedural em WebGPU; mantém o dragão SVG estático se indisponível.
Não há modelo de IA, voz ou decisões automáticas de negócio nesta entrega.

A base compartilhada de observação e leitura fica em src/experience; o MANAGER instala um adaptador
apenas no preview local. O painel Jornada local distingue navegação, estrutura apresentada,
consulta iniciada, resposta disponível e os sinais de dados apresentados implementados para HomePage,
ClientsIndex e MyCompaniesPage. Outras telas têm observação de transporte, sem promessa de renderização completa.

O diário é limitado a 160 eventos e 10 minutos, em memória; não registra corpos de resposta, credenciais,
textos digitados ou dados de clientes. A leitura de people pode ser reaproveitada por 30 segundos,
com limite de 40 entradas / aproximadamente 2 MB, separada por aplicativo, empresa, usuário, sessão,
papéis e dispositivo. Não há novo armazenamento persistente de clientes em IndexedDB.

A antecipação aguarda 250 ms de foco/hover, somente para uma rota permitida cuja consulta já foi
observada neste contexto. Há no máximo uma antecipação ativa. Ela não inventa consultas de rotas
nunca visitadas. Operações de escrita continuam no cliente original e invalidam o reaproveitamento.

Consulte docs/experience-contracts-local.md para contratos, limitações e evidências deste marco.

## Identificação e avatar na entrada

Apenas a prévia usa o adaptador ManagerSignIn.web, reaproveitando integralmente ui-login.
O título é Eu sou; o campo é Usuário, com mensagem Usuário é obrigatório; Nova conta continua
navegando para CreateAccount. Não há mudança no payload username/password, no cadastro ou na recuperação.
O pacote ui-login recebeu props opcionais por um patch local aditivo, registrado em patches/ui-login-identifier.json.
O comando web:manager-preview aplica scripts/apply-manager-login-patch.cjs antes de iniciar;
assim o ajuste não depende de uma edição solta em node_modules. Os defaults do pacote não mudam
para a interface atual em 8082. A publicação de uma versão NPM permanece fora desta etapa.

O avatar padrão se chama Sheng-Long e aparece também antes do login, com 40px e painel fechado.
Preferências do Sheng-Long permite tamanho 32–80px, posição esquerda/direita, tempo de sugestão
editável (0–86400s), Mais cedo (metade), Mais tarde (dobro) e Somente quando eu chamar.
As preferências são desta sessão. O convite aguarda a primeira interação e o tempo escolhido;
aguarda mais enquanto há foco em um campo de entrada ou a página está oculta. Aceitar é que abre
o painel, sem roubar foco automaticamente. Há um convite por contexto de entrada/usuário;
abrir manualmente, dispensar ou mudar o usuário cancela o convite pendente.

Na entrada o guia dá somente orientações públicas e não instala a instrumentação da API privada.
Tag, scan, NFC, voz e aprendizagem automática não foram implementados como autenticação neste marco.
O guia oferece apenas recursos conectados. O painel de diagnóstico aberto em capturas anteriores
foi aberto durante a checagem; ele não abria sozinho no primeiro acesso.


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
