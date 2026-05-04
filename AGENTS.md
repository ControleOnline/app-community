## Configuração local para testes
- app-community\config\key.local.js tem a informação da chave de API de um usuário de testes. Esse usuário pode ser utilizado para realizar chamadas à API e confirmar informações sobre o funcionamento. Use quando precisar.


## Qualidade
- Rodar lint e testes antes de concluir.
- Não introduzir breaking changes sem destacar.
- Preferir mudanças pequenas e isoladas.
- Tudo precisa ser reaproveitável, pequeno e organizado
- Não misturar responsabilidades entre componentes
- Componentes devem ser pequenos, o menor possível
- O CSS deve ficar separado em outro arquivo para facilitar a leitura do código
- Cada componente deve trabalhar com seus estados de forma separada, podendo ser adicionados em qualquer outro lugar com facilidade e poucos parâmetros, sendo auto-suficientes e desacoplados
- Filtros de selecao curta nao devem usar fileiras longas de chips ocupando a largura da tela. O padrao do sistema agora e seletor compacto com valor atual visivel e modal/lista de opcoes.
- Sempre que um filtro desse tipo puder ser compartilhado, ele deve nascer em `ui-common` e ser reutilizado pelos apps, evitando recriar chips e modais locais por tela.
- Nome da empresa nao deve ser repetido no corpo das paginas so para contextualizacao. Quando a rota usa seletor de empresa no header, a exibicao da empresa pertence ao `CompanyFilter`.


## Estilo de implementação
- Seguir padrão dos módulos existentes.
- Reaproveitar utilitários antes de criar novos.
- Nomear arquivos e classes de forma consistente com os módulos atuais.
- Em modais e popups operacionais que reaproveitam telas canônicas, o cabeçalho e a barra de ações também devem ser reaproveitados dos arquivos-fonte do fluxo principal. Impressão e ações irmãs ficam sempre na mesma barra padronizada, nunca em botões soltos paralelos.
- Identificação visual de pedido não pode ser redesenhada por tela. Cards, modais e detalhes operacionais devem reaproveitar o componente canônico `OrderHeader`, normalizando o payload se preciso, mas sem recriar número, cliente, datas ou status manualmente.


## Convenções
- O código Vue é legado e pode ser usado como referência, mas o sistema é feito em React Native para Web e para Aplicações nativas.
- O projeto é misto: a mesma base atende Web e apps nativos. Toda mudança de UI, assets, navegação, fontes, gestos e comportamento visual precisa ser pensada e validada considerando browser e dispositivos nativos.
- O front-end é composto por vários aplicativos que compartilham módulos. O parâmetro APP_TYPE muda para outro aplicativo, portanto, outra visão do mesmo sistema mas para uma função diferente dentro da empresa. Isso é extramamente importante.
- Leia `MODOS_OPERACAO.md` antes de propor ou implementar qualquer fluxo no front. Esse arquivo define as visoes por `APP_TYPE`, os tipos operacionais de device e o planejamento atual do `POS`. Agents como Codex devem trata-lo como contexto obrigatorio.
- Ícones em telas compartilhadas precisam funcionar em Web e nativo. Em ambiente Expo, prefira `@expo/vector-icons` quando possível. Se um módulo usar `react-native-vector-icons`, garanta o registro explícito das fontes no bootstrap web e nunca assuma que o browser carregará essas fontes automaticamente.
- Não adicinhar ou criar métodos para pesquisar várias opções.
- Preferir estados de store a estados locais.
- Não criar novos getters sem perguntar antes dentro dos stores
- Só usar a API em vez de stores em casos stritamente necessários
- Trabalhar preferencialmente com filas do store em vez de loopings ou chamadas asyncronas em lote.
- Preferir usar o getter reload no store em vez de criar funções de reload
- Usar o loading único do sistema e melhorá-lo se precisar, assim como o módulo de exibição de erros (state store)
- Todo erro visual do sistema deve usar o componente único de erro transitório centralizado no `MessageService` de `ui-common`, recebendo o erro, exibindo por alguns segundos e sumindo sozinho. Não criar banners/toasts/alerts paralelos para erro.
- Em máscaras, calculos e todos os tipos de helpers, usar um repositório do sistema e mentê-lo sempre organizado e em arquivos pequenos
- Manter as telas sempre componentizadas, reaproveitando tudo o que é possível, e mantendo tudo pequeno e organizado.
- Separar CSS dos arquivos de JS.
- Não passar objetos na URL. Na URL passamos tudo o que um refresh possa ler. Objetos passamos pelos stores e se ele tiver vazio, pega o ID da URL e preenche o objeto usando a store ou getItem.
- Preferir trabalhar com store ao invés de mandar parâmetros para componentes filhos
- Exemplo de módulo ideal: Orders.js que inclui orderHeader.js, orderInvoices.js, printOrder.js, orderPreparationQueue.js. Por sua vez um módulo chamado Invoice.js poderia incluir o orderInvoice.js e o módulo KDS poderia incluir orderHeader.js e printOrder.js, orderPreparationQueue.js. Sempre prefira modularizar assim.
- Sempre começe as telas por listagens e dentro delas, coloque botões para adicionar e editar, também para cancelar, nunca deletar.
- Atente-se que algumas ações não são pertinentes à aquela visão, como no CRM que é feito para vendedores, não haverá cadastros de categorias ou modelos de contratos, isso é função do admin (Manager). Sempre tenha em mente as visões de cada aplicativo q quem os usa.
- Sempre verifique o backend pasa ser melhor direcionado em tudo.
- Ao verificar o backend, preencha sempre os stores correspondentes com as colunas da entidade, formatando elas da melhor maneira possível
- Comente todo o código
- Sempre utilize a tradução atravéz da função tt presente no global do front para qualquer coisa que o cliente terá acesso, isso inclui preenchimento de objetos com label utilizados em listas por exemplo. Se encontrar algo não traduzido, traduzir.
- Tudo o que for comum, usar o módulo common em vez de criar helpers espalhados pelo sistema.
- Se encontrar algo fora desse padrão, favor corrigir, inclusive movendo e renomeando arquivos para os módulos corretos
- Tradução ausente nunca é problema, não use fallbacks pra isso.
- Os formatos de colunas dos objetos estão no store, em columns. Várias formatações importantes passam por lá. Sempre que possível, faça os helpers do sistema receber essas configurações de colunas.
- Diversas configurações que ligam o frontend aos dados do backend estão centralizadas nos stores. Use isso sempre que possível. E alimente o store com essas informações ao criar novas telas.
- Não há diversos nomes ou diversos jeitos de fazer alguma coisa. Se houver dois arquivos diferentes tratando a mesma coisa, pergunte qual deve manter e ejuste para que apenas um componente tenha a responsabilidade por aquela função.
- Se houver erros de grafia, ou diversos nomes para encontrar algo como um array de palavras por conta de dúvidas do que é o correto, simplesmente pergunte qual o correto. Exemplo: [order, orders] num campo de tipos provavelmente haverá uma grafia correta e outra que age como um fallback, porém isso não deve existir de forma alguma.
- Crie e mantenha atualizado de forma concisa, AGENTS.md em cada módulo. Eles devem ter regras claras sobre o funcionamento daquele módulo, principalmente regras de negócio pedidas em prompt. Se uma regra mudar, apague e reescreva. 
- Quando a regra for transversal entre módulos, o `AGENTS.md` da raiz também deve ser atualizado.
- Crie testes automatizados sempre que possível e os mantenha atualizados. Crie os testes dentro dos módulos correspondententes e não na raiz. A pasta de testes é src/tests 
- Tenha bom senso. Avisos do que cada ação faz é bem-vindo, mas lembr-se que são clientes que usam o sistema, ele não sabe o que é uma tabela device_config, então use uma linguagem mais adequada.
- Evite pai orquestrando filhos. Prefira que cada filho seja independente e o pai apenas organiza.
- Toda lista deve ser paginada e ter carregamento infinito
- Não usar caminhos relativos (../../../). Ao invés de caminhos relativos, use alias configurados no babel, como @controleonline por exemplo
- Para facilitar debugs, envie logs para a tabela de logs via API sempre que achar necessário, depois as leia no backend via API ou database.

## Regras de negócio CRM
- A listagem de oportunidades no CRM deve abrir com o filtro `open` selecionado por padrão. Os demais status continuam disponíveis para troca manual.
- O utilitário `resolveDefaultOpportunityStatusFilterKey` em `ui-crm/src/react/utils/opportunityStatusFilter.js` implementa essa lógica e deve ser reutilizado sempre que o filtro padrão for necessário nesse módulo.
- Quando a API não retorna a opção `open` na lista de status, a tela exibe as oportunidades sem filtro ativo (comportamento de fallback seguro).

## Regra transversal de seletor de empresa
- O frontend deve tratar `/people/companies/my` como a fonte de verdade do seletor de empresas.
- O seletor deve mostrar todas as empresas retornadas pela API; empresa fora do fluxo comercial do domínio atual deve aparecer desabilitada, nunca escondida.
- `company.enabled` significa apenas que a empresa está ativa no cadastro.
- `company.commercial_enabled` significa que a empresa tem cadeia comercial válida no domínio atual.
- `company.panel_enabled` é a flag que define se a empresa pode ser selecionada no painel atual.
- Componentes de troca de empresa, exploradores e escolhas de contexto devem usar `panel_enabled` para habilitar/desabilitar seleção.
- A escolha automática de empresa atual deve priorizar a primeira empresa com `panel_enabled = true`.
- `employee_enabled` e os demais `*_enabled` dentro de `company.user` representam o tipo de vínculo humano direto da pessoa com aquela empresa; eles não substituem `panel_enabled`.
