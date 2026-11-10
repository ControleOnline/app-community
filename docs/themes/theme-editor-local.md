# Editor de cores: uso e integração local

## Uso

- Portal ADMIN: avatar → Configurar temas abre o painel flutuante, inclusive dentro do MANAGER, para usuários com a permissão administrativa já definida por companyAuthority. Arraste pelo título.
- Inspecionar elemento destaca o objeto sob o ponteiro. O clique seleciona suas referências de cor e não executa a ação de negócio do objeto. Esc encerra a inspeção.
- O painel mostra propriedade → variável → valor do modo atual. O seletor de cores e os campos Claro/Escuro oferecem prévia imediata. Salvar cores grava; Cancelar ou fechar descarta a prévia.
- Configurador → Temas mostra o cadastro aplicado pelo domínio e o cadastro da empresa separadamente. Por padrão, as três colunas e os 26 previews usam o tema aplicado. O seletor permite consultar o cadastro da empresa sem trocar vínculos. Editar variáveis por modo abre o mesmo editor, com busca e identificação de Primário/Secundário.
- Editar um cadastro diferente do tema ativo não modifica a prévia global da aplicação.

## Fontes e responsabilidades

`docs/themes/themes-map.md` define o vocabulário dos papéis de cor. O preparo e o Metro geram `src/styles/themeContract.generated.js`: resultado automático, sem outra lista manual de tokens. Claro/Escuro são variantes `-light`/`-dark`; Primário/Secundário são papéis, independentes do modo.

`people_domain.theme_id` continua selecionando o tema. `theme.colors` continua armazenando os valores. `themes-colors.css` continua sendo o transporte público da API. Não há mudança de esquema, endpoint ou permissão no servidor. O carregador seleciona o modo e publica os valores como variáveis CSS e referências para os componentes existentes.

Campos legados existentes são preservados ao salvar. O componente Google loading e o grupo Tokens Base permanecem; a cor desse preview usa `loadingSpinner`, já presente no mapa.

O inspetor registra as referências efetivamente usadas em estilos React Native Web. Não compara valores RGB para adivinhar a origem. Um estilo literal de um módulo legado sem referência de tema é identificado como sem referência; o painel não inventa uma variável para ele.

## Carregamento e sessão

O CSS público é solicitado sem API-TOKEN. Carregamento, falha de transporte e tema carregado com papéis ausentes têm estados separados. Entrar novamente ou repetir a carga refaz a consulta; respostas de cargas anteriores são descartadas.

A sessão existente é vinculada à API e ao domínio efetivo. Uma sessão antiga sem essa vinculação, ou de outra API/domínio, exige novo login. Uma resposta 401 invalida somente o token que ainda é o atual. Uma resposta atrasada não derruba um login mais recente. 403 não é tratado como sessão inválida. A validação do servidor permanece intacta.

Salvar consulta novamente o cadastro, preserva campos não editados e bloqueia conflitos nos campos editados. Acesso e autorização continuam nos endpoints existentes.

## Integração com os módulos

Os adaptadores conservam os módulos e seus hooks originais. `@theme-original/*` resolve o módulo original conforme `moduleResolution` publicado/fonte. O patch de ThemeManager é versionado em `patches/theme-system.json`, aplicado no preparo e no Metro com verificação SHA-256 antes/depois. Uma versão de módulo incompatível exige revisão explícita, em vez de substituição silenciosa.

## Validação

- `node node_modules/jest/bin/jest.js --config jest.theme.config.cjs --runInBand`: 31 testes, incluindo identidade domínio/empresa, permissão ADMIN dentro do MANAGER, origem de valores, sessão, transporte, carregamento, contrato, inspetor, ADMIN e gravação simulada.
- Regressão dirigida: managerTheme, managerTableTheme e managerObjectTheme: 13 testes.
- Exportação web local com Expo concluída.
- Navegador: página ThemeManager real, painel, inspeção de texto/fundo/bordas, prévia, cancelamento, gravação simulada e alternância de modos. Os dados usados são sintéticos e a API real não recebe gravações.
- A suíte managerShell possui 7 falhas já reproduzidas no HEAD original, relativas ao seletor/layout/traduções. Elas não foram ocultadas ou corrigidas nesta alteração de temas.
- Os antigos exemplos Lave-Go não contêm cardShadow, containerTransparentBackground, iconBackground e textDanger requeridos pelo layout atual. O teste registra essas ausências; não foram fabricadas cores para preenchê-las.

Nenhuma task, commit, publicação, alteração de servidor ou alteração real no banco foi feita para entregar esta implementação.

### Conferência final em localhost

Em 05/11/2026, os 25 testes do sistema de temas e os 13 de regressão dirigida passaram novamente. O Expo foi iniciado em modo offline em localhost:8081. A aplicação real abriu a tela de entrada sem erros de console e publicou 293 variáveis `--co-theme-*`. API e proxy responderam HTTP 200 para a consulta pública de CSS. A sessão disponível no navegador de conferência permaneceu na tela de login; a validação autenticada do painel e do editor permanece a realizada com dados sintéticos. Nenhuma gravação real de tema foi executada.

### Correção e validação autenticada do cenário real

A seleção antiga da página consultava o tema da empresa, enquanto o CSS da aplicação usava o domínio. O atalho também testava o módulo aberto em vez do portal ADMIN e da autoridade do usuário. A página agora identifica os dois cadastros, seleciona explicitamente qual deles fornece os previews e não altera nenhum vínculo.

A consulta de leitura confirmou `localhost:8081 → ON_MANAGER_NEUTRAL_20261016 #11`, diferente de `GYROS #5` e `DEFAULT #1`. Na sessão autenticada pelo próprio usuário, foi validado:

- Avatar do MANAGER dentro do ADMIN → Configurar temas, com o cadastro #11 no painel.
- Página abrindo o tema aplicado com 262/262 papéis e 26/26 grupos de preview; seleção do cadastro GYROS e retorno ao aplicado sem alterar o domínio.
- Inventário de cores por componente: cardBackground claro #FFFFFF e escuro #16232E, com as chaves cardBackground-light/cardBackground-dark.
- Home real: inspeção de cardText, origem cardText-dark, valor #ECF3F7. A prévia #F472B6 produziu rgb(244,114,182); Cancelar restaurou rgb(236,243,247). O clique de inspeção não navegou nem executou a ação do card.
- Alternância claro/escuro com as respectivas origens cardText-light/cardText-dark; modo original restaurado.
- Comparação dos registros de cores #1/#5/#11 antes e depois: preservados. Vínculo do domínio permaneceu #11. Não houve gravação real.
- Verificação final: 31 testes de temas e 13 de regressão dirigida passaram; exportação web local passou. As 7 falhas preexistentes de managerShell continuam fora deste conjunto, conforme registro acima.

`describeThemeColor` usa a mesma resolução do runtime, retornando valor e chave de origem, incluindo mapeamentos legados existentes. Campos sem valor continuam ausentes. O editor mostra separadamente o campo do cadastro e o valor aplicado; não usa a cor de outro cadastro para preencher ou salvar um campo vazio.

### Seletor nativo e primeira inspeção

A gravação de 05/11 mostrou mudanças contínuas no seletor e demora na primeira inspeção. O teste de abertura detectou 2.096 chamadas que resolviam a paleta completa. A resolução agora é reutilizada por modo (8 resoluções na mesma abertura de teste), inclusive no inventário aplicado. O editor é memorizado e os tokens selecionados mantêm sua identidade durante o destaque do inspetor.

O seletor de cor web usa um input nativo estável: valor inicial fixo, sincronização externa quando não está em uso, eventos de prévia agrupados por requestAnimationFrame, liberação do último evento no blur e descarte de eventos pendentes ao desmontar. Cancelar/Salvar permanecem montados, desabilitados quando não há mudanças, evitando deslocar a âncora da janela de cores ao iniciar uma prévia. Esc no campo não aciona o fechamento global do painel.

A publicação CSS grava somente propriedades cujo valor mudou. Se as referências CSS continuam iguais, a prévia web não republica as mesmas referências na store da aplicação. Native continua recebendo os valores de cor reais.

Validação: 35 testes de temas e 13 de regressão dirigida passaram; exportação web local passou. Na sessão real, abrir o seletor nativo, alterar a cor pelas teclas, encerrar a seleção e cancelar a prévia restaurou cardText-dark #ECF3F7 / rgb(236,243,247), sem gravação. O gesto exato de arrastar/soltar no Brave está solicitado ao usuário; a automação do seletor nativo foi feita pelo teclado e não substitui essa conferência.

### Identidade visual por modo

As cores e o modo continuam no tema do domínio. As imagens continuam pertencendo à empresa selecionada. O painel de temas inclui a seção ADMIN “Logos da empresa para claro e escuro”, sem misturar imagens com os tokens de `themes-map.md` ou `theme.colors`.

A seção usa a configuração pública existente da empresa `company_branding`, com `logoLight` e `logoDark` como referências de imagem (endereço HTTP(S) ou caminho de arquivo já servido). Campo vazio mantém o logo original; nunca usa a variante do modo oposto ou a imagem de outra empresa. Configurações são lidas pela API existente `/configs` e gravadas somente pelo botão explícito, via `/configs/add-configs`, com as permissões atuais do servidor. Nenhuma migração ou novo vínculo de banco. Cancelar/fechar remove apenas a prévia local; troca de empresa/sessão invalida a edição. Conflitos de alteração concorrente impedem sobrescrita.

O seletor mantém dois intervalos de 12 px. A caixa do logo acompanha a proporção real informada pelo carregamento da imagem, limitada a 40 px de altura e até 80 px de largura (reduzida em telas estreitas para reservar espaço ao nome e à seta). `contain` permanece ativo, sem máscara, recorte ou recoloração. Margens transparentes e fundos opacos que já fazem parte do arquivo não são removidos pelo componente: usar um original transparente apropriado para cada modo.

A configuração recebe endereços de imagens existentes; não foi acrescentado um upload de arquivo neste fluxo.

## Catálogo, vínculos e aplicação no domínio

### Variações por finalidade

### Alcance: Só nesta tela / Em todas as telas

O painel flutuante agora oferece a escolha de alcance após inspecionar um elemento. O padrão da seleção é Só nesta tela, identificado por tipo de app + nome da rota + store. IDs de registros, instâncias de navegação, filtros, paginação e traduções não fazem parte da identidade. A escolha vale para a variável selecionada em todos os seus usos dentro dessa tela, não para um registro individual. A tela selecionada permanece indicada quando o usuário navega para conferir outra página.

O mesmo JSON theme.colors recebe chaves CSS seguras screen_<identidade UTF-16 hexadecimal>__<token>-light/dark. Não há entidade, vínculo ou permissão novos. A API existente serializa essas chaves como as demais cores; o transporte público CSS é lido pelo carregador existente. O resolvedor global exclui essas chaves, e ScreenThemeBoundary.web aplica somente as diferenças na raiz DOM da tela correspondente. O menu de conta leva seu próprio limite de tela dentro do Modal. Componentes sem referência a variável, cores literais e portais de outros módulos fora desse limite não passam a aceitar escopo por inferência.

Em todas as telas edita o padrão do tema; personalizações locais explícitas continuam prevalecendo. Usar cor global limpa a personalização do campo/modo. Sem valor próprio, a tela herda o global no mesmo modo; nenhum preenchimento automático é persistido. O editor mantém rascunhos locais e globais ao alternar alcance, com cancelamento e salvamento explícito existentes. No painel, as origens técnicas ficam recolhidas, os campos usam nomes curtos e indicam apenas Cor própria desta tela / Usando a cor global / Cor global. As variações anteriores são preservadas por compatibilidade, sem expandir sua família automaticamente no inspetor.

Conferência real em 2026-11-06: selecionado o fundo da busca no Centro financeiro, a prévia local cardBackground-light #123456 apareceu somente na raiz FinancialHubPage; a Home manteve #020202. Uma edição global #345678 mudou a Home, enquanto a personalização financeira permaneceu #123456. Cancelar restaurou as duas. Nenhum PUT de cores reais, alteração de vínculo ou publicação foi executado. Campos e botões de alcance conferidos em393 px. O salvamento/recarregamento foi validado com API simulada e as chaves serializadas; não foram criadas personalizações reais para testar persistência. Evidência: /tmp/screen-theme-finance-final.png.

O themes-map.md define13 tokens opcionais dentro do grupo Card, com metadados de base, finalidade e alcance: indicatorCard* para indicadores/faixa de resultados da Home e summaryCard* para cards mensais/caixas de métricas do relatório financeiro. Os26 grupos de preview existentes são preservados. O contrato gerado possui275 nomes; nenhum catálogo paralelo de variações é mantido.

Sem valor próprio, a variação herda o token base resolvido no mesmo modo, inclusive para temas legados. Não há cópia nem gravação automática. Um valor vazio faz a variação voltar a herdar. Definir um modo não importa a cor do outro; adicionar a primeira variação a um tema legado não muda a resolução das suas cores existentes. Os valores continuam no JSON theme.colors, com as mesmas permissões, salvamento explícito e vínculos.

O inspetor expõe a família completa da finalidade selecionada, incluindo textos, fundo, borda e ícones quando aplicáveis. O editor informa o alcance, distingue padrão compartilhado de variação, mostra a origem herdada e permite Usar padrão por campo/modo. Editar o padrão continua afetando componentes e variações que o herdam; uma variação com cor própria é independente. Busca, filtros, cálculos e navegação não são modificados.

Conferência autenticada: uma prévia de indicatorCardBackground-dark em #123456 alterou os indicadores da Home, mantendo cardBackground e summaryCardBackground em #29261E; ao navegar para Consolidado, os cards mensais permaneceram em #29261E. Após cancelar, uma prévia de summaryCardBackground-dark em #304050 alterou apenas o resumo financeiro; Usar padrão restaurou #29261E. Todas as prévias foram canceladas, sem PUT, troca de vínculos ou exclusão reais. Evidências: /tmp/theme-variation-home-preview.png e /tmp/theme-variation-summary-final.png.

O botão **Gerenciar temas e vínculos** abre os temas acessíveis na base atual, com busca por nome/ID, indicação do tema aplicado e referências. O botão **Novo tema** existente continua criando apenas o cadastro. A aplicação é uma ação separada e confirmada, que informa domínio, tema anterior e tema novo. A API exige permissão sobre a empresa do domínio, independentemente da empresa selecionada no cabeçalho, e rejeita confirmação baseada num vínculo antigo.

Temas em uso têm exclusão bloqueada. Como o modelo de tema é compartilhado e não possui proprietário, somente o superadministrador pode excluir temas sem vínculos; a API verifica isso novamente, em transação. Referências fora da permissão aparecem somente na contagem, sem expor seus detalhes. Nenhuma cor ausente é preenchida automaticamente durante a aplicação.

A consulta da lista e o cancelamento das confirmações não alteram registros. A validação local desta extensão usa respostas e entidades simuladas para trocas e exclusões; não executar PUT/DELETE de temas reais durante a conferência visual.

### Acesso por empresa e gestão global

A abertura do catálogo usa **Temas das minhas empresas**, também para superadministradores. Os temas são encontrados pelos domínios das empresas permitidas ao usuário, reaproveitando a política do seletor. A opção **Gestão global** é separada e só aparece com autorização do servidor para superadministrador; o servidor também nega pedidos diretos desse escopo a outros usuários. Temas sem vínculo não são atribuídos a empresas pelos seus nomes.

Os vínculos mostram empresa e domínio. Referências fora do escopo não expõem detalhes, mas continuam bloqueando exclusão. O carregamento explícito do mapeamento de PeopleDomain corrige a contagem que antes ignorava entidades de módulos carregadas sob demanda. A proteção inclui leitura por ID, edição de paletas compartilhadas e aplicação, e preserva o transporte público das cores do domínio.

Verificação:62 testes do frontend e21 do backend passaram, assim como compilação web e configuração dos serviços. A conferência com a conta real continua pendente: a aba da conversa está no login e a primeira consulta somente de leitura ao banco falhou na resolução do endereço dentro do ambiente restrito. A consulta autorizada fora dessa restrição confirmou dois vínculos reais para o tema #11, e a contagem corrigida retornou dois. Nenhum vínculo ou tema real foi modificado nesta validação.

### Apresentação do catálogo

O tema aplicado ao domínio aparece primeiro dentro dos resultados da busca; os demais mantêm a ordem retornada pela API. A empresa (ou empresas) dos vínculos visíveis aparece em destaque, seguida do nome e ID do tema. Empresas repetidas em vários domínios aparecem uma vez no destaque; nenhuma associação é inferida pelo nome do tema.

Os domínios começam recolhidos em “Ver vínculos”, com a contagem preservada. Expandir mostra os mesmos detalhes permitidos pela API e a indicação de referências ocultas; recolher ou trocar de escopo fecha a lista. A busca também aceita os nomes das empresas já visíveis. Esses estados são apenas de apresentação e não fazem gravações.

Conferência real dessa apresentação: sessão autenticada no localhost mostrou o tema #11 primeiro, CONTROLE ONLINE em destaque, DEFAULT com CONTROLE ONLINE · TESTE sem repetição, e seus15 domínios abriram/recolheram pelo controle de vínculos. Nenhuma ação de salvar/aplicar/excluir foi executada.64 testes do editor passaram e a compilação web foi exportada em /tmp/controle-theme-catalog-presentation. Evidência: /tmp/theme-catalog-presentation-final.png.

### Inspetor: Normal, Hover e toque

O menu da conta mantém o foco dentro do Modal. Enquanto ele está aberto, a raiz DOM estável do editor flutuante é movida para dentro desse limite; ao fechar, volta ao body, sem remontar nem perder o rascunho. Isso permite digitar nos campos com o menu aberto, preservando o Modal original. A seleção de uma opção oferece “Fundo e borda do menu” para acessar o contêiner, separado do fundo da linha. Os callbacks de children do Pressable também fornecem as variáveis reais de texto e ícone por estado, evitando misturar o texto atualmente em Hover com o estado Normal.

Conferência dessa correção: na sessão autenticada, uma prévia temporária de menuBackground-dark mudou o fundo para #123456; Cancelar restaurou #1A1A1A. Nenhum salvamento foi executado.74 testes passaram, incluindo preservação do rascunho ao mover a raiz entre o Modal e o body. Evidência: /tmp/menu-inspector-focus-fixed.png.

O inspetor abre em Normal e oferece Hover quando o próprio estilo do Pressable declara variáveis diferentes nesse estado. Os nomes vêm das expressões de estilo, sem comparar cores para adivinhar tokens. Elementos sem variáveis nesse estado mostram essa ausência. A seleção não aciona a navegação do componente.

No navegador móvel, iniciar a inspeção recolhe o painel; selecionar reabre o editor, mantendo o rascunho montado. Arrastar permite rolar sem selecionar. O toque de seleção bloqueia o clique posterior. Campos ficam em uma coluna, com controles de cor de44 px e ações de cancelar/salvar acessíveis durante a rolagem. O painel acompanha a área visível quando o teclado aparece.

Validação local:71 testes em19 suítes e exportação web passaram. Na sessão autenticada, Normal mostrou listItemBackground e Hover mostrou listItemActiveBackground no acesso rápido Dispositivos; a URL permaneceu na Home. Em393 px, o painel recolheu/reabriu e os campos ficaram em uma coluna. Toque e supressão do clique posterior foram verificados por testes automatizados; a ferramenta do navegador não oferece toque nativo, portanto não houve conferência em aparelho físico. Nenhuma cor ou vínculo real foi salvo.

### Separação local das cores das áreas permanentes — 2026-11-10

Os controles de conta/avatar, títulos do menu lateral, identificação da empresa no
cabeçalho e título de seção do menu do usuário passam a consumir variáveis próprias.
A shortcut bar também expõe borda ativa, estados desabilitados e sombra separados.
O mapa oficial continua sendo `themes-map.md`; o contrato é gerado a partir dele.

Na leitura, `initializeGlobalChromeColors` captura os valores anteriores nos dois
modos para preservar a aparência e impedir que a prévia de uma cor de conteúdo
altere esses controles. Valores próprios já cadastrados têm precedência. O editor
usa a mesma inicialização e, ao salvar, mantém as novas propriedades no JSON
`theme.colors`, preservando as demais chaves armazenadas. Sem salvar pelo editor,
essa inicialização permanece em memória; não há migração nem gravação automática.

Esta etapa não modifica o chaveamento de cores dos módulos, suas permissões ou
cadastros, nem a persistência local da chave. A mudança para uma chave compartilhada
será uma etapa posterior. Não foram criadas colunas nem executadas gravações no banco.

### Etapa 2 — chave de cores dos módulos compartilhada pelo tema

A origem da chave passa a ser `theme.colors.useModuleColors`, sem sufixo de modo,
com os valores `true`/`false` em texto, seguindo as opções de layout. A aplicação
lê a configuração recebida pela API do tema do domínio. O botão “Salvar opção no
tema” usa o fluxo existente de gravação de temas e suas permissões; não altera
vínculos, categorias, rotas nem suas cores. Sem a propriedade, permanece o antigo
padrão de ausência de preferência: ligado para layouts `list`/`buttons`.

A chave local `co.module-accent.v1:*` deixa de ser consultada para essa opção. Não
é copiada para o tema nem apagada. A leitura não dispara salvamentos. A preferência
compartilhada é recebida pelos demais usuários/domínios que utilizam o tema ao
carregarem ou recarregarem seus dados; não foi acrescentada sincronização em tempo
real. Rejeição da API mantém o valor aplicado e exibe o erro.

Validação desta etapa feita somente com API simulada: leitura da chave, salvamento
explícito, rejeição, troca de contexto e preservação das cores existentes. Nenhuma
gravação real no banco ou migração de colunas foi executada pelo agente.

### Etapa 3 — catálogo e prévias de aparência dos módulos

“Cores dos módulos” reúne categorias e suas rotas sem descartar menus de Home ou
atalhos de uma categoria repetida. A consulta normal usa somente os menus recebidos
pelo contexto. A edição mantém a mesma exigência da tela existente de menus:
`app_type_base === ADMIN` e usuário `ROLE_SUPER`, além da autorização da API.
Nesse caso, o painel carrega todas as páginas de `menu-config` do app atual,
incluindo registros desativados, sem criar menus ou alterar vínculos.

Cada categoria/rota possui edição da cor e do ícone existentes, com seleção de
ícones e de cores e aceitação de referências como `$primary`. O botão “Salvar
cadastro” envia somente os campos `color`/`icon` alterados ao endpoint existente.
Não envia ordenação, permissões, categoria, rota vinculada ou campos de prévia.
Após salvar, consulta novamente os cadastros e atualiza os menus permitidos da
empresa atual. O salvamento da chave compartilhada continua separado.

As prévias locais de Home em lista, Home em grade e menu lateral reproduzem a
aplicação atual. Por enquanto, o menu lateral usa a cor da categoria; os botões da
Home usam a cor da rota. A unificação permanece para a etapa 4. Cor do texto, cor
do ícone e fundo do ícone na grade são campos temporários, identificados como sem
coluna no banco. Só afetam a prévia local; não são enviados ao banco nem ao tema.
Descartar a prévia ou fechar o painel remove os rascunhos sem gravação.

Esta etapa foi validada com API simulada (paginação, permissões, salvamento
explícito e payload restrito). O agente não executou gravações reais no banco.

#### Navegação das categorias e rotas

Categorias começam recolhidas. Cada cabeçalho abre/recolhe seus campos e rotas,
com seta e estado acessível de expansão. Uma categoria fica aberta por vez; cada
categoria lembra a última rota expandida. Os campos e a prévia da rota ficam junto
a ela, em vez de no fim da lista de categorias. Cores adicionais começam recolhidas
em uma seção própria de prévia. Recolher, reabrir ou alternar categorias/rotas não
limpa rascunhos nem dispara salvamentos; o descarte continua explícito por cadastro.
A memória dos rascunhos vale enquanto o painel está montado no mesmo contexto.

### Etapa 4 — cores de rota no menu lateral e na Home em lista

Com a chave ligada e uma cor de rota válida, o fundo do item lateral usa
`routes.color`, igual ao botão da Home em lista. O ícone não recebe mais a mesma
cor do fundo. Ambos usam `moduleListIcon` e `moduleListText` para os primeiros
planos, resolvidos pela mesma função de apresentação (`moduleListAppearance`).
Essas duas variáveis pertencem ao JSON do tema; são inicializadas com os valores
anteriores de `textMuted` e `cardText` nos dois modos, sem gravação automática.
Assim, editar cores genéricas de conteúdo não muda os primeiros planos dos
módulos com o destaque aplicado. Valores próprios já cadastrados são preservados.

Com a chave desligada, ou sem cor de rota válida, a Home conserva os papéis
anteriores de lista e o menu lateral conserva `navigation*`, incluindo hover e
estado ativo. O fundo externo, títulos dos grupos, cabeçalho, menu do usuário e
shortcut bar continuam seguindo suas variáveis de tema. A borda do item lateral
ativo usa `navigationActiveBorder`. Cartões de categoria da Home continuam usando
`category.color`; a grade mantém sua regra de aplicação de fundos de rota.

As prévias de lista e menu lateral usam a mesma apresentação; as cores temporárias
extras continuam limitadas às prévias. O inspetor informa `routes.color` como
origem do fundo lateral, sem atribuir esse campo à cor do ícone ou à borda ativa.
Foram executados 33 testes focados com sucesso, sem gravações reais no banco ou
criação de colunas. A validação visual no navegador fica com o usuário.

### Variações dos quatro indicadores da Home e separação de Resultados

Os indicadores usam identidades estáveis: `closed-sales`, `period-orders`,
`open-orders` e `clients`. O inspetor reconhece essa finalidade mesmo quando um
texto ou ícone interno é selecionado. Só nesses quatro indicadores, o editor
oferece Padrão, Primária, Secundária e Específica. A escolha faz parte do mesmo
rascunho e salvamento explícito das cores; cancelar ou fechar o inspetor desfaz a
prévia. Trocar de indicador mantém os rascunhos no editor montado.

Padrão continua sendo `indicatorCard*`. Primária/Secundária possuem as propriedades
`homeMetricPrimary*`/`homeMetricSecondary*`, herdando o padrão quando faltam valores.
Cada específica tem propriedades estáveis pelo indicador, como
`homeMetricClosedSalesBackground-light`, e pode receber um nome editável. Ao criar
uma específica, ela herda da aparência anteriormente selecionada; voltar ao padrão
não apaga suas cores, nome ou base. Fundo, borda, valor principal, título/período,
mensagens e cores/fundo do ícone têm claro/escuro independentes. O desenho do ícone
permanece o original de cada indicador e não participa das variações.
O painel informa os indicadores potencialmente afetados por valores compartilhados.

Tudo usa propriedades escalares no JSON existente `theme.colors`: escolhas como
`homeMetricClosedSalesAppearance`, base da específica, propriedades de cor e o
nome legível codificado como texto hexadecimal com prefixo `v1_`. Esse formato
preserva acentos, espaços e símbolos sem inserir objetos JSON ou delimitadores no
CSS publicado pela API atual. O identificador não depende do nome. Não foi criada
coluna nem alterada a API. As variáveis `*Applied*` são calculadas no cliente para
aplicação/inspeção e não são gravadas. Novos tokens não alteram a resolução de
paletas legadas. Campos de modos diferentes não emprestam cores entre si.

Resultados usa `homeResults*`, inicializado na leitura com sua aparência anterior
nos dois modos. O próximo salvamento explícito preserva esses valores no tema,
permitindo editar o padrão dos indicadores sem alterar a faixa Resultados. Essa
faixa continua sendo editável por suas próprias variáveis, sem seletor de indicador.
Nada foi modificado nos cálculos, permissões, navegação, tabelas, filtros ou regras
de cores dos módulos. A opção das variações está restrita aos quatro indicadores.

Validação: 58 testes de tema/editor/transporte/inspeção mais um teste de integração
da Home passaram. Foram usados serviços simulados, sem gravação real no banco.

### Ajuste: desenho dos ícones preservado

Removidos o seletor de desenho e a substituição de ícones pelas variações dos
indicadores. Cor e fundo continuam editáveis por aparência nos dois modos.
Propriedades antigas `*Glyph`, caso já armazenadas, permanecem preservadas pelo
salvamento, mas não são aplicadas aos indicadores. Nenhuma gravação real no banco.

### Conferência da preparação da task-1496

O teste de `AppliedThemeOverview` passou a simular explicitamente a API, sem
carregar o cliente dependente de armazenamento do navegador, e a verificar que
nenhuma requisição é feita nesses cenários. Os quatro testes do arquivo passaram.
Na suíte de temas, 155 testes passaram; resta uma falha na expectativa antiga de
edição por tela, já reproduzida na master sem as alterações. Sem gravações reais.
