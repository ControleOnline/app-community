# Visoes e Modos de Operacao do App Community

## Objetivo
- Este arquivo centraliza a leitura funcional do `APP_TYPE`, dos tipos operacionais de device e dos modos internos do `POS`.
- O app muda de visao conforme o modo, mas continua sendo o mesmo sistema, compartilhando modulos, stores e regras de negocio.
- Antes de criar tela, store, rota, filtro, permissao ou regra nova, primeiro identifique em qual modo ela pertence.
- Quando uma regra for compartilhada, ela deve continuar vivendo em um unico modulo dono, sem duplicacao por tela.

## Leitura rapida
- `APP_TYPE` com `HomePage` ativa hoje no roteador principal: `MANAGER`, `CRM`, `POS`, `PPC`, `SHOP`, `DELIVERY` e `SERVICE`.
- `SERVICE` e um `APP_TYPE` separado, com package `com.controleonline.service`; sua home fica em `ui-support`, e e operacional, com menus vindos do backend e primeiro atalho para `LabelsPage`.
- `DELIVERY` nao e modo operacional de PDV, nao e tipo operacional de device e nao deve entrar em `pos-operation-mode`.
- `DELIVERY` usa `ui-logistic` como home e a tela inicial e um menu operacional com gate de onboarding do motoboy. Dali o usuario acessa a lista de pedidos de entrega, o relatorio de recebiveis, a listagem de empresas homologadas e as tabelas de entrega imutaveis.
- O runtime de device tambem reconhece aliases operacionais como `PDV`, `DISPLAY`, `KDS`, `TOTEM`, `PRINT` e `PRINTER`.
- `POS` e a visao operacional de venda.
- `PPC` e a visao operacional de producao e exibicao.
- `MANAGER` e a visao administrativa.
- `CRM` e a visao comercial.
- `SHOP` e a visao cliente-facing.

## Modos principais por APP_TYPE

### MANAGER
- Publico: dono, gerente, administrador e backoffice.
- Missao: governanca da operacao e da empresa.
- Modulos mais envolvidos: `ui-manager`, `ui-financial`, `ui-common`, `ui-ppc` para cadastro/configuracao de displays, `ui-products` e modulos de apoio.
- Responsabilidades:
- Configurador geral.
- Devices, impressoras, cameras, displays e vinculos entre equipamentos.
- Integracoes e conexoes.
- Historico de pedidos e visao ampla da operacao.
- Financeiro, carteiras, categorias de invoice e transferencia.
- Cadastros administrativos e modelos estruturais.
- Limites:
- Nao deve virar uma copia do `POS`.
- Mesmo quando abrir a tela de PDV, em `APP_TYPE=MANAGER` o checkout nao deve cobrar localmente no proprio device; o fluxo deve usar device remoto configurado ou pagamento na entrega.
- Nao deve concentrar responsabilidades de atendimento comercial do `CRM` nem fluxo cliente-facing do `SHOP`.

### SERVICE
- Publico: `employee` e `owner` da operacao.
- Missao: app operacional separado com foco em etiquetas, insumos e apoio ao atendimento.
- Regras: nao assumir comportamento do `MANAGER` e nao incluir checklist no escopo atual.
- Implementacao React: `ui-support`.

### CRM
- Publico: vendedor, consultor comercial, pre-venda e pos-venda comercial.
- Missao: relacionamento, pipeline e conversao comercial.
- Modulos mais envolvidos: `ui-crm`, `ui-contracts`, `ui-customers`, `ui-common`.
- Responsabilidades:
- Oportunidades.
- Propostas.
- Conversas comerciais.
- Contratos e contexto comercial vinculado.
- Comissoes.
- Configuracoes comerciais e parte do configurador que afeta a venda.
- Configuracao do fluxo de pagamento remoto dos pedidos, como device padrao, lista permitida de devices e permissao de troca durante o checkout.
- Limites:
- Nao deve receber cadastros administrativos que pertencem ao `MANAGER`, como gestao estrutural de devices, categorias administrativas ou modelos administrativos gerais.
- Nao deve assumir a operacao de caixa do `POS`.

### POS
- Publico: operador de caixa, balconista, atendente, garcom, operador de retirada e futuros fluxos de autoatendimento.
- Missao: abrir pedido, identificar comanda, incluir itens, cobrar, imprimir, acompanhar preparo e operar caixa.
- Modulos mais envolvidos: `ui-orders` como modulo dono, `ui-common` para configuracoes compartilhadas, `ui-customers` e `ui-people` para identificacao, `ui-ppc` para fila/status operacional e modulos financeiros compartilhados quando houver cobranca.
- Base atual do codigo:
- O contexto tecnico do POS usa `interactionMode = pdv`.
- O rascunho canonico do pedido de venda usa `orderType = cart` com `app = POS`.
- O checkout operacional e unico e nao deve ser duplicado em telas paralelas.
- Itens com fila precisam mostrar status e cor da etapa atual na propria linha.
- Quando um item chega ao fim da fila, a customizacao e a edicao daquele item ficam bloqueadas.
- O POS hoje ja considera configuracoes de device como `pos-type`, `check-type`, `product-input-type`, `selection-type`, `pos-gateway` e `pos-order-visibility`.
- `pos-type = simple` encurta a jornada: ao quitar o saldo do pedido, o operador volta para a listagem/historico. `pos-type = full` mantem a navegacao no detalhe do pedido.
- `check-type` hoje separa abertura/identificacao de comanda por `manual`, `barcode` ou `rfid`.
- `product-input-type` separa leitura de produto por `manual`, `barcode` ou `rfid`.
- `selection-type` controla selecao unica ou multipla.

### PPC
- Publico: cozinha, producao, expedicao, operador de display e operacao de preparo.
- Missao: transformar pedido vendido em leitura operacional de preparo e entrega.
- Modulos mais envolvidos: `ui-ppc` como modulo dono, `ui-orders` para leitura compartilhada dos itens, `ui-common` para runtime de device e impressao.
- Responsabilidades:
- Displays.
- Filas e blocos de fila.
- Ordem de preparo.
- Leitura operacional por pedido e por produto.
- Expansao de quantidade agrupada em linhas unitarias quando a operacao precisar.
- Limites:
- So deve mostrar pedidos operacionais de venda (`orderType = sale`).
- Nao deve inventar sua propria leitura de itens; a leitura interna precisa ser a mesma do `POS` e do `OrderDetails`.

### SHOP
- Publico: cliente final.
- Missao: vitrine, busca, carrinho e checkout online ou na entrega.
- Modulos mais envolvidos: `ui-shop`, `ui-common`, configuracoes comerciais/publicas vindas de `CRM` e `MANAGER`.
- Responsabilidades:
- Home do shop.
- Localizador de franquias.
- Fidelidade.
- Busca, categoria, produto, carrinho, checkout e pedidos do cliente.
- Limites:
- Nao confirma pagamento em dinheiro no proprio fluxo como um funcionario faria no `POS`.
- Nao recebe responsabilidades administrativas nem operacionais internas.

### DELIVERY
- Publico: operacao de entrega/retirada quando a empresa quiser abrir um app focado nisso.
- Nivel: `APP_TYPE`, equivalente a `MANAGER`, `CRM`, `POS`, `PPC` e `SHOP`.
- Estado atual:
- Usa `ui-logistic` como home dedicada, com menu operacional.
- A entrada do app fica travada ate existir pelo menos uma versao de tabela com `vehicleType` preenchido (`moto` ou `bike`).
- A home deve exibir menus para:
- pedidos de entrega;
- recebiveis do motoboy logado, considerando invoices em que ele e o `receiver`;
- empresas homologadas do motoboy logado, derivadas de `people_link` com `link_type=courier`;
- tabelas de entrega do motoboy, que abrem a lista imutavel de versoes.
- O fluxo de tabelas de entrega e composto por:
- `DeliveryVehicleSetupPage` para o primeiro cadastro bloqueante;
- `DeliveryRateTablesPage` para a lista de versoes do courier;
- `DeliveryRateTableFormPage` para criar nova versao a partir de um snapshot;
- `DeliveryRateTableCompaniesPage` para associar empresas a uma versao;
- `DeliveryRatesInboxPage` para o manager revisar as versoes visiveis;
- `DeliveryRateVersionPage` para a leitura detalhada da versao;
- `DeliveryRateHistoryPage` para consultar o historico imutavel da tabela;
- `DeliveryRateCompanyPage` para ativar ou desativar a tabela por empresa associada.
- A camada de presenca do motoboy usa outro conjunto de telas:
- `DeliveryCourierSchedulesPage` para horarios reutilizaveis;
- `DeliveryCourierScheduleFormPage` para criar ou editar uma janela semanal;
- `DeliveryCourierPresencePage` para ligar, desligar e associar horarios por empresa;
- `DeliveryPresenceInboxPage` para o manager ler a presenca por empresa;
- `DeliveryPresenceDetailPage` para o detalhe somente leitura no manager;
- o historico de conexao e desconexao sempre aparece na tela de detalhe via `EntityLogPage`.
- O modo manual exige motivo para conectar ou desconectar e cada evento gera log na tabela `log`.
- As migrations desse slice precisam rodar no tenant `admin.controleonline.com` via `tenant:migrations:migrate`, nao no banco base direto.
- O courier continua dono da criacao/associacao e o manager apenas alterna o estado `enabled` da empresa vinculada.
- A tela de pedidos continua saindo da colecao padrao `/orders`, filtrando `orderType=delivery` e `provider` do motoboy logado.
- Leitura correta:
- Nao deve ser tratado como modo operacional do `POS`.
- Nao deve ser usado como tipo de device.
- `provider_id`/`provider` identifica o motoboy da lista; `delivery_people_id` segue sendo a pessoa que recebe a entrega.
- Fluxos de entrega, retirada, codigos de handover e acompanhamento podem reaproveitar `ui-orders`, mas o recorte `DELIVERY` continua sendo uma visao de app.
- Quando o assunto for canal de venda, pagamento na entrega ou logistica, usar nomes especificos para evitar confusao com `APP_TYPE=DELIVERY`.

## Tipos operacionais de device
- Estes tipos nao substituem o `APP_TYPE`; eles complementam a identidade operacional do runtime e dos devices.
- `PDV`: device de venda e cobranca.
- `DISPLAY`: device de exibicao operacional.
- `KDS`: device de cozinha/preparo.
- `TOTEM`: device de autoatendimento/kiosk. No runtime atual ele ja e reconhecido como tipo operacional.
- `PRINT` e `PRINTER`: devices de impressao.
- Nem todo tipo operacional precisa ter uma home exclusiva hoje, mas todos devem respeitar a divisao de responsabilidades acima.

## POS por tipo de atividade
- Esta secao organiza o planejamento do POS para os proximos passos.
- O pedido inicial desta fase citou `BALCAO`, `GARCON`, `TOTEN`, `BALCAO` e `PDV`.
- Aqui o termo foi normalizado para `TOTEM`, que e o nome usado no codigo.
- `BALCAO` apareceu repetido no pedido; por enquanto ele foi consolidado em um unico tipo de atividade. Se depois precisarmos separar `balcao-venda` de `balcao-retirada`, isso vira dois subtipos formais.
- Os tipos abaixo sao a classificacao funcional alvo do POS. Parte deles ja tem base no codigo atual e parte deles entra aqui como regra de negocio para orientar a implementacao seguinte.

### BALCAO
- Visao:
- Atendimento rapido de frente de loja.
- Venda presencial com baixa friccao.
- Pode atender retirada rapida, pedido local simples e venda imediata.
- Modulos base:
- `ui-orders` para carrinho, pedido, checkout e caixa.
- `ui-common` para configuracao do device e meios de entrada.
- `ui-ppc` quando o item exigir fila de preparo.
- Regras de negocio iniciais:
- O operador pode abrir, continuar e concluir um pedido sem depender de mesa.
- A identificacao do cliente e opcional no inicio, mas deve ser possivel antes da cobranca ou da entrega quando a operacao exigir.
- A comanda pode ser manual, por codigo de barras ou RFID, conforme `check-type`.
- A venda deve priorizar velocidade de inclusao de itens, cobranca e impressao.
- Se o item entrar em fila de preparo, o POS precisa mostrar o status operacional na propria linha do item.
- Quando houver codigo de retirada ou handover, esse codigo deve ser mais visivel que ids tecnicos.
- O fluxo precisa aceitar pagamento local, remoto ou na entrega de acordo com as configuracoes permitidas para a empresa e para o device.

### GARCON
- Visao:
- Atendimento em mesa ou comanda aberta ao longo do consumo.
- O device do garcom e um ponto de lancamento, consulta e acompanhamento, nao apenas de cobranca.
- Modulos base:
- Nucleo do `ui-orders`.
- Identificacao de comanda/mesa via `check-type`.
- Integracao com `ui-ppc` para acompanhamento do preparo por item.
- Regras de negocio iniciais:
- O pedido precisa guardar contexto de atendimento, como comanda, mesa, nome curto do cliente ou outra referencia operacional equivalente.
- A jornada principal e adicionar itens ao longo do atendimento, sem exigir fechamento imediato.
- Itens devem poder ser enviados e acompanhados na producao por lancamento, nao apenas no encerramento do pedido.
- Enquanto o item nao chegar ao status final da fila, ele ainda pode ser ajustado dentro das regras de customizacao.
- O fechamento pode acontecer no proprio device do garcom ou ser delegado para um device do tipo `PDV`.
- A home desse tipo deve priorizar comandas abertas, mesa/comanda atual e reabertura rapida do atendimento.

### TOTEM
- Visao:
- Autoatendimento cliente-facing usando o nucleo transacional do POS.
- O usuario principal nao e um funcionario; portanto a experiencia precisa ser guiada, curta e sem opcoes administrativas.
- A primeira especializacao a ser desenvolvida e o `TOTEM` para mercado autonomo.
- Funcionalmente, o `TOTEM` pertence ao contexto operacional do `POS`; ele nao e uma area administrativa nem uma home livre do sistema.
- Modulos base:
- Nucleo de pedido do `ui-orders`.
- Catalogo e filtros de categoria compartilhados.
- Regras de canal do catalogo, ja que o sistema ja possui categorias por canal como `Balcao`, `Totem` e `Delivery`.
- Nesse ponto, `Delivery` e canal de catalogo/pedido; nao e modo operacional do PDV nem substitui `APP_TYPE=DELIVERY`.
- Configuracoes de modo, device e comportamento expostas no `MANAGER`.
- Regras de negocio iniciais:
- O fluxo deve expor apenas o necessario para o cliente montar e revisar o pedido.
- O totem nao deve mostrar configuracoes administrativas, caixa, sangria, abertura/fechamento de caixa, historico amplo nem detalhes tecnicos de device.
- O catalogo do totem deve respeitar o recorte de canal proprio do autoatendimento.
- O pedido precisa sair do totem pronto para pagamento e encaminhamento a producao, sem depender de navegacao administrativa.
- Desconto manual, override de preco e qualquer decisao de excecao devem continuar fora do totem.
- Quando houver retirada, o comprovante e o codigo de chamada precisam ser claros para o cliente e para a expedicao.
- Por padrao, o totem deve ser pensado como jornada sem dinheiro local e sem conciliacao manual no proprio equipamento; qualquer excecao futura precisa ser tratada como regra explicita.
- O totem de mercado autonomo deve ficar travado na tela de compra. Qualquer rota, menu, atalho, drawer, deep link ou navegacao que leve a outra tela do PDV ou do sistema precisa ser bloqueado nesse modo.
- O cliente deve conseguir adicionar produtos por leitura de codigo de barras, digitacao de busca e navegacao por categorias.
- A leitura de codigo de barras e requisito critico: o scanner deve adicionar produto mesmo quando nenhum campo de busca estiver em foco. A captura deve acontecer no nivel da tela/aplicacao do totem, sem depender de foco em input especifico.
- A captura global do scanner deve valer somente na tela de compra do totem. Ela nao deve vazar para telas administrativas, telas de configuracao ou outros modos do POS.
- Quando o codigo lido identificar um SKU valido, o item deve ser adicionado ao carrinho imediatamente, respeitando regras de estoque, preco, canal e disponibilidade.
- Quando o produto for pack, multipack, fardo, caixa ou embalagem equivalente, o fluxo precisa preservar a quantidade/unidade do pack para que carrinho, backend, estoque e totalizacao leiam a venda corretamente.
- O backend deve receber informacao suficiente para resolver o produto pelo SKU lido e para entender a quantidade vendida quando o SKU representar pack. O contrato do item nao deve depender apenas de nome do produto ou ids visuais da interface.
- Produtos sem codigo lido ainda precisam poder ser encontrados manualmente por busca textual ou por categoria, porque nem toda operacao de mercado autonomo depende exclusivamente do scanner.
- O modo nao possui abertura de caixa, fechamento de caixa, sangria, suprimento ou conferencia manual local. Se houver conciliacao financeira, ela pertence ao fluxo administrativo/financeiro fora do equipamento do cliente.
- Em Android dedicado, o totem pode acionar a camada nativa de kiosk para `Lock Task Mode`, tela acordada, modo imersivo, candidatura a launcher/Home e retomada no boot.
- No `MANAGER`, deve existir configuracao para escolher o modo operacional do device/PDV. O primeiro modo especializado dessa familia sera o `TOTEM` de mercado autonomo.
- A configuracao do `MANAGER` deve deixar claro quais devices estao em modo totem e quais continuam como `BALCAO`, `GARCON`, `PDV` ou outros modos operacionais futuros.

### PDV
- Visao:
- Caixa puro ou frente de cobranca da operacao.
- Pode receber pedidos originados no balcao, no garcom, no totem ou em outro ponto operacional.
- Modulos base:
- `ui-orders` para checkout, detalhe do pedido, caixa, sangria, fechamento e impressao.
- Configuracoes de gateway no `ui-common` e nos cadastros de device do `MANAGER`.
- Regras de negocio iniciais:
- O foco principal e cobrar, reabrir pedido quando permitido, registrar recebimento, operar caixa e imprimir.
- Deve ser o ponto natural de encerramento financeiro de comandas abertas por outros tipos de atividade.
- O device precisa respeitar o gateway local configurado e as regras da barra unica de pagamento.
- Em web/manager, o mesmo fluxo nao pode burlar a restricao de cobranca local do `MANAGER`.
- Quando o pedido vier de outra atividade, o PDV nao deve perder o contexto operacional original; ele apenas assume a etapa de caixa e conclusao.

## Regras transversais do POS
- Todo tipo de atividade do POS deve continuar usando o mesmo fluxo unificado de pedido e checkout.
- Nao criar um checkout diferente para cada atividade.
- Nao criar um renderer de itens diferente para cada tela operacional.
- O pedido aberto do POS deve continuar identificado por empresa e device quando a regra for local ao equipamento.
- O `PPC` e consumidor da venda operacional; portanto qualquer atividade do POS que gere preparo precisa alimentar a mesma leitura de fila.
- O `MANAGER` configura devices, gateways, impressoras, displays e politicas; o `POS` executa a operacao.
- O `CRM` pode configurar aspectos comerciais da venda, mas nao deve virar o dono da operacao de caixa.
- O `SHOP` e separado do POS no papel do usuario, mas compartilha regras centrais de pedido, pagamento e empresa quando isso fizer sentido.

## Direcao para proximas implementacoes
- Quando um prompt falar em "modo" ou "visao", primeiro decidir se ele e `APP_TYPE`, tipo operacional de device ou tipo de atividade dentro do `POS`.
- Quando um prompt falar em `PDV`, validar se ele quer dizer:
- a visao `POS`,
- o tipo operacional de device `PDV`,
- ou a atividade de caixa dentro do POS.
- Quando um prompt falar em `DELIVERY`, validar se ele quer dizer:
- o `APP_TYPE=DELIVERY`,
- o canal de venda/entrega de um pedido,
- pagamento na entrega,
- ou regras logisticas de entrega.
- `DELIVERY` nao deve ser adicionado como opcao de modo operacional do PDV.
- Toda nova regra de `BALCAO`, `GARCON`, `TOTEM` ou `PDV` deve ser atualizada neste arquivo e, quando pertinente, no `AGENTS.md` do modulo dono.

## Referencias atuais no codigo
- `src/routers/index.js`
- `modules/controleonline/ui-common/src/react/utils/deviceRuntime.js`
- `modules/controleonline/ui-common/src/react/config/deviceConfigBootstrap.js`
- `modules/controleonline/ui-orders/AGENTS.md`
- `modules/controleonline/ui-ppc/AGENTS.md`
- `modules/controleonline/ui-manager/AGENTS.md`
- `modules/controleonline/ui-crm/AGENTS.md`
