# Superfícies de lista e avatar — 19/10/2026

ManagerTableTheme mantém cardBackground e usa pageBackground como painel das listas. Busca, toolbar, linhas e rodapé preservam seus tokens específicos. People usa cardIconBackground para a superfície do avatar e cardIconColor para iniciais/ícone; fallback para temas antigos reaproveita cardBackground/cardIcon/listItemText. Não há cor do cadastro aplicada às iniciais.

Modo escuro mapeia cardIconBackground para bg-headers-dark e cardIconColor para text-headers-dark, com valores do tema existente. Sem alteração de banco/cadastros/consultas.

9 testes em3 suítes de contrato de tema passaram. Overlay de People atualizado e aplicação idempotente conferida; diff check aprovado. Claro conferido no AVD. Evidências em .codex/qa-native-manager-api25/list-avatar-theme-20261019.

Claro e escuro confirmados por captura no AVD: fundo da lista distinto do card, avatar suave e iniciais legíveis. AVD deixado em Clientes no escuro; contagem648 preservada. Nenhuma nova cor literal adicionada.
