# Configurador — adaptação local de 16/10/2026

## Particularidades e inventário

Reutiliza a tela existente do ui-config 1.0.24, sem recriar o hub no aplicativo.
Oito atalhos preservados: GeneralSettings, GenericLogPage, ConnectionsPage,
IntegrationsPage, ProductShowcasesPage, CronJobsPage, TranslationsReviewPage,
ThemeManagerPage. Textos e descrições continuam passando pela tradução original.
A tela não consulta nem grava diretamente dados: navega para os destinos. Não
possui filtro próprio de autorização; não foi introduzida uma nova política de
permissões nesta adaptação nem testada a autorização interna de cada destino.

ui-default: DefaultTableCards exige store/colunas e trata coleções de registros;
DefaultColumnMenu serve ações de coluna; campos e filtros não se aplicam a um hub
sem formulário. ui-common: EntityLogCards é específico de logs; modais tratam
conteúdo/confirmacão; BottomNavigationBar é navegação persistente, não uma grade
de atalhos com descrições. Nenhum cartão genérico compatível encontrado nesses
diretórios. Não adicionamos um componente só para justificar uma dependência.
O shell já compartilhado pelo Manager permanece responsável por empresa/conta/menu.

## Mudanças

- Prop opcional presentation em ConfiguratorPage; sem ela, preserva a resolução
  de paleta e layout anteriores. A prévia injeta o tema ativo sem sobrescrita da empresa.
- Reutiliza createStyles do próprio módulo e seus oito ActionCards. Superfície
  neutra no banner, tokens para textos, bordas e ícones; claro/escuro coordenados.
- Cartões em uma coluna até 760px e duas colunas acima; nomes acessíveis nos atalhos.
- Cabeçalho antigo retirado somente da rota ConfiguratorPage na prévia; voltar
  condicional no conteúdo. Cabeçalhos e ações dos módulos de destino preservados.
- Overlay versionado/hashes em patches/manager-configurator.json; reaplicação
  idempotente e recusa de conteúdo desconhecido. Integrado a web:manager-preview.

## Validação

Teste antes reproduziu a prop ignorada/prioridade incorreta do tema. Depois,
mesmo componente confirma os oito destinos, nenhuma navegação automática e tema
explícito. Testes do adaptador cobrem tokens claro/escuro, uma/duas colunas e voltar.
A lista de rotas mantém os cabeçalhos de detalhes fora da adaptação.
162 testes / 42 suítes do Manager aprovados; exportação web aprovada em
/tmp/on-manager-configurator-build. Overlay reaplicado e git diff --check aprovados.

Limites: testes em Node com host nativo substituído, sem homologação visual no
navegador ou teste funcional das oito telas de destino. Nenhum banco, Device Config,
fatura ou regra de negócio alterado. Sem commit, push ou publicação de código.

## Refinamento compacto — 16/10/2026

Pedido autorizado: compactar apenas o Configurador e apresentar textos em português.
Mantidos os oito destinos, ícones, áreas clicáveis e componente original do ui-config.
Banner com padding menor; cartões com altura mínima de 108px (antes 152px), padding
14px e altura livre conforme o conteúdo. Grade: uma coluna até 760px, duas até
1279px e três a partir de 1280px. Última linha não estica os cartões para preencher
espaço vazio. Ícones e títulos menores sem truncar descrições.

Textos de apresentação por rota na prévia, sem alterar traduções no banco nem
textos de outros aplicativos: Configurações gerais, Registros de atividade,
Conexões, Integrações, Vitrines de produtos, Agendamentos, Traduções, Temas.
Descrições resumidas e distintas dos títulos. O componente aceita essas opções
sem mudar seu comportamento quando a apresentação não é fornecida.

Validação: 164 testes / 42 suítes aprovados. Inclui três faixas de largura,
texto português mesmo com tradução recebida em inglês e clique que continua
navegando para a rota original. Conferência visual ainda pendente no navegador.
Overlay reaplicado sem conflito e git diff --check aprovado. Sem banco, commit ou push.

Exportação web do refinamento aprovada em /tmp/on-manager-configurator-compact-build.
