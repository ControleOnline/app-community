# Base visual compartilhada dos cards — 19/10/2026

Clientes (People) e histórico (OrderHistoryCard) agora compõem o conteúdo com DefaultEntityCard. Sua variante embedded aplica padding12 e conteúdo flexível, sem adicionar segunda borda/fundo. DefaultTableCards mantém a única superfície externa: fundo temático, borda e raio12. Clientes deixa de aplicar sua sombra própria e padding/margens distintos. Demais consumidores do DefaultEntityCard preservam o comportamento anterior por padrão.

Campos e callbacks permanecem nos módulos: pessoas preserva avatar, nome, PF/PJ, contato e handleEdit; pedidos preserva identificação, status, cliente, canal/tipo, data, valor e openRow/onOpenOrder. As ações financeiras continuam no renderer original de ações da tabela. Não houve alteração de API, filtros, totais ou regras de negócio.

AVD: Clientes648 registros, cards sem sombra e terceira linha parcialmente visível; histórico1176 registros e ações originais conferidos. Aparelho deixado em Clientes. Evidência em .codex/qa-native-manager-api25/shared-card-base-20261019/.

Manager73suítes/287testes e compartilhados23suítes/138testes+2Node passaram antes da nova asserção de variante embedded. Teste adicional focado:2suítes/20testes passaram (card-base-focused.log). Checksums conferidos e git diff --check aprovado. Overlays persistidos, sem publicação.
