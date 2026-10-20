# Ciclos de leitura — validação local de 16/10/2026

Escopo: Clientes, Colaboradores, Minhas empresas e categorias do PDV. Sem commit,
push, publicação, cadastro, criação de pedido, pagamento ou alteração no banco.

## Resultados

Tempos de uma execução real da API + ações das stores + hook de paginação do
DefaultTable. Primitivas visuais são substituídas no teste: não são tempos até a
pintura completa no navegador nem um benchmark estatístico.

| Leitura | Primeira abertura | Retorno sem HTTP | Restauração sem rede | Página / total |
|---|---:|---:|---:|---:|
| Clientes | 1627 ms | 6 ms | 7 ms | 20 / 648 |
| Colaboradores | 664 ms | 3 ms | 6 ms | 7 / 7 |
| Minhas empresas | 1396 ms | 4 ms | 7 ms | 3 / 3 |
| Categorias do PDV | 889 ms | 4 ms | 7 ms | 17 / 17 |

Atualização forçada de Clientes: 1.035 ms, mantendo os 20 registros visíveis.
O carregador real de categorias do checkout também apresentou 17 categorias;
seu carrinho foi neutralizado no teste para impedir qualquer escrita de negócio.
Restauração sem rede: novo coordenador e snapshots das respostas reais em um
adaptador persistente de teste; falhas de GET simuladas. IndexedDB é o adaptador
usado pela prévia web e tem cobertura própria de chaves, limites e limpeza.

## Contrato implementado

- Ações de domínio continuam escolhendo filtros, paginação e autorização.
- Páginas exatas por contexto/consulta; não misturar Clientes com Minhas empresas.
- Memória e IndexedDB: frescor 30 s; dados anteriores aparecem imediatamente e
  atualizam em segundo plano. Validade máxima 24 h, 40 páginas e aproximadamente 2 MB.
- Contexto inclui usuário, empresa, sessão, permissões, aplicação e device. As
  chaves persistidas são SHA-256; credenciais não são gravadas no cache.
- Escrita, logout e mudança de contexto invalidam as páginas; resposta antiga
  não aquece contexto novo. Primeiro bootstrap não apaga a página restaurável.
- Erros 401/403 removem os dados locais, sem mascarar autorização como offline.
- Falha de armazenamento não impede leitura online; falha de rede com snapshot
  mostra os dados e aviso. Sem snapshot, o erro continua explícito.
- Atualização manual ignora o cache fresco; retorno à tela preserva a página.
- Colaboradores usa listFields opcional, com whitelist na API. Mantém os mesmos
  sete vínculos e campos da tabela, evitando contatos/mídias aninhados. Sem
  listFields, o contrato completo original continua igual.
- Inicialização local: API com quatro workers; prévia Metro com dois workers.
  Compilação fria não deve ser confundida com navegação já carregada.

## Verificação

APP: 137 testes / 32 suítes. API: 26 testes / 1.931 asserções; 17 depreciações
existentes e 2 avisos PHPUnit. Integração autenticada passou. Compilação web passou.
Os overlays NPM e Composer são locais, com guardas de versão e conteúdo.

Executar a integração com Node 20, usando CO_SMOKE_USER e CO_SMOKE_PASSWORD apenas
no ambiente do processo: npm run test:manager:reads. Nunca gravar esses valores
em relatório, arquivo de configuração versionado ou saída de console.

## Fronteira desta entrega

Offline de leitura de páginas já visitadas; não é PWA offline completo nem fila
de vendas/pagamentos. Pintura completa, tablet/maquininha e operação transacional
do PDV não são homologadas por esta integração. Voz, widgets, pedidos recentes,
panorama operacional e evolução do avatar continuam no roadmap.

Somente este texto e o roadmap permanecem como relatório; não há capturas com
dados pessoais anexadas nem corpos de respostas armazenados como evidência.
