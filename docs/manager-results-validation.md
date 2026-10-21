# Resultados — adaptação local de 16/10/2026

## Particularidades

A tela IncomeStatement do ui-financial 1.1.41 não utilizava ui-default.
A consulta existente é getIncomeStatements da store invoice, por empresa e ano.
O relatório contém 12 meses, receitas, despesas e saldo (receita menos despesa).
Receitas e despesas abrem categorias principais e subcategorias com valores.
O ano é filtrado explicitamente; limpar restaura o ano atual. Ausência de empresa,
erro e carregamento têm estados próprios. Nada disso foi substituído.

## Alteração limitada à prévia MANAGER

- ManagerResultsPage mantém a tela e a store existentes, passando apresentação opcional.
- O ano reutiliza DefaultInput do ui-default em modo formulário, sem autosave.
  As opções maxLength e onSubmitEditing foram adicionadas sem mudar os padrões
  dos demais consumidores. Digitar não grava dados nem filtra; confirmar consulta.
- Cartões mensais, filtros e modal permanecem específicos do relatório. Seus
  estilos recebem os tokens do modo ativo; não foi criada uma segunda tabela ou
  um novo componente genérico para imitar componentes existentes.
- Título e mensagens passam a Resultados somente no adaptador. Cabeçalho antigo
  oculto somente nessa rota da prévia; voltar condicional disponível no conteúdo.
- Alvos de detalhe receberam nomes acessíveis por mês e tipo; ações com 44px.
- Não alteramos API, fórmulas, estrutura de retorno, seleção de empresa, regras
  financeiras ou dados de faturas. Configurador permanece para uma próxima etapa.

Overlays locais: patches/manager-results.json, com versões exatas e hashes
antes/depois; scripts/apply-manager-results-patch.cjs valida todos os arquivos
antes da escrita e recusa versões/conteúdos desconhecidos. Integrado ao comando
web:manager-preview. Sem as props opcionais, a apresentação anterior é preservada.

## Verificação

- Antes da adaptação: três cenários falharam (apresentação, filtro padrão e vazio).
- Após: meses, saldo negativo, detalhes e fechamento de modal, consulta por ano,
  limpar, empresa ausente e caminho legado aprovados com resposta sintética.
- DefaultInput real testado com host nativo substituído: edição de rascunho,
  limite e confirmação, sem autosave ou gravação.
- Todos os campos de cor dos estilos do relatório pertencem ao tema configurado
  nos dois modos. Teste cobre títulos, superfícies, campos, modal e cores de saldo.
- Total da suíte Manager: 154 testes / 39 suítes aprovados.
- Exportação web aprovada em /tmp/on-manager-results-build.
- Reaplicação do overlay e git diff --check aprovados.

Limites: testes de componente em Node com host nativo substituído, não homologação
visual desktop/mobile no navegador, nem validação contábil dos valores reais da
empresa. A lógica de consulta e cálculo original foi preservada. Nenhuma alteração
no banco, commit, push ou publicação de código.

## Checagem dos dois pacotes — continuação em 16/10

Inventário conferido:
- ui-default: DefaultInput é adequado ao ano e permanece em uso. DefaultTableCards
  depende de store/colunas e é voltado a coleções de registros; não substitui os
  12 agregados mensais sem alterar desnecessariamente o contrato do relatório.
  DefaultModalButton controla abertura por render props, mas não hospeda o modal.
- ui-common: AnimatedModal aceita conteúdo arbitrário e foi reutilizado para os
  detalhes de categorias. ConfirmModal exige confirmação/cancelamento e mensagem;
  EntityLogCards é específico de logs, e os demais modais encontrados atendem
  importação, impressoras e cópia de configurações. Não são cartões financeiros.

Implementação: somente a prévia de Resultados injeta AnimatedModal no relatório.
Duas props opcionais no modal compartilhado permitem cor do overlay configurada
pelo tema e alinhamento central. Outros consumidores preservam o overlay e o
alinhamento anteriores. O fundo do conteúdo interno fica transparente para evitar
sobreposição de dois overlays. Cartões, valores e árvore de categorias preservados.

Validação atual: 157 testes / 40 suítes aprovados e exportação web aprovada.
Testes do AnimatedModal real com host nativo substituído verificam tema,
alinhamento, fechamento e comportamento legado. Integração do adaptador com o
modal compartilhado também testada. Revisão visual no navegador ainda pendente.
Nenhuma consulta ou regra financeira alterada; sem banco, commit ou push.
