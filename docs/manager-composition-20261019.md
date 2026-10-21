# Composição compacta das listas — 19/10/2026

Escopo autorizado: apresentação das listas no Manager, sem alteração de filtros de empresa, consultas, permissões, criação/edição, totais ou fluxos do PDV.

- Clientes, fornecedores, franquias, colaboradores e empresas: título em linha própria, sem instrução de consulta e sem botão extra de expandir/recolher. A barra compartilhada mantém busca, filtros, modos e opções; a ação de cadastro original é exposta pelo botão compartilhado, com o mesmo callback.
- Estado de leitura nessas listas: mensagens rotineiras removidas; problemas de atualização e modo offline continuam informados.
- Cards de pessoas/empresas: opção de apresentação na tabela remove a moldura externa, pois o módulo já desenha seu card. Os demais consumidores mantêm a aparência anterior.
- Produtos: removido texto explicativo de cabeçalho, preservando controles específicos do catálogo.
- Histórico: corpo do card com padding10/gap5 e preço16, mantendo identificador, status, cliente, canal, tipo, data, valor e ações originais. Controles compartilhados de toque continuam com44 de área mínima; totais/paginação preservados.
- PDV: composição aprovada preservada. Relatório Resultados continua especializado; não foi convertido em tabela.

Verificação: 73 suítes/287 testes Manager passaram; após a ligação final da criação à barra compartilhada,18 testes focados passaram. Componentes compartilhados:23 suítes/138 testes e2 Node passaram. Lint das três composições alteradas passou. `git diff --check` passou. Não houve escrita comercial, commit ou publicação.

A recarga nativa concluiu. Clientes foi conferido no AVD: título sem instruções, cadastro na barra compartilhada e dois cards visíveis. Totais continuam na barra e na paginação. Histórico foi reaberto para conferir sua composição com totais preservados.

Rodapé financeiro: os mesmos três indicadores foram organizados em colunas flexíveis (rótulo acima do valor) para diminuir quebras de linha em telas estreitas. Nenhum cálculo foi modificado. Suíte compartilhada final138+2 passou e o teste de resumo financeiro3/3 passou. Lint dirigido passou com reconhecimento explícito de identificadores JSX (a configuração padrão acusa imports JSX como não usados).

AVD deixado em Clientes. Conferência de histórico:1176 pedidos, receita R$83.135,87 e ticket R$84,66 preservados. Resultado financeiro e ações de pedido não foram executados. O restante dos módulos compartilha o ajuste por componente; não foi realizada nova homologação manual de todos os menus.
