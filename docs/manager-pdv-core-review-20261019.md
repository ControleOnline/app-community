# PDV nativo e contratos do core — revisão local 19/10/2026

## Escopo e conclusão

Etapa visual já aceita pelo usuário. Esta rodada corrigiu leitura/reutilização do catálogo nativo e o custo da primeira consulta; revisou configurações, parâmetros e rotas dos menus. Não é homologação integral do ERP nem autorização de publicação. Nenhum pedido, invoice, pagamento, produção ou dado de configuração foi criado/alterado na base. Consultas SQL foram somente leitura; credenciais e cabeçalhos não integram a evidência.

## O que foi corrigido

O cache compartilhado do garçom dependia de WebCrypto e IndexedDB. No Android API 25 a identificação retornava nula, provocando acesso recorrente à rede. Foi adaptado o mecanismo existente: SHA256 compatível no nativo e AsyncStorage para os mesmos registros, limitado a 100 registros. A chave considera API/domínio, sessão, usuário/perfil, empresa, dispositivo, aplicativo, contexto e revisão de invalidação. Dados antigos aparecem imediatamente e, após 60 segundos, podem ser revalidados em segundo plano. Não se assume que ficam corretos indefinidamente até limpeza manual.

O comando existente clear-product-cache invalida memória e armazenamento do catálogo sem apagar sessão/tema. Escritas de catálogo pelo adaptador também invalidam. Os caches já existentes do preview recebem a mesma notificação. Não foi criado um motor paralelo de catálogo. Listas default em geral ainda não têm persistência durável automática: saveOffline permanece sem implementação efetiva; não se deve prometer cache persistente para todos os menus.

Na API, a pré-carga de productFiles trazia o binário files.content para a coleção, embora ele não seja serializado no grupo product:read. A seleção parcial agora busca só os metadados nesse grupo exato. Outros grupos e download autenticado permanecem no caminho original. Não há alteração de paginação, autorização ou regras de preço/estoque.

O realce do menu agora diferencia rotas iguais por parâmetros: pedidos de venda e compras não ficam selecionados como se fossem a mesma opção.

## Evidência medida

- Mesmo aparelho/sessão/empresa/filtro: cinco produtos, total cinco, payload completo com SHA256 idêntico. Antes 3255 ms; depois 878 ms. Profiler depois: 778 ms, 20 consultas, 523 ms de banco. Antes, uma consulta de arquivos consumia 2494 ms.
- Duas leituras consecutivas pelo cache nativo: 3555 ms e 3 ms. Isso mede leitura de dados, não pintura completa da tela.
- Após force-stop e reabertura sem limpar dados: mesma consulta retornou cinco itens persistidos em 83 ms, um acerto no armazenamento e zero leituras de rede antes do retorno. Revalidação posterior em segundo plano é esperada conforme TTL. Uma tentativa imediatamente durante hidratação não tinha contexto disponível; a medição válida foi feita após hidratação da sessão/device.
- 255 testes / 65 suítes do app; 37 testes / cinco suítes do fluxo de catálogo/garçom; API 26 testes / 1933 assertions; wiring de segurança dois testes / 70 assertions. Todos com saída zero. API mantém depreciações/notices existentes no PHP 8.5.
- Lint dos arquivos tocados passou com contexto JSX/Jest e TextEncoder, sem desativar regras. Não equivale a lint integral do repositório.

## Contratos verificados

Banco distingue apps, tipos de pedido, vínculos e vitrines. Company 3 possui device-configs separados, incluindo 510 com waiter/tab/manage, 378 waiter/table/manage, 508 cashier/none/manage e 425 totem/none/manage. Chaves efetivas: check-order-type e check-order-management-mode. O Manager não recebeu um modo garçom forçado.

Menus são consultados pelo serviço existente por usuário/empresa/app/tipo; a revisão encontrou 35 entradas home e quatro toolbar configuradas, e 35 entradas autorizadas no menu lateral da sessão atual. Configuração não implica autorização universal. Temas têm dez definições na base e 371 tokens na sessão observada. Invoice, order, product_showcase e product_showcase_item mantêm entidades/regras separadas. A revisão não substitui testes com perfis restritos.

As 39 entradas abaixo resolvem em 15 arquivos de rotas compartilhadas. displayList usa o alias canônico DisplayList. A adaptação visual do Manager delega aos módulos existentes; os wrappers específicos preservam parâmetros. Uma rota existente prova integração de navegação, não aprovação funcional de todas as operações.

| Menu | Tipo | Rota resolvida | Parâmetros | Módulo original |
| --- | --- | --- | --- | --- |
| Minhas empresas | home | MyCompaniesPage | `{}` | @controleonline/ui-people/src/react/pages/MyCompaniesPage |
| Financeiro | home | FinancialHubPage | `{}` | @controleonline/ui-financial/src/react/pages/FinancialHubPage |
| ComissionsPage | home | ComissionsPage | `{}` | @controleonline/ui-crm/src/react/pages/comissions |
| Resultados | home | IncomeStatement | `{}` | @controleonline/ui-financial/src/react/pages/reports/IncomeStatement |
| Contas a pagar | home | Payables | `{}` | @controleonline/ui-financial/src/react/pages/Payables |
| Contas a receber | home | Receivables | `{}` | @controleonline/ui-financial/src/react/pages/Receivables |
| Tabelas de entrega | home | DeliveryRatesInboxPage | `{}` | @controleonline/ui-logistic/src/react/pages/delivery-rates/DeliveryRatesInboxPage |
| Transferencias | home | OwnTransfers | `{}` | @controleonline/ui-financial/src/react/pages/OwnTransfers |
| Carteiras | home | WalletsPage | `{}` | @controleonline/ui-financial/src/react/pages/WalletsPage |
| Vitrines de preços | home | ProductShowcasesPage | `{}` | @controleonline/ui-products/src/react/pages/ProductShowcasesPage |
| Categorias financeiras | home | InvoiceCategoriesPage | `{}` | @controleonline/ui-financial/src/react/pages/InvoiceCategoriesPage |
| Pedidos de venda | home | OrderHistoryPage | `{"orderTypeFilter":"sale","historyTitle":"Pedidos de venda"}` | @controleonline/ui-orders/src/react/pages/orders/OrderHistoryPage |
| Fornecedores | home | ProvidersIndex | `{}` | @controleonline/ui-customers/src/react/pages/provider |
| Produtos | home | ProductsPage | `{}` | @controleonline/ui-products/src/react/pages/Products |
| Estoque | home | InventoriesPage | `{}` | @controleonline/ui-products/src/react/pages/Inventories |
| Pedidos de Compra | home | OrderHistoryPage | `{"orderTypeFilter":"purchase","historyTitle":"Compras"}` | @controleonline/ui-orders/src/react/pages/orders/OrderHistoryPage |
| Sugestoes de compra | home | PurchasingSuggestion | `{}` | @controleonline/ui-products/src/react/pages/PurchaseSuggestions |
| Registrar compra | home | PurchaseFormPage | `{}` | @controleonline/ui-products/src/react/pages/PurchaseForm |
| Custos do cardápio | home | MenuCostsPage | `{}` | @controleonline/ui-products/src/react/pages/MenuCostsPage |
| Insumos | home | CategoriesPage | `{"context":"supplies","interactionMode":"manager"}` | @controleonline/ui-products/src/react/pages/Categories |
| Presenca dos motoboys | home | DeliveryPresenceInboxPage | `{}` | @controleonline/ui-logistic/src/react/pages/presence/DeliveryPresenceInboxPage |
| Etiquetas | home | LabelsPage | `{}` | @controleonline/ui-products/src/react/pages/LabelsPage |
| Displays | home | DisplayList | `{}` | @controleonline/ui-ppc/src/react/pages/displays/displayPage |
| Clientes | home | ClientsIndex | `{}` | @controleonline/ui-customers/src/react/pages/clients |
| Colaboradores | home | EmployeesIndex | `{}` | @controleonline/ui-customers/src/react/pages/employees |
| PDV | home | PdvPage | `{}` | @controleonline/ui-orders/src/react/pages/PdvPage |
| Acerto de pedidos | home | LinkedOrderSettlementPage | `{}` | @controleonline/ui-orders/src/react/pages/checkout/LinkedOrderSettlementPage |
| Editor de modelos | home | ModelTemplatesPage | `{}` | @controleonline/ui-crm/src/react/pages/ModelTemplatesPage |
| Etiquetas | home | LabelsPage | `{}` | @controleonline/ui-products/src/react/pages/LabelsPage |
| Configurador | home | ConfiguratorPage | `{}` | @controleonline/ui-config/src/react/pages/ConfiguratorPage |
| Dispositivos | home | DevicesIndex | `{}` | @controleonline/ui-common/src/react/pages/Devices |
| Conexoes | home | ConnectionsPage | `{}` | @controleonline/ui-common/src/react/pages/Connections |
| Integrações | home | IntegrationsPage | `{}` | @controleonline/ui-common/src/react/pages/Integrations |
| Categorias | home | ManagerCategoriesPage | `{}` | @controleonline/ui-products/src/react/pages/ManagerCategoriesPage |
| Traducoes | home | TranslationsReviewPage | `{}` | @controleonline/ui-translate/src/react/pages/TranslationsReviewPage |
| Home | toolbar | HomePage | `{}` | src/pages/OnGestorHome.js, src/routers/index.js |
| Oportunidades | toolbar | CrmIndex | `{}` | @controleonline/ui-crm/src/react/pages/crm/index |
| Clientes | toolbar | ClientsIndex | `{}` | @controleonline/ui-customers/src/react/pages/clients |
| Perfil | toolbar | ProfilePage | `{}` | @controleonline/ui-people/src/react/pages/Profile |

## Limites e próxima homologação

Antes da entrega oficial: executar percursos por menu/perfil/empresa/app; conferir acesso negado com usuário restrito; mudança de empresa e tema; atualização de preço/estoque/permissão; limpeza do catálogo e sessão; mesa/comanda/venda/invoice/produção em ambiente de teste autorizado; consistência de vitrines e catálogo; dispositivo físico/pinpad e medições de tela completa. Financeiro e produção não foram exercitados por ações de escrita nesta rodada. Erro anterior Maximum update depth não está declarado resolvido por esta mudança.

Os quatro atalhos atuais têm rotas distintas. Uma configuração futura com dois atalhos inferiores da mesma rota e parâmetros distintos ainda exige validação do realce no componente compartilhado. Títulos apresentados pelo preview também têm aliases próprios e merecem revisão se a configuração administrativa mudar.

## Reprodução no AVD

1. Menu → PDV: conferir cards coloridos e abrir uma categoria.
2. Voltar por Categorias e abrir a mesma categoria: os dados já lidos devem voltar rapidamente.
3. Fechar e reabrir o app sem limpar dados; abrir PDV e repetir a categoria. O cache deve reaparecer e permitir atualização em segundo plano.
4. Pesquisar outro produto e trocar de categoria: conferir itens corretos, sem resultados da seleção anterior. Não é necessário adicionar/vender para este teste.

AVD API 25 e API/Metro locais ficaram disponíveis. Evidências sanitizadas: .codex/qa-native-manager-api25/pdv-performance-core-20261019/ na raiz do workspace. Alterações locais, sem commit, push ou publicação.
