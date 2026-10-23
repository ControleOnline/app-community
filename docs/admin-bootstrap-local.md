# ADMIN: investigação e correção local da abertura

Escopo: apresentação do bootstrap web de ADMIN, sem alterar autenticação, permissões,
seleção de empresa, menus autorizados ou identidade visual. Não publicado.

## Retorno do teste local: atualização durante a execução

As capturas posteriores mostram a home ADMIN carregada e, em outra captura, o erro
React `Rendered more hooks than during the previous render`, no DefaultProvider,
com a sequência anterior terminando antes de useWebThemePalette. A introdução do
novo efeito de bootstrap alterou a quantidade de hooks do provider em execução.
O código atual chama esses hooks incondicionalmente. Isso identifica uma quebra
na atualização durante desenvolvimento; não comprova, sozinho, a causa de toda
demora anterior do carregamento.

O bundle servido pelo Expo foi inspecionado: esse módulo de node_modules não recebe
a transformação de assinaturas do React Refresh. A diretiva `@refresh reset`, sozinha,
não é suficiente nesse caminho. O provider agora registra sua assinatura diretamente
no runtime de React Refresh, com forceReset=true, somente em desenvolvimento.
O teste usa esse runtime real: sem assinatura, a família preserva estado; com o
registro, a família é marcada para remontagem. Isso evita reutilizar a sequência
antiga em atualizações desse arquivo. Não muda stores, autenticação ou permissões.
O diagnóstico temporário de Console foi removido. O fluxo normal de atualização
das stores continua coberto pelo teste de navegação sem remontagem.

Validação desta revisão: 67 testes em 11 suítes aprovados. Overlay reaplicável e
auditoria de hashes aprovados; git diff --check aprovado. O bundle efetivamente
servido em localhost contém o registro de assinatura, sem o diagnóstico temporário.
A aba de teste abriu o login ADMIN após recarga, sem novos erros de hooks; os erros
anteriores permanecem no histórico do Console. A sessão autenticada do Brave do
usuário não está disponível ao navegador de teste. A captura recebida comprova a
home aberta antes desta última revisão, não a validação autenticada desta revisão.

## Causa verificada no código

- A home já monta antes de CheckLogin concluir restoreSession. O getter sessionChecked
  começa false. A grade recebe menus vazios e interpreta esse estado como ausência de menus.
- useWebMenus busca menus-people somente depois de isLogged e currentCompany.id.
  Antes desta correção, não comunicava conclusão ou falha ao bootstrap.
- useWebBootstrapReady libera a abertura quando não há sessão ou empresa; o App
  registrava apenas true e não voltava ao estado pendente.
- Enquanto as traduções ainda não correspondem ao contexto atual, DefaultProvider.web
  aplica visibility:hidden e opacity:0 à interface inteira. Sem cobertura de carregamento
  coordenada, isso deixa o fundo do navegador exposto.

Fontes: ui-login/CheckLogin e store auth; ui-common/DefaultProvider.web.configuration,
DefaultProvider.web e DefaultProvider.styles; ui-layout/App; ui-layout/AppMenuGrid.
As capturas fornecidas pelo usuário mostram o sintoma. A sequência de estados foi
reproduzida de forma controlada nos testes; não foi medida uma sessão autenticada real.

## Correção

- O ADMIN mantém uma cobertura de carregamento até a sessão ser verificada, haver
  empresa, as traduções estarem prontas e a consulta de menus do contexto atual terminar.
- Os componentes de navegação permanecem montados; não há novo reset de rota.
- Resposta vazia concluída libera a grade normalmente. Pendência não vira mensagem vazia.
- Falha de menus ou empresa mostra erro e opção de recarregar. Respostas de uma empresa
  anterior continuam descartadas pelo cancelamento existente.
- Rotas públicas são liberadas para login. O ajuste de bootstrap é exclusivo de ADMIN web.

Overlay local reproduzível para ui-common 1.2.102 e ui-layout 1.0.20:
patches/admin-bootstrap.json e scripts/apply-admin-bootstrap-patch.cjs. O Metro verifica
versões e hashes antes de aplicar. O comando manager:prepare aceita o overlay verificado.
Nenhuma alteração depende somente de uma edição manual em node_modules.

## Evidência

- adminBootstrap.test.js: requisição real do hook sob controle de promises; pendência,
  resposta vazia, falha e descarte de resposta obsoleta.
- bootstrapNavigation.test.js: provider real compilado, com dependências externas
  controladas; liberação apenas após sessão/empresa/menus/traduções; uma montagem
  de navegação, sem desmontagem intermediária.
- adminBootstrapShell.test.js: App real compilado com dependências controladas; cobertura
  de carregamento, liberação e erro, preservando a navegação montada.
- adminBootstrapState.test.js: pré-requisitos e separação entre rotas públicas e privadas.
- Rodada focada: 66 testes aprovados em 11 suítes. Não representa a suíte global.
- Teste adicional de controles de tabela: 3 testes aprovados; total de 69 testes em 12 suítes.
- manager:prepare executado com sucesso; audit overlays: zero arquivos adicionais aplicados.
- Compilação web final do Expo: aprovada; artefato local em /tmp/controleonline-admin-bootstrap-export.
- Lint do estado de bootstrap e scripts de aplicação: aprovado. git diff --check: aprovado.

Limite: o navegador de validação está sem sessão. A abertura completa com dados e
sessão reais do ADMIN permanece sem comprovação autenticada nesta passagem.

## Stores e autorização: leitura adicional

- O cliente usa a sessão existente no header API-TOKEN. A consulta de menus recebe
  myCompany, appType e menuType; não aceita uma identidade de usuário escolhida pela tela.
- GetMenuByPeopleAction obtém o usuário do token e encaminha sua pessoa e ROLE_SUPER
  a MenuConfigService. MenuRepository filtra menus habilitados e tipo de app; para
  usuários não-super, também exige vínculo humano habilitado com a empresa e pessoa.
- theme.menus permanece como coleção usada pela grade. O novo estado guarda somente
  conclusão/erro da consulta e sua identidade de contexto, sem copiar menus ou regras.
- normalizeRuntimeMenuResponse já possui fallback local para ADMIN/MANAGER. Essa
  política preexistente foi preservada, não criada pelo ajuste. Não se usa quantidade
  de menus como critério de autenticação, autorização ou conclusão da consulta.
- O endpoint pode retornar HTTP 200 com response.success=false. Há teste que reproduz
  esse envelope e comprova que o carregamento fica em erro, em vez de liberar a home.
- DefaultTable lê configs, columns, filters e ações da store do módulo. Esses contratos
  não foram modificados; o ajuste não desabilita nem habilita ferramentas de tabelas.
- Não houve modificação de backend, configuração de menus, vínculos ou permissões.

Uma repetição concorrente à compilação excedeu o timeout de um teste. A reexecução
isolada passou. As leituras e a compilação das fixtures foram movidas para fora da
janela cronometrada dos testes assíncronos; a rodada final de 66 testes passou integralmente.

As ações das stores mantêm referências estáveis nas mutações do adaptador Zustand.
O teste do provider confirmou uma consulta de menus ao completar o contexto, sem
remontar a navegação a cada atualização de estado de carregamento.

## Retorno da homologação: ID de rascunho na entrada do PDV (#1150)

Em 23/10/2026, o usuário mostrou Home → PDV com `orderId` na primeira entrada
e URL limpa no segundo clique. O `AddProductScreen` recuperava o rascunho por
`loadStoredDraftOrder` e `persistCatalogOrderId` chamava `navigation.setParams`.
Na reentrada, o pedido já ativo impedia essa recuperação; por isso a diferença.

O teste `pdvDraftNavigation.test.js` reproduziu a escrita indevida antes da correção.
A recuperação passiva agora atualiza somente o contexto interno e os parâmetros
fornecidos ao catálogo. Não apaga rascunhos, não cria uma venda nova, não modifica
stores, configuração de dispositivo ou regras comerciais. Links explícitos,
retomada, início de pedido e inicialização de comanda mantêm seus parâmetros.

Validação local: 18 testes de navegação/Manager e 10 testes de categorias,
contexto ativo e armazenamento de rascunho aprovados. Overlay versionado e hash
atualizados; aplicação repetida aprovada. Isso é evidência controlada, não prova
de reprodução autenticada do pedido da captura em staging.
