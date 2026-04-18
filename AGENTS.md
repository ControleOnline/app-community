
## Qualidade
- Rodar lint e testes antes de concluir.
- Não introduzir breaking changes sem destacar.
- Preferir mudanças pequenas e isoladas.
- Tudo precisa ser reaproveitável, pequeno e organizado
- Não misturar responsabilidades entre componentes
- Componentes devem ser pequenos, o menor possível
- O CSS deve ficar separado em outro arquivo para facilitar a leitura do código
- Cada componente deve trabalhar com seus estados de forma separada, podendo ser adicionados em qualquer outro lugar com facilidade e poucos parâmetros, sendo auto-suficientes e desacoplados


## Estilo de implementação
- Seguir padrão dos módulos existentes.
- Reaproveitar utilitários antes de criar novos.
- Nomear arquivos e classes de forma consistente com os módulos atuais.


## Convenções
- O código Vue é legado e pode ser usado como referência, mas o sistema é feito em React Native para Web e para Aplicações nativas.
O front-end é composto por vários aplicativos que compartilham módulos. O parâmetro APP_TYPE muda para outro aplicativo, portanto, outra visão do mesmo sistema mas para uma função diferente dentro da empresa. Isso é extramamente importante.
- Não adicinhar ou criar métodos para pesquisar várias opções.
- Preferir estados de store a estados locais.
- Não criar novos getters sem perguntar antes dentro dos stores
- Só usar a API em vez de stores em casos stritamente necessários
- Trabalhar preferencialmente com filas do store em vez de loopings ou chamadas asyncronas em lote.
- Preferir usar o getter reload no store em vez de criar funções de reload
- Usar o loading único do sistema e melhorá-lo se precisar, assim como o módulo de exibição de erros (state store)
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