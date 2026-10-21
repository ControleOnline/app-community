# Auditoria local do core e dos menus — 19/10/2026

## Resultado

Não há base para declarar o app inteiro homologado. A varredura de leitura encontrou um bloqueador de execução em Traduções, custo elevado das consultas administrativas de integração, falhas de imagens na web local, aplicação parcial do tema escuro e pontos de leitura repetida. Não foi feita correção de produto nesta rodada.

Continuação local de ControleOnline/app-community#1099. App em task-1099, base b30349fa3c853e85f8c2a8f24ef4ecded9a6a56e / 1.10.68; API local em master 8e047ccc9413b3e254a7694a971a56c995379942, com as alterações locais anteriores preservadas. Sem commit, push ou publicação. Sessão existente do Manager/GYROS; sem criação de venda, pedido, pagamento ou produção.

## Método e limites dos tempos

- Abertura dos menus disponíveis na sessão, estados de dados/vazio/erro, controles compartilhados, navegação inferior e tema. Registros DOM/XML e capturas ficam apenas na pasta local de evidências.
- “Dados apresentados” é a telemetria já existente do app, disponível em parte das telas. Estrutura apresentada é outra métrica e não prova dados completos nem imagens carregadas.
- Tempos de observação externa são limites até uma captura confirmar a tela sem indicador de carregamento. Incluem navegação/ferramenta de captura; não são tempos puros de renderização nem p95.
- Ocorreram atrasos da ferramenta de navegador, inclusive ações que surtiram efeito apesar de resposta de timeout. Tentativas com erro/DOM vazio foram excluídas da comparação numérica; não são tratadas como crashes do app. O travamento de Traduções tem erro JavaScript e fonte confirmados, independentemente disso.
- Primeira visita nesta auditoria não é partida com cache zerado. Dados e sessão foram preservados. As tentativas de comparação web em retorno tiveram interferência da ferramenta; não existe benchmark confiável frio versus quente para todos os menus nesta rodada.
- Ambiente de desenvolvimento local com profiler Symfony e emulador API 25. Os números não representam release em aparelho físico ou produção. Operações de escrita, outros perfis/empresas, iOS, pinpad e cada tela de detalhe não foram homologados.

## Tempos de dados apresentados pelo próprio app

| Tela | Plataforma | Tempo | Observação |
| --- | --- | --- | --- |
| Home | Web | 82 ms | Sessão hidratada, indicadores disponíveis; não inclui todo o bootstrap |
| Clientes | Web | 3516 ms | 648 resultados, página de 20 |
| Colaboradores | Web | 2111 ms | Sete resultados |
| Produtos | Web | 3147 ms | 45 resultados; consulta administrativa de integração pode continuar depois |
| Colaboradores | Android API 25 | 1982 ms | Passagem válida após navegação; não equivale a partida fria |

## API: duração real das requisições observadas

450 perfis GET exportados do profiler desde o início da auditoria. Amostra limitada aos perfis selecionados, com rotas normalizadas, sem parâmetros, headers ou payloads. Banco e servidor medidos no mesmo ambiente de desenvolvimento.

| Rota | Amostras | Mediana | Máximo | Máximo de consultas SQL |
| --- | --- | --- | --- | --- |
| `/marketplace/integrations/catalog/status` | 4 | 19.21 s | 23.32 s | 675 |
| `/marketplace/integrations` | 4 | 5.68 s | 6.39 s | 222 |
| `/products` | 19 | 0.79 s | 1.66 s | 28 |
| `/people` | 18 | 0.97 s | 1.21 s | 29 |
| `/orders` | 41 | 0.52 s | 3.08 s | 93 |
| `/products [contagem]` | 50 | 0.59 s | 0.86 s | 21 |
| `/localhost%3A8081/files/:id/download` | 54 | 1.98 s | 3.34 s | 13 |

Não se deve somar esses tempos à telemetria visual: há consultas paralelas e chamadas que continuam em segundo plano.

## Achados e prioridade

### 1. Bloqueador: Traduções derruba a web

ReferenceError `handleExternalFiltersChange is not defined`, reproduzido após abrir Traduções. A falha foi observada após a abertura e a navegação para outros menus; o render tardio de uma tela ainda montada é a explicação compatível com o comportamento e precisa de teste específico de ciclo de vida. Referência em ui-translate 1.1.65, TranslationsReviewPage.js:308. A função existe no retorno de useTranslationsReviewOperations.js:274, mas não é retirada do retorno na página (desestruturação próxima de :185). Checagem estática de referências indefinidas em 82 arquivos confirmou essa referência ausente. Isso não é falha do novo estilo compacto.

A API também retornou 404 em `/translates/overview` nas leituras desta rodada. Esse contrato precisa ser conferido na composição APP/API; corrigir somente o callback não basta para homologar a tela. Evidência do erro JavaScript está no log de navegador e na checagem estática; houve captura da web em branco.

### 2. Desempenho: status administrativo do catálogo de integrações

Quatro chamadas `/marketplace/integrations/catalog/status`, todas HTTP 200, levaram aproximadamente 17,5–23,3 segundos, com 675 consultas SQL em cada uma. Num perfil, 335 consultas atingem `extra_fields` e 321 `extra_data` (656 das 675 consultas). Isso é evidência de repetição de consultas; a correção exata exige revisar o carregamento ORM, sem alterar regras de disponibilidade ou autorização.

Products.js:160–166 solicita o status no foco de Manager por useMarketplaceCatalogSync; a consulta não é gate do retorno da lista principal. O controller IntegrationController.php:1341 monta status de três plataformas. Portanto, ver produtos em cerca de três segundos não significa que a atividade de rede/banco dessa entrada terminou. O endpoint da lista de integrações também chegou a 222 consultas e mediana de 5,68 s.

Direção: corrigir o carregamento e reaproveitamento no serviço/hook compartilhado; avaliar quando os dados administrativos precisam ser consultados no catálogo operacional. Não duplicar stores nem esconder erro com atraso artificial.

### 3. Imagens: falhas reais na web local

Na amostra do profiler, `/localhost%3A8081/files/:id/download` teve 44 respostas 403 e duas 500, além de oito 200. Não é correto considerar todo 403 como ausência de arquivo. O hostname de desenvolvimento está inserido na rota de tenant. `ui-common/src/react/utils/fileUrl.js`, buildTenantDownloadUrl, reconstrói essa rota; o proxy local encaminha o caminho recebido.

Revisar resolução de domínio/arquivo na composição local e o erro do servidor, preservando autenticação. A causa de cada arquivo negado não foi provada isoladamente. No nativo, o caminho correspondente com localhost:8000 teve 104 retornos 200 nesta amostra; não generalizar a falha web para Android.

### 4. Tema compartilhado ainda não cobre toda a apresentação

Reprodução: Clientes no tamanho de celular → tema escuro. Cabeçalho e moldura mudam, enquanto cards de pessoas, área da busca e rodapé da tabela permanecem claros; o item ativo da barra inferior perde contraste. Captura `clients-dark-mobile.jpg`. Tema claro foi restaurado.

Há um contexto de tema fornecido ao DefaultTable e componentes filhos que consultam tokens diretamente da store, como People.js. A divergência visual é confirmada; a causa exata da sincronização entre essas fontes ainda precisa ser isolada. Não declarar tema global integralmente homologado apenas porque o contexto do DefaultTable recebeu tokens.

### 5. PDV web: contagens fazem leituras separadas

useCategoryProductCounts.js consulta a coleção canônica uma vez por categoria e para “Todos”, com dois workers. Isso preserva total DISTINCT e regras de empresa/ativo/tipo, porém adiciona múltiplas consultas e atualizações de estado. Esse fluxo usa `signal` e a query na URI; a política atual do coordenador não reutiliza essas requisições. A amostra possui 50 consultas de contagem, mediana 594 ms cada; isso não significa 50 chamadas numa única abertura.

A implementação está habilitada no catálogo Manager web; no modo Manager nativo inline, as contagens estão desabilitadas. Direção: reaproveitar/incrementar o contrato compartilhado de contagem e sua invalidação; evitar criar uma segunda interpretação das regras do catálogo.

### 6. Core compartilhado não implica persistência de todas as listas

O default delega ao store e mantém proteção de identidade da consulta, filtros, ordenação e paginação. Entretanto, ui-default/src/store/default/actions.js:166 implementa saveOffline como retorno vazio; getItems usa o caminho online. Isso já existe no core e não foi introduzido pelo visual.

O preview acrescenta coordenação/deduplicação e cache em memória para um conjunto restrito de endpoints, com TTL de 30 segundos, além do cache persistente do catálogo. Não é armazenamento universal de pedidos, finanças ou todos os cadastros até o usuário apagar o cache. Reutilizar os mecanismos existentes e definir freshness/invalidação por recurso continua necessário.

## Compatibilidade com o core

- A resolução do preview intercepta DefaultTable e delega ao componente original. O tema do shell é compartilhado por todas as rotas; nenhuma regra comercial foi reescrita nesta auditoria.
- Existem adaptações locais de apresentação e de leitura/cache, além de substituições locais de PdvPage, DevicesIndex, IncomeStatement e ConfiguratorPage. Portanto, “compatível com o core” não significa código idêntico nem mudança exclusivamente cosmética em todos os arquivos.
- Nem toda tela deve ser DefaultTable: estoque, perfil, CRM, integrações e formulários têm fluxos próprios nos módulos originais. Usar a store/default onde apropriado não exige apagar esses fluxos.
- A checagem estática examinou 82 arquivos de entrada/consumidores e encontrou o callback ausente de Traduções. Não equivale a análise completa de todos os imports, segurança, permissões ou lógica comercial.
- Alguns rótulos mudaram entre o cadastro português e chaves/traduções inglesas durante a hidratação. Há cabeçalhos legados coexistindo com o shell em páginas não adaptadas. São itens de consistência registrados, sem redesign nesta rodada.
- Custos do cardápio exibiu transitoriamente “Contexto da leitura alterado”; uma observação posterior mostrou os dados sem esse aviso. Não classificado como falha persistente. As datas de últimas compras também exibem parte de timestamp, merecendo revisão de formatação.

## Matriz web — observações válidas

Os valores abaixo são limites de observação externa, não benchmark de renderização. Tentativas rejeitadas pela ferramenta ficam no JSON bruto e não são marcadas como aprovação. Traduções tem falha confirmada; Perfis e CRM foram conferidos adicionalmente em largura móvel.

| Menu | Observação externa | Estado |
| --- | --- | --- |
| Colaboradores | 2.57 s | Dados/estado vazio observados; ações de escrita não executadas |
| Minhas empresas | 7.03 s | Dados/estado vazio observados; ações de escrita não executadas |
| Vitrines | 2.71 s | Dados/estado vazio observados; ações de escrita não executadas |
| Dispositivos | 2.84 s | Dados/estado vazio observados; ações de escrita não executadas |
| Connections | 3.39 s | Dados/estado vazio observados; ações de escrita não executadas |
| Manager categories | 5.27 s | Dados/estado vazio observados; ações de escrita não executadas |
| Configurações | 2.00 s | Dados/estado vazio observados; ações de escrita não executadas |
| Financeiro | 2.97 s | Dados/estado vazio observados; ações de escrita não executadas |
| Comissionspage | 3.35 s | Dados/estado vazio observados; ações de escrita não executadas |
| Resultados | 3.55 s | Dados/estado vazio observados; ações de escrita não executadas |
| Payables | 3.90 s | Dados/estado vazio observados; ações de escrita não executadas |
| Receivables | 1.87 s | Dados/estado vazio observados; ações de escrita não executadas |
| Own transfers | 1.94 s | Dados/estado vazio observados; ações de escrita não executadas |
| Wallets | 4.43 s | Dados/estado vazio observados; ações de escrita não executadas |
| Invoice categories | 2.73 s | Dados/estado vazio observados; ações de escrita não executadas |
| Model templates | 8.01 s | Dados/estado vazio observados; ações de escrita não executadas |
| Model labels | 1.33 s | Dados/estado vazio observados; ações de escrita não executadas |
| Pedidos de venda | 2.64 s | Dados/estado vazio observados; ações de escrita não executadas |
| Produtos | 3.44 s | Dados/estado vazio observados; ações de escrita não executadas |
| Inventory | 2.98 s | Dados/estado vazio observados; ações de escrita não executadas |
| Pedidos de compra | 1.77 s | Dados/estado vazio observados; ações de escrita não executadas |
| Purchase suggestions | 1.63 s | Dados/estado vazio observados; ações de escrita não executadas |
| Purchase form | 1.43 s | Dados/estado vazio observados; ações de escrita não executadas |
| Menu costs | 10.30 s | Dados/estado vazio observados; ações de escrita não executadas |
| Supplies | 7.35 s | Dados/estado vazio observados; ações de escrita não executadas |
| Presence inbox | 2.54 s | Dados/estado vazio observados; ações de escrita não executadas |
| Display list | 7.62 s | Dados/estado vazio observados; ações de escrita não executadas |
| PDV | 6.84 s | Dados/estado vazio observados; ações de escrita não executadas |
| Mesas e comandas | 1.90 s | Dados/estado vazio observados; ações de escrita não executadas |
| Integrations | 6.84 s | Dados/estado vazio observados; ações de escrita não executadas |
| Clientes | 3516 ms (telemetria de dados) | 648 resultados; observação da primeira abertura |
| Fornecedores | Sem tempo válido | 69 resultados e paginação conferidos após atraso da ferramenta |
| Tabelas de entrega | Sem tempo válido | Inbox e tabela vazia conferidos após atraso da ferramenta |
| Início | 82 ms (telemetria de dados) | Indicadores conferidos após hidratação |
| Traduções | Sem conclusão válida | Falha JavaScript e API 404 |
| Perfil | Sem tempo de conclusão válido | Conteúdo conferido em 390 × 844, sem editar dados |
| Oportunidades | Sem tempo de conclusão válido | Vazio configurado conferido em 390 × 844, sem erro de atualização máxima nessa passagem |

## Matriz Android API 25

Mesma limitação: a observação inclui o custo de captura XML, e screen.committed é somente estrutura da tela. Tentativas com seletor ausente ou XML indisponível não aprovam a rota. As primeiras tentativas do script foram descartadas por sobreposição de seleção, posicionamento e XML antigo; os registros abaixo usam as séries com identidade de rota verificada.

| Rota | Estrutura apresentada | Observação externa | Estado |
| --- | --- | --- | --- |
| ClientsIndex | 192 ms | 2.28 s | Tela observada; validar semântica do estado |
| EmployeesIndex | 297 ms | 3.72 s | Tela observada; validar semântica do estado |
| PdvPage | 155 ms | 3.24 s | Tela observada; validar semântica do estado |
| LinkedOrderSettlementPage | 171 ms | 2.95 s | Tela observada; validar semântica do estado |
| ProductShowcasesPage | 309 ms | 3.08 s | Tela observada; validar semântica do estado |
| ConfiguratorPage | 228 ms | 2.41 s | Tela observada; validar semântica do estado |
| DevicesIndex | 441 ms | 3.56 s | Tela observada; validar semântica do estado |
| ConnectionsPage | 287 ms | 3.97 s | Tela observada; validar semântica do estado |
| IntegrationsPage | 124 ms | 7.79 s | Tela observada; validar semântica do estado |
| ManagerCategoriesPage | 170 ms | 5.84 s | Tela observada; validar semântica do estado |
| FinancialHubPage | 199 ms | 3.37 s | Tela observada; validar semântica do estado |
| ComissionsPage | 254 ms | 3.79 s | Tela observada; validar semântica do estado |
| Payables | 182 ms | 4.53 s | Tela observada; validar semântica do estado |
| Receivables | 248 ms | 1.77 s | Tela observada; validar semântica do estado |
| OwnTransfers | 198 ms | 1.68 s | Tela observada; validar semântica do estado |
| WalletsPage | 205 ms | 1.74 s | Tela observada; validar semântica do estado |

Os menus sem confirmação Android nesta matriz permanecem sem homologação nativa nesta rodada; falha de seletor/tempo da ferramenta não é aprovação nem defeito funcional confirmado. A web recebeu cobertura mais ampla. Produtos foi também conferido manualmente com 45 resultados; essa observação não tem tempo preciso de conclusão.

## Próxima etapa sugerida

1. Corrigir callback/contrato de Traduções e repetir a abertura e navegação para fora da tela.
2. Reduzir as consultas de status administrativo do catálogo e revisar o momento da leitura, no serviço/hook compartilhado.
3. Corrigir o caminho de imagens no ambiente web e investigar as respostas 500 sem reduzir autorização.
4. Conciliar tema dos componentes filhos e contraste da barra; depois repetir a comparação de carregamento com cache recente, instrumentação por tela e ambiente controlado.

Nenhum novo recurso ou correção foi aplicado nesta auditoria. Os testes automatizados da integração anterior não foram repetidos, nem usados para aprovar os defeitos encontrados agora. Esta entrega é o diagnóstico local com evidências; a task permanece aberta, sem publicação.
